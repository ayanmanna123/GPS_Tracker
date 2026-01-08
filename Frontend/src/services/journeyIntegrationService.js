// services/journeyIntegrationService.js
import { busSearchService } from './busSearchService';
import { journeyPlanningService } from './journeyPlanningService';

class JourneyIntegrationService {
  constructor() {
    this.searchTimeout = 30000; // 30 seconds timeout
  }

  /**
   * Enhanced search that tries direct buses first, then multi-leg journeys
   * @param {Object} from - Starting coordinates {lat, lon}
   * @param {Object} to - Destination coordinates {lat, lon}
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Combined search results
   */
  async searchWithFallback(from, to, options = {}) {
    const startTime = Date.now();
    let directResults = [];
    let journeyResults = null;
    let hasDirectRoutes = false;

    try {
      // Step 1: Try direct bus routes first
      console.log('🚌 Searching for direct buses...');
      const directSearch = await busSearchService.findBusesByRoute(from, to, {
        radius: options.radius || 1000,
        maxResults: options.maxResults || 20
      });

      if (directSearch.success && directSearch.buses && directSearch.buses.length > 0) {
        directResults = directSearch.buses;
        hasDirectRoutes = true;
        console.log(`✅ Found ${directResults.length} direct buses`);
      } else {
        console.log('❌ No direct buses found');
      }

      // Step 2: Always try multi-leg journey planning (parallel to direct search or as fallback)
      console.log('🔄 Planning multi-leg journeys...');
      const journeySearch = await journeyPlanningService.planJourney(from, to, {
        maxTransfers: options.maxTransfers || 2,
        maxWalkingDistance: options.maxWalkingDistance || 1000,
        maxTotalTime: options.maxTotalTime || 120,
        ...options
      });

      if (journeySearch.success && journeySearch.journeys.length > 0) {
        journeyResults = journeySearch;
        console.log(`✅ Found ${journeySearch.journeys.length} journey options`);
      } else {
        console.log('❌ No multi-leg journeys found');
      }

      // Step 3: Combine and return results
      return {
        success: true,
        hasDirectRoutes,
        directBuses: directResults,
        journeyOptions: journeyResults?.journeys || [],
        searchType: hasDirectRoutes ? 'mixed' : 'journey-only',
        metadata: {
          searchTime: Date.now() - startTime,
          directRoutesFound: directResults.length,
          journeyOptionsFound: journeyResults?.journeys?.length || 0,
          searchLocation: { from, to },
          timestamp: new Date().toISOString()
        },
        error: null
      };

    } catch (error) {
      console.error('Journey integration error:', error);
      return {
        success: false,
        hasDirectRoutes: false,
        directBuses: [],
        journeyOptions: [],
        searchType: 'error',
        metadata: {
          searchTime: Date.now() - startTime,
          error: error.message
        },
        error: error.message
      };
    }
  }

  /**
   * Search for buses near a single location (no journey planning needed)
   * @param {Object} coordinates - Location coordinates {lat, lon}
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Nearby bus results
   */
  async searchNearbyBuses(coordinates, options = {}) {
    try {
      console.log('📍 Searching for nearby buses...');
      const nearbyBuses = await busSearchService.findNearbyBuses(
        coordinates,
        options.radius || 1000
      );

      const busArray = Array.isArray(nearbyBuses) ? nearbyBuses : [];

      return {
        success: true,
        hasDirectRoutes: false,
        directBuses: busArray,
        journeyOptions: [],
        searchType: 'nearby',
        metadata: {
          searchLocation: coordinates,
          radius: options.radius || 1000,
          totalFound: busArray.length,
          timestamp: new Date().toISOString()
        },
        error: null
      };

    } catch (error) {
      console.error('Nearby search error:', error);
      return {
        success: false,
        hasDirectRoutes: false,
        directBuses: [],
        journeyOptions: [],
        searchType: 'error',
        metadata: { error: error.message },
        error: error.message
      };
    }
  }

