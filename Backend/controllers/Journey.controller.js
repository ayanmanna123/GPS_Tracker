import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";

// Helper function to calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Find buses within radius of a point
export const findBusesNearPoint = async (lat, lon, radius = 1000) => {
  try {
    const buses = await Bus.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lon, lat] },
          $maxDistance: radius,
        },
      },
      status: { $in: ["Active", "On Route", "At Stop"] },
    });
    return buses;
  } catch (error) {
    console.error("Error finding buses near point:", error);
    return [];
  }
};

// Find potential transfer points between two locations
export const findTransferPoints = async (
  fromLat,
  fromLon,
  toLat,
  toLon,
  maxDistance = 2000
) => {
  const transferPoints = [];

  try {
    // Find buses near starting point
    const fromBuses = await findBusesNearPoint(fromLat, fromLon, 1000);

    // Find buses near destination
    const toBuses = await findBusesNearPoint(toLat, toLon, 1000);

    // Find intersection points where routes might connect
    for (const fromBus of fromBuses) {
      if (!fromBus.route || fromBus.route.length === 0) continue;

      for (const toBus of toBuses) {
        if (!toBus.route || toBus.route.length === 0) continue;
        if (fromBus._id.equals(toBus._id)) continue;

        // Check if routes intersect or come close
        for (const fromPoint of fromBus.route) {
          for (const toPoint of toBus.route) {
            const distance = calculateDistance(
              fromPoint.lat,
              fromPoint.lng,
              toPoint.lat,
              toPoint.lng
            );

            if (distance <= 500) {
              // 500m transfer radius
              transferPoints.push({
                id: `${fromBus._id}-${toBus._id}-${fromPoint.lat}-${fromPoint.lng}`,
                location: {
                  lat: (fromPoint.lat + toPoint.lat) / 2,
                  lon: (fromPoint.lng + toPoint.lng) / 2,
                },
                fromBus: fromBus._id,
                toBus: toBus._id,
                walkingDistance: distance,
                name: `Transfer Point (${Math.round(distance)}m walk)`,
              });
            }
          }
        }
      }
    }

    // Remove duplicates and sort by walking distance
    const uniquePoints = transferPoints
      .filter(
        (point, index, self) =>
          index === self.findIndex((p) => p.id === point.id)
      )
      .sort((a, b) => a.walkingDistance - b.walkingDistance);

    return uniquePoints.slice(0, 10); // Return top 10 transfer points
  } catch (error) {
    console.error("Error finding transfer points:", error);
    return [];
  }
};

