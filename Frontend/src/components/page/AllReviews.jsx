import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import Navbar from "../shared/Navbar";
import {
  Star,
  Filter,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const AllReviews = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    rating: "",
    sortBy: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });
  const [expandedReview, setExpandedReview] = useState(null);
  const [reportModal, setReportModal] = useState({ open: false, reviewId: null });
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [busId, filters, pagination.currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/review/reviews/${busId}`,
        {
          params: {
            ...filters,
            page: pagination.currentPage,
            limit: 10,
          },
        }
      );

      if (response.data.success) {
        setReviews(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/review/reviews/${busId}/stats`
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Please login to mark review as helpful");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/review/reviews/${reviewId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
      toast.error(error.response?.data?.message || "Failed to mark as helpful");
    }
  };

  const handleReportReview = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/review/reviews/${reportModal.reviewId}/report`,
        {
          reason: reportReason,
          description: reportDescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Review reported successfully");
        setReportModal({ open: false, reviewId: null });
        setReportReason("");
        setReportDescription("");
        fetchReviews();
      }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error(error.response?.data?.message || "Failed to report review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : darktheme
                  ? "text-gray-600"
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating, count) => {
    const percentage =
      stats?.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

    return (
      <div className="flex items-center gap-3">
        <span className={`text-sm w-12 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
          {rating} {renderStars(rating)}
        </span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm w-12 text-right ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
          {count}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 px-4 py-2 rounded-lg ${
              darktheme
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ← Back
          </button>
          <h1
            className={`text-4xl font-bold mb-2 ${
              darktheme ? "text-white" : "text-gray-900"
            }`}
          >
            Bus Reviews
          </h1>
          <p className={darktheme ? "text-gray-400" : "text-gray-600"}>
            See what passengers say about this bus
          </p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div
            className={`rounded-2xl p-6 mb-8 ${
              darktheme ? "bg-gray-800/80 border border-gray-700" : "bg-white shadow-lg"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {stats.averageRatings?.overall || "N/A"}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.averageRatings?.overall || 0))}
                </div>
                <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                  Based on {stats.totalReviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2 space-y-2">
                <h3 className={`font-semibold mb-3 ${darktheme ? "text-white" : "text-gray-900"}`}>
                  Rating Distribution
                </h3>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating}>
                    {renderRatingBar(rating, stats.ratingDistribution?.[rating] || 0)}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-700">
              {stats.averageRatings &&
                Object.entries(stats.averageRatings)
                  .filter(([key]) => key !== "overall")
                  .map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {value}
                      </div>
                      <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          className={`rounded-xl p-4 mb-6 flex flex-wrap gap-4 ${
            darktheme ? "bg-gray-800/80" : "bg-white shadow"
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
              Filters:
            </span>
          </div>

          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darktheme
                ? "bg-gray-900 text-white border-gray-700"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border`}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darktheme
                ? "bg-gray-900 text-white border-gray-700"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border`}
          >
            <option value="createdAt">Most Recent</option>
            <option value="helpful">Most Helpful</option>
          </select>

          <select
            value={filters.order}
            onChange={(e) => handleFilterChange("order", e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darktheme
                ? "bg-gray-900 text-white border-gray-700"
                : "bg-gray-50 text-gray-900 border-gray-300"
            } border`}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div
            className={`text-center py-20 rounded-xl ${
              darktheme ? "bg-gray-800/80" : "bg-white shadow"
            }`}
          >
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={`text-xl ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`rounded-xl p-6 ${
                  darktheme ? "bg-gray-800/80 border border-gray-700" : "bg-white shadow-lg"
                }`}
              >
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          darktheme ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {review.userName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                          {review.userName || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.averageRating)}
                          <span className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                            {review.averageRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {Object.entries(review.ratings).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-2 rounded-lg ${
                        darktheme ? "bg-gray-900/50" : "bg-gray-50"
                      }`}
                    >
                      <p className={`text-xs mb-1 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(value)}</div>
                        <span className="text-sm font-semibold">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className={`mb-4 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                    {review.comment}
                  </p>
                )}

                {/* Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo, "_blank")}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      darktheme
                        ? "bg-gray-900/50 hover:bg-gray-900 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpfulCount || 0})
                  </button>

                  <button
                    onClick={() => setReportModal({ open: true, reviewId: review._id })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      darktheme
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        : "bg-red-50 hover:bg-red-100 text-red-600"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={pagination.currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                pagination.currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-700"
              } ${darktheme ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
              Previous
            </button>
            <span className={`px-4 py-2 ${darktheme ? "text-white" : "text-gray-900"}`}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
                }))
              }
              disabled={!pagination.hasMore}
              className={`px-4 py-2 rounded-lg ${
                !pagination.hasMore ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
              } ${darktheme ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl p-6 max-w-md w-full ${
              darktheme ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className={`text-xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-900"}`}>
              Report Review
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                  Reason *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darktheme
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="offensive">Offensive Language</option>
                  <option value="fake">Fake Review</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                  Description (Optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    darktheme
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setReportModal({ open: false, reviewId: null });
                  setReportReason("");
                  setReportDescription("");
                }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  darktheme
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleReportReview}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReviews;
