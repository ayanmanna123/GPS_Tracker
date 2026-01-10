/**
 * Mock Data for Offline Mode
 * Provides sample data when MongoDB is not available
 */

// Track offline mode status
export let isOfflineMode = false;

export const setOfflineMode = (offline) => {
    isOfflineMode = offline;
    console.log(offline ? "⚠️ Running in OFFLINE MODE with mock data" : "✅ Running in ONLINE MODE with database");
};

// Sample Buses
export const mockBuses = [
    {
        _id: "mock-bus-001",
        deviceID: "BUS001",
        name: "City Express 1",
        from: "Downtown Station",
        to: "Airport Terminal",
        driver: "mock-driver-001",
        ticketprice: 50,
        timeSlots: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
        ratings: [4.5, 4.8, 4.2, 4.6],
        location: {
            _id: "mock-loc-001",
            location: { type: "Point", coordinates: [77.5946, 12.9716] }, // Bangalore
        },
    },
    {
        _id: "mock-bus-002",
        deviceID: "BUS002",
        name: "Metro Shuttle 2",
        from: "Central Park",
        to: "Tech Park",
        driver: "mock-driver-002",
        ticketprice: 35,
        timeSlots: ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00"],
        ratings: [4.3, 4.5, 4.7],
        location: {
            _id: "mock-loc-002",
            location: { type: "Point", coordinates: [77.6245, 12.9352] },
        },
    },
    {
        _id: "mock-bus-003",
        deviceID: "BUS003",
        name: "Green Line Bus",
        from: "North Terminal",
        to: "South Station",
        driver: "mock-driver-003",
        ticketprice: 40,
        timeSlots: ["05:30", "07:30", "09:30", "11:30", "13:30", "15:30", "17:30", "19:30"],
        ratings: [4.0, 4.2, 4.4, 4.1],
        location: {
            _id: "mock-loc-003",
            location: { type: "Point", coordinates: [77.5500, 12.9800] },
        },
    },
];

// Sample Locations
export const mockLocations = [
    {
        _id: "mock-loc-001",
        deviceID: "BUS001",
        location: { type: "Point", coordinates: [77.5946, 12.9716], timestamp: new Date() },
        prevlocation: { type: "Point", coordinates: [77.5900, 12.9700] },
        route: [
            { type: "Point", coordinates: [77.5900, 12.9700], timestamp: new Date(Date.now() - 300000), speed: 25 },
            { type: "Point", coordinates: [77.5920, 12.9708], timestamp: new Date(Date.now() - 240000), speed: 30 },
            { type: "Point", coordinates: [77.5946, 12.9716], timestamp: new Date(), speed: 28 },
        ],
    },
    {
        _id: "mock-loc-002",
        deviceID: "BUS002",
        location: { type: "Point", coordinates: [77.6245, 12.9352], timestamp: new Date() },
        prevlocation: { type: "Point", coordinates: [77.6200, 12.9340] },
        route: [
            { type: "Point", coordinates: [77.6200, 12.9340], timestamp: new Date(Date.now() - 300000), speed: 22 },
            { type: "Point", coordinates: [77.6225, 12.9346], timestamp: new Date(Date.now() - 180000), speed: 28 },
            { type: "Point", coordinates: [77.6245, 12.9352], timestamp: new Date(), speed: 25 },
        ],
    },
    {
        _id: "mock-loc-003",
        deviceID: "BUS003",
        location: { type: "Point", coordinates: [77.5500, 12.9800], timestamp: new Date() },
        prevlocation: { type: "Point", coordinates: [77.5480, 12.9790] },
        route: [],
    },
];

// Sample Trip History for AI Predictions
export const mockTripHistory = [
    {
        _id: "mock-trip-001",
        busId: "mock-bus-001",
        routeId: "ROUTE001",
        date: new Date(Date.now() - 86400000), // Yesterday
        dayOfWeek: new Date().getDay(),
        timeSlot: 8,
        startTime: new Date(Date.now() - 86400000 + 28800000),
        endTime: new Date(Date.now() - 86400000 + 31500000),
        actualDuration: 45,
        expectedDuration: 40,
        delayMinutes: 5,
        weather: { condition: "clear", temperature: 28 },
        trafficLevel: 3,
        from: { name: "Downtown Station", coordinates: { lat: 12.9716, lng: 77.5946 } },
        to: { name: "Airport Terminal", coordinates: { lat: 12.9500, lng: 77.7000 } },
        totalDistance: 15,
        averageSpeed: 20,
    },
    {
        _id: "mock-trip-002",
        busId: "mock-bus-001",
        routeId: "ROUTE001",
        date: new Date(Date.now() - 172800000), // 2 days ago
        dayOfWeek: (new Date().getDay() + 6) % 7,
        timeSlot: 9,
        startTime: new Date(Date.now() - 172800000 + 32400000),
        endTime: new Date(Date.now() - 172800000 + 34800000),
        actualDuration: 40,
        expectedDuration: 40,
        delayMinutes: 0,
        weather: { condition: "cloudy", temperature: 25 },
        trafficLevel: 2,
        from: { name: "Downtown Station", coordinates: { lat: 12.9716, lng: 77.5946 } },
        to: { name: "Airport Terminal", coordinates: { lat: 12.9500, lng: 77.7000 } },
        totalDistance: 15,
        averageSpeed: 22.5,
    },
    {
        _id: "mock-trip-003",
        busId: "mock-bus-002",
        routeId: "ROUTE002",
        date: new Date(Date.now() - 86400000),
        dayOfWeek: new Date().getDay(),
        timeSlot: 17,
        startTime: new Date(Date.now() - 86400000 + 61200000),
        endTime: new Date(Date.now() - 86400000 + 63900000),
        actualDuration: 50,
        expectedDuration: 35,
        delayMinutes: 15,
        weather: { condition: "rain", temperature: 22 },
        trafficLevel: 4,
        from: { name: "Central Park", coordinates: { lat: 12.9352, lng: 77.6245 } },
        to: { name: "Tech Park", coordinates: { lat: 12.9200, lng: 77.6800 } },
        totalDistance: 12,
        averageSpeed: 14.4,
    },
    // Add more mock trips for better predictions
    ...generateMockTrips(),
];

