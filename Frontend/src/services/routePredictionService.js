/**
 * Route Prediction Service
 * Handles API calls for AI-based route predictions
 */
class RoutePredictionService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";
    }

    /**
     * Get ETA prediction for a bus at a specific location
     * @param {string} busId - Bus ID
     * @param {Object} destination - Optional destination coordinates {lat, lng}
     * @returns {Promise<Object>} ETA prediction result
     */
    async getETAPrediction(busId, destination = null) {
        try {
            let url = `${this.baseUrl}/predict/eta?busId=${busId}`;
            if (destination) {
                url += `&lat=${destination.lat}&lng=${destination.lng}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get ETA prediction");
            }

            return {
                success: true,
                ...data,
            };
        } catch (error) {
            console.error("ETA prediction error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get optimal route predictions between two locations
     * @param {Object} from - Origin coordinates {lat, lng}
     * @param {Object} to - Destination coordinates {lat, lng}
     * @returns {Promise<Object>} Route predictions
     */
    async getOptimalRoutes(from, to) {
        try {
            const url = `${this.baseUrl}/predict/route?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get route predictions");
            }

            return {
                success: true,
                routes: data.routes || [],
                recommendedRoute: data.recommendedRoute,
                metadata: data.metadata,
            };
        } catch (error) {
            console.error("Route prediction error:", error);
            return {
                success: false,
                error: error.message,
                routes: [],
            };
        }
    }

    /**
     * Get delay forecast for a specific route
     * @param {string} routeId - Route ID
     * @returns {Promise<Object>} Delay prediction
     */
    async getDelayForecast(routeId) {
        try {
            const response = await fetch(`${this.baseUrl}/predict/delays/${routeId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get delay forecast");
            }

            return {
                success: true,
                ...data,
            };
        } catch (error) {
            console.error("Delay forecast error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get reliability score for a route
     * @param {string} routeId - Route ID
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Promise<Object>} Reliability score
     */
    async getReliabilityScore(routeId, days = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}/predict/reliability/${routeId}?days=${days}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get reliability score");
            }

            return {
                success: true,
                ...data,
            };
        } catch (error) {
            console.error("Reliability score error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Submit feedback to improve prediction accuracy
     * @param {Object} feedback - Feedback data
     * @returns {Promise<Object>} Submission result
     */
    async submitFeedback(feedback) {
        try {
            const response = await fetch(`${this.baseUrl}/predict/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(feedback),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit feedback");
            }

            return {
                success: true,
                ...data,
            };
        } catch (error) {
            console.error("Feedback submission error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get prediction model statistics
     * @returns {Promise<Object>} Model statistics
     */
    async getModelStats() {
        try {
            const response = await fetch(`${this.baseUrl}/predict/stats`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get model stats");
            }

            return {
                success: true,
                ...data,
            };
        } catch (error) {
            console.error("Model stats error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Format minutes into human-readable duration
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
     * Get color based on confidence level
     * @param {number} confidence - Confidence score (0-100)
     * @returns {string} Color code
     */
    getConfidenceColor(confidence) {
        if (confidence >= 70) return "#22c55e"; // Green
        if (confidence >= 40) return "#f59e0b"; // Amber
        return "#ef4444"; // Red
    }

    /**
     * Get color based on reliability score
     * @param {number} score - Reliability score (0-100)
     * @returns {string} Color code
     */
    getReliabilityColor(score) {
        if (score >= 80) return "#22c55e"; // Green - Excellent
        if (score >= 60) return "#84cc16"; // Lime - Good
        if (score >= 40) return "#f59e0b"; // Amber - Fair
        return "#ef4444"; // Red - Poor
    }

    /**
     * Get delay risk level styling
     * @param {number} probability - Delay probability percentage
     * @returns {Object} Style configuration
     */
    getDelayRiskStyle(probability) {
        if (probability > 60) {
            return {
                color: "#ef4444",
                bgColor: "#fef2f2",
                label: "High Risk",
                icon: "⚠️",
            };
        }
        if (probability > 30) {
            return {
                color: "#f59e0b",
                bgColor: "#fffbeb",
                label: "Medium Risk",
                icon: "⚡",
            };
        }
        return {
            color: "#22c55e",
            bgColor: "#f0fdf4",
            label: "Low Risk",
            icon: "✓",
        };
    }
}

export const routePredictionService = new RoutePredictionService();
export default RoutePredictionService;
