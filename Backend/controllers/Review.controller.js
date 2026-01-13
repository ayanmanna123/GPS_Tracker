import Bus from "../models/Bus.model.js";
import Review from "../models/Review.model.js";
import User from "../models/User.model.js";
// import your Bus model

export const createReview = async (req, res) => {
  try {
    const { busId, ratings, comment, photos } = req.body;
    const userId = req.auth.sub;

    let user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "Login first",
        success: false,
      });
    }

    if (!busId || !ratings) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existingReview = await Review.findOne({ busId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this bus" });
    }

    for (let key of Object.keys(ratings)) {
      if (ratings[key] < 1 || ratings[key] > 5) {
        return res.status(400).json({
          success: false,
          message: `${key} rating must be between 1 and 5`,
        });
      }
    }

    const review = new Review({
      busId,
      userId,
      userName: user.name,
      userEmail: user.email,
      ratings,
      comment,
      photos: photos || [],
    });
    await review.save();

    const bus = await Bus.findOne({ deviceID: busId });

    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }

    const totalReviews = await Review.countDocuments({ busId });

    let newRatings = { ...bus.ratings };
    for (let key of Object.keys(ratings)) {
      const currentAvg = bus.ratings[key] || 0;
      const newAvg =
        (currentAvg * (totalReviews - 1) + ratings[key]) / totalReviews;
      newRatings[key] = parseFloat(newAvg.toFixed(2));
    }

    bus.ratings = newRatings;
    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Review added successfully & bus ratings updated",
      data: review,
      updatedRatings: bus.ratings,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all reviews for a specific bus with filters
export const getBusReviews = async (req, res) => {
  try {
    const { busId } = req.params;
    const { rating, sortBy = "createdAt", order = "desc", limit = 10, page = 1 } = req.query;

    let query = { busId };

    // Filter by minimum rating
    if (rating) {
      const minRating = parseInt(rating);
      query.$expr = {
        $gte: [
          {
            $avg: [
              "$ratings.punctuality",
              "$ratings.comfort",
              "$ratings.cleanliness",
              "$ratings.driverBehavior",
              "$ratings.safety",
              "$ratings.valueForMoney",
            ],
          },
          minRating,
        ],
      };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};

    if (sortBy === "helpful") {
      sortOptions.helpfulCount = sortOrder;
    } else if (sortBy === "rating") {
      // Can't directly sort by average, so we'll handle in aggregation
      sortOptions.createdAt = sortOrder;
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate average rating for each review
    const reviewsWithAvg = reviews.map((review) => {
      const ratings = Object.values(review.ratings);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return {
        ...review,
        averageRating: parseFloat(avgRating.toFixed(2)),
      };
    });

    const totalReviews = await Review.countDocuments(query);

    // Calculate rating distribution
    const allReviews = await Review.find({ busId }).lean();
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((review) => {
      const ratings = Object.values(review.ratings);
      const avgRating = Math.round(
        ratings.reduce((a, b) => a + b, 0) / ratings.length
      );
      ratingDistribution[avgRating]++;
    });

    return res.status(200).json({
      success: true,
      data: reviewsWithAvg,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalReviews,
        hasMore: skip + reviewsWithAvg.length < totalReviews,
      },
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Report a review
export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.auth.sub;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Check if user already reported this review
    const alreadyReported = review.reports.some(
      (report) => report.userId === userId
    );
    if (alreadyReported) {
      return res
        .status(400)
        .json({ success: false, message: "You already reported this review" });
    }

    review.reports.push({
      userId,
      reason,
      description: description || "",
    });

    // Mark as reported if it has 3 or more reports
    if (review.reports.length >= 3) {
      review.isReported = true;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review reported successfully",
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.auth.sub;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Check if already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(userId);

    if (alreadyMarked) {
      // Remove the helpful mark
      review.helpfulBy = review.helpfulBy.filter((id) => id !== userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful mark
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: alreadyMarked ? "Unmarked as helpful" : "Marked as helpful",
      helpfulCount: review.helpfulCount,
      isMarked: !alreadyMarked,
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get review statistics for a bus
export const getBusReviewStats = async (req, res) => {
  try {
    const { busId } = req.params;

    const reviews = await Review.find({ busId }).lean();

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageRatings: null,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    // Calculate average ratings for each category
    const averageRatings = {
      punctuality: 0,
      comfort: 0,
      cleanliness: 0,
      driverBehavior: 0,
      safety: 0,
      valueForMoney: 0,
      overall: 0,
    };

    reviews.forEach((review) => {
      Object.keys(review.ratings).forEach((key) => {
        averageRatings[key] += review.ratings[key];
      });
    });

    Object.keys(averageRatings).forEach((key) => {
      if (key !== "overall") {
        averageRatings[key] = parseFloat(
          (averageRatings[key] / reviews.length).toFixed(2)
        );
      }
    });

    // Calculate overall average
    const ratingKeys = Object.keys(averageRatings).filter(
      (key) => key !== "overall"
    );
    averageRatings.overall = parseFloat(
      (
        ratingKeys.reduce((sum, key) => sum + averageRatings[key], 0) /
        ratingKeys.length
      ).toFixed(2)
    );

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const ratings = Object.values(review.ratings);
      const avgRating = Math.round(
        ratings.reduce((a, b) => a + b, 0) / ratings.length
      );
      ratingDistribution[avgRating]++;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalReviews: reviews.length,
        averageRatings,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
