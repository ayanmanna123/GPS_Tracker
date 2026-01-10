import mongoose from "mongoose";

const TripHistorySchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true,
        index: true,
    },
    routeId: {
        type: String,
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
        index: true,
    },
    timeSlot: {
        type: Number,
        required: true,
        min: 0,
        max: 23,
        index: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    actualDuration: {
        type: Number, // Duration in minutes
        required: true,
    },
    expectedDuration: {
        type: Number, // Scheduled duration in minutes
        required: true,
    },
    delayMinutes: {
        type: Number, // Delay = actual - expected (can be negative for early arrival)
        default: 0,
    },
    weather: {
        condition: {
            type: String,
            enum: ["clear", "cloudy", "rain", "heavy_rain", "fog", "unknown"],
            default: "unknown",
        },
        temperature: {
            type: Number, // Celsius
        },
    },
    trafficLevel: {
        type: Number,
        min: 1,
        max: 5, // 1 = very light, 5 = very heavy
        default: 3,
    },
    stops: [
        {
            stopId: {
                type: String,
                required: true,
            },
            stopName: {
                type: String,
            },
            scheduledArrival: {
                type: Date,
            },
            actualArrival: {
                type: Date,
            },
            delayAtStop: {
                type: Number, // Delay in minutes at this stop
                default: 0,
            },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
    ],
    from: {
        name: String,
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    to: {
        name: String,
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    totalDistance: {
        type: Number, // Distance in kilometers
    },
    averageSpeed: {
        type: Number, // km/h
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound indexes for efficient querying
TripHistorySchema.index({ busId: 1, date: -1 });
TripHistorySchema.index({ routeId: 1, dayOfWeek: 1, timeSlot: 1 });
TripHistorySchema.index({ routeId: 1, date: -1 });

// Static method to get historical data for predictions
TripHistorySchema.statics.getHistoricalData = async function (
    routeId,
    dayOfWeek,
    timeSlot,
    limit = 30
) {
    return this.find({
        routeId,
        dayOfWeek,
        timeSlot: { $gte: timeSlot - 1, $lte: timeSlot + 1 }, // Include nearby time slots
    })
        .sort({ date: -1 })
        .limit(limit)
        .lean();
};

// Static method to get recent trips for a bus
TripHistorySchema.statics.getRecentTrips = async function (busId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.find({
        busId,
        date: { $gte: startDate },
    })
        .sort({ date: -1 })
        .lean();
};

// Static method to calculate route reliability
TripHistorySchema.statics.getRouteReliability = async function (
    routeId,
    days = 30
) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trips = await this.find({
        routeId,
        date: { $gte: startDate },
    }).lean();

    if (trips.length === 0) {
        return { score: 50, sampleSize: 0, message: "No historical data available" };
    }

    // Calculate on-time percentage (within 5 minutes of scheduled)
    const onTimeTrips = trips.filter((trip) => Math.abs(trip.delayMinutes) <= 5);
    const onTimePercentage = (onTimeTrips.length / trips.length) * 100;

    // Calculate average delay
    const totalDelay = trips.reduce((sum, trip) => sum + trip.delayMinutes, 0);
    const averageDelay = totalDelay / trips.length;

    // Calculate score (higher is better)
    let score = onTimePercentage;
    if (averageDelay > 0) {
        score -= Math.min(averageDelay * 2, 30); // Penalize for delays
    }
    score = Math.max(0, Math.min(100, score));

    return {
        score: Math.round(score),
        onTimePercentage: Math.round(onTimePercentage),
        averageDelay: Math.round(averageDelay * 10) / 10,
        sampleSize: trips.length,
    };
};

const TripHistory = mongoose.model("TripHistory", TripHistorySchema);
export default TripHistory;
