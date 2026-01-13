import Feedback from "../models/Feedback.model.js";
import User from "../models/User.model.js";

const ALLOWED_CATEGORIES = [
  "Delay",
  "Cleanliness",
  "Safety",
  "Driver Behavior",
  "Route Efficiency",
  "Other",
];

export const createFeedback = async (req, res) => {
  try {
    const { busId, rating, categories = [], comment, suggestion } = req.body;
    const auth0Id = req.auth?.sub;

    if (!auth0Id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ success: false, message: "Login first" });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be a number between 1 and 5" });
    }

    if (!Array.isArray(categories)) {
      return res
        .status(400)
        .json({ success: false, message: "Categories must be an array" });
    }

    const invalid = categories.some((c) => !ALLOWED_CATEGORIES.includes(c));
    if (invalid) {
      return res
        .status(400)
        .json({ success: false, message: "One or more categories are invalid" });
    }

    const feedback = new Feedback({
      busId: busId || null,
      userId: user._id,
      rating,
      categories,
      comment,
      suggestion,
    });

    await feedback.save();

    return res.status(201).json({ success: true, message: "Feedback submitted", data: feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const auth0Id = req.auth?.sub;
    if (!auth0Id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ auth0Id });
    if (!user || user.status !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { page = 1, limit = 20, busId, category, minRating } = req.query;
    const filter = {};
    if (busId) filter.busId = busId;
    if (category) filter.categories = category;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Feedback.countDocuments(filter);
    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email");

    return res.status(200).json({ success: true, total, page: Number(page), feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
