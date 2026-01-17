import Location from "../models/Location.model.js";

export const getRouteHistory = async (req, res) => {
  try {
    const { deviceID } = req.params;
    const { startDate, endDate } = req.query;

    if (!deviceID) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    const query = { deviceID };
    
    // Build date filter if provided
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      query["route.timestamp"] = dateFilter;
    }

    const bus = await Location.findOne({ deviceID }).select('deviceID route lastUpdated');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Filter route points by date range if specified
    let filteredRoute = bus.route || [];
    if (startDate || endDate) {
      filteredRoute = bus.route.filter(point => {
        const pointDate = new Date(point.timestamp);
        if (startDate && pointDate < new Date(startDate)) return false;
        if (endDate && pointDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Group route points by date for better organization
    const routeByDate = {};
    filteredRoute.forEach(point => {
      const date = new Date(point.timestamp).toDateString();
      if (!routeByDate[date]) {
        routeByDate[date] = [];
      }
      routeByDate[date].push(point);
    });

    res.json({
      success: true,
      data: {
        deviceID,
        totalPoints: filteredRoute.length,
        dateRange: {
          start: startDate || (filteredRoute[0]?.timestamp),
          end: endDate || (filteredRoute[filteredRoute.length - 1]?.timestamp)
        },
        routeHistory: filteredRoute,
        routeByDate,
        lastUpdated: bus.lastUpdated
      }
    });

  } catch (error) {
    console.error("[getRouteHistory] Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching route history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const getAvailableDates = async (req, res) => {
  try {
    const { deviceID } = req.params;

    if (!deviceID) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    const bus = await Location.findOne({ deviceID }).select('route');

    if (!bus || !bus.route || bus.route.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No route history found for this bus"
      });
    }

    // Extract unique dates from route history
    const dates = [...new Set(
      bus.route.map(point => 
        new Date(point.timestamp).toDateString()
      )
    )].sort((a, b) => new Date(b) - new Date(a));

    res.json({
      success: true,
      data: {
        deviceID,
        availableDates: dates,
        totalDays: dates.length,
        oldestRecord: dates[dates.length - 1],
        newestRecord: dates[0]
      }
    });

  } catch (error) {
    console.error("[getAvailableDates] Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching available dates",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};