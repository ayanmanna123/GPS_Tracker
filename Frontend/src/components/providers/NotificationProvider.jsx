import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import websocketService from "../../services/websocketService";
import { toast } from "sonner";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Navigation2,
  Users,
  Clock,
} from "lucide-react";

/**
 * NotificationProvider - Manages WebSocket notifications for the entire app
 * Place this in App.jsx or a high-level component
 */
const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Subscribe to notifications for this user
    websocketService.subscribeNotifications(user.sub);

    // Listen for notifications
    const cleanup = websocketService.onNotification((notification) => {
      console.log("🔔 Notification received:", notification);

      // Add to notification list
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50

      // Show toast notification
      showNotificationToast(notification);
    });

    return () => {
      if (user?.sub) {
        websocketService.unsubscribeNotifications(user.sub);
      }
      cleanup();
    };
  }, [isAuthenticated, user]);

  const showNotificationToast = (notification) => {
    const { type, title, message, deviceID, data } = notification;

    const icon = getNotificationIcon(type);
    const toastOptions = {
      duration: 5000,
      icon: icon,
    };

    switch (type) {
      case "bus_arrival":
        toast.success(`🚌 ${title || "Bus Arriving"}`, {
          description: message || `Bus ${deviceID} is arriving soon!`,
          ...toastOptions,
        });
        break;

      case "seat_available":
        toast.info(`💺 ${title || "Seats Available"}`, {
          description: message || `Seats now available on bus ${deviceID}`,
          ...toastOptions,
        });
        break;

      case "traffic_alert":
        toast.warning(`🚦 ${title || "Traffic Alert"}`, {
          description: message || `Heavy traffic detected on route`,
          ...toastOptions,
        });
        break;

      case "eta_update":
        toast.info(`⏱️ ${title || "ETA Updated"}`, {
          description: message || `New estimated arrival time`,
          ...toastOptions,
        });
        break;

      case "bus_delayed":
        toast.warning(`⏰ ${title || "Bus Delayed"}`, {
          description: message || `Your bus is running late`,
          ...toastOptions,
        });
        break;

      case "emergency":
        toast.error(`🚨 ${title || "Emergency Alert"}`, {
          description: message || "Emergency notification",
          ...toastOptions,
        });
        break;

      default:
        toast(`${title || "Notification"}`, {
          description: message,
          ...toastOptions,
        });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "bus_arrival":
        return <Navigation2 className="w-5 h-5 text-blue-500" />;
      case "seat_available":
        return <Users className="w-5 h-5 text-green-500" />;
      case "traffic_alert":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "eta_update":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "bus_delayed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "emergency":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return <>{children}</>;
};

export default NotificationProvider;

/**
 * Helper function to send custom notifications from anywhere in the app
 * @param {Object} notification - Notification object
 * @param {string} notification.type - Notification type
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {Object} notification.data - Additional data
 */
export const showCustomNotification = (notification) => {
  const { type = "info", title, message, ...rest } = notification;

  switch (type) {
    case "success":
      toast.success(title, {
        description: message,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
      break;

    case "error":
      toast.error(title, {
        description: message,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
      break;

    case "warning":
      toast.warning(title, {
        description: message,
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      });
      break;

    default:
      toast(title, {
        description: message,
        icon: <Info className="w-5 h-5 text-blue-500" />,
      });
  }
};

/**
 * Notification types enum for reference
 */
export const NotificationTypes = {
  BUS_ARRIVAL: "bus_arrival",
  SEAT_AVAILABLE: "seat_available",
  TRAFFIC_ALERT: "traffic_alert",
  ETA_UPDATE: "eta_update",
  BUS_DELAYED: "bus_delayed",
  EMERGENCY: "emergency",
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Example backend usage (for reference):
 * 
 * import { emitNotification } from '../utils/socket.js';
 * 
 * // When bus is arriving
 * emitNotification(userId, {
 *   type: 'bus_arrival',
 *   title: 'Bus Arriving Soon',
 *   message: `Your bus ${deviceID} will arrive in 5 minutes`,
 *   deviceID: deviceID,
 *   data: { eta: 5, location: coordinates }
 * });
 * 
 * // When seats become available
 * emitNotification(userId, {
 *   type: 'seat_available',
 *   title: 'Seats Now Available',
 *   message: `${availableSeats} seats available on bus ${deviceID}`,
 *   deviceID: deviceID,
 *   data: { availableSeats }
 * });
 * 
 * // Traffic alert
 * emitNotification(userId, {
 *   type: 'traffic_alert',
 *   title: 'Heavy Traffic Ahead',
 *   message: 'Severe traffic on your route. Expect delays.',
 *   data: { trafficLevel: 'severe' }
 * });
 */