// Plan multi-leg journey
export const planJourney = async (req, res) => {
  try {
    const { from, to, options = {} } = req.body;

    if (!from || !to || !from.lat || !from.lon || !to.lat || !to.lon) {
      return res.status(400).json({
        success: false,
        error: "Valid from and to coordinates are required",
      });
    }

    const {
      maxTransfers = 2,
      maxWalkingDistance = 1000,
      maxTotalTime = 120,
      departureTime = new Date(),
    } = options;

    const journeys = [];
    const searchStartTime = Date.now();
    const transferPoints = [];

    // Step 1: Try to find direct routes first
    const directBuses = await findBusesNearPoint(from.lat, from.lon, 1000);
    const directRoutes = [];

    for (const bus of directBuses) {
      if (!bus.route || bus.route.length === 0) continue;

      // Check if this bus goes near the destination
      let minDistanceToDestination = Infinity;
      let bestDestinationPoint = null;

      for (const point of bus.route) {
        const distanceToDestination = calculateDistance(
          point.lat,
          point.lng,
          to.lat,
          to.lon
        );

        if (distanceToDestination < minDistanceToDestination) {
          minDistanceToDestination = distanceToDestination;
          bestDestinationPoint = point;
        }
      }

      if (minDistanceToDestination <= 500) {
        // Within 500m of destination
        directRoutes.push({
          ...bus.toObject(),
          distanceToDestination: minDistanceToDestination,
        });
      }
    }

    // Step 2: If no direct routes, find multi-leg journeys
    if (directRoutes.length === 0 && maxTransfers > 0) {
      const transferPoints = await findTransferPoints(
        from.lat,
        from.lon,
        to.lat,
        to.lon
      );

      for (const transfer of transferPoints.slice(0, 5)) {
        // Check top 5 transfer points
        try {
          // Find first leg: from start to transfer point
          const firstLegBuses = await findBusesNearPoint(
            from.lat,
            from.lon,
            800
          );
          const secondLegBuses = await findBusesNearPoint(to.lat, to.lon, 800);

          for (const firstBus of firstLegBuses) {
            if (firstBus._id.equals(transfer.fromBus)) {
              for (const secondBus of secondLegBuses) {
                if (secondBus._id.equals(transfer.toBus)) {
                  // Calculate journey times (simplified)
                  const firstLegTime = 20; // minutes - you'd calculate this based on route
                  const walkingTime = Math.ceil(transfer.walkingDistance / 80); // 80m/min walking speed
                  const waitingTime = 5; // minutes - average waiting time
                  const secondLegTime = 25; // minutes
                  const totalTime =
                    firstLegTime + walkingTime + waitingTime + secondLegTime;

                  if (
                    totalTime <= maxTotalTime &&
                    transfer.walkingDistance <= maxWalkingDistance
                  ) {
                    journeys.push({
                      totalDuration: `${totalTime} minutes`,
                      totalTransfers: 1,
                      legs: [
                        {
                          type: "bus",
                          busId: firstBus.deviceID,
                          busName:
                            firstBus.name || `Route ${firstBus.deviceID}`,
                          from: "Starting Point",
                          to: transfer.name,
                          duration: `${firstLegTime} minutes`,
                          boardingTime: new Date(
                            Date.now() + 5 * 60000
                          ).toLocaleTimeString(), // 5 min from now
                          alightTime: new Date(
                            Date.now() + (5 + firstLegTime) * 60000
                          ).toLocaleTimeString(),
                          busStatus: firstBus.status,
                          driverName: firstBus.driverName,
                          driverPhone: firstBus.driverPhone,
                        },
                        {
                          type: "walk",
                          from: transfer.name,
                          to: "Connection Point",
                          duration: `${walkingTime} minutes`,
                          distance: `${Math.round(transfer.walkingDistance)}m`,
                          instructions: [
                            `Walk ${Math.round(
                              transfer.walkingDistance
                            )}m to connecting bus stop`,
                          ],
                        },
                        {
                          type: "wait",
                          from: "Connection Point",
                          to: "Connection Point",
                          duration: `${waitingTime} minutes`,
                          instructions: ["Wait for connecting bus"],
                        },
                        {
                          type: "bus",
                          busId: secondBus.deviceID,
                          busName:
                            secondBus.name || `Route ${secondBus.deviceID}`,
                          from: "Connection Point",
                          to: "Destination",
                          duration: `${secondLegTime} minutes`,
                          boardingTime: new Date(
                            Date.now() +
                              (5 + firstLegTime + walkingTime + waitingTime) *
                                60000
                          ).toLocaleTimeString(),
                          alightTime: new Date(
                            Date.now() +
                              (5 +
                                firstLegTime +
                                walkingTime +
                                waitingTime +
                                secondLegTime) *
                                60000
                          ).toLocaleTimeString(),
                          busStatus: secondBus.status,
                          driverName: secondBus.driverName,
                          driverPhone: secondBus.driverPhone,
                        },
                      ],
                    });
                  }
                }
              }
            }
          }
        } catch (legError) {
          console.error("Error planning leg:", legError);
          continue;
        }
      }
    }

    // Sort journeys by total time
    journeys.sort((a, b) => {
      const timeA = parseInt(a.totalDuration) || 999;
      const timeB = parseInt(b.totalDuration) || 999;
      return timeA - timeB;
    });

    res.json({
      success: true,
      journeys: journeys.slice(0, 5), // Return top 5 journeys
      directRoutes: directRoutes.slice(0, 3), // Return top 3 direct routes
      metadata: {
        searchTime: Date.now() - searchStartTime,
        totalBusesAnalyzed: directBuses.length,
        transferPointsConsidered: transferPoints?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Journey planning error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to plan journey",
      details: error.message,
    });
  }
};

// Get transfer points near a location
export const getTransferPoints = async (req, res) => {
  try {
    const { lat, lon, radius = 500 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const buses = await findBusesNearPoint(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(radius)
    );

    // Create transfer points from bus stops/locations
    const transferPoints = buses.map((bus) => ({
      id: bus._id,
      name: bus.name || `Bus Stop ${bus.deviceID}`,
      location: {
        lat: bus.location.coordinates[1],
        lon: bus.location.coordinates[0],
      },
      busesAvailable: [bus.deviceID],
      type: "bus_stop",
    }));

    res.json({
      success: true,
      transferPoints,
    });
  } catch (error) {
    console.error("Transfer points error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get transfer points",
    });
  }
};

// Get walking route between two points
export const getWalkingRoute = async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "From and to coordinates are required",
      });
    }

    const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
    const walkingSpeed = 80; // meters per minute
    const duration = Math.ceil(distance / walkingSpeed);

    // Simple walking instructions (you could integrate with a mapping service)
    const instructions = [
      `Walk ${Math.round(distance)}m to your destination`,
      `Estimated time: ${duration} minutes`,
    ];

    res.json({
      success: true,
      distance: Math.round(distance),
      duration,
      instructions,
      route: [
        { lat: from.lat, lon: from.lon },
        { lat: to.lat, lon: to.lon },
      ],
    });
  } catch (error) {
    console.error("Walking route error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get walking route",
    });
  }
};
