import { io } from "socket.io-client";
import { toast } from "sonner";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   * @returns {Promise} Connection promise
   */
  connect() {
    if (this.socket?.connected) {
      console.log("✅ WebSocket already connected");
      return Promise.resolve();
    }

    const serverURL = import.meta.env.VITE_BASE_URL?.replace(/\/api\/v1$/, "") || 
                     "http://localhost:5000";

    console.log(`🔌 Connecting to WebSocket server: ${serverURL}`);

    this.socket = io(serverURL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
    });

    return new Promise((resolve, reject) => {
      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected:", this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        toast.success("Connected to live tracking");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        this.isConnected = false;
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          toast.error("Failed to connect to server");
          reject(error);
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket disconnected:", reason);
        this.isConnected = false;

        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          this.socket.connect();
        }
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        toast.success("Reconnected to live tracking");
      });

      this.socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ WebSocket reconnection failed");
        toast.error("Unable to reconnect. Please refresh the page.");
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting WebSocket");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Track a specific bus
   * @param {string} deviceID - Bus device ID
   */
  trackBus(deviceID) {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket not connected");
      return;
    }

    console.log(`📍 Tracking bus: ${deviceID}`);
    this.socket.emit("track-bus", deviceID);
  }

  /**
   * Update location for a specific bus (Driver only)
   * @param {string} deviceID - Bus device ID
   * @param {number} latitude - Current latitude
   * @param {number} longitude - Current longitude
   * @param {number} speed - Current speed (optional)
   * @param {number} direction - Current direction (optional)
   */
  updateLocation(deviceID, latitude, longitude, speed, direction) {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket not connected, cannot update location");
      return;
    }

    this.socket.emit("update-location", {
      deviceID,
      latitude,
      longitude,
      speed,
      direction,
    });
  }

  /**
   * Stop tracking a specific bus
   * @param {string} deviceID - Bus device ID
   */
  stopTrackingBus(deviceID) {
    if (!this.socket?.connected) return;

    console.log(`🛑 Stopped tracking bus: ${deviceID}`);
    this.socket.emit("stop-tracking-bus", deviceID);
  }

  /**
   * Track multiple buses
   * @param {string[]} deviceIDs - Array of bus device IDs
   */
  trackMultipleBuses(deviceIDs) {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket not connected");
      return;
    }

    console.log(`📍 Tracking ${deviceIDs.length} buses`);
    this.socket.emit("track-multiple-buses", deviceIDs);
  }

  /**
   * Stop tracking multiple buses
   * @param {string[]} deviceIDs - Array of bus device IDs
   */
  stopTrackingMultipleBuses(deviceIDs) {
    if (!this.socket?.connected) return;

    console.log(`🛑 Stopped tracking ${deviceIDs.length} buses`);
    this.socket.emit("stop-tracking-multiple-buses", deviceIDs);
  }

  /**
   * Subscribe to notifications
   * @param {string} userId - User ID
   */
  subscribeNotifications(userId) {
    if (!this.socket?.connected) return;

    console.log(`🔔 Subscribed to notifications: ${userId}`);
    this.socket.emit("subscribe-notifications", userId);
  }

  /**
   * Unsubscribe from notifications
   * @param {string} userId - User ID
   */
  unsubscribeNotifications(userId) {
    if (!this.socket?.connected) return;

    console.log(`🔕 Unsubscribed from notifications: ${userId}`);
    this.socket.emit("unsubscribe-notifications", userId);
  }

  /**
   * Listen to location updates
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onLocationUpdate(callback) {
    if (!this.socket) return () => {};

    this.socket.on("location-update", callback);
    this.listeners.set("location-update", callback);

    return () => {
      this.socket?.off("location-update", callback);
      this.listeners.delete("location-update");
    };
  }

  /**
   * Listen to tracking updates
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onTrackingUpdate(callback) {
    if (!this.socket) return () => {};

    this.socket.on("tracking-update", callback);
    this.listeners.set("tracking-update", callback);

    return () => {
      this.socket?.off("tracking-update", callback);
      this.listeners.delete("tracking-update");
    };
  }

  /**
   * Listen to passenger updates
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onPassengerUpdate(callback) {
    if (!this.socket) return () => {};

    this.socket.on("passenger-update", callback);
    this.listeners.set("passenger-update", callback);

    return () => {
      this.socket?.off("passenger-update", callback);
      this.listeners.delete("passenger-update");
    };
  }

  /**
   * Listen to ETA updates
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onETAUpdate(callback) {
    if (!this.socket) return () => {};

    this.socket.on("eta-update", callback);
    this.listeners.set("eta-update", callback);

    return () => {
      this.socket?.off("eta-update", callback);
      this.listeners.delete("eta-update");
    };
  }

  /**
   * Listen to traffic updates
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onTrafficUpdate(callback) {
    if (!this.socket) return () => {};

    this.socket.on("traffic-update", callback);
    this.listeners.set("traffic-update", callback);

    return () => {
      this.socket?.off("traffic-update", callback);
      this.listeners.delete("traffic-update");
    };
  }

  /**
   * Listen to notifications
   * @param {function} callback - Callback function
   * @returns {function} Cleanup function
   */
  onNotification(callback) {
    if (!this.socket) return () => {};

    this.socket.on("notification", callback);
    this.listeners.set("notification", callback);

    return () => {
      this.socket?.off("notification", callback);
      this.listeners.delete("notification");
    };
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null} Socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// Named exports for convenience
export const {
  connect,
  disconnect,
  trackBus,
  stopTrackingBus,
  trackMultipleBuses,
  stopTrackingMultipleBuses,
  subscribeNotifications,
  unsubscribeNotifications,
  updateLocation,
  onLocationUpdate,
  onTrackingUpdate,
  onPassengerUpdate,
  onETAUpdate,
  onTrafficUpdate,
  onNotification,
  getConnectionStatus,
  getSocketId,
} = websocketService;
