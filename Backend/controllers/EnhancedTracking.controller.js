import Bus from "../models/Bus.model.js";
import Location from "../models/Location.model.js";
import User from "../models/User.model.js";

// Calculate direction between two points (bearing)
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalize to 0-360
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

// Update real-time tracking data
export const updateTrackingData = async (req, res) => {
  try {
    const { deviceID, speed, direction, passengers, trafficLevel } = req.body;

    if (!deviceID) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const location = await Location.findOne({ deviceID });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Update real-time data
    location.realTimeData = {
      currentPassengers: passengers || location.realTimeData?.currentPassengers || 0,
      speed: speed || location.realTimeData?.speed || 0,
      direction: direction || location.realTimeData?.direction || 0,
      trafficLevel: trafficLevel || location.realTimeData?.trafficLevel || "unknown",
      lastDataUpdate: new Date(),
    };

    await location.save();

    // Also update Bus model if exists
    const bus = await Bus.findOne({ deviceID });
    if (bus) {
      bus.tracking = {
        currentSpeed: speed || 0,
        direction: direction || 0,
        lastSpeedUpdate: new Date(),
      };

      if (passengers !== undefined) {
        bus.capacity.occupiedSeats = passengers;
        bus.capacity.availableSeats = bus.capacity.totalSeats - passengers;
      }

      if (trafficLevel) {
        bus.trafficCondition = trafficLevel;
      }

      await bus.save();
    }

    return res.status(200).json({
      success: true,
      message: "Tracking data updated successfully",
      data: {
        deviceID,
        realTimeData: location.realTimeData,
      },
    });
  } catch (error) {
    console.error("Error updating tracking data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get enhanced tracking info for a specific bus
export const getEnhancedTrackingInfo = async (req, res) => {
  try {
    const { deviceID } = req.params;

    const location = await Location.findOne({ deviceID });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const bus = await Bus.findOne({ deviceID }).populate("driver");

    // Calculate speed and direction if we have recent route data
    let calculatedSpeed = 0;
    let calculatedDirection = 0;

    if (location.route && location.route.length >= 2) {
      const recentPoints = location.route.slice(-2);
      const [point1, point2] = recentPoints;

      const timeDiff =
        (new Date(point2.timestamp) - new Date(point1.timestamp)) / 1000; // seconds
      if (timeDiff > 0) {
        const distance = calculateDistance(
          point1.coordinates[0],
          point1.coordinates[1],
          point2.coordinates[0],
          point2.coordinates[1]
        );
        calculatedSpeed = (distance / timeDiff) * 3600; // km/h
        calculatedDirection = calculateBearing(
          point1.coordinates[0],
          point1.coordinates[1],
          point2.coordinates[0],
          point2.coordinates[1]
        );
      }
    }

    const trackingInfo = {
      deviceID,
      currentLocation: location.location,
      previousLocation: location.prevlocation,
      realTimeData: {
        ...location.realTimeData,
        speed: location.realTimeData?.speed || calculatedSpeed,
        direction: location.realTimeData?.direction || calculatedDirection,
      },
      busInfo: bus
        ? {
            name: bus.name,
            from: bus.from,
            to: bus.to,
            capacity: bus.capacity,
            trafficCondition: bus.trafficCondition,
            estimatedArrival: bus.estimatedArrival,
            driver: bus.driver,
          }
        : null,
      lastUpdated: location.lastUpdated,
      routeHistory: location.route.slice(-20), // Last 20 points
    };

    return res.status(200).json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    console.error("Error getting enhanced tracking info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get tracking info for multiple buses
export const getMultipleBusTracking = async (req, res) => {
  try {
    const { deviceIDs } = req.body; // Array of device IDs

    if (!deviceIDs || !Array.isArray(deviceIDs) || deviceIDs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Device IDs array is required",
      });
    }

    // Limit to 10 buses at a time
    if (deviceIDs.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 buses can be tracked simultaneously",
      });
    }

    const locations = await Location.find({ deviceID: { $in: deviceIDs } });
    const buses = await Bus.find({ deviceID: { $in: deviceIDs } }).populate(
      "driver"
    );

    const trackingData = locations.map((location) => {
      const bus = buses.find((b) => b.deviceID === location.deviceID);

      // Calculate speed and direction
      let calculatedSpeed = 0;
      let calculatedDirection = 0;

      if (location.route && location.route.length >= 2) {
        const recentPoints = location.route.slice(-2);
        const [point1, point2] = recentPoints;

        const timeDiff =
          (new Date(point2.timestamp) - new Date(point1.timestamp)) / 1000;
        if (timeDiff > 0) {
          const distance = calculateDistance(
            point1.coordinates[0],
            point1.coordinates[1],
            point2.coordinates[0],
            point2.coordinates[1]
          );
          calculatedSpeed = (distance / timeDiff) * 3600;
          calculatedDirection = calculateBearing(
            point1.coordinates[0],
            point1.coordinates[1],
            point2.coordinates[0],
            point2.coordinates[1]
          );
        }
      }

      return {
        deviceID: location.deviceID,
        currentLocation: location.location,
        realTimeData: {
          ...location.realTimeData,
          speed: location.realTimeData?.speed || calculatedSpeed,
          direction: location.realTimeData?.direction || calculatedDirection,
        },
        busInfo: bus
          ? {
              name: bus.name,
              from: bus.from,
              to: bus.to,
              capacity: bus.capacity,
              trafficCondition: bus.trafficCondition,
            }
          : null,
        lastUpdated: location.lastUpdated,
      };
    });

    return res.status(200).json({
      success: true,
      count: trackingData.length,
      data: trackingData,
    });
  } catch (error) {
    console.error("Error getting multiple bus tracking:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Share bus location with friends
export const shareBusLocation = async (req, res) => {
  try {
    const { deviceID, shareWithEmails, expirationHours } = req.body;
    const userId = req.auth.sub;

    if (!deviceID || !shareWithEmails || !Array.isArray(shareWithEmails)) {
      return res.status(400).json({
        success: false,
        message: "Device ID and share recipients are required",
      });
    }

    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expirationHours || 24));

    // Add shared users
    shareWithEmails.forEach((email) => {
      const existing = bus.sharedWith.find(
        (share) => share.userId === email
      );
      if (!existing) {
        bus.sharedWith.push({
          userId: email,
          sharedAt: new Date(),
          expiresAt: expiresAt,
        });
      }
    });

    await bus.save();

    // Generate shareable link
    const shareLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/track/shared/${deviceID}`;

    return res.status(200).json({
      success: true,
      message: "Location shared successfully",
      data: {
        shareLink,
        expiresAt,
        sharedWith: shareWithEmails,
      },
    });
  } catch (error) {
    console.error("Error sharing bus location:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update passenger count
export const updatePassengerCount = async (req, res) => {
  try {
    const { deviceID, action } = req.body; // action: 'board' or 'alight'

    if (!deviceID || !action) {
      return res.status(400).json({
        success: false,
        message: "Device ID and action are required",
      });
    }

    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (action === "board") {
      if (bus.capacity.occupiedSeats < bus.capacity.totalSeats) {
        bus.capacity.occupiedSeats += 1;
      } else {
        return res.status(400).json({
          success: false,
          message: "Bus is full",
        });
      }
    } else if (action === "alight") {
      if (bus.capacity.occupiedSeats > 0) {
        bus.capacity.occupiedSeats -= 1;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'board' or 'alight'",
      });
    }

    bus.capacity.availableSeats =
      bus.capacity.totalSeats - bus.capacity.occupiedSeats;

    await bus.save();

    // Also update location model
    const location = await Location.findOne({ deviceID });
    if (location) {
      location.realTimeData.currentPassengers = bus.capacity.occupiedSeats;
      await location.save();
    }

    return res.status(200).json({
      success: true,
      message: "Passenger count updated",
      data: {
        occupiedSeats: bus.capacity.occupiedSeats,
        availableSeats: bus.capacity.availableSeats,
        totalSeats: bus.capacity.totalSeats,
      },
    });
  } catch (error) {
    console.error("Error updating passenger count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Calculate and update ETA
export const calculateETA = async (req, res) => {
  try {
    const { deviceID, destinationLat, destinationLng } = req.body;

    if (!deviceID || !destinationLat || !destinationLng) {
      return res.status(400).json({
        success: false,
        message: "Device ID and destination coordinates are required",
      });
    }

    const location = await Location.findOne({ deviceID });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const currentLat = location.location.coordinates[0];
    const currentLng = location.location.coordinates[1];

    // Calculate distance to destination
    const distance = calculateDistance(
      currentLat,
      currentLng,
      destinationLat,
      destinationLng
    );

    // Get current speed or use average speed
    const currentSpeed =
      location.realTimeData?.speed || 30; // Default 30 km/h

    // Calculate ETA
    let etaMinutes = (distance / currentSpeed) * 60;

    // Adjust for traffic
    const trafficMultiplier = {
      light: 1.0,
      moderate: 1.3,
      heavy: 1.6,
      severe: 2.0,
      unknown: 1.2,
    };

    const trafficLevel = location.realTimeData?.trafficLevel || "unknown";
    etaMinutes *= trafficMultiplier[trafficLevel];

    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + Math.round(etaMinutes));

    // Update ETA in database
    location.realTimeData.eta = eta;
    await location.save();

    const bus = await Bus.findOne({ deviceID });
    if (bus) {
      bus.estimatedArrival = eta;
      await bus.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        distance: distance.toFixed(2),
        etaMinutes: Math.round(etaMinutes),
        eta: eta,
        currentSpeed: currentSpeed.toFixed(1),
        trafficLevel,
      },
    });
  } catch (error) {
    console.error("Error calculating ETA:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
