import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";
import { emitLocationUpdate, emitTrackingUpdate, emitETAUpdate } from "../utils/socket.js";
import notificationService from "../utils/notifications.js";
import redisClient, { isRedisConnected } from "../utils/redis.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371000; // Radius of Earth in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Check if coordinate is within radius of any existing route point
const isCoordinateNearExisting = (newCoord, route, radiusInMeters = 500) => {
  for (const point of route) {
    const existingCoord = point.coordinates;
    const distance = calculateDistance(
      existingCoord[0],
      existingCoord[1],
      newCoord[0],
      newCoord[1],
    );
    if (distance <= radiusInMeters) return true;
  }
  return false;
};

export const updatelocation = async (req, res) => {
  try {
    const { deviceID, latitude, longitude } = req.body;

    console.log(`[updatelocation] Received request:`, {
      deviceID,
      latitude,
      longitude,
    });

    if (!deviceID || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: deviceID, latitude, longitude",
        received: {
          deviceID: !!deviceID,
          latitude: !!latitude,
          longitude: !!longitude,
        },
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
        details: { latitude: lat, longitude: lng, valid: false },
      });
    }

    const coordinates = [lat, lng];
    const currentTime = new Date();
    console.log(`[updatelocation] Parsed coordinates:`, coordinates);

    let bus = await Location.findOne({ deviceID });
    console.log(`[updatelocation] Existing bus found:`, !!bus);

    if (bus) {
      let shouldAddToRoute = true;

      if (bus.route && bus.route.length > 0) {
        const isDuplicate = isCoordinateNearExisting(
          coordinates,
          bus.route,
          500,
        );
        shouldAddToRoute = !isDuplicate;
      }

      if (shouldAddToRoute) {
        bus.route.push({
          type: "Point",
          coordinates: coordinates,
          timestamp: currentTime,
        });
        console.log(
          `[updatelocation] Added new location to route, total points: ${bus.route.length}`,
        );
      } else {
        console.log(
          `[updatelocation] Skipped adding duplicate route point (within 500m)`,
        );
      }

      // ✅ Always update live location
      bus.prevlocation = {
        type: "Point",
        coordinates: bus.location.coordinates, // old location
        timestamp: bus.location.timestamp,
      };

      bus.location = {
        type: "Point",
        coordinates: coordinates,
      };
      bus.lastUpdated = currentTime;

      await bus.save();

      // Cache location data in Redis for faster access
      if (isRedisConnected) {
        try {
          const cacheKey = `bus:location:${deviceID}`;
          const cacheData = {
            deviceID,
            location: bus.location,
            prevlocation: bus.prevlocation,
            lastUpdated: bus.lastUpdated,
            realTimeData: bus.realTimeData,
            route: bus.route?.slice(-10), // Cache last 10 route points
            cachedAt: new Date(),
          };
          await redisClient.setEx(cacheKey, 300, JSON.stringify(cacheData)); // Cache for 5 minutes
          console.log(`[updatelocation] Cached location data for bus: ${deviceID}`);
        } catch (cacheError) {
          console.warn(`[updatelocation] Redis cache error:`, cacheError.message);
        }
      }

      // Emit WebSocket update for real-time tracking
      emitLocationUpdate(deviceID, {
        location: bus.location,
        prevlocation: bus.prevlocation,
        lastUpdated: bus.lastUpdated,
        realTimeData: bus.realTimeData,
      });

      // Check for arrival notifications and delays
      try {
        // Calculate ETA if we have route data
        if (bus.route && bus.route.length > 1) {
          // Get bus info for notifications
          const busInfo = await Bus.findOne({ deviceID });
          
          if (busInfo) {
            // Calculate distance to destination and estimated time
            // For now, we'll use a simple calculation - in a real app this would be more complex
            const currentLat = bus.location.coordinates[0];
            const currentLng = bus.location.coordinates[1];
            
            // Assuming destination is the last point in the route
            const lastRoutePoint = bus.route[bus.route.length - 1];
            if (lastRoutePoint && lastRoutePoint.coordinates) {
              const destLat = lastRoutePoint.coordinates[0];
              const destLng = lastRoutePoint.coordinates[1];
              
              const distanceToDestination = calculateDistance(
                currentLat, currentLng, destLat, destLng
              );
              
              // Enhanced ETA calculation with traffic and historical data
              let etaMinutes = 0;
              if (bus.realTimeData && bus.realTimeData.speed > 0) {
                // Base calculation: Distance in km / speed in kmh * 60 to get minutes
                etaMinutes = (distanceToDestination / 1000) / bus.realTimeData.speed * 60;

                // Apply traffic multiplier if available
                if (bus.realTimeData.trafficLevel) {
                  const trafficMultiplier = getTrafficMultiplier(bus.realTimeData.trafficLevel);
                  etaMinutes *= trafficMultiplier;
                }

                // Apply historical adjustment based on time of day
                const historicalMultiplier = getHistoricalMultiplier(currentTime);
                etaMinutes *= historicalMultiplier;

                // Add buffer time for stops and delays
                etaMinutes += calculateStopBuffer(bus.route, distanceToDestination);
              }
              
              // Schedule arrival notification if ETA is within reasonable range
              if (etaMinutes > 0 && etaMinutes < 120) { // Less than 2 hours
                // This would be called for each user tracking this bus
                // In a real implementation, you'd get the list of users tracking this bus
                // and schedule notifications for each of them
                
                // Schedule arrival notification for all users tracking this bus
                notificationService.scheduleArrivalNotificationForAllTrackers(deviceID, etaMinutes, {
                  name: busInfo.name,
                  from: busInfo.from,
                  to: busInfo.to
                });
                
                // Check weather along the route and send alerts if needed
                if (bus.route && bus.route.length > 0) {
                  notificationService.checkWeatherAlongRoute(deviceID, bus.route.map(point => ({
                    lat: point.coordinates[0],
                    lon: point.coordinates[1]
                  })));
                }
              }
            }
          }
        }
      } catch (notificationError) {
        console.error('Error in notification processing:', notificationError);
        // Don't fail the main operation if notification fails
      }

      return res.json({ success: true, message: "Location updated", bus });
    } else {
      const newBus = new Location({
        deviceID,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        route: [
          {
            type: "Point",
            coordinates: coordinates,
            timestamp: currentTime,
          },
        ],
        lastUpdated: currentTime,
      });

      await newBus.save();
      return res.json({
        success: true,
        message: "New bus created",
        bus: newBus,
      });
    }
  } catch (error) {
    console.error(`[updatelocation] Error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllBus = async (req, res) => {
  const { lat, lng, radius } = req.query;

  console.log(`[getAllBus] Query params:`, { lat, lng, radius });

  // Validation
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "lat & lng are required parameters",
      received: { lat, lng, radius },
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = radius ? parseInt(radius) : 10000; // Default 10km

  console.log(`[getAllBus] Parsed values:`, {
    latitude,
    longitude,
    searchRadius,
  });

  // Validate coordinates
  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates provided",
      details: {
        latitude,
        longitude,
        validLat: !isNaN(latitude) && latitude >= -90 && latitude <= 90,
        validLng: !isNaN(longitude) && longitude >= -180 && longitude <= 180,
      },
    });
  }

  try {
    console.log(
      `[getAllBus] Searching near ${latitude}, ${longitude} within ${searchRadius}m`,
    );

    // Debug: Check if there are any buses in the database
    const totalBusCount = await Location.countDocuments();
    console.log(`[getAllBus] Total buses in database: ${totalBusCount}`);

    // Debug: Get a sample of buses to check their coordinates
    const sampleBuses = await Location.find({}).limit(3);
    console.log(
      `[getAllBus] Sample bus locations:`,
      sampleBuses.map((bus) => ({
        deviceID: bus.deviceID,
        coordinates: bus.location?.coordinates,
        hasLocation: !!bus.location,
      })),
    );

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [latitude, longitude],
          },
          distanceField: "distanceFromSearch",
          maxDistance: searchRadius,
          spherical: true,
        },
      },
      {
        $addFields: {
          formattedDistance: {
            $cond: {
              if: { $lt: ["$distanceFromSearch", 1000] },
              then: {
                $concat: [
                  { $toString: { $round: "$distanceFromSearch" } },
                  "m",
                ],
              },
              else: {
                $concat: [
                  {
                    $toString: {
                      $round: [{ $divide: ["$distanceFromSearch", 1000] }, 1],
                    },
                  },
                  "km",
                ],
              },
            },
          },
        },
      },
      { $sort: { distanceFromSearch: 1 } },
      { $limit: 100 },
    ];

    console.log(`[getAllBus] Running aggregation pipeline...`);
    const buses = await Location.aggregate(pipeline);
    console.log(`[getAllBus] Aggregation returned ${buses.length} buses`);

    // Debug: Log distances of found buses
    buses.slice(0, 5).forEach((bus) => {
      console.log(
        `[getAllBus] Bus ${bus.deviceID}: ${Math.round(
          bus.distanceFromSearch,
        )}m away`,
      );
    });

    // Format the results
    const busesWithDistance = buses.map((bus) => ({
      ...bus,
      distanceFromSearch: Math.round(bus.distanceFromSearch),
      hasRoute: bus.route && bus.route.length > 0,
      routePoints: bus.route ? bus.route.length : 0,
      // Add mock driver and timing data
      driverName: bus.driverName || "Driver Available",
      driverPhone: bus.driverPhone || "+91-9876543210",
      startTime: bus.startTime || "06:00 AM",
      expectedTime: bus.expectedTime || "Calculating...",
      destinationTime: bus.destinationTime || "08:00 PM",
      status: bus.status || "Active",
    }));

    logSuccess("getAllBus", `Found ${busesWithDistance.length} buses`, {
      latitude,
      longitude,
      searchRadius,
    });

    res.json({
      success: true,
      buses: busesWithDistance,
      metadata: {
        searchLocation: { latitude, longitude },
        radius: searchRadius,
        totalFound: busesWithDistance.length,
        totalInDatabase: totalBusCount,
        searchTime: new Date().toISOString(),
      },
      debug: {
        coordinates: [longitude, latitude],
        sampleLocations: sampleBuses
          .map((b) => b.location?.coordinates)
          .filter(Boolean),
      },
    });
  } catch (err) {
    logError("getAllBus", err, { latitude, longitude, searchRadius });

    // Enhanced error response
    res.status(500).json({
      success: false,
      message: "Server error while searching for buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              searchParams: { latitude, longitude, searchRadius },
              errorType: err.name,
              mongoError: err.code,
            }
          : undefined,
    });
  }
};

export const debugDatabase = async (req, res) => {
  try {
    const stats = {
      totalBuses: await Location.countDocuments(),
      busesWithLocation: await Location.countDocuments({
        location: { $exists: true },
      }),
      busesWithRoute: await Location.countDocuments({
        "route.0": { $exists: true },
      }),
      sampleBuses: await Location.find({})
        .limit(5)
        .select("deviceID location route"),
    };

    // Check indexes
    const indexes = await Location.collection.getIndexes();

    res.json({
      success: true,
      debug: {
        ...stats,
        indexes: Object.keys(indexes),
        hasGeoIndex: Object.keys(indexes).some((key) =>
          key.includes("location"),
        ),
        sampleCoordinates: stats.sampleBuses.map((bus) => ({
          deviceID: bus.deviceID,
          coordinates: bus.location?.coordinates,
          coordinateType: bus.location?.coordinates
            ? typeof bus.location.coordinates[0]
            : "none",
        })),
      },
    });
  } catch (error) {
    logError("debugDatabase", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { deviceID } = req.params;
    const allBus = await Bus.findOne({ deviceID: deviceID })
      .populate("driver")
      .populate("location");

    if (!allBus || allBus.length === 0) {
      return res.status(404).json({
        message: "No bus created",
        success: false,
      });
    }

    // Transform each bus to match UI expectations
    const formattedBuses = {
      // Core identifiers
      deviceID: deviceID,
      id: deviceID,
      deviceId: deviceID,

      // Basic info (with defaults for missing data)
      name: allBus.name || `Bus ${allBus.deviceID}`,
      busName: allBus.busName || `Bus ${allBus.deviceID}`,
      status: allBus.status || "Active",

      // Location data
      location: allBus.location,
      currentLocation: allBus.currentLocation || "Live tracking available",
      lat: allBus.location?.coordinates?.[0] || 0, // GeoJSON format is [lng, lat]
      lng: allBus.location?.coordinates?.[1] || 0,
      latitude: allBus.location?.coordinates?.[0] || 0,
      longitude: allBus.location?.coordinates?.[1] || 0,

      // Route data
      route: allBus.location.route || [],

      lastUpdated: allBus.lastUpdated,
      timestamp: allBus.lastUpdated,
      updatedAt: allBus.lastUpdated,
      startTime: allBus.startTime || "06:00 AM",
      expectedTime: allBus.expectedTime || "Calculating...",
      destinationTime: allBus.destinationTime || "08:00 PM",

      driverName: allBus.driver?.name || "Driver Available",
      driver: allBus.driver?.name || "Driver Available",
      driverPhone: allBus.driver?.phone || "Contact Support",

      prevlocation: allBus.location?.prevlocation,
      livelocation: allBus.location?.location,

      _id: allBus._id,
      __v: allBus.__v,
    };

    return res.status(200).json({
      message: "All buses fetched successfully",
      success: true,
      data: formattedBuses,
    });
  } catch (error) {
    console.error("[getAllBUs] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

export const createBusId = async (req, res) => {
  try {
    const { deviceID } = req.body;
    console.log(`[createBusId] Creating bus with ID: ${deviceID}`);

    if (!deviceID) {
      return res.status(400).json({
        message: "device id is required",
        success: false,
      });
    }

    // Check if bus already exists
    const existingBus = await Location.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "bus already registered",
        success: false,
      });
    }

    const newBus = await Location.create({
      deviceID,
      route: [],
    });

    logSuccess("createBusId", "Bus created", { deviceID });
    return res.status(200).json({
      message: "bus registered successfully",
      newBus: newBus.toObject(),
      success: true,
    });
  } catch (error) {
    logError("createBusId", error, req.body);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllBusDetails = async (req, res) => {
  try {
    // 1. Parse valid page/limit from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Ensure valid positive integers
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 20;

    const skip = (validPage - 1) * validLimit;

    // 2. Fetch total count & paginated data in parallel
    const [totalItems, buses] = await Promise.all([
      Bus.countDocuments({}),
      Bus.find({})
        .populate("driver")
        .populate("location")
        .skip(skip)
        .limit(validLimit)
        .exec(),
    ]);

    const totalPages = Math.ceil(totalItems / validLimit);

    if (!buses || buses.length === 0) {
      if (totalItems === 0) {
        return res.status(404).json({
          message: "No buses found",
          success: false,
        });
      }
    }

    const busData = buses.map((bus) => {
      // if populated location exists
      const loc = bus.location;

      return {
        deviceID: bus.deviceID,
        from: bus.from,
        to: bus.to,
        driver: {
          id: bus.driver?._id,
          name: bus.driver?.name,
          experience: bus.driver?.driverExp,
        },
        location: loc
          ? {
              coordinates: loc.location?.coordinates || [0, 0],
              lastUpdated: loc.lastUpdated || null,
            }
          : {
              coordinates: [0, 0],
              lastUpdated: null,
            },
      };
    });

    return res.status(200).json({
      message: "All bus details found",
      success: true,
      metadata: {
        page: validPage,
        limit: validLimit,
        totalItems,
        totalPages,
      },
      buses: busData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Enhanced error logging
const logError = (functionName, error, context = {}) => {
  console.error(`[${functionName}] Error:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Enhanced success logging
const logSuccess = (functionName, result, context = {}) => {
  console.log(`[${functionName}] Success:`, {
    result: typeof result === "object" ? Object.keys(result) : result,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const getBusesAlongRoute = async (req, res) => {
  const { fromLat, fromLon, toLat, toLon, radius } = req.query;

  console.log(`[getBusesAlongRoute] Query params:`, {
    fromLat,
    fromLon,
    toLat,
    toLon,
    radius,
  });

  if (!fromLat || !fromLon || !toLat || !toLon) {
    return res.status(400).json({
      success: false,
      message: "fromLat, fromLon, toLat, toLon are required",
      received: { fromLat, fromLon, toLat, toLon, radius },
    });
  }

  const searchRadius = radius ? parseInt(radius) : 15000; // INCREASED to 15km default
  const fromLatitude = parseFloat(fromLat);
  const fromLongitude = parseFloat(fromLon);
  const toLatitude = parseFloat(toLat);
  const toLongitude = parseFloat(toLon);

  console.log(`[getBusesAlongRoute] Parsed coordinates:`, {
    from: [fromLatitude, fromLongitude],
    to: [toLatitude, toLongitude],
    radius: searchRadius,
  });

  // Validate all coordinates
  const coords = [
    { name: "fromLat", value: fromLatitude },
    { name: "fromLon", value: fromLongitude },
    { name: "toLat", value: toLatitude },
    { name: "toLon", value: toLongitude },
  ];

  const invalidCoords = coords.filter(
    (coord) =>
      isNaN(coord.value) ||
      (coord.name.includes("Lat") && (coord.value < -90 || coord.value > 90)) ||
      (coord.name.includes("Lon") && (coord.value < -180 || coord.value > 180)),
  );

  if (invalidCoords.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates",
      invalidCoords: invalidCoords.map((c) => ({ [c.name]: c.value })),
    });
  }

  try {
    console.log(
      `[getBusesAlongRoute] Searching route: (${fromLat}, ${fromLon}) -> (${toLat}, ${toLon})`,
    );

    // Debug: Check total buses
    const totalBuses = await Location.countDocuments();
    console.log(`[getBusesAlongRoute] Total buses in database: ${totalBuses}`);

    // FIXED: Get ALL buses first, then analyze them
    const allBuses = await Location.find({
      location: { $exists: true, $ne: null },
      "location.coordinates": { $exists: true, $ne: [] },
    }).limit(1000); // Reasonable limit

    console.log(
      `[getBusesAlongRoute] Found ${allBuses.length} buses with valid locations`,
    );

    if (allBuses.length === 0) {
      return res.json({
        success: true,
        buses: [],
        metadata: {
          message: "No buses found in database with valid locations",
          fromLocation: { lat: fromLatitude, lng: fromLongitude },
          toLocation: { lat: toLatitude, lng: toLongitude },
          radius: searchRadius,
          totalInDatabase: totalBuses,
          searchTime: new Date().toISOString(),
        },
      });
    }

    // FIXED: Analyze each bus for route relevance
    const analyzedBuses = allBuses
      .map((bus) => {
        // Get bus coordinates
        console.log("[getBusesAlongRoute] lat & lon : ", bus);
        const busLat = bus.location?.coordinates?.[0];
        const busLng = bus.location?.coordinates?.[1];

        if (!busLat || !busLng) {
          console.log(
            `[getBusesAlongRoute] Bus ${bus.deviceID} has invalid coordinates:`,
            bus.location?.coordinates,
          );
          return null;
        }

        // Calculate distances to route points
        const distanceFromStart = calculateDistance(
          fromLatitude,
          fromLongitude,
          busLat,
          busLng,
        );
        const distanceToEnd = calculateDistance(
          toLatitude,
          toLongitude,
          busLat,
          busLng,
        );

        // FIXED: Enhanced route analysis
        const routeAnalysis = analyzeRouteForJourney(bus, {
          from: { lat: fromLatitude, lng: fromLongitude },
          to: { lat: toLatitude, lng: toLongitude },
        });

        // FIXED: Better relevance scoring
        let relevanceScore = 0;
        const maxRelevantDistance = 10000; // 10km

        // Score based on proximity to route points
        const startProximityScore = Math.max(
          0,
          (maxRelevantDistance - distanceFromStart) / maxRelevantDistance,
        );
        const endProximityScore = Math.max(
          0,
          (maxRelevantDistance - distanceToEnd) / maxRelevantDistance,
        );

        // FIXED: Score based on being between start and end points
        const routeDistance = calculateDistance(
          fromLatitude,
          fromLongitude,
          toLatitude,
          toLongitude,
        );
        const totalDistanceViaPoint = distanceFromStart + distanceToEnd;
        const detourRatio = totalDistanceViaPoint / routeDistance;

        if (detourRatio < 1.3) {
          // Bus is roughly on the direct path
          relevanceScore += 0.8;
        } else if (detourRatio < 2.0) {
          // Bus is somewhat on the path
          relevanceScore += 0.4;
        }

        // Add proximity scores
        relevanceScore +=
          Math.max(startProximityScore, endProximityScore) * 0.5;

        // Bonus for having route data
        if (routeAnalysis.routePoints && routeAnalysis.routePoints.length > 0) {
          relevanceScore += 0.2;
        }

        // Bonus for correct direction
        if (routeAnalysis.isCorrectDirection) {
          relevanceScore += 0.3;
        }

        // Bonus for passing through
        if (routeAnalysis.passesThrough) {
          relevanceScore += 0.5;
        }

        return {
          ...bus.toJSON(),
          routeAnalysis: {
            ...routeAnalysis,
            score: Math.min(1.0, relevanceScore),
          },
          routeMatch: {
            ...routeAnalysis,
            score: Math.min(1.0, relevanceScore),
          },
          distanceFromStart,
          distanceToEnd,
          distanceFromSearch: Math.min(distanceFromStart, distanceToEnd),
          routeRelevanceScore: Math.min(1.0, relevanceScore),
          detourRatio,
          // Add mock data
          driverName: bus.driverName || "Driver Available",
          driverPhone: bus.driverPhone || "+91-9876543210",
          startTime: bus.startTime || "06:00 AM",
          expectedTime: bus.expectedTime || "Calculating...",
          destinationTime: bus.destinationTime || "08:00 PM",
          status: bus.status || "Active",
        };
      })
      .filter((bus) => bus !== null);

    console.log(`[getBusesAlongRoute] Analyzed ${analyzedBuses.length} buses`);

    // FIXED: More lenient filtering for relevant buses
    const relevantBuses = analyzedBuses.filter((bus) => {
      const isNearStart = bus.distanceFromStart <= 8000; // 8km
      const isNearEnd = bus.distanceToEnd <= 8000; // 8km
      const hasDecentScore = bus.routeRelevanceScore > 0.1;
      const isOnPath = bus.detourRatio < 3.0; // Very lenient detour ratio
      const passesThrough = bus.routeAnalysis?.passesThrough;

      return (
        isNearStart || isNearEnd || hasDecentScore || isOnPath || passesThrough
      );
    });

    console.log(
      `[getBusesAlongRoute] Filtered to ${relevantBuses.length} relevant buses`,
    );

    // Sort by relevance
    relevantBuses.sort((a, b) => {
      // Prioritize buses that pass through the route
      if (a.routeAnalysis?.passesThrough && !b.routeAnalysis?.passesThrough)
        return -1;
      if (!a.routeAnalysis?.passesThrough && b.routeAnalysis?.passesThrough)
        return 1;

      // Then by relevance score
      return b.routeRelevanceScore - a.routeRelevanceScore;
    });

    logSuccess(
      "getBusesAlongRoute",
      `Found ${relevantBuses.length} route buses`,
      {
        from: [fromLatitude, fromLongitude],
        to: [toLatitude, toLongitude],
      },
    );

    res.json({
      success: true,
      buses: relevantBuses.slice(0, 50), // Limit results
      metadata: {
        fromLocation: { lat: fromLatitude, lng: fromLongitude },
        toLocation: { lat: toLatitude, lng: toLongitude },
        radius: searchRadius,
        totalScanned: allBuses.length,
        routeBusesCount: relevantBuses.length,
        totalInDatabase: totalBuses,
        searchTime: new Date().toISOString(),
        searchStrategy: "enhanced_route_analysis",
      },
      debug:
        process.env.NODE_ENV === "development"
          ? {
              fromSearchCoords: [fromLongitude, fromLatitude],
              toSearchCoords: [toLongitude, toLatitude],
              routeDistance: calculateDistance(
                fromLatitude,
                fromLongitude,
                toLatitude,
                toLongitude,
              ),
              analysisResults: analyzedBuses.slice(0, 3).map((bus) => ({
                deviceID: bus.deviceID,
                score: bus.routeRelevanceScore,
                distanceFromStart: Math.round(bus.distanceFromStart),
                distanceToEnd: Math.round(bus.distanceToEnd),
                detourRatio: bus.detourRatio?.toFixed(2),
                passesThrough: bus.routeAnalysis?.passesThrough,
                isCorrectDirection: bus.routeAnalysis?.isCorrectDirection,
              })),
            }
          : undefined,
    });
  } catch (err) {
    logError("getBusesAlongRoute", err, {
      fromLatitude,
      fromLongitude,
      toLatitude,
      toLongitude,
      searchRadius,
    });
    res.status(500).json({
      success: false,
      message: "Server error while searching for route buses",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

function analyzeRouteForJourney(bus, journey) {
  const analysis = {
    score: 0,
    fromDistance: Infinity,
    toDistance: Infinity,
    fromIndex: -1,
    toIndex: -1,
    isCorrectDirection: false,
    passesThrough: false,
    routePoints: [],
  };

  // Get bus current location
  const busLat = bus.location?.coordinates?.[0];
  const busLng = bus.location?.coordinates?.[1];

  if (busLat && busLng) {
    analysis.fromDistance = calculateDistance(
      journey.from.lat,
      journey.from.lng,
      busLat,
      busLng,
    );
    analysis.toDistance = calculateDistance(
      journey.to.lat,
      journey.to.lng,
      busLat,
      busLng,
    );
  }

  // Analyze route points if available
  if (bus.route && Array.isArray(bus.route) && bus.route.length > 0) {
    let minFromDistance = analysis.fromDistance;
    let minToDistance = analysis.toDistance;
    let closestFromIndex = -1;
    let closestToIndex = -1;

    bus.route.forEach((point, index) => {
      if (
        point.coordinates &&
        Array.isArray(point.coordinates) &&
        point.coordinates.length >= 2
      ) {
        const [lat, lng] = point.coordinates;

        const distanceFromStart = calculateDistance(
          journey.from.lat,
          journey.from.lng,
          lat,
          lng,
        );
        const distanceToEnd = calculateDistance(
          journey.to.lat,
          journey.to.lng,
          lat,
          lng,
        );

        if (distanceFromStart < minFromDistance) {
          minFromDistance = distanceFromStart;
          closestFromIndex = index;
        }
        if (distanceToEnd < minToDistance) {
          minToDistance = distanceToEnd;
          closestToIndex = index;
        }

        analysis.routePoints.push({
          lat,
          lng,
          index,
          distanceFromStart,
          distanceToEnd,
        });
      }
    });

    if (minFromDistance < analysis.fromDistance)
      analysis.fromDistance = minFromDistance;
    if (minToDistance < analysis.toDistance)
      analysis.toDistance = minToDistance;
    analysis.fromIndex = closestFromIndex;
    analysis.toIndex = closestToIndex;

    // FIXED: More lenient threshold for passing through
    const threshold = 3000; // 3km threshold (increased)
    const nearFrom = analysis.fromDistance <= threshold;
    const nearTo = analysis.toDistance <= threshold;
    analysis.passesThrough = nearFrom && nearTo;

    // Check direction
    if (closestFromIndex >= 0 && closestToIndex >= 0) {
      analysis.isCorrectDirection = closestToIndex > closestFromIndex;
    }
  }

  return analysis;
}

function compressRoute(route, targetSize) {
  if (route.length <= targetSize) return route;

  // Always keep first and last points
  const compressed = [route[0]];

  // Calculate importance scores for middle points
  const middlePoints = route.slice(1, -1).map((point, index) => {
    const actualIndex = index + 1;
    const prev = route[actualIndex - 1];
    const next = route[actualIndex + 1];

    let importance = 0;

    // High speed changes are important
    if (point.speed && prev.speed) {
      const speedChange = Math.abs(point.speed - prev.speed);
      importance += speedChange * 0.1;
    }

    // Direction changes are important (using simple angle approximation)
    if (prev.coordinates && next.coordinates) {
      const bearing1 = calculateBearing(prev.coordinates, point.coordinates);
      const bearing2 = calculateBearing(point.coordinates, next.coordinates);
      const directionChange = Math.abs(bearing1 - bearing2);
      importance += Math.min(directionChange, 360 - directionChange) * 0.01;
    }

    // Recent points are more important
    const ageMinutes = (Date.now() - new Date(point.timestamp)) / (1000 * 60);
    importance += Math.max(0, 60 - ageMinutes) * 0.05;

    // Points with poor accuracy are less important
    if (point.accuracy && point.accuracy > 0) {
      importance -= Math.min(point.accuracy / 100, 1) * 10;
    }

    return { point, importance, originalIndex: actualIndex };
  });

  // Sort by importance and keep the most important ones
  middlePoints.sort((a, b) => b.importance - a.importance);
  const keepCount = Math.max(0, targetSize - 2); // Subtract 2 for first and last
  const selectedMiddle = middlePoints.slice(0, keepCount);

  // Sort selected points back to chronological order
  selectedMiddle.sort((a, b) => a.originalIndex - b.originalIndex);

  // Add selected middle points
  selectedMiddle.forEach((item) => compressed.push(item.point));

  // Always keep the last point
  compressed.push(route[route.length - 1]);

  return compressed;
}

function calculateBearing(coord1, coord2) {
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;
  const deltaLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Enhanced getBusByDeviceId with calculated stats
export const getBusByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  console.log(`[getBusByDeviceId] Looking for device: ${deviceId}`);

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: "Device ID is required",
    });
  }

  try {
    const bus = await Location.findOne({ deviceID: deviceId }).sort({
      lastUpdated: -1,
    });

    if (!bus) {
      console.log(`[getBusByDeviceId] Bus not found: ${deviceId}`);
      return res.status(404).json({
        success: false,
        message: `Bus with device ID ${deviceId} not found`,
      });
    }

    // Calculate enhanced statistics
    const stats = calculateBusStatistics(bus);

    // Enhanced bus data with real-time calculations
    const busWithCalculatedData = {
      ...bus.toJSON(),
      // Real-time calculated values
      calculatedSpeed: stats.currentSpeed,
      calculatedETA: stats.estimatedArrival,
      calculatedDistance: stats.remainingDistance,
      calculatedStops: stats.remainingStops,
      // Trip statistics
      tripStats: {
        totalDistance: stats.totalDistance,
        averageSpeed: stats.averageSpeed,
        maxSpeed: stats.maxSpeed,
        tripDuration: stats.tripDuration,
        activeTime: stats.activeTime,
      },
      // Enhanced display data
      driverName: bus.driverName || "Driver Available",
      driverPhone: bus.driverPhone || "+91-9876543210",
      startTime: bus.startTime || formatTime(bus.tripStartTime) || "06:00 AM",
      expectedTime: stats.estimatedArrival || "Calculating...",
      destinationTime: bus.destinationTime || "08:00 PM",
      status: bus.status || "Active",
    };

    logSuccess("getBusByDeviceId", "Bus found with calculated data", {
      deviceId,
    });
    res.json({
      success: true,
      latestLocations: busWithCalculatedData,
      metadata: {
        deviceId,
        searchTime: new Date().toISOString(),
        calculationsPerformed: true,
      },
    });
  } catch (err) {
    logError("getBusByDeviceId", err, { deviceId });
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Helper function to calculate comprehensive bus statistics
function calculateBusStatistics(bus) {
  const stats = {
    currentSpeed: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    totalDistance: 0,
    remainingDistance: 0,
    remainingStops: 0,
    estimatedArrival: null,
    tripDuration: 0,
    activeTime: 0,
  };

  if (!bus || !bus.route || bus.route.length === 0) {
    return stats;
  }

  const route = bus.route;
  const currentLocation = bus.location?.coordinates;

  // Calculate current speed from recent route points
  if (route.length >= 2) {
    const recentPoints = route.slice(-5); // Last 5 points
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < recentPoints.length; i++) {
      const prev = recentPoints[i - 1];
      const curr = recentPoints[i];

      if (
        prev.coordinates &&
        curr.coordinates &&
        prev.timestamp &&
        curr.timestamp
      ) {
        const distance = calculateDistance(
          prev.coordinates[0],
          prev.coordinates[1],
          curr.coordinates[0],
          curr.coordinates[1],
        );
        const timeDiff =
          (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;

        if (timeDiff > 0) {
          totalDistance += distance;
          totalTime += timeDiff;
        }
      }
    }

    if (totalTime > 0) {
      stats.currentSpeed = Math.round((totalDistance / totalTime) * 3.6); // Convert to km/h
    }
  }

  // Calculate other statistics
  const nonZeroSpeeds = route
    .filter((point) => point.speed && point.speed > 0)
    .map((p) => p.speed);
  if (nonZeroSpeeds.length > 0) {
    stats.averageSpeed = Math.round(
      nonZeroSpeeds.reduce((sum, speed) => sum + speed, 0) /
        nonZeroSpeeds.length,
    );
    stats.maxSpeed = Math.max(...nonZeroSpeeds);
  }

  // Calculate total distance from route
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    if (prev.coordinates && curr.coordinates) {
      totalDistance += calculateDistance(
        prev.coordinates[0],
        prev.coordinates[1],
        curr.coordinates[0],
        curr.coordinates[1],
      );
    }
  }
  stats.totalDistance = Math.round((totalDistance / 1000) * 100) / 100; // Convert to km, round to 2 decimals

  // Calculate remaining distance to destination (if available)
  if (currentLocation && bus.destinationCoords) {
    stats.remainingDistance =
      Math.round(
        (calculateDistance(
          currentLocation[0],
          currentLocation[1],
          bus.destinationCoords[0],
          bus.destinationCoords[1],
        ) /
          1000) *
          100,
      ) / 100;
  }

  // Estimate remaining stops (simplified)
  if (currentLocation && route.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;

    route.forEach((point, index) => {
      if (point.coordinates) {
        const distance = calculateDistance(
          currentLocation[0],
          currentLocation[1],
          point.coordinates[0],
          point.coordinates[1],
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    stats.remainingStops = Math.max(0, route.length - closestIndex - 1);
  }

  // Calculate ETA
  if (stats.remainingDistance > 0 && stats.currentSpeed > 0) {
    const etaHours = stats.remainingDistance / stats.currentSpeed;
    const etaTime = new Date(Date.now() + etaHours * 60 * 60 * 1000);
    stats.estimatedArrival = etaTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Calculate trip duration
  if (bus.tripStartTime) {
    stats.tripDuration = Math.round(
      (Date.now() - new Date(bus.tripStartTime)) / (1000 * 60),
    ); // minutes
  }

  return stats;
}

// Helper function to format time
function formatTime(date) {
  if (!date) return null;
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get traffic multiplier based on traffic level
function getTrafficMultiplier(trafficLevel) {
  const multipliers = {
    'low': 1.0,
    'medium': 1.2,
    'high': 1.5,
    'heavy': 2.0,
    'severe': 2.5
  };
  return multipliers[trafficLevel] || 1.0;
}

// Helper function to get historical multiplier based on time of day
function getHistoricalMultiplier(currentTime) {
  const hour = currentTime.getHours();

  // Peak hours: 7-9 AM and 4-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return 1.3; // 30% slower during peak hours
  }

  // Off-peak hours: 10 PM - 5 AM
  if (hour >= 22 || hour <= 5) {
    return 0.9; // 10% faster during off-peak
  }

  // Normal hours
  return 1.0;
}

// Helper function to calculate buffer time for stops
function calculateStopBuffer(route, distanceToDestination) {
  if (!route || route.length === 0) return 0;

  // Estimate number of stops based on route length and distance
  const routeLength = route.length;
  const estimatedStops = Math.max(1, Math.floor(routeLength / 10)); // Assume a stop every 10 route points

  // Average stop time: 2 minutes per stop
  const stopTimeMinutes = estimatedStops * 2;

  // Additional buffer for traffic lights, boarding, etc.
  const additionalBuffer = Math.min(10, distanceToDestination / 1000 * 0.5); // 30 seconds per km, max 10 minutes

  return stopTimeMinutes + additionalBuffer;
}
