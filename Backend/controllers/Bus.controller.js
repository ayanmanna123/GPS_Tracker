import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import Location from "../models/Location.model.js";

export const CreateBus = async (req, res) => {
  try {
    const { name, deviceID, to, from, timeSlots, ticketPrice } = req.body;

    if (
      !name ||
      !deviceID ||
      !to ||
      !from ||
      !ticketPrice ||
      !timeSlots?.length
    ) {
      return res.status(400).json({
        message: "All fields including time slots are required",
        success: false,
      });
    }

    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "Login first",
        success: false,
      });
    }

    const existingBus = await Bus.findOne({ deviceID });
    if (existingBus) {
      return res.status(400).json({
        message: "Bus already registered",
        success: false,
      });
    }

    // create location record
    const newBusLocation = await Location.create({ deviceID });

    // build bus details
    const busDetails = {
      name,
      deviceID,
      to,
      from,
      driver: user._id,
      location: newBusLocation._id,
      ticketprice: ticketPrice,
      timeSlots,
    };

    const newBus = await Bus.create(busDetails);

    return res.status(200).json({
      message: "Bus details created successfully",
      bus: newBus,
      location: newBusLocation,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
};

export const getAllBUs = async (req, res) => {
  try {
    // 1. Parse valid page/limit from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Ensure valid positive integers
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 20;

    const skip = (validPage - 1) * validLimit;

    // 2. Fetch total count & paginated data in parallel
    const [totalItems, allBus] = await Promise.all([
      Bus.countDocuments({}),
      Bus.find({})
        .populate("driver")
        .populate("location")
        .skip(skip)
        .limit(validLimit)
        .exec(),
    ]);

    const totalPages = Math.ceil(totalItems / validLimit);

    // 3. Handle case where no data is found (optional: could also return empty array with metadata)
    if (!allBus || allBus.length === 0) {
      // It's often better to valid JSON with empty data than 404 for a list endpoint,
      // but sticking to previous behavior for "No bus created" if the DB is actually empty
      // implies check against totalItems or just return empty list.
      // If the page is out of range, allBus will be empty, which is valid.
      // Let's return the metadata even if data is empty, unless the DB is truly empty?
      // The original code returned 404 if no buses existed at all.
      // Let's preserve that behavior if totalItems === 0.
      if (totalItems === 0) {
        return res.status(404).json({
          message: "No bus created",
          success: false,
        });
      }
    }

    // 4. Transform data
    const formattedBuses = allBus.map((busData) => {
      return {
        // Core identifiers
        deviceID: busData.deviceID,
        id: busData.deviceID,
        deviceId: busData.deviceID,

        // Basic info
        name: busData.name || `Bus ${busData.deviceID}`,
        busName: busData.busName || `Bus ${busData.deviceID}`,
        status: busData.status || "Active",

        // Location data
        location: busData.location,
        currentLocation: busData.currentLocation || "Live tracking available",
        lat: busData.location?.location?.coordinates?.[0] || 0,
        lng: busData.location?.location?.coordinates?.[1] || 0,
        latitude: busData.location?.location?.coordinates?.[0] || 0,
        longitude: busData.location?.location?.coordinates?.[1] || 0,

        // Route data
        route: busData.route || [],

        // Time data
        lastUpdated: busData.lastUpdated,
        timestamp: busData.lastUpdated,
        updatedAt: busData.lastUpdated,
        startTime: busData.startTime || "06:00 AM",
        expectedTime: busData.expectedTime || "Calculating...",
        destinationTime: busData.destinationTime || "08:00 PM",

        // Driver data
        driverName: busData.driver?.name || "Driver Available",
        driver: busData.driver?.name || "Driver Available",
        driverPhone: busData.driver?.phone || "Contact Support",

        // Additional metadata
        _id: busData._id,
        __v: busData.__v,
      };
    });

    // 5. Return response with metadata
    return res.status(200).json({
      message: "All buses fetched successfully",
      success: true,
      metadata: {
        page: validPage,
        limit: validLimit,
        totalItems,
        totalPages,
      },
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
