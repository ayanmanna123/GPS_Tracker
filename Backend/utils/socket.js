import { Server } from "socket.io";

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://gps-tracker-umber.vercel.app",
        "https://gps-tracker-ecru.vercel.app",
        "https://where-is-my-bus.netlify.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Track single bus
    socket.on("track-bus", (deviceID) => {
      console.log(`📍 Client ${socket.id} tracking bus: ${deviceID}`);
      socket.join(`bus:${deviceID}`);
      socket.emit("tracking-started", { deviceID });
    });

    // Stop tracking single bus
    socket.on("stop-tracking-bus", (deviceID) => {
      console.log(`🛑 Client ${socket.id} stopped tracking bus: ${deviceID}`);
      socket.leave(`bus:${deviceID}`);
      socket.emit("tracking-stopped", { deviceID });
    });

    // Track multiple buses
    socket.on("track-multiple-buses", (deviceIDs) => {
      console.log(`📍 Client ${socket.id} tracking ${deviceIDs.length} buses`);
      deviceIDs.forEach((deviceID) => {
        socket.join(`bus:${deviceID}`);
      });
      socket.emit("multiple-tracking-started", { deviceIDs });
    });

    // Stop tracking multiple buses
    socket.on("stop-tracking-multiple-buses", (deviceIDs) => {
      console.log(`🛑 Client ${socket.id} stopped tracking ${deviceIDs.length} buses`);
      deviceIDs.forEach((deviceID) => {
        socket.leave(`bus:${deviceID}`);
      });
      socket.emit("multiple-tracking-stopped", { deviceIDs });
    });

    // Subscribe to notifications
    socket.on("subscribe-notifications", (userId) => {
      console.log(`🔔 Client ${socket.id} subscribed to notifications: ${userId}`);
      socket.join(`notifications:${userId}`);
    });

    // Unsubscribe from notifications
    socket.on("unsubscribe-notifications", (userId) => {
      console.log(`🔕 Client ${socket.id} unsubscribed from notifications: ${userId}`);
      socket.leave(`notifications:${userId}`);
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });

  console.log("🚀 WebSocket server initialized");
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Emit location update for a specific bus
 * @param {string} deviceID - Bus device ID
 * @param {object} locationData - Location update data
 */
export const emitLocationUpdate = (deviceID, locationData) => {
  if (!io) return;

  io.to(`bus:${deviceID}`).emit("location-update", {
    deviceID,
    ...locationData,
    timestamp: new Date(),
  });

  console.log(`📡 Location update emitted for bus: ${deviceID}`);
};

/**
 * Emit tracking data update for a specific bus
 * @param {string} deviceID - Bus device ID
 * @param {object} trackingData - Tracking data (speed, direction, passengers, etc.)
 */
export const emitTrackingUpdate = (deviceID, trackingData) => {
  if (!io) return;

  io.to(`bus:${deviceID}`).emit("tracking-update", {
    deviceID,
    ...trackingData,
    timestamp: new Date(),
  });

  console.log(`📡 Tracking update emitted for bus: ${deviceID}`);
};

/**
 * Emit notification to a specific user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 */
export const emitNotification = (userId, notification) => {
  if (!io) return;

  io.to(`notifications:${userId}`).emit("notification", {
    ...notification,
    timestamp: new Date(),
  });

  console.log(`🔔 Notification sent to user: ${userId}`);
};

/**
 * Emit ETA update for a specific bus
 * @param {string} deviceID - Bus device ID
 * @param {object} etaData - ETA calculation data
 */
export const emitETAUpdate = (deviceID, etaData) => {
  if (!io) return;

  io.to(`bus:${deviceID}`).emit("eta-update", {
    deviceID,
    ...etaData,
    timestamp: new Date(),
  });

  console.log(`⏱️ ETA update emitted for bus: ${deviceID}`);
};

/**
 * Emit passenger count update for a specific bus
 * @param {string} deviceID - Bus device ID
 * @param {object} capacityData - Capacity data
 */
export const emitPassengerUpdate = (deviceID, capacityData) => {
  if (!io) return;

  io.to(`bus:${deviceID}`).emit("passenger-update", {
    deviceID,
    ...capacityData,
    timestamp: new Date(),
  });

  console.log(`👥 Passenger update emitted for bus: ${deviceID}`);
};

/**
 * Emit traffic update for a specific bus
 * @param {string} deviceID - Bus device ID
 * @param {string} trafficLevel - Traffic level
 */
export const emitTrafficUpdate = (deviceID, trafficLevel) => {
  if (!io) return;

  io.to(`bus:${deviceID}`).emit("traffic-update", {
    deviceID,
    trafficLevel,
    timestamp: new Date(),
  });

  console.log(`🚦 Traffic update emitted for bus: ${deviceID}`);
};

/**
 * Broadcast to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Data to broadcast
 */
export const broadcast = (event, data) => {
  if (!io) return;

  io.emit(event, {
    ...data,
    timestamp: new Date(),
  });

  console.log(`📢 Broadcast: ${event}`);
};

/**
 * Get connected clients count
 * @returns {number} Number of connected clients
 */
export const getConnectedClientsCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

/**
 * Get clients tracking a specific bus
 * @param {string} deviceID - Bus device ID
 * @returns {Promise<number>} Number of clients tracking the bus
 */
export const getBusTrackersCount = async (deviceID) => {
  if (!io) return 0;

  const room = io.sockets.adapter.rooms.get(`bus:${deviceID}`);
  return room ? room.size : 0;
};
