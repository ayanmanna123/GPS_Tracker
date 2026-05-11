import haversine from "haversine-distance";
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";
import getAddressFromCoordinates from "../utils/getAddressFromCoordinates.js";
import redisClient from "../utils/redis.js";

// 🌍 Haversine formula for distance (km)
function haversineDistance(coord1, coord2) {
  const R = 6371; // km
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
  
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// helper: find the nearest index on the route within a threshold (default 2km)
const findNearestIndex = (point, routeCoords, thresholdKm = 2.0) => {
  let minIndex = -1;
  let minDist = Infinity;
  
  for (let i = 0; i < routeCoords.length; i++) {
    const dist = haversineDistance(point, routeCoords[i].coordinates);
    if (dist < minDist && dist <= thresholdKm) {
      minDist = dist;
      minIndex = i;
    }
  }
  return minIndex;
};

// helper: find nearest future startTime
const getNextStartTime = (timeSlots, minTime = new Date()) => {
  let nearestSlot = null;
  let minDiff = Infinity;

  timeSlots.forEach((slot) => {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(minTime);
    slotStartTime.setHours(startH, startM, 0, 0);

    let diff = slotStartTime - minTime;
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    if (diff < minDiff) {
      minDiff = diff;
      nearestSlot = slot;
    }
  });

  return nearestSlot;
};

export const findBusByRoute = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;
    const fLat = parseFloat(fromLat);
    const fLng = parseFloat(fromLng);
    const tLat = parseFloat(toLat);
    const tLng = parseFloat(toLng);

    if (isNaN(fLat) || isNaN(fLng) || isNaN(tLat) || isNaN(tLng)) {
      return res.status(400).json({ message: "Invalid coordinates provided", success: false });
    }

    const roundTo4 = (num) => Number.parseFloat(num).toFixed(4);
    const cacheKey = `routeSearch:${roundTo4(fLat)},${roundTo4(fLng)}->${roundTo4(tLat)},${roundTo4(tLng)}`;

    let cachedRoute = null;
    try {
      if (redisClient.isOpen) {
        cachedRoute = await redisClient.get(cacheKey);
      }
    } catch (err) {
      console.log("Redis cache skip");
    }

    if (cachedRoute) {
      return res.status(200).json(JSON.parse(cachedRoute));
    }

    const buses = await Location.find({}, { deviceID: 1, route: 1 });
    const userStart = [fLat, fLng];
    const userEnd = [tLat, tLng];

    // 1. Try DIRECT routes (allowing bi-directional match)
    const directBusMatches = [];
    for (const bus of buses) {
      const fromIdx = findNearestIndex(userStart, bus.route, 2.5);
      const toIdx = findNearestIndex(userEnd, bus.route, 2.5);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        directBusMatches.push({
          deviceID: bus.deviceID,
          fromIdx,
          toIdx,
          bus
        });
      }
    }

    if (directBusMatches.length > 0) {
      const directBusIDs = directBusMatches.map(m => m.deviceID);
      let matchedBuses = await Bus.find({ deviceID: { $in: directBusIDs } });
      matchedBuses = matchedBuses.map((bus) => ({
        ...bus.toObject(),
        nextStartTime: getNextStartTime(bus.timeSlots),
      }));

      // Build path for the first direct match
      const bestMatch = directBusMatches[0];
      const { fromIdx, toIdx, bus: directBus } = bestMatch;
      
      const startIdx = Math.min(fromIdx, toIdx);
      const endIdx = Math.max(fromIdx, toIdx);
      let routeSegment = directBus.route.slice(startIdx, endIdx + 1).map(p => p.coordinates);
      
      // Reverse segment if traveling backwards on the route array
      if (fromIdx > toIdx) routeSegment.reverse();

      const pathCoordinates = [userStart, ...routeSegment, userEnd];

      const pathAddresses = [];
      for (let i = 0; i < pathCoordinates.length; i++) {
        let address = { english: "Transit point", local: "ট্রানজিট পয়েন্ট" };
        if (i === 0 || i === pathCoordinates.length - 1) {
          address = await getAddressFromCoordinates(pathCoordinates[i][0], pathCoordinates[i][1]);
        }
        pathAddresses.push({ coordinates: pathCoordinates[i], address });
      }

      const response = {
        message: "Direct route found",
        success: true,
        type: "direct",
        total: matchedBuses.length,
        busesUsed: matchedBuses,
        pathCoordinates,
        pathAddresses,
      };

      if (redisClient.isOpen) await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
      return res.status(200).json(response);
    }

    // 2. 1-Transfer Search (Find two buses that intersect)
    const startBuses = [];
    const endBuses = [];

    for (const bus of buses) {
      const sIdx = findNearestIndex(userStart, bus.route, 2.5);
      if (sIdx !== -1) startBuses.push({ bus, sIdx });

      const eIdx = findNearestIndex(userEnd, bus.route, 2.5);
      if (eIdx !== -1) endBuses.push({ bus, eIdx });
    }

    for (const sMatch of startBuses) {
      for (const eMatch of endBuses) {
        if (sMatch.bus.deviceID === eMatch.bus.deviceID) continue;

        // Look for an intersection point between the two routes
        for (let i = sMatch.sIdx; i < sMatch.bus.route.length; i++) {
          const sPoint = sMatch.bus.route[i].coordinates;
          const transferIdx = findNearestIndex(sPoint, eMatch.bus.route, 1.0);
          
          if (transferIdx !== -1) {
            // Found a 1-transfer path!
            const matchedBuses = await Bus.find({ 
              deviceID: { $in: [sMatch.bus.deviceID, eMatch.bus.deviceID] } 
            });
            
            // Build the two segments
            const segment1 = sMatch.bus.route.slice(Math.min(sMatch.sIdx, i), Math.max(sMatch.sIdx, i) + 1).map(p => p.coordinates);
            if (sMatch.sIdx > i) segment1.reverse();

            const segment2 = eMatch.bus.route.slice(Math.min(transferIdx, eMatch.eIdx), Math.max(transferIdx, eMatch.eIdx) + 1).map(p => p.coordinates);
            if (transferIdx > eMatch.eIdx) segment2.reverse();

            const pathCoordinates = [userStart, ...segment1, ...segment2, userEnd];

            const pathAddresses = [];
            for (let k = 0; k < pathCoordinates.length; k++) {
              let address = { english: "Transit point" };
              if (k === 0 || k === pathCoordinates.length - 1 || k === segment1.length) {
                address = await getAddressFromCoordinates(pathCoordinates[k][0], pathCoordinates[k][1]);
              }
              pathAddresses.push({ coordinates: pathCoordinates[k], address });
            }

            const response = {
              message: "1-transfer route found",
              success: true,
              type: "multi-hop",
              busesUsed: matchedBuses,
              pathCoordinates,
              pathAddresses,
            };

            if (redisClient.isOpen) await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
            return res.status(200).json(response);
          }
        }
      }
    }

    return res.status(404).json({ message: "No direct or multi-hop bus route found", success: false });
  } catch (error) {
    console.error("Error in findBusByRoute:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const findByBusId = async (req, res) => {
  try {
    const { DeviceId } = req.body;
    if (!DeviceId) {
      return res.status(404).json({
        message: "no device id i have",
      });
    }
    const allbus = await Bus.findOne({ deviceID: DeviceId });
    if (!allbus) {
      return res.status(400).json({
        message: "no bus found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "success",
      success: true,
      allbus,
    });
  } catch (error) {
    console.error("Error in findByBusId:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during bus lookup",
      error: error.message
    });
  }
};

export const findByBusName = async (req, res) => {
  try {
    const { BusName } = req.body;
    if (!BusName) {
      return res.status(404).json({
        message: "bus name is requried",
        success: false,
      });
    }
    const allBus = await Bus.find({ name: BusName });
    return res.status(200).json({
      message: "bus get success fully",
      success: true,
      allBus,
    });
  } catch (error) {
    console.error("Error in findByBusName:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during bus name lookup",
      error: error.message
    });
  }
};


