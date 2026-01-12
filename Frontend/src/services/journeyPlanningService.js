// services/journeyPlanningService.js
class JourneyPlanningService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_BASE_URL;
  }

  /**
   * Find multi-leg journey options between two points
   * @param {Object} from - Starting coordinates {lat, lon}
   * @param {Object} to - Destination coordinates {lat, lon}
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Journey planning result
   */
  async planJourney(from, to, options = {}) {
    try {
      const defaultOptions = {
        maxTransfers: 2,
        maxWalkingDistance: 1000, // meters
        maxTotalTime: 120, // minutes
        departureTime: new Date().toISOString(),
        ...options,
      };

      const response = await fetch(`${this.baseUrl}/api/v1/journey-planner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          options: defaultOptions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Journey planning failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        journeys: data.journeys || [],
        directRoutes: data.directRoutes || [],
        metadata: data.metadata || {},
      };
    } catch (error) {
      console.error("Journey planning error:", error);
      return {
        success: false,
        error: error.message,
        journeys: [],
        directRoutes: [],
      };
    }
  }

  /**
   * Get transfer points near a location
   * @param {Object} coordinates - {lat, lon}
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Array>} List of transfer points
   */
  async getTransferPoints(coordinates, radius = 500) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/transfer-points?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transfer points");
      }

      const data = await response.json();
      return data.transferPoints || [];
    } catch (error) {
      console.error("Transfer points error:", error);
      return [];
    }
  }

  /**
   * Calculate walking route between two points
   * @param {Object} from - Starting coordinates
   * @param {Object} to - Destination coordinates
   * @returns {Promise<Object>} Walking route information
   */
  async getWalkingRoute(from, to) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/walking-route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to }),
      });

      if (!response.ok) {
        return {
          distance: this.calculateDistance(from, to),
          duration: Math.ceil(this.calculateDistance(from, to) / 80), // Assuming 80m/min walking speed
          instructions: ["Walk to destination"],
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Walking route error:", error);
      return {
        distance: this.calculateDistance(from, to),
        duration: Math.ceil(this.calculateDistance(from, to) / 80),
        instructions: ["Walk to destination"],
      };
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {Object} from - {lat, lon}
   * @param {Object} to - {lat, lon}
   * @returns {number} Distance in meters
   */
  calculateDistance(from, to) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
    const Δλ = ((to.lon - from.lon) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format journey duration
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? mins + "m" : ""}`;
  }

  /**
   * Format distance
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Validate journey planning request
   * @param {Object} from - Starting coordinates
   * @param {Object} to - Destination coordinates
   * @returns {boolean} Is valid request
   */
  validateJourneyRequest(from, to) {
    if (!from || !to) return false;
    if (typeof from.lat !== "number" || typeof from.lon !== "number")
      return false;
    if (typeof to.lat !== "number" || typeof to.lon !== "number") return false;
    if (Math.abs(from.lat) > 90 || Math.abs(to.lat) > 90) return false;
    if (Math.abs(from.lon) > 180 || Math.abs(to.lon) > 180) return false;
    return true;
  }
}

export const journeyPlanningService = new JourneyPlanningService();
