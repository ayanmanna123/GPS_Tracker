import haversine from "haversine-distance"; // npm install haversine-distance
import Location from "../models/Location.model.js";
import Bus from "../models/Bus.model.js";
import Razorpay from "razorpay";
import User from "../models/User.model.js";
import Payment from "../models/Payment.model.js";
import crypto from "crypto";
import getAddressFromCoordinates from "../utils/utilsgetAddressFromCoordinates.js";

const razorpay = new Razorpay({
  key_id: "rzp_test_RPcZFwp7G16Gjf",
  key_secret: "tUB9roW7JPgT4qJutNMxbrAZ",
});

export const calculateTicketPrice = async (req, res) => {
  try {
    const { busId, fromLat, fromLng, toLat, toLng } = req.body;

    if (!busId || !fromLat || !fromLng || !toLat || !toLng) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    // Step 1: Fetch Bus & its linked Location
    const bus = await Bus.findOne({ deviceID: busId }).populate("location");
    if (!bus)
      return res.status(404).json({ success: false, message: "Bus not found" });

    const locationData = await Location.findById(bus.location);
    if (!locationData || !locationData.route || locationData.route.length < 2) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found or invalid" });
    }

    const route = locationData.route;

    // Step 2: Find nearest route points for from & to
    const fromPoint = [fromLat, fromLng];
    const toPoint = [toLat, toLng];

    let fromIndex = 0,
      toIndex = 0;
    let minFromDist = Infinity,
      minToDist = Infinity;

    route.forEach((r, i) => {
      const distFrom = haversine(
        [r.coordinates[0], r.coordinates[1]],
        fromPoint,
      );
      const distTo = haversine([r.coordinates[0], r.coordinates[1]], toPoint);
      if (distFrom < minFromDist) {
        minFromDist = distFrom;
        fromIndex = i;
      }
      if (distTo < minToDist) {
        minToDist = distTo;
        toIndex = i;
      }
    });

    // Ensure correct order (swap if needed)
    if (fromIndex > toIndex) [fromIndex, toIndex] = [toIndex, fromIndex];

    // Step 3: Calculate total route distance
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += haversine(
        route[i].coordinates,
        route[i + 1].coordinates,
      );
    }
    totalDistance /= 1000; // convert to km

    // Step 4: Calculate passenger travel distance
    let passengerDistance = 0;
    for (let i = fromIndex; i < toIndex; i++) {
      passengerDistance += haversine(
        route[i].coordinates,
        route[i + 1].coordinates,
      );
    }
    passengerDistance /= 1000; // convert to km

    // Step 5: Calculate proportional ticket price
    const pricePerKm = bus.ticketprice / totalDistance; // ticketprice = full route price
    const ticketPrice = Math.round(passengerDistance * pricePerKm);

    return res.status(200).json({
      success: true,
      data: {
        fromIndex,
        toIndex,
        totalDistance: totalDistance.toFixed(2),
        passengerDistance: passengerDistance.toFixed(2),
        ticketPrice,
        pricePerKm: pricePerKm.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error calculating ticket price:", error);
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export const veryfypament = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ticketData,
      busId,
      fromLat,
      fromLng,
      toLat,
      toLng,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment fields" });
    }

    if (!ticketData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing ticket data" });
    }

    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;

    // Get user
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Save payment record
    const paymentRecord = new Payment({
      user: userInfo._id,
      name: userInfo.name || "Unknown User",
      email: userInfo.email || "N/A",
      busId: busId,
      fromLat: fromLat,
      fromLng: fromLng,
      toLat: toLat,
      toLng: toLng,
      totalDistance: ticketData.totalDistance,
      passengerDistance: ticketData.passengerDistance,
      ticketPrice: ticketData.ticketPrice,
      pricePerKm: ticketData.pricePerKm,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus: isAuthentic ? "Success" : "Failed",
    });

    await paymentRecord.save();

    return res.json({
      success: isAuthentic,
      message: isAuthentic
        ? "✅ Payment verified successfully!"
        : "❌ Payment verification failed!",
      paymentId: paymentRecord._id,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTecket = async (req, res) => {
  try {
    const userInfo = await User.findOne({ auth0Id: req.auth.sub });
    if (!userInfo) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const allTicket = await Payment.find({ user: userInfo._id }).populate(
      "user",
    );

    if (!allTicket) {
      return res.status(404).json({
        message: "no tickete avalable",
        success: false,
      });
    }
    return res.status(200).json({
      message: "this is your tickete",
      allTicket,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const createTickete = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
};

export const findTicketById = async (req, res) => {
  try {
    const { ticketid } = req.params;

    const ticket = await Payment.findById(ticketid).populate("user");
    if (!ticket) {
      return res.status(404).json({
        message: "Payment not found",
        success: false,
      });
    }

    // ✅ Convert coordinates to address
    const fromAddressData = await getAddressFromCoordinates(
      ticket.fromLat,
      ticket.fromLng,
    );
    const toAddressData = await getAddressFromCoordinates(
      ticket.toLat,
      ticket.toLng,
    );

    // ✅ Add addresses directly into ticket object (without saving to DB)
    const ticketWithAddress = {
      ...ticket.toObject(),
      fromAddress: {
        english: fromAddressData.english,
        local: fromAddressData.local,
        state: fromAddressData.state,
      },
      toAddress: {
        english: toAddressData.english,
        local: toAddressData.local,
        state: toAddressData.state,
      },
    };

    return res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket: ticketWithAddress,
      success: true,
    });
  } catch (error) {
    console.error("Error in findTicketById:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