  /**
   * Search for a specific bus by ID
   * @param {string} deviceID - Bus device ID
   * @returns {Promise<Object>} Bus search results
   */
  async searchBusById(deviceID) {
    try {
      console.log(`🔍 Searching for bus: ${deviceID}`);
      const { getBusLocationByDeviceId } = await import('../operations/busAPI');
      const busData = await getBusLocationByDeviceId(deviceID.trim());

      if (busData && busData !== null) {
        const busArray = Array.isArray(busData) ? busData : [busData];

        return {
          success: true,
          hasDirectRoutes: false,
          directBuses: busArray,
          journeyOptions: [],
          searchType: 'bus-id',
          metadata: {
            deviceId: deviceID.trim(),
            totalFound: busArray.length,
            timestamp: new Date().toISOString()
          },
          error: null
        };
      } else {
        return {
          success: false,
          hasDirectRoutes: false,
          directBuses: [],
          journeyOptions: [],
          searchType: 'bus-id',
          metadata: { deviceId: deviceID.trim() },
          error: `Bus with ID "${deviceID}" not found`
        };
      }

    } catch (error) {
      console.error('Bus ID search error:', error);
      return {
        success: false,
        hasDirectRoutes: false,
        directBuses: [],
        journeyOptions: [],
        searchType: 'bus-id',
        metadata: { deviceId: deviceID.trim(), error: error.message },
        error: error.response?.status === 404
          ? `Bus with ID "${deviceID}" not found`
          : 'Error searching for bus. Please check the bus ID and try again.'
      };
    }
  }

  /**
   * Get comprehensive search suggestions based on results
   * @param {Object} results - Search results from searchWithFallback
   * @returns {Object} Search suggestions and tips
   */
  getSuggestions(results) {
    const suggestions = {
      tips: [],
      alternatives: [],
      improvements: []
    };

    if (!results.success) {
      suggestions.tips.push('Check your internet connection and try again');
      suggestions.tips.push('Verify that the locations are accessible by public transport');
      return suggestions;
    }

    // No results at all
    if (results.directBuses.length === 0 && results.journeyOptions.length === 0) {
      suggestions.tips.push('Try searching with nearby landmarks or major roads');
      suggestions.tips.push('Consider expanding your search radius');
      suggestions.tips.push('Check if buses operate during current hours');
      suggestions.alternatives.push('Try searching for buses near your starting point');
      suggestions.alternatives.push('Look for buses near your destination and plan backwards');
    }

    // Only journey options available
    if (results.directBuses.length === 0 && results.journeyOptions.length > 0) {
      suggestions.tips.push('No direct buses available, but we found connected routes');
      suggestions.tips.push('Multi-leg journeys may take longer but can get you there');
      suggestions.improvements.push('Consider departure time to minimize waiting');
    }

    // Both direct and journey options
    if (results.directBuses.length > 0 && results.journeyOptions.length > 0) {
      suggestions.alternatives.push('Compare direct routes with multi-leg options for best timing');
      suggestions.tips.push('Direct routes may be faster but less frequent');
    }

    // Many journey options
    if (results.journeyOptions.length > 3) {
      suggestions.tips.push('Multiple route combinations available - choose based on time preference');
      suggestions.improvements.push('Consider walking distance and transfer times');
    }

    return suggestions;
  }

  /**
   * Format combined results for display components
   * @param {Object} results - Results from searchWithFallback
   * @returns {Object} Formatted results for components
   */
  formatResultsForDisplay(results) {
    return {
      // For existing BusSearchResults component
      busResults: {
        searchResults: results.directBuses || [],
        isLoading: false,
        error: results.error,
        searchType: 'route',
        searchMetadata: results.metadata
      },

      // For new JourneyPlanResults component  
      journeyResults: {
        journeyResults: {
          journeys: results.journeyOptions || [],
          directRoutes: results.directBuses || [],
          metadata: results.metadata
        },
        isLoading: false,
        error: results.error,
        searchMetadata: results.metadata
      },

      // Combined metadata
      hasResults: (results.directBuses?.length > 0) || (results.journeyOptions?.length > 0),
      searchType: results.searchType,
      suggestions: this.getSuggestions(results)
    };
  }
}

export const journeyIntegrationService = new JourneyIntegrationService();