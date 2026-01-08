// services/busSearchService.js - FIXED VERSION

// import { apiConnector } from "./apiConnector";

// export class BusSearchService {
//   constructor(baseURL = import.meta.env.VITE_BASE_URL) {
//     this.baseURL = baseURL;
//   }

//   /**
//    * Transform API response to consistent format
//    */
//   transformBusData(busData) {
//     if (!busData) return null;

//     return {
//       // Core identifiers
//       deviceID: busData.deviceID,
//       id: busData.deviceID,
//       deviceId: busData.deviceID,

//       // Basic info
//       name: busData.name || `Bus ${busData.deviceID}`,
//       busName: busData.busName || `Bus ${busData.deviceID}`,
//       status: busData.status || 'Active',

//       // Location data - FIXED coordinate handling
//       location: busData.location,
//       currentLocation: busData.currentLocation || 'Live tracking available',
//       // Handle GeoJSON format [lng, lat] properly
//       lat: busData.location?.coordinates?.[1] || busData.lat || busData.latitude,
//       lng: busData.location?.coordinates?.[0] || busData.lng || busData.longitude,
//       latitude: busData.location?.coordinates?.[1] || busData.latitude || busData.lat,
//       longitude: busData.location?.coordinates?.[0] || busData.longitude || busData.lng,

//       // Route data
//       route: busData.route || [],

//       // Time data
//       lastUpdated: busData.lastUpdated,
//       timestamp: busData.lastUpdated,
//       updatedAt: busData.lastUpdated,
//       startTime: busData.startTime || '06:00 AM',
//       expectedTime: busData.expectedTime || 'Calculating...',
//       destinationTime: busData.destinationTime || '08:00 PM',

//       // Driver data
//       driverName: busData.driverName || 'Driver Available',
//       driver: busData.driverName || 'Driver Available',
//       driverPhone: busData.driverPhone || 'Contact Support',

//       // Distance data (if available)
//       distanceFromSearch: busData.distanceFromSearch,
//       distanceFromStart: busData.distanceFromStart,
//       distanceFromEnd: busData.distanceFromEnd,
//       formattedDistance: busData.formattedDistance,

//       // Route match data (if available)
//       routeMatch: busData.routeMatch,
//       routeAnalysis: busData.routeAnalysis,

//       // Metadata
//       _id: busData._id,
//       __v: busData.__v
//     };
//   }

//   /**
//    * FIXED: Enhanced route search with proper endpoint usage
//    */
//   async findBusesByRoute(fromCoords, toCoords, options = {}) {
//     const { radius = 10000, maxResults = 50 } = options;

//     try {
//       console.log('Searching for buses along route:', {
//         from: fromCoords,
//         to: toCoords,
//         radius
//       });

//       // FIXED: Use the correct route search endpoint
//       const response = await apiConnector("GET", 
//         `${this.baseURL}/route/search?fromLat=${fromCoords.lat}&fromLon=${fromCoords.lon}&toLat=${toCoords.lat}&toLon=${toCoords.lon}&radius=${radius}`
//       );

//       if (!response || !response.data) {
//         throw new Error('No response data received');
//       }

//       const data = response.data;

//       if (!data.success) {
//         console.warn('API route search returned success: false', data);
//         return {
//           success: false,
//           error: data.message || 'Route search failed',
//           buses: []
//         };
//       }

//       const buses = data.buses || [];
//       console.log(`Route API returned ${buses.length} buses`);

//       const transformedBuses = buses.map(bus => this.transformBusData(bus));

//       return {
//         success: true,
//         buses: transformedBuses,
//         metadata: data.metadata || {
//           searchType: 'route',
//           fromCoords,
//           toCoords,
//           radius,
//           totalFound: transformedBuses.length
//         }
//       };
//     } catch (error) {
//       console.error('Error in findBusesByRoute:', error);
//       return {
//         success: false,
//         error: error.message,
//         buses: []
//       };
//     }
//   }

