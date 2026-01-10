import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";
import TripHistory from "../models/TripHistory.model.js";
import {
    calculateWeightedAverage,
    getTimeSlotFactor,
    getDayOfWeekFactor,
    getWeatherFactor,
    predictETAFromHistory,
    calculateDelayProbability,
    calculateConfidenceScore,
    calculateVariance,
    generatePredictionExplanation,
} from "../utils/prediction.utils.js";
import { calculateDistance } from "./Journey.controller.js";
import { isOfflineMode, mockDataHelpers, mockBuses, mockLocations } from "../utils/mockData.js";

/**
 * Predict ETA for a bus at a specific stop
 * GET /api/v1/predict/eta?busId=xxx&stopId=xxx
 */
export const predictETA = async (req, res) => {
    try {
        const { busId, stopId, lat, lng } = req.query;

        if (!busId) {
            return res.status(400).json({
                success: false,
                error: "Bus ID is required",
            });
        }

        let bus;
        let historicalTrips = [];

        if (isOfflineMode) {
            // Use mock data
            bus = mockDataHelpers.findBusByDeviceId(busId);
            if (!bus) {
                // Return first mock bus if specific one not found
                bus = { ...mockBuses[0], deviceID: busId };
            }
            historicalTrips = mockDataHelpers.getRecentTrips(bus._id, 60);
        } else {
            // Use database
            bus = await Bus.findOne({ deviceID: busId }).populate("location");
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    error: "Bus not found",
                });
            }
            historicalTrips = await TripHistory.getRecentTrips(bus._id, 60);
        }

        // Get current conditions
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        // Calculate distance to destination
        let distance = 0;
        if (lat && lng && bus.location) {
            const busLat = bus.location.location?.coordinates?.[1] || bus.location?.coordinates?.[1] || 12.9716;
            const busLng = bus.location.location?.coordinates?.[0] || bus.location?.coordinates?.[0] || 77.5946;
            distance = calculateDistance(busLat, busLng, parseFloat(lat), parseFloat(lng)) / 1000; // km
        }

        // Predict ETA
        const prediction = predictETAFromHistory(historicalTrips, distance || 5, {
            hour,
            dayOfWeek,
            weather: "unknown",
        });

        // Calculate arrival time
        const arrivalTime = new Date(now.getTime() + prediction.predictedMinutes * 60000);

        res.json({
            success: true,
            prediction: {
                busId,
                busName: bus.name,
                estimatedMinutes: prediction.predictedMinutes,
                estimatedArrival: arrivalTime.toISOString(),
                estimatedArrivalFormatted: arrivalTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                confidence: prediction.confidence,
                confidenceLevel:
                    prediction.confidence >= 70
                        ? "high"
                        : prediction.confidence >= 40
                            ? "medium"
                            : "low",
                explanation: generatePredictionExplanation(prediction),
                factors: prediction.factors,
                statistics: prediction.statistics,
                method: prediction.method,
            },
            metadata: {
                requestTime: now.toISOString(),
                dataPoints: prediction.sampleSize || 0,
                offlineMode: isOfflineMode,
            },
        });
    } catch (error) {
        console.error("ETA prediction error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to predict ETA",
            details: error.message,
        });
    }
};

/**
 * Predict optimal route between two locations
 * GET /api/v1/predict/route?fromLat=x&fromLng=x&toLat=x&toLng=x
 */
