import notificationService, { NotificationTypes } from '../utils/notifications.js';
import { emitNotification } from '../utils/socket.js';
import Bus from '../models/Bus.model.js';
import Location from '../models/Location.model.js';

/**
 * Send delay alert when bus is running late
 */
export const sendDelayAlert = async (req, res) => {
  try {
    const { deviceID, delayMinutes, reason } = req.body;

    if (!deviceID || delayMinutes === undefined) {
      return res.status(400).json({
        success: false,
        message: "Device ID and delay minutes are required"
      });
    }

    // Get bus information
    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Send delay notification to all users tracking this bus
    notificationService.sendNotificationToBusTrackers(deviceID, {
      type: NotificationTypes.BUS_DELAYED,
      title: 'Bus Delayed',
      message: `Bus ${bus.name || deviceID} is delayed by ${delayMinutes} minutes. ${reason || ''}`,
      deviceID,
      busInfo: {
        name: bus.name,
        from: bus.from,
        to: bus.to
      },
      delayMinutes,
      reason
    });

    return res.status(200).json({
      success: true,
      message: "Delay alert sent successfully"
    });
  } catch (error) {
    console.error("Error sending delay alert:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Schedule arrival notification when bus is 5 minutes away
 */
export const scheduleArrivalNotification = async (req, res) => {
  try {
    const { deviceID, userId, etaMinutes } = req.body;

    if (!deviceID || !userId || etaMinutes === undefined) {
      return res.status(400).json({
        success: false,
        message: "Device ID, user ID, and ETA minutes are required"
      });
    }

    // Get bus information
    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Schedule arrival notification
    notificationService.scheduleArrivalNotification(deviceID, userId, etaMinutes, {
      name: bus.name,
      from: bus.from,
      to: bus.to
    });

    return res.status(200).json({
      success: true,
      message: "Arrival notification scheduled successfully"
    });
  } catch (error) {
    console.error("Error scheduling arrival notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Send route change notification
 */
export const sendRouteChangeNotification = async (req, res) => {
  try {
    const { deviceID, newRoute, affectedStops, reason } = req.body;

    if (!deviceID) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    // Get bus information
    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Send route change notification
    notificationService.sendRouteChangeNotification(deviceID, {
      busName: bus.name,
      newRoute,
      affectedStops,
      reason: reason || "Route has been modified due to unforeseen circumstances"
    });

    return res.status(200).json({
      success: true,
      message: "Route change notification sent successfully"
    });
  } catch (error) {
    console.error("Error sending route change notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Send maintenance alert to drivers
 */
export const sendMaintenanceAlert = async (req, res) => {
  try {
    const { deviceID, message, priority, details } = req.body;

    if (!deviceID || !message) {
      return res.status(400).json({
        success: false,
        message: "Device ID and message are required"
      });
    }

    // Send maintenance alert
    notificationService.sendMaintenanceAlert(deviceID, {
      message,
      priority: priority || "normal",
      details: details || ""
    });

    return res.status(200).json({
      success: true,
      message: "Maintenance alert sent successfully"
    });
  } catch (error) {
    console.error("Error sending maintenance alert:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Check and send delay alerts based on actual vs expected ETAs
 */
export const checkBusDelays = async (req, res) => {
  try {
    const { deviceID, expectedETA, actualETA } = req.body;

    if (!deviceID || expectedETA === undefined || actualETA === undefined) {
      return res.status(400).json({
        success: false,
        message: "Device ID, expected ETA, and actual ETA are required"
      });
    }

    // Get bus information
    const bus = await Bus.findOne({ deviceID });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Check and send delay alert if needed
    notificationService.checkAndSendDelayAlert(deviceID, {
      name: bus.name,
      from: bus.from,
      to: bus.to
    }, expectedETA, actualETA);

    return res.status(200).json({
      success: true,
      message: "Delay check completed"
    });
  } catch (error) {
    console.error("Error checking bus delays:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Get active notification timers count
 */
export const getActiveNotificationTimers = async (req, res) => {
  try {
    const count = notificationService.getActiveTimersCount();
    
    return res.status(200).json({
      success: true,
      count,
      message: `${count} active notification timers`
    });
  } catch (error) {
    console.error("Error getting active notification timers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Cancel scheduled notification
 */
export const cancelScheduledNotification = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Key is required"
      });
    }

    notificationService.cancelScheduledNotification(key);

    return res.status(200).json({
      success: true,
      message: "Scheduled notification cancelled"
    });
  } catch (error) {
    console.error("Error cancelling scheduled notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Cancel all scheduled notifications for a bus
 */
export const cancelAllScheduledNotifications = async (req, res) => {
  try {
    const { deviceID } = req.body;

    if (!deviceID) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    notificationService.cancelAllScheduledNotifications(deviceID);

    return res.status(200).json({
      success: true,
      message: "All scheduled notifications cancelled for bus"
    });
  } catch (error) {
    console.error("Error cancelling all scheduled notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Send general notification to specific user
 */
export const sendGeneralNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID, type, title, and message are required"
      });
    }

    // Send notification to specific user
    notificationService.sendNotification(userId, {
      type,
      title,
      message,
      data
    });

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully"
    });
  } catch (error) {
    console.error("Error sending general notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};