//   /**
//    * FIXED: Find nearby buses with better error handling
//    */
//   async findNearbyBuses(coords, radius = 10000) {
//     try {
//       const lat = coords.lat || coords.latitude;
//       const lng = coords.lng || coords.lon || coords.longitude;

//       if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
//         throw new Error('Invalid coordinates provided');
//       }

//       // Validate coordinate ranges
//       if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
//         throw new Error('Coordinates out of valid range');
//       }

//       console.log(`Searching for buses near: ${lat}, ${lng} within ${radius}m`);

//       const response = await apiConnector("GET",
//         `${this.baseURL}/get/search?lat=${lat}&lng=${lng}&radius=${radius}`
//       );

//       if (!response || !response.data) {
//         throw new Error('No response data received');
//       }

//       const data = response.data;

//       if (!data.success) {
//         console.warn('API search returned success: false', data);
//         return []; // Return empty array instead of throwing error
//       }

//       const buses = data.buses || [];
//       console.log(`Nearby API returned ${buses.length} buses`);

//       return buses.map(bus => this.transformBusData(bus));

//     } catch (error) {
//       console.error('Error finding nearby buses:', error);
//       return [];
//     }
//   }

//   /**
//    * Calculate distance between two points using Haversine formula
//    */
//   calculateDistance(lat1, lon1, lat2, lon2) {
//     if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     return R * c;
//   }

//   /**
//    * Format distance for display
//    */
//   formatDistance(meters) {
//     if (!meters || meters === Infinity) return 'Unknown';

//     if (meters < 1000) {
//       return `${Math.round(meters)}m`;
//     } else {
//       return `${(meters / 1000).toFixed(1)}km`;
//     }
//   }

//   /**
//    * Get bus details by device ID
//    */
//   async getBusById(deviceId) {
//     try {
//       if (!deviceId) {
//         throw new Error('Device ID is required');
//       }

//       const response = await apiConnector("GET",`${this.baseURL}/bus/${deviceId}`);
//       if (!response || !response.data) {
//         throw new Error(`HTTP error! status: ${response?.status || 'unknown'}`);
//       }
//       const data = response.data;

//       if (!data.success) {
//         throw new Error(data.message || 'Failed to fetch bus details');
//       }

//       // Handle different response formats
//       if (data.latestLocations) {
//         return this.transformBusData(data.latestLocations);
//       } else if (data.bus) {
//         return this.transformBusData(data.bus);
//       } else {
//         return this.transformBusData(data);
//       }
//     } catch (error) {
//       console.error('Error fetching bus by ID:', error);
//       throw error;
//     }
//   }

//   /**
//    * ADDED: Debug method to test coordinates
//    */
//   async debugCoordinates(lat, lng) {
//     console.log('Debug coordinates:', { lat, lng });
//     console.log('Lat type:', typeof lat, 'Lng type:', typeof lng);
//     console.log('Lat valid:', !isNaN(lat) && lat >= -90 && lat <= 90);
//     console.log('Lng valid:', !isNaN(lng) && lng >= -180 && lng <= 180);

//     // Test a simple nearby search
//     try {
//       const result = await this.findNearbyBuses({ lat, lng }, 5000);
//       console.log('Debug search result:', result.length, 'buses found');
//       return result;
//     } catch (error) {
//       console.error('Debug search error:', error);
//       return [];
//     }
//   }
// }

// // Create singleton instance
// export const busSearchService = new BusSearchService();


// services/busSearchService.js - FIXED VERSION
import { apiConnector } from "./apiConnector";

