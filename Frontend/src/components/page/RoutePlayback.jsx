import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Calendar,
  Clock,
  MapPin,
  Route as RouteIcon,
  ArrowLeft,
  Settings,
  Info,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Gauge
} from 'lucide-react';
import L from 'leaflet';
import Navbar from '../shared/Navbar';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map view updates
const MapController = ({ position, isPlaying }) => {
  const map = useMap();
  useEffect(() => {
    if (position && isPlaying) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [position, map, isPlaying]);
  return null;
};

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
  const [showStats, setShowStats] = useState(true);
  
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading && !routeData.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darktheme ? 'bg-[#0f172a]' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-t-blue-500 border-blue-500/20 rounded-full mx-auto mb-6"
          ></motion.div>
          <p className={`text-xl font-medium ${darktheme ? 'text-blue-400' : 'text-gray-800'}`}>
            Reconstructing Journey...
          </p>
        </div>
      </div>
    );
  }

  const currentPosition = getCurrentPosition();
  const routePolyline = getRoutePolyline();
  const currentPoint = routeData[currentIndex];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darktheme ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {/* Header Overlay */}
        <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl backdrop-blur-md shadow-2xl border ${
                darktheme ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
              }`}
            >
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-xl transition-all hover:scale-110 ${
                  darktheme ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <RouteIcon className="w-6 h-6 text-blue-500" />
                  Route Playback
                </h1>
                <p className={`text-xs font-bold opacity-60 uppercase tracking-widest`}>
                  Device • {deviceID}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`pointer-events-auto flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md shadow-2xl border ${
                darktheme ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5 text-blue-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-4 py-2 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darktheme 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{formatDate(date)}</option>
                ))}
              </select>
            </motion.div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-grow relative min-h-[60vh]">
          {routeData.length > 0 && currentPosition ? (
            <MapContainer
              ref={mapRef}
              center={currentPosition}
              zoom={15}
              zoomControl={false}
              className="h-full w-full"
            >
              <TileLayer
                url={darktheme 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapController position={currentPosition} isPlaying={isPlaying} />

              {/* Route Polyline */}
              {routePolyline.length > 1 && (
                <Polyline
                  positions={routePolyline}
                  color="#3b82f6"
                  weight={6}
                  opacity={0.6}
                  lineCap="round"
                />
              )}
              
              {/* Current Position Marker */}
              <Marker position={currentPosition}>
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-2 font-bold text-blue-600 border-b pb-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(currentPoint?.timestamp)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="opacity-50 font-bold uppercase">Speed</p>
                        <p className="font-mono text-sm">{currentPoint?.speed?.toFixed(1) || 0} km/h</p>
                      </div>
                      <div>
                        <p className="opacity-50 font-bold uppercase">Bearing</p>
                        <p className="font-mono text-sm">{currentPoint?.direction || 0}°</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className={`h-full flex items-center justify-center ${darktheme ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className="text-center p-8 rounded-3xl border-2 border-dashed border-gray-400/30">
                <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-bold opacity-50">No trajectory data for this period</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className={`relative z-[1001] px-6 pb-6 pt-0`}>
          <div className="max-w-7xl mx-auto">
            {/* Timeline Slider */}
            <div className={`mb-6 p-4 rounded-3xl backdrop-blur-xl shadow-2xl border ${
              darktheme ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-4">
                    <div className={`flex flex-col`}>
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Departure</span>
                      <span className="font-mono text-sm">{routeData.length > 0 ? formatTime(routeData[0].timestamp) : '--:--'}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-500/20"></div>
                    <div className={`flex flex-col`}>
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Arrival</span>
                      <span className="font-mono text-sm">{routeData.length > 0 ? formatTime(routeData[routeData.length-1].timestamp) : '--:--'}</span>
                    </div>
                 </div>

                 <div className="text-center">
                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      darktheme ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500 text-white'
                    }`}>
                      {formatTime(currentPoint?.timestamp || Date.now())}
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Progress</span>
                    <span className="font-mono text-sm">{Math.round((currentIndex / (routeData.length - 1 || 1)) * 100)}%</span>
                 </div>
              </div>
              
              <input
                type="range"
                min="0"
                max={routeData.length - 1}
                value={currentIndex}
                onChange={(e) => handleTimelineClick(parseInt(e.target.value))}
                className="w-full h-3 bg-blue-500/10 rounded-full appearance-none cursor-pointer transition-all hover:h-4 active:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white"
              />
            </div>

            {/* Main Action Bar */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Playback Controls */}
              <div className={`flex-1 flex items-center justify-between p-4 rounded-3xl backdrop-blur-xl shadow-2xl border ${
                darktheme ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  {[0.5, 1, 2, 4].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                        playbackSpeed === speed
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 scale-110'
                          : darktheme
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={handleSkipBack}
                    className={`p-3 rounded-2xl transition-all active:scale-90 ${
                      darktheme ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                    }`}
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full bg-blue-500 text-white shadow-2xl shadow-blue-500/40 hover:bg-blue-600 hover:scale-110 transition-all active:scale-95 flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
                  </button>
                  
                  <button
                    onClick={handleSkipForward}
                    className={`p-3 rounded-2xl transition-all active:scale-90 ${
                      darktheme ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                    }`}
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                <button 
                  onClick={() => setShowStats(!showStats)}
                  className={`p-3 rounded-2xl transition-all ${
                    showStats 
                      ? 'bg-blue-500/20 text-blue-500' 
                      : darktheme ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Gauge className="w-6 h-6" />
                </button>
              </div>

              {/* Dynamic Stats Bar */}
              <AnimatePresence>
                {showStats && (
                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    className={`flex items-center gap-6 p-4 rounded-3xl backdrop-blur-xl shadow-2xl border ${
                      darktheme ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Points</span>
                      <span className="text-xl font-black text-blue-500">{routeData.length}</span>
                    </div>
                    <div className="h-10 w-px bg-gray-500/20"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Duration</span>
                      <span className="text-xl font-black text-green-500">
                        {routeData.length > 0 
                          ? Math.round((new Date(routeData[routeData.length-1].timestamp) - new Date(routeData[0].timestamp)) / 60000) 
                          : 0}
                        <span className="text-[10px] ml-1">min</span>
                      </span>
                    </div>
                    <div className="h-10 w-px bg-gray-500/20"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Current Speed</span>
                      <span className="text-xl font-black text-orange-500">
                        {currentPoint?.speed?.toFixed(1) || 0}
                        <span className="text-[10px] ml-1">km/h</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default RoutePlayback;