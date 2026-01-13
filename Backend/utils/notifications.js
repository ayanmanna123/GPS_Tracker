import { emitNotification, getIO, emitDriverNotification } from './socket.js';
import axios from 'axios';

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Notification Types Enum
 */
export const NotificationTypes = {
  BUS_ARRIVAL: 'bus_arrival',
  BUS_DELAYED: 'bus_delayed',
  ROUTE_CHANGE: 'route_change',
  WEATHER_ALERT: 'weather_alert',
  MAINTENANCE_ALERT: 'maintenance_alert',
  TRAFFIC_ALERT: 'traffic_alert',
  EMERGENCY: 'emergency',
  SYSTEM: 'system'
};

/**
 * Notification Service Class
 */
class NotificationService {
  constructor() {
    this.activeTimers = new Map(); // Store active timers for arrival notifications
    this.activeSubscriptions = new Map(); // Store active notification subscriptions
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID to send notification to
   * @param {Object} notification - Notification object
   */
  sendNotification(userId, notification) {
    emitNotification(userId, {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * Send notification to all users tracking a specific bus
   * @param {string} deviceID - Bus device ID
   * @param {Object} notification - Notification object
   */
  sendNotificationToBusTrackers(deviceID, notification) {
    const io = getIO();
    if (!io) return;

    io.to(`bus:${deviceID}`).emit('notification', {
      ...notification,
      deviceID,
      timestamp: new Date()
    });

    console.log(`🔔 Notification sent to all trackers of bus: ${deviceID}`);
  }

  /**
   * Schedule arrival notification when bus is 5 minutes away
   * @param {string} deviceID - Bus device ID
   * @param {string} userId - User ID to notify
   * @param {number} etaMinutes - ETA in minutes
   * @param {Object} busInfo - Bus information
   */
  scheduleArrivalNotification(deviceID, userId, etaMinutes, busInfo) {
    if (etaMinutes <= 0) return;

    // Clear any existing timer for this device/user combination
    const timerKey = `${deviceID}-${userId}`;
    if (this.activeTimers.has(timerKey)) {
      clearTimeout(this.activeTimers.get(timerKey));
      this.activeTimers.delete(timerKey);
    }

    // Calculate when to trigger the 5-minute warning
    const warningTime = Math.max(0, (etaMinutes - 5)) * 60 * 1000; // Convert to milliseconds
    
    if (warningTime === 0) {
      // If bus is already within 5 minutes, send immediate notification
      this.sendNotification(userId, {
        type: NotificationTypes.BUS_ARRIVAL,
        title: 'Bus Arriving Soon!',
        message: `Your bus ${busInfo.name || deviceID} will arrive in less than 5 minutes!`,
        deviceID,
        busInfo,
        etaMinutes: Math.max(0, etaMinutes)
      });
      return;
    }

    const timer = setTimeout(() => {
      this.sendNotification(userId, {
        type: NotificationTypes.BUS_ARRIVAL,
        title: 'Bus Arriving Soon!',
        message: `Your bus ${busInfo.name || deviceID} will arrive in approximately 5 minutes!`,
        deviceID,
        busInfo,
        etaMinutes: 5
      });
      
      // Remove timer from active timers
      this.activeTimers.delete(timerKey);
    }, warningTime);

    // Store timer reference
    this.activeTimers.set(timerKey, timer);
    
    console.log(`⏰ Scheduled arrival notification for bus ${deviceID} and user ${userId} in ${warningTime}ms`);
  }

  /**
   * Schedule arrival notification for all users tracking a bus
   * @param {string} deviceID - Bus device ID
   * @param {number} etaMinutes - ETA in minutes
   * @param {Object} busInfo - Bus information
   */
  async scheduleArrivalNotificationForAllTrackers(deviceID, etaMinutes, busInfo) {
    if (etaMinutes <= 0) return;

    const io = getIO();
    if (!io) return;

    // Get all sockets tracking this bus
    const room = io.sockets.adapter.rooms.get(`bus:${deviceID}`);
    if (!room) return;

    // Calculate when to trigger the 5-minute warning
    const warningTime = Math.max(0, (etaMinutes - 5)) * 60 * 1000; // Convert to milliseconds
    
    if (warningTime === 0) {
      // If bus is already within 5 minutes, send immediate notification
      this.sendNotificationToBusTrackers(deviceID, {
        type: NotificationTypes.BUS_ARRIVAL,
        title: 'Bus Arriving Soon!',
        message: `Bus ${busInfo.name || deviceID} will arrive in less than 5 minutes!`,
        deviceID,
        busInfo,
        etaMinutes: Math.max(0, etaMinutes)
      });
      return;
    }

    const timer = setTimeout(() => {
      this.sendNotificationToBusTrackers(deviceID, {
        type: NotificationTypes.BUS_ARRIVAL,
        title: 'Bus Arriving Soon!',
        message: `Bus ${busInfo.name || deviceID} will arrive in approximately 5 minutes!`,
        deviceID,
        busInfo,
        etaMinutes: 5
      });
    }, warningTime);

    // Store timer reference with deviceID key
    const timerKey = `arrival-${deviceID}`;
    if (this.activeTimers.has(timerKey)) {
      clearTimeout(this.activeTimers.get(timerKey));
    }
    this.activeTimers.set(timerKey, timer);
    
    console.log(`⏰ Scheduled arrival notification for all trackers of bus ${deviceID} in ${warningTime}ms`);
  }

  /**
   * Check if bus is delayed and send delay alert
   * @param {string} deviceID - Bus device ID
   * @param {Object} busInfo - Bus information
   * @param {number} expectedETA - Expected ETA in minutes
   * @param {number} actualETA - Actual ETA in minutes
   */
  checkAndSendDelayAlert(deviceID, busInfo, expectedETA, actualETA) {
    const delayThreshold = 5; // Alert if delayed by more than 5 minutes
    const delayInMinutes = actualETA - expectedETA;

    if (delayInMinutes > delayThreshold) {
      this.sendNotificationToBusTrackers(deviceID, {
        type: NotificationTypes.BUS_DELAYED,
        title: 'Bus Delayed',
        message: `Bus ${busInfo.name || deviceID} is delayed by ${Math.round(delayInMinutes)} minutes.`,
        deviceID,
        busInfo,
        delayInMinutes: Math.round(delayInMinutes),
        expectedETA,
        actualETA
      });
      
      console.log(`⏰ Delay alert sent for bus ${deviceID}, delayed by ${delayInMinutes} minutes`);
    }
  }

  /**
   * Send route change notification
   * @param {string} deviceID - Bus device ID
   * @param {Object} routeChangeInfo - Route change information
   */
  sendRouteChangeNotification(deviceID, routeChangeInfo) {
    this.sendNotificationToBusTrackers(deviceID, {
      type: NotificationTypes.ROUTE_CHANGE,
      title: 'Route Change Alert',
      message: `Bus ${routeChangeInfo.busName || deviceID} has changed its route. ${routeChangeInfo.reason || ''}`,
      deviceID,
      routeChangeInfo,
      affectedStops: routeChangeInfo.affectedStops || []
    });
    
    console.log(`🛣️ Route change notification sent for bus ${deviceID}`);
  }

  /**
   * Send weather alert notification
   * @param {string} deviceID - Bus device ID
   * @param {Object} weatherInfo - Weather information
   */
  async sendWeatherAlert(deviceID, weatherInfo) {
    this.sendNotificationToBusTrackers(deviceID, {
      type: NotificationTypes.WEATHER_ALERT,
      title: `Weather Alert: ${weatherInfo.condition}`,
      message: weatherInfo.description || `Severe weather conditions ahead: ${weatherInfo.condition}. Route may be affected.`,
      deviceID,
      weatherInfo,
      severity: weatherInfo.severity || 'moderate'
    });
    
    console.log(`⛈️ Weather alert sent for bus ${deviceID}: ${weatherInfo.condition}`);
  }

  /**
   * Send maintenance alert to drivers
   * @param {string} deviceID - Bus device ID
   * @param {Object} maintenanceInfo - Maintenance information
   */
  sendMaintenanceAlert(deviceID, maintenanceInfo) {
    // Send to driver notification room (assuming driver ID is tied to device ID)
    emitDriverNotification(deviceID, {
      type: NotificationTypes.MAINTENANCE_ALERT,
      title: 'Maintenance Required',
      message: maintenanceInfo.message || `Maintenance required for bus ${deviceID}. ${maintenanceInfo.details || ''}`,
      deviceID,
      maintenanceInfo,
      priority: maintenanceInfo.priority || 'normal'
    });

    console.log(`🔧 Maintenance alert sent for bus ${deviceID}`);
  }

  /**
   * Send traffic alert notification
   * @param {string} deviceID - Bus device ID
   * @param {Object} trafficInfo - Traffic information
   */
  sendTrafficAlert(deviceID, trafficInfo) {
    this.sendNotificationToBusTrackers(deviceID, {
      type: NotificationTypes.TRAFFIC_ALERT,
      title: `Traffic Alert: ${trafficInfo.level}`,
      message: trafficInfo.description || `Heavy traffic ahead on the route. Expect delays.`,
      deviceID,
      trafficInfo,
      expectedDelay: trafficInfo.expectedDelay || 0
    });
    
    console.log(`🚦 Traffic alert sent for bus ${deviceID}: ${trafficInfo.level}`);
  }

  /**
   * Cancel scheduled notification
   * @param {string} key - Timer key to cancel
   */
  cancelScheduledNotification(key) {
    if (this.activeTimers.has(key)) {
      clearTimeout(this.activeTimers.get(key));
      this.activeTimers.delete(key);
      console.log(`❌ Scheduled notification cancelled: ${key}`);
    }
  }

  /**
   * Cancel all scheduled notifications for a bus
   * @param {string} deviceID - Bus device ID
   */
  cancelAllScheduledNotifications(deviceID) {
    // Cancel arrival notification timer
    const arrivalTimerKey = `arrival-${deviceID}`;
    this.cancelScheduledNotification(arrivalTimerKey);

    // Cancel any other device-specific timers
    for (const [key, timer] of this.activeTimers) {
      if (key.startsWith(deviceID)) {
        clearTimeout(timer);
        this.activeTimers.delete(key);
      }
    }
  }

  /**
   * Get active timers count
   */
  getActiveTimersCount() {
    return this.activeTimers.size;
  }

  /**
   * Send weather alert notification
   * @param {string} deviceID - Bus device ID
   * @param {Object} weatherInfo - Weather information
   */
  async sendWeatherAlert(deviceID, weatherInfo) {
    this.sendNotificationToBusTrackers(deviceID, {
      type: NotificationTypes.WEATHER_ALERT,
      title: `Weather Alert: ${weatherInfo.condition}`,
      message: weatherInfo.description || `Severe weather conditions ahead: ${weatherInfo.condition}. Route may be affected.`,
      deviceID,
      weatherInfo,
      severity: weatherInfo.severity || 'moderate'
    });
    
    console.log(`⛈️ Weather alert sent for bus ${deviceID}: ${weatherInfo.condition}`);
  }

  /**
   * Fetch weather data for specific coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async getWeatherData(lat, lon) {
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].main,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        rainIntensity: response.data.rain ? response.data.rain['1h'] || 0 : 0,
        coordinates: { lat, lon }
      };
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      return null;
    }
  }

  /**
   * Check weather conditions along a route and send alerts if needed
   * @param {string} deviceID - Bus device ID
   * @param {Array} route - Array of route coordinates [{lat, lon}]
   */
  async checkWeatherAlongRoute(deviceID, route) {
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeatherMap API key not configured');
      return;
    }

    // Check weather at multiple points along the route
    const weatherCheckpoints = this.getRouteCheckpoints(route, 5); // Check every 5 points
    
    for (const checkpoint of weatherCheckpoints) {
      const weatherData = await this.getWeatherData(checkpoint.lat, checkpoint.lon);
      
      if (weatherData) {
        const shouldAlert = this.shouldSendWeatherAlert(weatherData);
        
        if (shouldAlert) {
          await this.sendWeatherAlert(deviceID, {
            condition: weatherData.condition,
            description: `Severe weather ahead: ${weatherData.description}. Temperature: ${weatherData.temperature}°C, Wind: ${weatherData.windSpeed} m/s`,
            severity: this.getWeatherSeverity(weatherData),
            location: checkpoint,
            weatherData
          });
        }
      }
    }
  }

  /**
   * Determine if weather conditions warrant an alert
   * @param {Object} weatherData - Weather data object
   * @returns {boolean} - Whether to send an alert
   */
  shouldSendWeatherAlert(weatherData) {
    // Define conditions that warrant alerts
    const severeConditions = [
      'Thunderstorm', 'Drizzle', 'Rain', 'Snow', 
      'Extreme', 'Atmosphere', 'Additional'
    ];
    
    // Check for severe weather conditions
    if (severeConditions.includes(weatherData.condition)) {
      return true;
    }
    
    // Check for heavy rain
    if (weatherData.rainIntensity > 5) { // More than 5mm/hour
      return true;
    }
    
    // Check for extreme temperatures
    if (weatherData.temperature > 40 || weatherData.temperature < -10) {
      return true;
    }
    
    // Check for strong winds
    if (weatherData.windSpeed > 10) { // More than 10 m/s
      return true;
    }
    
    return false;
  }

  /**
   * Determine weather severity level
   * @param {Object} weatherData - Weather data object
   * @returns {string} - Severity level
   */
  getWeatherSeverity(weatherData) {
    if (weatherData.condition === 'Thunderstorm') return 'high';
    if (weatherData.condition === 'Rain' && weatherData.rainIntensity > 10) return 'high';
    if (weatherData.condition === 'Snow' && weatherData.rainIntensity > 5) return 'high';
    if (weatherData.windSpeed > 15) return 'high';
    
    if (weatherData.condition === 'Rain' && weatherData.rainIntensity > 5) return 'moderate';
    if (weatherData.windSpeed > 10) return 'moderate';
    if (weatherData.temperature > 35 || weatherData.temperature < -5) return 'moderate';
    
    return 'low';
  }

  /**
   * Get checkpoints along a route for weather monitoring
   * @param {Array} route - Array of route coordinates
   * @param {number} interval - Interval between checkpoints
   * @returns {Array} - Selected checkpoints
   */
  getRouteCheckpoints(route, interval) {
    if (!route || route.length === 0) return [];
    
    const checkpoints = [];
    for (let i = 0; i < route.length; i += interval) {
      checkpoints.push(route[i]);
    }
    
    // Always include the last point
    if (route.length > 0) {
      const lastPoint = route[route.length - 1];
      if (!checkpoints.some(cp => cp.lat === lastPoint.lat && cp.lon === lastPoint.lon)) {
        checkpoints.push(lastPoint);
      }
    }
    
    return checkpoints;
  }

  /**
   * Clean up all timers (call on server shutdown)
   */
  cleanup() {
    for (const [key, timer] of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
    this.activeSubscriptions.clear();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export the service and types
export default notificationService;
export { NotificationService };
