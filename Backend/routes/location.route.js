import express from "express";

import {
  createBusId,
  getAllBus,
  getAllBusDetails,
  getBusByDeviceId,
  getBusesAlongRoute,
  getLocation,
  updatelocation,
  debugDatabase, // Add this import
} from "../controllers/Location.controller.js";

const locationRoute = express.Router();

// Existing routes
locationRoute.put("/update/location", updatelocation);
locationRoute.post("/create/newBus", createBusId);
locationRoute.get("/get/location/:deviceID", getLocation);
locationRoute.get("/get/search", getAllBus);
locationRoute.get("/route/search", getBusesAlongRoute);
locationRoute.get("/bus/:deviceId", getBusByDeviceId);
// locationRoute.post('/bus/update', updateBusLocation);
locationRoute.get("/AllLocation", getAllBusDetails);

// NEW DEBUG ENDPOINTS
locationRoute.get("/debug/database", debugDatabase);

// Test endpoint to create sample buses for testing
locationRoute.post("/debug/create-sample-buses", async (req, res) => {
  try {
    const Location = (await import("../models/Location.model.js")).default;

    // Sample bus locations around Delhi for testing
    const sampleBuses = [
      {
        deviceID: "TEST-BUS-001",
        location: {
          type: "Point",
          coordinates: [77.209, 28.6139], // Delhi center
        },
        route: [
          {
            type: "Point",
            coordinates: [77.1025, 28.7041], // North Delhi
            timestamp: new Date(),
          },
          {
            type: "Point",
            coordinates: [77.209, 28.6139], // Center
            timestamp: new Date(),
          },
        ],
        status: "Active",
        driverName: "Test Driver 1",
      },
      {
        deviceID: "TEST-BUS-002",
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041], // North Delhi
        },
        route: [
          {
            type: "Point",
            coordinates: [77.209, 28.6139], // Center
            timestamp: new Date(),
          },
          {
            type: "Point",
            coordinates: [77.391, 28.5355], // South Delhi
            timestamp: new Date(),
          },
        ],
        status: "Active",
        driverName: "Test Driver 2",
      },
      {
        deviceID: "TEST-BUS-003",
        location: {
          type: "Point",
          coordinates: [77.391, 28.5355], // South Delhi
        },
        route: [
          {
            type: "Point",
            coordinates: [77.1025, 28.7041], // North Delhi
            timestamp: new Date(),
          },
          {
            type: "Point",
            coordinates: [77.391, 28.5355], // South Delhi
            timestamp: new Date(),
          },
        ],
        status: "Active",
        driverName: "Test Driver 3",
      },
    ];

    // Delete existing test buses
    await Location.deleteMany({ deviceID: { $regex: /^TEST-BUS/ } });

    // Insert new test buses
    const createdBuses = await Location.insertMany(sampleBuses);

    res.json({
      success: true,
      message: `Created ${createdBuses.length} test buses`,
      buses: createdBuses.map((bus) => ({
        deviceID: bus.deviceID,
        coordinates: bus.location.coordinates,
        routePoints: bus.route.length,
      })),
    });
  } catch (error) {
    console.error("Error creating sample buses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test route search with predefined coordinates
locationRoute.get("/debug/test-route-search", async (req, res) => {
  try {
    // Delhi coordinates for testing
    const testRoutes = [
      {
        name: "North to South Delhi",
        fromLat: 28.7041,
        fromLon: 77.1025,
        toLat: 28.5355,
        toLon: 77.391,
      },
      {
        name: "Central Delhi Loop",
        fromLat: 28.6139,
        fromLon: 77.209,
        toLat: 28.65,
        toLon: 77.25,
      },
    ];

    const results = [];

    for (const route of testRoutes) {
      try {
        const { getBusesAlongRoute } =
          await import("../controllers/Location.controller.js");

        // Mock request/response objects
        const mockReq = {
          query: {
            fromLat: route.fromLat,
            fromLon: route.fromLon,
            toLat: route.toLat,
            toLon: route.toLon,
            radius: 10000,
          },
        };

        let mockResult = null;
        const mockRes = {
          json: (data) => {
            mockResult = data;
          },
          status: (code) => ({
            json: (data) => {
              mockResult = { ...data, statusCode: code };
            },
          }),
        };

        await getBusesAlongRoute(mockReq, mockRes);

        results.push({
          route: route.name,
          coordinates: `(${route.fromLat}, ${route.fromLon}) -> (${route.toLat}, ${route.toLon})`,
          result: mockResult,
        });
      } catch (error) {
        results.push({
          route: route.name,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      testResults: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default locationRoute;
