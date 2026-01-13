import notificationService from '../utils/notifications.js';
import Bus from '../models/Bus.model.js';
import Location from '../models/Location.model.js';
import { emitLocationUpdate, emitTrackingUpdate, emitETAUpdate } from '../utils/socket.js';

/**
 * Notification Integration Service
 * Handles integration between tracking data and notification system
 */
class NotificationIntegrationService {
  /**
   * Process location update and trigger appropriate notifications
   * @param {string} deviceID - Bus device ID
   * @param {Object} locationData - Location data
   */
  async processLocationUpdate(deviceID, locationData) {
    try {
      // Get bus information
      const busInfo = await Bus.findOne({ deviceID });
      const locationInfo = await Location.findOne({ deviceID });

      if (!busInfo || !locationInfo) {
        console.log(`Bus or location info not found for deviceID: ${deviceID}`);
        return;
      }

      // Calculate and process notifications
      await this.processArrivalNotifications(deviceID, busInfo, locationInfo);
      await this.processDelayNotifications(deviceID, busInfo, locationInfo);
      await this.processWeatherNotifications(deviceID, locationInfo);
      await this.processTrafficNotifications(deviceID, locationInfo);
    } catch (error) {
      console.error('Error in processLocationUpdate:', error);
    }
  }

  /**
   * Process arrival notifications when bus is approaching destination
   * @param {string} deviceID - Bus device ID
   * @param {Object} busInfo - Bus information
   * @param {Object} locationInfo - Location information
   */
  async processArrivalNotifications(deviceID, busInfo, locationInfo) {
    try {
      if (!locationInfo.route || locationInfo.route.length === 0) {
        return;
      }

      // Calculate ETA to destination
      const etaResult = await this.calculateETA(deviceID, locationInfo);
      
      if (etaResult && etaResult.etaMinutes !== undefined) {
        // Schedule arrival notification for all trackers
        notificationService.scheduleArrivalNotificationForAllTrackers(deviceID, etaResult.etaMinutes, {
          name: busInfo.name,
          from: busInfo.from,
          to: busInfo.to
        });
      }
    } catch (error) {
      console.error('Error processing arrival notifications:', error);
    }
  }

  /**
   * Process delay notifications when bus is running behind schedule
   * @param {string} deviceID - Bus device ID
   * @param {Object} busInfo - Bus information
   * @param {Object} locationInfo - Location information
   */
  async processDelayNotifications(deviceID, busInfo, locationInfo) {
    try {
      // Calculate expected vs actual ETA
      const expectedETA = busInfo.expectedArrival || null;
      const actualETA = await this.calculateETA(deviceID, locationInfo);
      
      if (expectedETA && actualETA && actualETA.etaMinutes) {
        // Compare expected and actual arrival times
        const expectedMinutes = this.dateToMinutes(expectedETA);
        const actualMinutes = this.dateToMinutes(new Date(Date.now() + actualETA.etaMinutes * 60000));
        
        const delayMinutes = actualMinutes - expectedMinutes;
        
        if (delayMinutes > 5) { // Alert if delayed by more than 5 minutes
          notificationService.checkAndSendDelayAlert(deviceID, {
            name: busInfo.name,
            from: busInfo.from,
            to: busInfo.to
          }, expectedMinutes, actualMinutes);
        }
      }
    } catch (error) {
      console.error('Error processing delay notifications:', error);
    }
  }

  /**
   * Process weather notifications based on route conditions
   * @param {string} deviceID - Bus device ID
   * @param {Object} locationInfo - Location information
   */
  async processWeatherNotifications(deviceID, locationInfo) {
    try {
      if (!locationInfo.route || locationInfo.route.length === 0) {
        return;
      }

      // Convert route to coordinates array
      const routeCoordinates = locationInfo.route.map(point => ({
        lat: point.coordinates[0],
        lon: point.coordinates[1]
      }));

      // Check weather along the route
      await notificationService.checkWeatherAlongRoute(deviceID, routeCoordinates);
    } catch (error) {
      console.error('Error processing weather notifications:', error);
    }
  }