export class BusSearchService {
  constructor(baseURL = import.meta.env.VITE_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Transform API response to consistent format
   */
  transformBusData(busData) {
    if (!busData) return null;

    return {
      // Core identifiers
      deviceID: busData.deviceID,
      id: busData.deviceID,
      deviceId: busData.deviceID,

      // Basic info
      name: busData.name || `Bus ${busData.deviceID}`,
      busName: busData.busName || `Bus ${busData.deviceID}`,
      status: busData.status || 'Active',

      // FIXED: Better coordinate handling
      location: busData.location,
      currentLocation: busData.currentLocation || 'Live tracking available',
      // Handle GeoJSON format [lng, lat] properly
      lat: busData.location?.coordinates?.[1] || busData.lat || busData.latitude,
      lng: busData.location?.coordinates?.[0] || busData.lng || busData.longitude,
      latitude: busData.location?.coordinates?.[1] || busData.latitude || busData.lat,
      longitude: busData.location?.coordinates?.[0] || busData.longitude || busData.lng,

      // Route data
      route: busData.route || [],

      // Time data
      lastUpdated: busData.lastUpdated,
      timestamp: busData.lastUpdated,
      updatedAt: busData.lastUpdated,
      startTime: busData.startTime || '06:00 AM',
      expectedTime: busData.expectedTime || 'Calculating...',
      destinationTime: busData.destinationTime || '08:00 PM',

      // Driver data
      driverName: busData.driverName || 'Driver Available',
      driver: busData.driverName || 'Driver Available',
      driverPhone: busData.driverPhone || 'Contact Support',

      // Distance data (if available)
      distanceFromSearch: busData.distanceFromSearch,
      distanceFromStart: busData.distanceFromStart,
      distanceFromEnd: busData.distanceFromEnd,
      distanceToEnd: busData.distanceToEnd,
      formattedDistance: busData.formattedDistance,
      detourRatio: busData.detourRatio,

      // Route match data (if available)
      routeMatch: busData.routeMatch,
      routeAnalysis: busData.routeAnalysis,

      // Metadata
      _id: busData._id,
      __v: busData.__v
    };
  }

  /**
   * FIXED: Enhanced route search with better error handling and debugging
   */
  async findBusesByRoute(fromCoords, toCoords, options = {}) {
    const { radius = 15000 } = options; // Increased default radius

    try {
      console.log('🔍 Route Search Parameters:', {
        from: fromCoords,
        to: toCoords,
        radius,
        baseURL: this.baseURL
      });

      // FIXED: Validate coordinates before making API call
      if (!fromCoords?.lat || !fromCoords?.lon || !toCoords?.lat || !toCoords?.lon) {
        throw new Error('Invalid coordinates: missing lat/lon values');
      }

      if (isNaN(fromCoords.lat) || isNaN(fromCoords.lon) || isNaN(toCoords.lat) || isNaN(toCoords.lon)) {
        throw new Error('Invalid coordinates: coordinates are not numbers');
      }

      // FIXED: Use correct parameter names (fromLon, toLon)
      const apiUrl = `${this.baseURL}/route/search?fromLat=${fromCoords.lat}&fromLon=${fromCoords.lon}&toLat=${toCoords.lat}&toLon=${toCoords.lon}&radius=${radius}`;

      console.log('🌐 API URL:', apiUrl);

      const response = await apiConnector("GET", apiUrl);

      console.log('📡 API Response:', {
        status: response?.status,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : 'No data'
      });

      if (!response || !response.data) {
        console.error('❌ No response data received');
        throw new Error('No response data received from route search API');
      }

      const data = response.data;
      console.log('📊 Response Data:', {
        success: data.success,
        busCount: data.buses?.length || 0,
        metadata: data.metadata,
        hasDebug: !!data.debug
      });

      if (!data.success) {
        console.warn('⚠️  API route search returned success: false', {
          message: data.message,
          error: data.error
        });
        return {
          success: false,
          error: data.message || data.error || 'Route search failed - no specific error message',
          buses: []
        };
      }

      const buses = data.buses || [];
      console.log(`✅ Route API returned ${buses.length} buses`);

      // Log first few buses for debugging
      if (buses.length > 0) {
        console.log('🚌 Sample buses from API:',
          buses.slice(0, 2).map(bus => ({
            deviceID: bus.deviceID,
            coordinates: bus.location?.coordinates,
            distanceFromStart: bus.distanceFromStart,
            distanceToEnd: bus.distanceToEnd,
            routeScore: bus.routeRelevanceScore
          }))
        );
      }

      const transformedBuses = buses.map(bus => this.transformBusData(bus));

      console.log(`🔄 Transformed ${transformedBuses.length} buses`);

      return {
        success: true,
        buses: transformedBuses,
        metadata: data.metadata || {
          searchType: 'route',
          fromCoords,
          toCoords,
          radius,
          totalFound: transformedBuses.length,
          searchTime: new Date().toISOString()
        },
        debug: data.debug
      };
    } catch (error) {
      console.error('❌ Error in findBusesByRoute:', {
        message: error.message,
        stack: error.stack,
        searchParams: { fromCoords, toCoords, radius }
      });
      return {
        success: false,
        error: `Route search failed: ${error.message}`,
        buses: [],
        debug: {
          searchParams: { fromCoords, toCoords, radius },
          errorType: error.name,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * FIXED: Find nearby buses with better error handling
   */
  async findNearbyBuses(coords, radius = 10000) {
    try {
      const lat = coords.lat || coords.latitude;
      const lng = coords.lng || coords.lon || coords.longitude;

      console.log('🔍 Nearby Search Parameters:', { lat, lng, radius });

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new Error(`Invalid coordinates provided: lat=${lat}, lng=${lng}`);
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error(`Coordinates out of valid range: lat=${lat} (must be -90 to 90), lng=${lng} (must be -180 to 180)`);
      }

      const apiUrl = `${this.baseURL}/get/search?lat=${lat}&lng=${lng}&radius=${radius}`;
      console.log('🌐 Nearby API URL:', apiUrl);

      const response = await apiConnector("GET", apiUrl);

      if (!response || !response.data) {
        throw new Error('No response data received from nearby search API');
      }

      const data = response.data;
      console.log('📡 Nearby API Response:', {
        success: data.success,
        busCount: data.buses?.length || 0
      });

      if (!data.success) {
        console.warn('⚠️  Nearby search returned success: false', data);
        return []; // Return empty array instead of throwing error
      }

      const buses = data.buses || [];
      console.log(`✅ Nearby API returned ${buses.length} buses`);

      return buses.map(bus => this.transformBusData(bus));

    } catch (error) {
      console.error('❌ Error finding nearby buses:', {
        message: error.message,
        coords,
        radius
      });
      return [];
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters) {
    if (!meters || meters === Infinity) return 'Unknown';

    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Get bus details by device ID
   */
  async getBusById(deviceId) {
    try {
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      const response = await apiConnector("GET", `${this.baseURL}/bus/${deviceId}`);
      if (!response || !response.data) {
        throw new Error(`HTTP error! status: ${response?.status || 'unknown'}`);
      }
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch bus details');
      }

      // Handle different response formats
      if (data.latestLocations) {
        return this.transformBusData(data.latestLocations);
      } else if (data.bus) {
        return this.transformBusData(data.bus);
      } else {
        return this.transformBusData(data);
      }
    } catch (error) {
      console.error('❌ Error fetching bus by ID:', error);
      throw error;
    }
  }

  /**
   * Debug method to test endpoints
   */
  async debugEndpoints() {
    try {
      console.log('🧪 Testing API endpoints...');

      // Test base connectivity
      const healthCheck = await fetch(`${this.baseURL}/`);
      console.log('🏥 Health check:', healthCheck.status);

      // Test search endpoints with sample data
      const testCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates

      const nearbyTest = await this.findNearbyBuses(testCoords, 5000);
      console.log('🧪 Nearby test result:', nearbyTest.length, 'buses');

      const routeTest = await this.findBusesByRoute(
        testCoords,
        { lat: 28.7041, lng: 77.1025 }, // Another Delhi location
        { radius: 5000 }
      );
      console.log('🧪 Route test result:', routeTest.buses?.length || 0, 'buses');

      return {
        baseURL: this.baseURL,
        healthCheck: healthCheck.status,
        nearbySearch: nearbyTest.length,
        routeSearch: routeTest.buses?.length || 0
      };
    } catch (error) {
      console.error('🧪 Debug endpoints error:', error);
      return { error: error.message };
    }
  }
}

// Create singleton instance
export const busSearchService = new BusSearchService();