export const predictOptimalRoute = async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({
                success: false,
                error: "Origin and destination coordinates are required",
            });
        }

        const from = { lat: parseFloat(fromLat), lng: parseFloat(fromLng) };
        const to = { lat: parseFloat(toLat), lng: parseFloat(toLng) };

        // Get current conditions
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        let routes = [];

        if (isOfflineMode) {
            // Use mock data for predictions
            for (const mockBus of mockBuses) {
                const historicalTrips = mockDataHelpers.getRecentTrips(mockBus._id, 30);
                const directDistance = calculateDistance(from.lat, from.lng, to.lat, to.lng) / 1000;

                const prediction = predictETAFromHistory(historicalTrips, directDistance, {
                    hour,
                    dayOfWeek,
                });

                const delayInfo = calculateDelayProbability(historicalTrips);
                const reliability = mockDataHelpers.getRouteReliability(mockBus.deviceID, 30);

                routes.push({
                    busId: mockBus.deviceID,
                    busName: mockBus.name,
                    from: mockBus.from,
                    to: mockBus.to,
                    estimatedMinutes: prediction.predictedMinutes,
                    estimatedArrival: new Date(
                        now.getTime() + prediction.predictedMinutes * 60000
                    ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                    confidence: prediction.confidence,
                    reliabilityScore: reliability.score,
                    delayProbability: delayInfo.probabilityPercentage,
                    averageDelay: delayInfo.averageDelay,
                    distance: Math.round(directDistance * 10) / 10,
                    factors: prediction.factors,
                });
            }
        } else {
            // Find buses near the starting point
            const nearbyBuses = await Location.find({
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [from.lng, from.lat] },
                        $maxDistance: 2000, // 2km radius
                    },
                },
            }).limit(10);

            for (const locationDoc of nearbyBuses) {
                try {
                    const bus = await Bus.findOne({ location: locationDoc._id });
                    if (!bus) continue;

                    // Get historical data for this route
                    const historicalTrips = await TripHistory.getRecentTrips(bus._id, 30);

                    // Calculate distance
                    const directDistance = calculateDistance(from.lat, from.lng, to.lat, to.lng) / 1000;

                    // Predict ETA
                    const prediction = predictETAFromHistory(historicalTrips, directDistance, {
                        hour,
                        dayOfWeek,
                    });

                    // Get delay probability
                    const delayInfo = calculateDelayProbability(historicalTrips);

                    // Get reliability score
                    const reliability = await TripHistory.getRouteReliability(
                        bus.deviceID,
                        30
                    );

                    routes.push({
                        busId: bus.deviceID,
                        busName: bus.name || `Route ${bus.deviceID}`,
                        from: bus.from || "Origin",
                        to: bus.to || "Destination",
                        estimatedMinutes: prediction.predictedMinutes,
                        estimatedArrival: new Date(
                            now.getTime() + prediction.predictedMinutes * 60000
                        ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                        confidence: prediction.confidence,
                        reliabilityScore: reliability.score,
                        delayProbability: delayInfo.probabilityPercentage,
                        averageDelay: delayInfo.averageDelay,
                        distance: Math.round(directDistance * 10) / 10,
                        factors: prediction.factors,
                    });
                } catch (busError) {
                    console.error("Error processing bus:", busError);
                    continue;
                }
            }
        }

        // Sort routes by estimated time and reliability
        routes.sort((a, b) => {
            // Prioritize reliability, then ETA
            const scoreA = a.reliabilityScore * 0.4 + (100 - a.estimatedMinutes) * 0.6;
            const scoreB = b.reliabilityScore * 0.4 + (100 - b.estimatedMinutes) * 0.6;
            return scoreB - scoreA;
        });

        res.json({
            success: true,
            routes: routes.slice(0, 5), // Return top 5 routes
            recommendedRoute: routes[0] || null,
            metadata: {
                requestTime: now.toISOString(),
                routesAnalyzed: routes.length,
                offlineMode: isOfflineMode,
                currentConditions: {
                    hour,
                    dayOfWeek,
                    timeSlotFactor: getTimeSlotFactor(hour),
                    dayFactor: getDayOfWeekFactor(dayOfWeek),
                },
            },
        });
    } catch (error) {
        console.error("Route prediction error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to predict optimal route",
            details: error.message,
        });
    }
};

/**
 * Get delay prediction for a specific route
 * GET /api/v1/predict/delays/:routeId
 */
export const getDelayPrediction = async (req, res) => {
    try {
        const { routeId } = req.params;

        if (!routeId) {
            return res.status(400).json({
                success: false,
                error: "Route ID is required",
            });
        }

        // Get current conditions
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        let historicalTrips = [];

        if (isOfflineMode) {
            historicalTrips = mockDataHelpers.getHistoricalData(routeId, dayOfWeek, hour, 50);
            // If no data for this route, use general mock data
            if (historicalTrips.length === 0) {
                historicalTrips = mockDataHelpers.getHistoricalData("ROUTE001", dayOfWeek, hour, 50);
            }
        } else {
            historicalTrips = await TripHistory.getHistoricalData(
                routeId,
                dayOfWeek,
                hour,
                50
            );
        }

        const delayInfo = calculateDelayProbability(historicalTrips);

        // Adjust for current conditions
        const timeFactor = getTimeSlotFactor(hour);
        const dayFactor = getDayOfWeekFactor(dayOfWeek);
        const conditionMultiplier = (timeFactor + dayFactor) / 2;

        const adjustedProbability = Math.min(
            1,
            delayInfo.probability * conditionMultiplier
        );

        res.json({
            success: true,
            routeId,
            prediction: {
                delayProbability: Math.round(adjustedProbability * 100),
                delayProbabilityRaw: delayInfo.probabilityPercentage,
                expectedDelay: delayInfo.averageDelay,
                maxHistoricalDelay: delayInfo.maxDelay,
                riskLevel:
                    adjustedProbability > 0.6
                        ? "high"
                        : adjustedProbability > 0.3
                            ? "medium"
                            : "low",
                confidence: delayInfo.confidence,
            },
            currentConditions: {
                hour,
                dayOfWeek,
                timeSlotFactor: timeFactor,
                dayFactor,
                isPeakHour: timeFactor > 1.3,
            },
            metadata: {
                requestTime: now.toISOString(),
                dataPoints: delayInfo.sampleSize,
                offlineMode: isOfflineMode,
            },
        });
    } catch (error) {
        console.error("Delay prediction error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to predict delays",
            details: error.message,
        });
    }
};

/**
 * Get route reliability score
 * GET /api/v1/predict/reliability/:routeId
 */
export const getRouteReliability = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { days = 30 } = req.query;

        if (!routeId) {
            return res.status(400).json({
                success: false,
                error: "Route ID is required",
            });
        }

        let reliability;
        let recentPerformance = [];

        if (isOfflineMode) {
            reliability = mockDataHelpers.getRouteReliability(routeId, parseInt(days));
            // Generate mock recent performance
            recentPerformance = Array.from({ length: 5 }, (_, i) => ({
                date: new Date(Date.now() - i * 86400000),
                delay: Math.floor(Math.random() * 10) - 2,
                duration: 35 + Math.floor(Math.random() * 15),
            }));
        } else {
            reliability = await TripHistory.getRouteReliability(
                routeId,
                parseInt(days)
            );

            // Get additional statistics
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            const recentTrips = await TripHistory.find({
                routeId,
                date: { $gte: startDate },
            })
                .sort({ date: -1 })
                .limit(10)
                .lean();

            recentPerformance = recentTrips.map((trip) => ({
                date: trip.date,
                delay: trip.delayMinutes,
                duration: trip.actualDuration,
            }));
        }

        res.json({
            success: true,
            routeId,
            reliability: {
                score: reliability.score,
                scoreLabel:
                    reliability.score >= 80
                        ? "Excellent"
                        : reliability.score >= 60
                            ? "Good"
                            : reliability.score >= 40
                                ? "Fair"
                                : "Poor",
                onTimePercentage: reliability.onTimePercentage,
                averageDelay: reliability.averageDelay,
                sampleSize: reliability.sampleSize,
            },
            recentPerformance,
            metadata: {
                queryDays: parseInt(days),
                requestTime: new Date().toISOString(),
                offlineMode: isOfflineMode,
            },
        });
    } catch (error) {
        console.error("Reliability calculation error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to calculate reliability",
            details: error.message,
        });
    }
};

/**
 * Submit prediction feedback for model improvement
 * POST /api/v1/predict/feedback
 */
export const submitPredictionFeedback = async (req, res) => {
    try {
        const {
            busId,
            routeId,
            predictedMinutes,
            actualMinutes,
            predictedArrival,
            actualArrival,
            conditions,
        } = req.body;

        if (!busId || !routeId) {
            return res.status(400).json({
                success: false,
                error: "Bus ID and Route ID are required",
            });
        }

        if (isOfflineMode) {
            // In offline mode, just acknowledge the feedback
            const accuracy = actualMinutes
                ? Math.max(0, 100 - Math.abs(actualMinutes - predictedMinutes) * 5)
                : null;

            return res.json({
                success: true,
                message: "Feedback recorded (offline mode - not persisted)",
                feedback: {
                    tripId: `offline-${Date.now()}`,
                    predictedMinutes,
                    actualMinutes,
                    difference: actualMinutes ? actualMinutes - predictedMinutes : null,
                    accuracyScore: accuracy,
                },
                offlineMode: true,
            });
        }

        // Find the bus
        const bus = await Bus.findOne({ deviceID: busId });
        if (!bus) {
            return res.status(404).json({
                success: false,
                error: "Bus not found",
            });
        }

        // Create a new trip history entry from feedback
        const now = new Date();
        const tripData = {
            busId: bus._id,
            routeId,
            date: now,
            dayOfWeek: now.getDay(),
            timeSlot: now.getHours(),
            startTime: predictedArrival
                ? new Date(new Date(predictedArrival).getTime() - predictedMinutes * 60000)
                : new Date(now.getTime() - (actualMinutes || predictedMinutes) * 60000),
            endTime: actualArrival ? new Date(actualArrival) : now,
            actualDuration: actualMinutes || predictedMinutes,
            expectedDuration: predictedMinutes,
            delayMinutes: (actualMinutes || predictedMinutes) - predictedMinutes,
            weather: conditions?.weather || { condition: "unknown" },
            trafficLevel: conditions?.trafficLevel || 3,
        };

        const tripHistory = new TripHistory(tripData);
        await tripHistory.save();

        // Calculate accuracy
        const accuracy = actualMinutes
            ? Math.max(0, 100 - Math.abs(actualMinutes - predictedMinutes) * 5)
            : null;

        res.json({
            success: true,
            message: "Feedback recorded successfully",
            feedback: {
                tripId: tripHistory._id,
                predictedMinutes,
                actualMinutes,
                difference: actualMinutes ? actualMinutes - predictedMinutes : null,
                accuracyScore: accuracy,
            },
        });
    } catch (error) {
        console.error("Feedback submission error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to submit feedback",
            details: error.message,
        });
    }
};

/**
 * Get prediction statistics and model info
 * GET /api/v1/predict/stats
 */
export const getPredictionStats = async (req, res) => {
    try {
        const now = new Date();

        let totalTrips, stats, uniqueRoutes;

        if (isOfflineMode) {
            totalTrips = mockDataHelpers.getTripCount(30);
            stats = mockDataHelpers.getAggregateStats();
            uniqueRoutes = mockDataHelpers.getUniqueRoutes();
        } else {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            totalTrips = await TripHistory.countDocuments({
                date: { $gte: thirtyDaysAgo },
            });

            const aggregateStats = await TripHistory.aggregate([
                { $match: { date: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: null,
                        avgDuration: { $avg: "$actualDuration" },
                        avgDelay: { $avg: "$delayMinutes" },
                        totalTrips: { $sum: 1 },
                    },
                },
            ]);

            stats = aggregateStats[0] || {
                avgDuration: 0,
                avgDelay: 0,
                totalTrips: 0,
            };

            uniqueRoutes = await TripHistory.distinct("routeId", {
                date: { $gte: thirtyDaysAgo },
            });
        }

        res.json({
            success: true,
            statistics: {
                totalTripsLast30Days: totalTrips,
                averageTripDuration: Math.round((stats.avgDuration || 0) * 10) / 10,
                averageDelay: Math.round((stats.avgDelay || 0) * 10) / 10,
                uniqueRoutes: uniqueRoutes.length,
                dataQuality:
                    totalTrips > 100 ? "Good" : totalTrips > 20 ? "Moderate" : "Limited",
            },
            modelInfo: {
                version: "1.0.0",
                algorithm: "Weighted Historical Average with Condition Adjustment",
                lastUpdated: now.toISOString(),
                features: [
                    "Time-of-day factor",
                    "Day-of-week factor",
                    "Weather adjustment",
                    "Historical weighted average",
                    "Confidence scoring",
                ],
            },
            offlineMode: isOfflineMode,
        });
    } catch (error) {
        console.error("Stats retrieval error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve statistics",
            details: error.message,
        });
    }
};