export const getBusByDeviceID = async (req, res) => {
  try {
    const { deviceID } = req.params;

    // 🔍 Find Bus and populate driver + location
    const bus = await Bus.findOne({ deviceID })
      .populate("driver")
      .populate("location");

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const location = await Location.findById(bus.location);
    if (!location)
      return res.status(404).json({ message: "Location not found" });

    // 🧮 Calculate Speed using prevlocation & location
    let speed = 0;
    if (location.prevlocation && location.location) {
      const dist = haversineDistance(
        location.prevlocation.coordinates,
        location.location.coordinates,
      );
      const timeDiff =
        (new Date(location.location.timestamp) -
          new Date(location.prevlocation.timestamp)) /
        3600000; // hours
      speed = timeDiff > 0 ? dist / timeDiff : 0;
    }

    // 📏 Calculate total distance (entire route)
    let totalDistance = 0;
    if (location.route && location.route.length > 1) {
      for (let i = 1; i < location.route.length; i++) {
        totalDistance += haversineDistance(
          location.route[i - 1].coordinates,
          location.route[i].coordinates,
        );
      }
    }

    // 📏 Calculate covered distance (up to current location)
    let coveredDistance = 0;
    if (location.route && location.route.length > 0) {
      for (let i = 1; i < location.route.length; i++) {
        const segmentDist = haversineDistance(
          location.route[i - 1].coordinates,
          location.route[i].coordinates,
        );
        const [currLat, currLon] = location.location.coordinates;

        // check if current location is near this segment
        const distToCurr = haversineDistance(
          location.route[i].coordinates,
          location.location.coordinates,
        );
        if (distToCurr < 0.3) {
          coveredDistance += segmentDist;
          break;
        } else {
          coveredDistance += segmentDist;
        }
      }
    }

    // 🧭 Remaining Distance
    const remainingDistance = Math.max(totalDistance - coveredDistance, 0);

    // ⏱️ ETA
    let ETA = "N/A";
    if (speed > 0 && remainingDistance > 0) {
      const hours = remainingDistance / speed;
      ETA = `${(hours * 60).toFixed(1)} min`;
    }

    // 🧾 Final result
    const result = {
      deviceID: bus.deviceID,
      name: bus.name,
      from: bus.from,
      to: bus.to,
      path: location.route,
      ticketprice: bus.ticketprice,
      timeSlots: bus.timeSlots,
      driver: {
        name: bus.driver?.name,
        email: bus.driver?.email,
        licenceId: bus.driver?.licenceId,
        driverExp: bus.driver?.driverExp,
        picture: bus.driver?.picture,
      },
      liveLocation: {
        coordinates: location.location.coordinates,
        timestamp: location.location.timestamp,
      },
      speed: Number(speed.toFixed(2)),
      totalDistance: Number(totalDistance.toFixed(2)),
      coveredDistance: Number(coveredDistance.toFixed(2)),
      remainingDistance: Number(remainingDistance.toFixed(2)),
      ETA,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
