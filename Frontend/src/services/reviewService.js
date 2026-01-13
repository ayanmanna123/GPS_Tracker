import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Create a new review for a bus
 * @param {string} token - Auth token
 * @param {object} reviewData - { busId, ratings, comment, photos }
 * @returns {Promise} Review response
 */
export const createReview = async (token, reviewData) => {
  const response = await axios.post(
    `${BASE_URL}/review/reviews`,
    reviewData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Get all reviews for a specific bus with filters
 * @param {string} busId - Bus device ID
 * @param {object} params - { rating, sortBy, order, page, limit }
 * @returns {Promise} Reviews list with pagination
 */
export const getBusReviews = async (busId, params = {}) => {
  const response = await axios.get(
    `${BASE_URL}/review/reviews/${busId}`,
    { params }
  );
  return response.data;
};

/**
 * Get review statistics for a bus
 * @param {string} busId - Bus device ID
 * @returns {Promise} Review statistics
 */
export const getBusReviewStats = async (busId) => {
  const response = await axios.get(
    `${BASE_URL}/review/reviews/${busId}/stats`
  );
  return response.data;
};

/**
 * Report a review
 * @param {string} token - Auth token
 * @param {string} reviewId - Review ID
 * @param {object} reportData - { reason, description }
 * @returns {Promise} Report response
 */
export const reportReview = async (token, reviewId, reportData) => {
  const response = await axios.post(
    `${BASE_URL}/review/reviews/${reviewId}/report`,
    reportData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Mark a review as helpful or remove helpful mark
 * @param {string} token - Auth token
 * @param {string} reviewId - Review ID
 * @returns {Promise} Helpful response
 */
export const markReviewHelpful = async (token, reviewId) => {
  const response = await axios.post(
    `${BASE_URL}/review/reviews/${reviewId}/helpful`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Upload review photos (helper function for future cloud storage integration)
 * @param {File[]} photos - Array of photo files
 * @returns {Promise<string[]>} Array of photo URLs
 */
export const uploadReviewPhotos = async (photos) => {
  // TODO: Implement cloud storage upload (e.g., Cloudinary, AWS S3)
  // For now, we're using base64 encoding
  const photoPromises = photos.map((photo) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(photo);
    });
  });
  
  return Promise.all(photoPromises);
};