  /**
   * Process traffic notifications
   * @param {string} deviceID - Bus device ID
   * @param {Object} locationInfo - Location information
   */
  async processTrafficNotifications(deviceID, locationInfo) {
    try {
      if (locationInfo.realTimeData && locationInfo.realTimeData.trafficLevel) {
        notificationService.sendTrafficAlert(deviceID, {
          level: locationInfo.realTimeData.trafficLevel,
          description: `Traffic level: ${locationInfo.realTimeData.trafficLevel}. Expect delays.`,
          expectedDelay: this.getExpectedDelayFromTrafficLevel(locationInfo.realTimeData.trafficLevel)
        });
      }
    } catch (error) {
      console.error('Error processing traffic notifications:', error);
    }
  }

  /**
   * Calculate ETA to destination
   * @param {string} deviceID - Bus device ID
   * @param {Object} locationInfo - Location information
   * @returns {Object} ETA calculation result
   */
  async calculateETA(deviceID, locationInfo) {
    try {
      if (!locationInfo.route || locationInfo.route.length === 0) {
        return null;
      }

      const currentLat = locationInfo.location.coordinates[0];
      const currentLng = locationInfo.location.coordinates[1];

      // Get destination (last point in route)
      const lastRoutePoint = locationInfo.route[locationInfo.route.length - 1];
      if (!lastRoutePoint || !lastRoutePoint.coordinates) {
        return null;
      }

      const destLat = lastRoutePoint.coordinates[0];
      const destLng = lastRoutePoint.coordinates[1];

      // Calculate distance to destination
      const distanceToDestination = this.calculateDistance(
        currentLat, currentLng, destLat, destLng
      );

      // Calculate ETA based on current speed
      let etaMinutes = 0;
      if (locationInfo.realTimeData && locationInfo.realTimeData.speed > 0) {
        etaMinutes = (distanceToDestination / 1000) / locationInfo.realTimeData.speed * 60;
      }

      return {
        distance: distanceToDestination,
        etaMinutes: Math.max(0, etaMinutes), // Ensure non-negative
        destination: { lat: destLat, lng: destLng }
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Convert date to minutes from midnight
   * @param {Date} date - Date object
   * @returns {number} Minutes from midnight
   */
  dateToMinutes(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  /**
   * Get expected delay based on traffic level
   * @param {string} trafficLevel - Traffic level (light, moderate, heavy, severe)
   * @returns {number} Expected delay in minutes
   */
  getExpectedDelayFromTrafficLevel(trafficLevel) {
    const delayMap = {
      light: 2,
      moderate: 5,
      heavy: 10,
      severe: 20
    };
    return delayMap[trafficLevel] || 5; // Default to 5 minutes
  }

  /**
   * Process route change notification
   * @param {string} deviceID - Bus device ID
   * @param {Object} oldRoute - Old route
   * @param {Object} newRoute - New route
   */
  async processRouteChangeNotification(deviceID, oldRoute, newRoute) {
    try {
      const busInfo = await Bus.findOne({ deviceID });
      
      // Calculate which stops are affected
      const affectedStops = this.compareRoutes(oldRoute, newRoute);
      
      notificationService.sendRouteChangeNotification(deviceID, {
        busName: busInfo?.name || deviceID,
        oldRoute,
        newRoute,
        affectedStops,
        reason: "Route adjusted due to traffic or operational requirements"
      });
    } catch (error) {
      console.error('Error processing route change notification:', error);
    }
  }

  /**
   * Compare two routes and find affected stops
   * @param {Array} oldRoute - Old route coordinates
   * @param {Array} newRoute - New route coordinates
   * @returns {Array} Affected stops
   */
  compareRoutes(oldRoute, newRoute) {
    // Simple comparison - in reality, you'd have more complex logic
    const oldCoords = oldRoute.map(point => `${point.coordinates[0]},${point.coordinates[1]}`);
    const newCoords = newRoute.map(point => `${point.coordinates[0]},${point.coordinates[1]}`);
    
    const removedStops = oldCoords.filter(coord => !newCoords.includes(coord));
    const newStops = newCoords.filter(coord => !oldCoords.includes(coord));
    
    return {
      removed: removedStops,
      added: newStops,
      totalAffected: removedStops.length + newStops.length
    };
  }

  /**
   * Process maintenance alert for drivers
   * @param {string} deviceID - Bus device ID
   * @param {Object} maintenanceInfo - Maintenance information
   */
  async processMaintenanceAlert(deviceID, maintenanceInfo) {
    try {
      notificationService.sendMaintenanceAlert(deviceID, maintenanceInfo);
    } catch (error) {
      console.error('Error processing maintenance alert:', error);
    }
  }
}

// Create singleton instance
const notificationIntegrationService = new NotificationIntegrationService();

export default notificationIntegrationService;