import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Update real-time tracking data for a bus
 * @param {string} token - Auth token
 * @param {object} trackingData - { deviceID, speed, direction, passengers, trafficLevel }
 * @returns {Promise} Tracking update response
 */
export const updateTrackingData = async (token, trackingData) => {
  const response = await axios.post(
    `${BASE_URL}/tracking/update-tracking`,
    trackingData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Get enhanced tracking info for a specific bus
 * @param {string} deviceID - Bus device ID
 * @returns {Promise} Enhanced tracking data
 */
export const getEnhancedTrackingInfo = async (deviceID) => {
  const response = await axios.get(`${BASE_URL}/tracking/bus/${deviceID}`);
  return response.data;
};

/**
 * Get tracking info for multiple buses
 * @param {string[]} deviceIDs - Array of device IDs (max 10)
 * @returns {Promise} Multiple bus tracking data
 */
export const getMultipleBusTracking = async (deviceIDs) => {
  const response = await axios.post(`${BASE_URL}/tracking/multiple-buses`, {
    deviceIDs,
  });
  return response.data;
};

/**
 * Share bus location with friends
 * @param {string} token - Auth token
 * @param {object} shareData - { deviceID, shareWithEmails, expirationHours }
 * @returns {Promise} Share response with link
 */
export const shareBusLocation = async (token, shareData) => {
  const response = await axios.post(
    `${BASE_URL}/tracking/share-location`,
    shareData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Update passenger count
 * @param {string} token - Auth token
 * @param {object} countData - { deviceID, action: 'board' | 'alight' }
 * @returns {Promise} Updated capacity info
 */
export const updatePassengerCount = async (token, countData) => {
  const response = await axios.post(
    `${BASE_URL}/tracking/passenger-count`,
    countData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Calculate ETA to destination
 * @param {object} etaData - { deviceID, destinationLat, destinationLng }
 * @returns {Promise} ETA calculation result
 */
export const calculateETA = async (etaData) => {
  const response = await axios.post(`${BASE_URL}/tracking/calculate-eta`, etaData);
  return response.data;
};

/**
 * Start real-time tracking for a bus (helper function)
 * @param {string} deviceID - Bus device ID
 * @param {function} onUpdate - Callback for updates
 * @param {number} interval - Update interval in ms (default: 5000)
 * @returns {function} Stop function
 */
export const startRealTimeTracking = (deviceID, onUpdate, interval = 5000) => {
  const fetchData = async () => {
    try {
      const data = await getEnhancedTrackingInfo(deviceID);
      onUpdate(data);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    }
  };

  // Initial fetch
  fetchData();

  // Set up interval
  const intervalId = setInterval(fetchData, interval);

  // Return stop function
  return () => clearInterval(intervalId);
};

/**
 * Get traffic condition color
 * @param {string} level - Traffic level
 * @returns {string} Color class
 */
export const getTrafficColor = (level) => {
  const colors = {
    light: "text-green-500",
    moderate: "text-yellow-500",
    heavy: "text-orange-500",
    severe: "text-red-500",
    unknown: "text-gray-500",
  };
  return colors[level] || colors.unknown;
};

/**
 * Get direction arrow based on bearing
 * @param {number} direction - Direction in degrees (0-360)
 * @returns {string} Arrow character
 */
export const getDirectionArrow = (direction) => {
  const arrows = {
    N: "↑",
    NE: "↗",
    E: "→",
    SE: "↘",
    S: "↓",
    SW: "↙",
    W: "←",
    NW: "↖",
  };

  const deg = direction || 0;
  if (deg >= 337.5 || deg < 22.5) return arrows.N;
  if (deg >= 22.5 && deg < 67.5) return arrows.NE;
  if (deg >= 67.5 && deg < 112.5) return arrows.E;
  if (deg >= 112.5 && deg < 157.5) return arrows.SE;
  if (deg >= 157.5 && deg < 202.5) return arrows.S;
  if (deg >= 202.5 && deg < 247.5) return arrows.SW;
  if (deg >= 247.5 && deg < 292.5) return arrows.W;
  if (deg >= 292.5 && deg < 337.5) return arrows.NW;
  return arrows.N;
};

/**
 * Format ETA as human-readable countdown
 * @param {Date|string} etaDate - ETA date
 * @returns {string} Formatted ETA
 */
export const formatETACountdown = (etaDate) => {
  if (!etaDate) return null;

  const now = new Date();
  const eta = new Date(etaDate);
  const diffMs = eta - now;

  if (diffMs < 0) return "Arrived";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Get seat availability status
 * @param {object} capacity - { totalSeats, occupiedSeats, availableSeats }
 * @returns {object} { status, color, message }
 */
export const getSeatAvailabilityStatus = (capacity) => {
  if (!capacity) return { status: "unknown", color: "gray", message: "Unknown" };

  const { availableSeats } = capacity;

  if (availableSeats > 10) {
    return {
      status: "available",
      color: "green",
      message: "Seats Available",
    };
  } else if (availableSeats > 5) {
    return {
      status: "limited",
      color: "yellow",
      message: "Limited Seats",
    };
  } else if (availableSeats > 0) {
    return {
      status: "few",
      color: "orange",
      message: "Few Seats",
    };
  } else {
    return {
      status: "full",
      color: "red",
      message: "Bus Full",
    };
  }
};
