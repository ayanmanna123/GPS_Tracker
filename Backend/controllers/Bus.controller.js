import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import Location from "../models/Location.model.js";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";

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

// Get available seats for a specific bus and date
export const getAvailableSeats = async (req, res) => {
  try {
    const { busId, journeyDate } = req.params;

    if (!busId || !journeyDate) {
      return res.status(400).json({
        message: "Bus ID and journey date are required",
        success: false,
      });
    }

    // Find the bus
    const bus = await Bus.findOne({ deviceID: busId });
    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
        success: false,
      });
    }

    // Get all bookings for this bus on the specified date
    const startOfDay = new Date(journeyDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(journeyDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      bus: bus._id,
      journeyDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: "active",
      "seats.status": { $in: ["booked", "confirmed"] },
    });

    // Collect occupied seats
    const occupiedSeats = new Set();
    bookings.forEach(booking => {
      booking.seats.forEach(seat => {
        if (seat.status === "booked" || seat.status === "confirmed") {
          occupiedSeats.add(seat.seatNumber);
        }
      });
    });

    // Generate available seats (assuming seats are numbered 1 to totalSeats)
    const availableSeats = [];
    for (let i = 1; i <= bus.capacity.totalSeats; i++) {
      const seatNumber = i.toString();
      if (!occupiedSeats.has(seatNumber)) {
        availableSeats.push(seatNumber);
      }
    }

    return res.status(200).json({
      message: "Available seats fetched successfully",
      success: true,
      data: {
        busId: bus.deviceID,
        busName: bus.name,
        totalSeats: bus.capacity.totalSeats,
        availableSeats: availableSeats.length,
        occupiedSeats: occupiedSeats.size,
        seatNumbers: availableSeats,
        journeyDate,
      },
    });
  } catch (error) {
    console.error("[getAvailableSeats] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { busId, seats, journeyDate, fromLocation, toLocation, totalAmount } = req.body;

    if (!busId || !seats || !journeyDate || !fromLocation || !toLocation || !totalAmount) {
      return res.status(400).json({
        message: "All booking details are required",
        success: false,
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: "At least one seat must be selected",
        success: false,
      });
    }

    // Get user info
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Find the bus
    const bus = await Bus.findOne({ deviceID: busId });
    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
        success: false,
      });
    }

    // Check if seats are available
    const startOfDay = new Date(journeyDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(journeyDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      bus: bus._id,
      journeyDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: "active",
      "seats.status": { $in: ["booked", "confirmed"] },
    });

    const occupiedSeats = new Set();
    existingBookings.forEach(booking => {
      booking.seats.forEach(seat => {
        if (seat.status === "booked" || seat.status === "confirmed") {
          occupiedSeats.add(seat.seatNumber);
        }
      });
    });

    // Check if requested seats are available
    const unavailableSeats = seats.filter(seat => occupiedSeats.has(seat));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        message: `Seats ${unavailableSeats.join(", ")} are no longer available`,
        success: false,
      });
    }

    // Create booking seats array
    const bookingSeats = seats.map(seatNumber => ({
      seatNumber,
      status: "booked",
    }));

    // Create the booking
    const booking = await Booking.create({
      user: user._id,
      bus: bus._id,
      seats: bookingSeats,
      journeyDate: new Date(journeyDate),
      fromLocation,
      toLocation,
      totalAmount,
      paymentStatus: "pending",
      bookingStatus: "active",
    });

    // Update bus capacity (increment occupied seats)
    await Bus.findByIdAndUpdate(bus._id, {
      $inc: { "capacity.occupiedSeats": seats.length, "capacity.availableSeats": -seats.length }
    });

    return res.status(201).json({
      message: "Booking created successfully",
      success: true,
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        seats: seats,
        totalAmount,
        journeyDate,
        busName: bus.name,
        busId: bus.deviceID,
      },
    });
  } catch (error) {
    console.error("[createBooking] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
        success: false,
      });
    }

    // Get user info
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Find and update the booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: user._id,
      bookingStatus: "active"
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or already cancelled",
        success: false,
      });
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    booking.seats.forEach(seat => {
      seat.status = "cancelled";
    });
    booking.updatedAt = new Date();
    await booking.save();

    // Update bus capacity (decrement occupied seats)
    const occupiedSeatsCount = booking.seats.length;
    await Bus.findByIdAndUpdate(booking.bus, {
      $inc: { "capacity.occupiedSeats": -occupiedSeatsCount, "capacity.availableSeats": occupiedSeatsCount }
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
      success: true,
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        refundedAmount: booking.totalAmount,
      },
    });
  } catch (error) {
    console.error("[cancelBooking] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    // Get user info
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const bookings = await Booking.find({ user: user._id })
      .populate("bus", "name deviceID from to")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User bookings fetched successfully",
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("[getUserBookings] Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};
