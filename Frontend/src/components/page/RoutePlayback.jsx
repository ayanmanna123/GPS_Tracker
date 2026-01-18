import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Calendar,
  Clock,
  MapPin,
  Route as RouteIcon,
  ArrowLeft
} from 'lucide-react';
import L from 'leaflet';
import Navbar from '../shared/Navbar';
import { useSelector } from 'react-redux';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutePlayback = () => {
  const { deviceID } = useParams();
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);
  
  const [routeData, setRouteData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);
  const mapRef = useRef(null);

  // Fetch available dates on component mount
  useEffect(() => {
    fetchAvailableDates();
  }, [deviceID]);

  // Fetch route data when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchRouteData();
    }
  }, [selectedDate]);

  // Playback control
  useEffect(() => {
    if (isPlaying && routeData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= routeData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, routeData.length]);

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/route-history/${deviceID}/dates`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableDates(data.data.availableDates);
        if (data.data.availableDates.length > 0) {
          setSelectedDate(data.data.availableDates[0]);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch available dates');
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 1);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/route-history/${deviceID}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      
      if (data.success) {
        setRouteData(data.data.routeHistory);
        setCurrentIndex(0);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch route data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 10));
  };

  const handleSkipForward = () => {
    setCurrentIndex(Math.min(routeData.length - 1, currentIndex + 10));
  };

  const handleTimelineClick = (index) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const getCurrentPosition = () => {
    if (routeData.length === 0 || currentIndex >= routeData.length) return null;
    const point = routeData[currentIndex];
    return [point.coordinates[0], point.coordinates[1]];
  };

  const getRoutePolyline = () => {
    if (routeData.length === 0) return [];
    return routeData.slice(0, currentIndex + 1).map(point => [
      point.coordinates[0], 
      point.coordinates[1]
    ]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darktheme ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darktheme ? 'text-white' : 'text-gray-800'}>Loading route history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darktheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${darktheme ? 'text-red-400' : 'text-red-500'}`}>⚠️</div>
            <h2 className={`text-2xl font-bold mb-2 ${darktheme ? 'text-white' : 'text-gray-800'}`}>
              Error Loading Route History
            </h2>
            <p className={`mb-4 ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPosition = getCurrentPosition();
  const routePolyline = getRoutePolyline();

  return (
    <div className={`min-h-screen ${darktheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* Header */}
      <div className={`border-b ${darktheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-colors ${
                  darktheme ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                  Route Playback
                </h1>
                <p className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Device: {deviceID}
                </p>
              </div>
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${darktheme ? 'text-gray-400' : 'text-gray-600'}`} />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darktheme 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[60vh]">
        {routeData.length > 0 && currentPosition ? (
          <MapContainer
            ref={mapRef}
            center={currentPosition}
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Route Polyline */}
            {routePolyline.length > 1 && (
              <Polyline
                positions={routePolyline}
                color="#3B82F6"
                weight={4}
                opacity={0.8}
              />
            )}
            
            {/* Current Position Marker */}
            <Marker position={currentPosition}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Current Position</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(routeData[currentIndex]?.timestamp)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-200">
            <p className="text-gray-600">No route data available for selected date</p>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className={`border-t ${darktheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handleSkipBack}
              className={`p-3 rounded-full transition-colors ${
                darktheme ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={handleSkipForward}
              className={`p-3 rounded-full transition-colors ${
                darktheme ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>Speed:</span>
            {[0.5, 1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-blue-500 text-white'
                    : darktheme
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Timeline */}
          {routeData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={darktheme ? 'text-gray-400' : 'text-gray-600'}>
                  {formatTime(routeData[0]?.timestamp)}
                </span>
                <span className={darktheme ? 'text-gray-400' : 'text-gray-600'}>
                  {formatTime(routeData[routeData.length - 1]?.timestamp)}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={routeData.length - 1}
                  value={currentIndex}
                  onChange={(e) => handleTimelineClick(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs mt-2">
                  <span className={darktheme ? 'text-gray-500' : 'text-gray-400'}>
                    Point {currentIndex + 1} of {routeData.length}
                  </span>
                  <span className={darktheme ? 'text-gray-500' : 'text-gray-400'}>
                    {routeData[currentIndex] && formatTime(routeData[currentIndex].timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {routeData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className={`p-4 rounded-lg ${darktheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <RouteIcon className={`w-4 h-4 ${darktheme ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Points
                  </span>
                </div>
                <p className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                  {routeData.length}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${darktheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`w-4 h-4 ${darktheme ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Duration
                  </span>
                </div>
                <p className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                  {Math.round((new Date(routeData[routeData.length - 1]?.timestamp) - new Date(routeData[0]?.timestamp)) / (1000 * 60))} min
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${darktheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className={`w-4 h-4 ${darktheme ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Point
                  </span>
                </div>
                <p className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                  {currentIndex + 1}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${darktheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Play className={`w-4 h-4 ${darktheme ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm ${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Speed
                  </span>
                </div>
                <p className={`text-lg font-semibold ${darktheme ? 'text-white' : 'text-gray-800'}`}>
                  {playbackSpeed}x
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlayback;