/**
 * Prediction Utility Functions
 * Contains ML-based helper functions for route prediction
 */

/**
 * Calculate weighted average with exponential decay
 * More recent values have higher weights
 * @param {Array<number>} values - Array of values
 * @param {number} decayFactor - Decay factor (0-1), higher = more weight on recent
 * @returns {number} Weighted average
 */
export const calculateWeightedAverage = (values, decayFactor = 0.9) => {
    if (!values || values.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    values.forEach((value, index) => {
        const weight = Math.pow(decayFactor, index);
        weightedSum += value * weight;
        totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

/**
 * Get traffic multiplier based on time of day
 * Peak hours have higher multipliers
 * @param {number} hour - Hour of day (0-23)
 * @returns {number} Traffic multiplier (1.0 - 2.0)
 */
export const getTimeSlotFactor = (hour) => {
    // Morning peak: 7-10 AM
    if (hour >= 7 && hour <= 10) {
        return 1.4 + (hour === 8 || hour === 9 ? 0.3 : 0);
    }
    // Evening peak: 5-8 PM
    if (hour >= 17 && hour <= 20) {
        return 1.5 + (hour === 17 || hour === 18 ? 0.3 : 0);
    }
    // Moderate traffic: 11 AM - 4 PM
    if (hour >= 11 && hour <= 16) {
        return 1.2;
    }
    // Late night / early morning: low traffic
    if (hour >= 22 || hour <= 5) {
        return 0.8;
    }
    // Default moderate traffic
    return 1.0;
};

/**
 * Get day of week traffic factor
 * @param {number} dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @returns {number} Traffic factor (0.7 - 1.3)
 */
export const getDayOfWeekFactor = (dayOfWeek) => {
    const factors = {
        0: 0.7, // Sunday - lightest traffic
        1: 1.2, // Monday - high (start of week)
        2: 1.1, // Tuesday
        3: 1.1, // Wednesday
        4: 1.15, // Thursday
        5: 1.3, // Friday - highest (end of week, weekend rush)
        6: 0.85, // Saturday - moderate
    };
    return factors[dayOfWeek] || 1.0;
};

/**
 * Get weather impact factor on travel time
 * @param {string} condition - Weather condition
 * @returns {number} Weather impact factor (1.0 - 1.5)
 */
export const getWeatherFactor = (condition) => {
    const factors = {
        clear: 1.0,
        cloudy: 1.0,
        rain: 1.2,
        heavy_rain: 1.4,
        fog: 1.3,
        unknown: 1.05,
    };
    return factors[condition] || 1.0;
};

/**
 * Normalize data points using min-max normalization
 * @param {Array<number>} dataPoints - Array of values
 * @returns {Array<number>} Normalized values (0-1)
 */
export const normalizeData = (dataPoints) => {
    if (!dataPoints || dataPoints.length === 0) return [];

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min;

    if (range === 0) return dataPoints.map(() => 0.5);

    return dataPoints.map((value) => (value - min) / range);
};

/**
 * Calculate confidence score based on sample size and variance
 * @param {number} sampleSize - Number of data points
 * @param {number} variance - Variance of the data
 * @param {number} optimalSampleSize - Optimal sample size for full confidence
 * @returns {number} Confidence score (0-100)
 */
export const calculateConfidenceScore = (
    sampleSize,
    variance,
    optimalSampleSize = 50
) => {
    // Sample size contribution (0-60 points)
    const sampleScore = Math.min(60, (sampleSize / optimalSampleSize) * 60);

    // Variance contribution (0-40 points)
    // Lower variance = higher confidence
    const maxVariance = 100; // Expected maximum reasonable variance
    const varianceScore = Math.max(0, 40 - (variance / maxVariance) * 40);

    return Math.round(sampleScore + varianceScore);
};

/**
 * Calculate variance of an array
 * @param {Array<number>} values - Array of values
 * @returns {number} Variance
 */
export const calculateVariance = (values) => {
    if (!values || values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate standard deviation
 * @param {Array<number>} values - Array of values
 * @returns {number} Standard deviation
 */
export const calculateStandardDeviation = (values) => {
    return Math.sqrt(calculateVariance(values));
};

/**
 * Predict ETA using weighted historical data
 * @param {Array<Object>} historicalTrips - Historical trip data
 * @param {number} baseDistance - Distance to destination in km
 * @param {Object} currentConditions - Current time, weather, etc.
 * @returns {Object} Prediction result with ETA and confidence
 */
export const predictETAFromHistory = (
    historicalTrips,
    baseDistance,
    currentConditions = {}
) => {
    const { hour = new Date().getHours(), dayOfWeek = new Date().getDay(), weather = "unknown" } = currentConditions;

    if (!historicalTrips || historicalTrips.length === 0) {
        // Fallback: estimate based on average speed of 25 km/h
        const baseETA = (baseDistance / 25) * 60; // minutes
        const adjustedETA =
            baseETA * getTimeSlotFactor(hour) * getDayOfWeekFactor(dayOfWeek);

        return {
            predictedMinutes: Math.round(adjustedETA),
            confidence: 30,
            method: "fallback_estimate",
            factors: {
                timeSlot: getTimeSlotFactor(hour),
                dayOfWeek: getDayOfWeekFactor(dayOfWeek),
            },
        };
    }

    // Extract durations from historical trips
    const durations = historicalTrips.map((trip) => trip.actualDuration);

    // Calculate weighted average (recent trips have more weight)
    const basePrediction = calculateWeightedAverage(durations, 0.85);

    // Apply current condition factors
    const timeFactor = getTimeSlotFactor(hour);
    const dayFactor = getDayOfWeekFactor(dayOfWeek);
    const weatherFactor = getWeatherFactor(weather);

    // Calculate historical averages for comparison
    const historicalTimeFactor =
        historicalTrips.reduce((sum, trip) => sum + getTimeSlotFactor(trip.timeSlot), 0) /
        historicalTrips.length;
    const historicalDayFactor =
        historicalTrips.reduce((sum, trip) => sum + getDayOfWeekFactor(trip.dayOfWeek), 0) /
        historicalTrips.length;

    // Adjust prediction based on current vs historical conditions
    const conditionAdjustment =
        (timeFactor / historicalTimeFactor) * (dayFactor / historicalDayFactor) * weatherFactor;

    const adjustedPrediction = basePrediction * conditionAdjustment;

    // Calculate confidence
    const variance = calculateVariance(durations);
    const confidence = calculateConfidenceScore(historicalTrips.length, variance);

    return {
        predictedMinutes: Math.round(adjustedPrediction),
        confidence,
        method: "historical_weighted",
        sampleSize: historicalTrips.length,
        factors: {
            timeSlot: timeFactor,
            dayOfWeek: dayFactor,
            weather: weatherFactor,
            conditionAdjustment: Math.round(conditionAdjustment * 100) / 100,
        },
        statistics: {
            basePrediction: Math.round(basePrediction),
            variance: Math.round(variance * 10) / 10,
            stdDeviation: Math.round(calculateStandardDeviation(durations) * 10) / 10,
        },
    };
};

/**
 * Calculate delay probability based on historical data
 * @param {Array<Object>} historicalTrips - Historical trip data
 * @param {number} threshold - Delay threshold in minutes
 * @returns {Object} Delay probability and statistics
 */
export const calculateDelayProbability = (historicalTrips, threshold = 5) => {
    if (!historicalTrips || historicalTrips.length === 0) {
        return {
            probability: 0.3, // Default 30% probability when no data
            confidence: 0,
            message: "No historical data available",
        };
    }

    const delayedTrips = historicalTrips.filter(
        (trip) => trip.delayMinutes > threshold
    );
    const probability = delayedTrips.length / historicalTrips.length;

    const delays = historicalTrips.map((trip) => trip.delayMinutes);
    const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;
    const maxDelay = Math.max(...delays);

    return {
        probability: Math.round(probability * 100) / 100,
        probabilityPercentage: Math.round(probability * 100),
        averageDelay: Math.round(avgDelay * 10) / 10,
        maxDelay: Math.round(maxDelay),
        sampleSize: historicalTrips.length,
        confidence: calculateConfidenceScore(
            historicalTrips.length,
            calculateVariance(delays)
        ),
    };
};

/**
 * Generate prediction explanation text
 * @param {Object} prediction - Prediction result object
 * @returns {string} Human-readable explanation
 */
export const generatePredictionExplanation = (prediction) => {
    const { predictedMinutes, confidence, factors, statistics } = prediction;

    let explanation = `Estimated arrival in ${predictedMinutes} minutes`;

    if (confidence >= 70) {
        explanation += " (high confidence)";
    } else if (confidence >= 40) {
        explanation += " (moderate confidence)";
    } else {
        explanation += " (low confidence - limited historical data)";
    }

    if (factors) {
        if (factors.timeSlot > 1.3) {
            explanation += ". Currently peak traffic hours";
        }
        if (factors.weather > 1.1) {
            explanation += ". Weather may cause delays";
        }
    }

    return explanation;
};