// Generate additional mock trips for realistic predictions
function generateMockTrips() {
    const trips = [];
    const buses = ["mock-bus-001", "mock-bus-002", "mock-bus-003"];
    const routes = ["ROUTE001", "ROUTE002", "ROUTE003"];

    for (let i = 0; i < 30; i++) {
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const busIndex = i % 3;
        const timeSlot = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
        const expectedDuration = 30 + Math.floor(Math.random() * 30); // 30-60 mins
        const delayMinutes = Math.floor(Math.random() * 15) - 3; // -3 to 12 mins

        trips.push({
            _id: `mock-trip-gen-${i}`,
            busId: buses[busIndex],
            routeId: routes[busIndex],
            date: new Date(Date.now() - daysAgo * 86400000),
            dayOfWeek: new Date(Date.now() - daysAgo * 86400000).getDay(),
            timeSlot,
            actualDuration: expectedDuration + delayMinutes,
            expectedDuration,
            delayMinutes: Math.max(0, delayMinutes),
            weather: { condition: ["clear", "cloudy", "rain"][Math.floor(Math.random() * 3)], temperature: 20 + Math.floor(Math.random() * 15) },
            trafficLevel: 1 + Math.floor(Math.random() * 5),
            totalDistance: 10 + Math.floor(Math.random() * 10),
            averageSpeed: 15 + Math.floor(Math.random() * 20),
        });
    }

    return trips;
}

// Helper functions to query mock data
export const mockDataHelpers = {
    // Find bus by device ID
    findBusByDeviceId: (deviceId) => {
        const bus = mockBuses.find(b => b.deviceID === deviceId);
        if (bus) {
            return { ...bus, location: mockLocations.find(l => l.deviceID === deviceId) || bus.location };
        }
        return null;
    },

    // Find buses near a point
    findBusesNearPoint: (lat, lng, maxDistanceKm = 10) => {
        // Simple distance calculation for demo purposes
        return mockLocations.slice(0, 5).map(loc => ({
            ...loc,
            bus: mockBuses.find(b => b.deviceID === loc.deviceID),
        }));
    },

    // Get recent trips for a bus
    getRecentTrips: (busId, days = 30) => {
        const startDate = new Date(Date.now() - days * 86400000);
        return mockTripHistory.filter(t =>
            t.busId === busId && new Date(t.date) >= startDate
        );
    },

    // Get historical data for predictions
    getHistoricalData: (routeId, dayOfWeek, timeSlot, limit = 30) => {
        return mockTripHistory
            .filter(t =>
                t.routeId === routeId &&
                t.dayOfWeek === dayOfWeek &&
                Math.abs(t.timeSlot - timeSlot) <= 1
            )
            .slice(0, limit);
    },

    // Get route reliability
    getRouteReliability: (routeId, days = 30) => {
        const trips = mockTripHistory.filter(t => t.routeId === routeId);
        if (trips.length === 0) {
            return { score: 75, sampleSize: 0, onTimePercentage: 75, averageDelay: 3 };
        }

        const onTimeTrips = trips.filter(t => Math.abs(t.delayMinutes) <= 5);
        const onTimePercentage = (onTimeTrips.length / trips.length) * 100;
        const avgDelay = trips.reduce((sum, t) => sum + t.delayMinutes, 0) / trips.length;

        let score = onTimePercentage - (avgDelay * 2);
        score = Math.max(0, Math.min(100, score));

        return {
            score: Math.round(score),
            onTimePercentage: Math.round(onTimePercentage),
            averageDelay: Math.round(avgDelay * 10) / 10,
            sampleSize: trips.length,
        };
    },

    // Get all buses
    getAllBuses: () => mockBuses,

    // Get trip count
    getTripCount: (days = 30) => {
        const startDate = new Date(Date.now() - days * 86400000);
        return mockTripHistory.filter(t => new Date(t.date) >= startDate).length;
    },

    // Get aggregate stats
    getAggregateStats: () => {
        const trips = mockTripHistory;
        if (trips.length === 0) {
            return { avgDuration: 40, avgDelay: 3, totalTrips: 0 };
        }

        return {
            avgDuration: Math.round(trips.reduce((sum, t) => sum + t.actualDuration, 0) / trips.length),
            avgDelay: Math.round((trips.reduce((sum, t) => sum + t.delayMinutes, 0) / trips.length) * 10) / 10,
            totalTrips: trips.length,
        };
    },

    // Get unique routes
    getUniqueRoutes: () => [...new Set(mockTripHistory.map(t => t.routeId))],
};

export default mockDataHelpers;
