import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { toast } from "sonner";
import websocketService from "../../services/websocketService";
import {
  MapPin,
  Clock,
  Users,
  Navigation2,
  Gauge,
  Share2,
  AlertTriangle,
  Zap,
  Bus as BusIcon,
  TrendingUp,
  Activity,
  Mail,
  Timer,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import SOSButton from "./SOSButton";

// Custom bus icon component
const BusMarker = ({ speed, direction, passengers, available }) => {
  return (
    <div className="relative">
      <div
        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
        style={{
          transform: `rotate(${direction}deg)`,
        }}
      >
        <span className="text-2xl">🚌</span>
      </div>
      {speed > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-bold shadow-md">
          {Math.round(speed)} km/h
        </div>
      )}
      {passengers !== undefined && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-bold shadow-md">
          {passengers}/{passengers + available}
        </div>
      )}
    </div>
  );
};

// Component to handle road-aligned routing
const Routing = ({ origin, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!origin || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin[0], origin[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      createMarker: () => null, // Hide default routing markers
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 5, opacity: 0.7 }],
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [origin, destination, map]);

  return null;
};

// Component to center map on bus location
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const EnhancedBusTracking = () => {
  const { deviceID } = useParams();
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const hasInitialized = useRef(false);

  // Fetch tracking data
  const fetchTrackingData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/tracking/bus/${deviceID}`
      );

      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      if (loading) {
        toast.error("Failed to load tracking data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate ETA
  const calculateETA = async (destLat, destLng) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/tracking/calculate-eta`,
        {
          deviceID,
          destinationLat: destLat,
          destinationLng: destLng,
        }
      );

      if (response.data.success) {
        setEta(response.data.data);
      }
    } catch (error) {
      console.error("Error calculating ETA:", error);
    }
  };

  // Share location
  const handleShareLocation = async () => {
    if (!shareEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to share location");
      return;
    }

    try {
      setSharing(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/tracking/share-location`,
        {
          deviceID,
          shareWithEmails: [shareEmail],
          expirationHours: 24,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Location shared successfully!");
        setShareEmail("");
        
        // Copy link to clipboard
        navigator.clipboard.writeText(response.data.data.shareLink);
        toast.success("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing location:", error);
      toast.error(error.response?.data?.message || "Failed to share location");
    } finally {
      setSharing(false);
    }
  };

  // Initialize WebSocket connection and tracking
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeTracking = async () => {
      try {
        // Connect to WebSocket
        await websocketService.connect();
        setIsConnected(true);

        // Start tracking this bus
        websocketService.trackBus(deviceID);

        // Fetch initial data
        await fetchTrackingData();
      } catch (error) {
        console.error("Failed to initialize tracking:", error);
        toast.error("Failed to connect to live tracking");
      }
    };

    initializeTracking();

    // Set up WebSocket event listeners
    const cleanupLocation = websocketService.onLocationUpdate((data) => {
      if (data.deviceID === deviceID) {
        console.log("📍 Location update received:", data);
        setTrackingData((prev) => ({
          ...prev,
          currentLocation: data.location,
          previousLocation: data.prevlocation,
          lastUpdated: data.lastUpdated,
          realTimeData: {
            ...prev?.realTimeData,
            ...data.realTimeData,
          },
        }));
      }
    });

    const cleanupTracking = websocketService.onTrackingUpdate((data) => {
      if (data.deviceID === deviceID) {
        console.log("📡 Tracking update received:", data);
        setTrackingData((prev) => ({
          ...prev,
          realTimeData: {
            ...prev?.realTimeData,
            ...data.realTimeData,
          },
          busInfo: {
            ...prev?.busInfo,
            capacity: data.capacity || prev?.busInfo?.capacity,
            trafficCondition: data.trafficCondition || prev?.busInfo?.trafficCondition,
          },
        }));
      }
    });

    const cleanupPassenger = websocketService.onPassengerUpdate((data) => {
      if (data.deviceID === deviceID) {
        console.log("👥 Passenger update received:", data);
        setTrackingData((prev) => ({
          ...prev,
          busInfo: {
            ...prev?.busInfo,
            capacity: {
              occupiedSeats: data.occupiedSeats,
              availableSeats: data.availableSeats,
              totalSeats: data.totalSeats,
            },
          },
        }));
      }
    });

    const cleanupETA = websocketService.onETAUpdate((data) => {
      if (data.deviceID === deviceID) {
        console.log("⏱️ ETA update received:", data);
        setEta(data);
      }
    });

    const cleanupTraffic = websocketService.onTrafficUpdate((data) => {
      if (data.deviceID === deviceID) {
        console.log("🚦 Traffic update received:", data);
        setTrackingData((prev) => ({
          ...prev,
          busInfo: {
            ...prev?.busInfo,
            trafficCondition: data.trafficLevel,
          },
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      websocketService.stopTrackingBus(deviceID);
      cleanupLocation();
      cleanupTracking();
      cleanupPassenger();
      cleanupETA();
      cleanupTraffic();
    };
  }, [deviceID]);

  // Get traffic color
  const getTrafficColor = (level) => {
    const colors = {
      light: "text-green-500",
      moderate: "text-yellow-500",
      heavy: "text-orange-500",
      severe: "text-red-500",
      unknown: "text-gray-500",
    };
    return colors[level] || colors.unknown;
  };

  // Get traffic label
  const getTrafficLabel = (level) => {
    const labels = {
      light: "Light Traffic",
      moderate: "Moderate Traffic",
      heavy: "Heavy Traffic",
      severe: "Severe Traffic",
      unknown: "Unknown",
    };
    return labels[level] || labels.unknown;
  };

  // Get direction arrow
  const getDirectionArrow = (direction) => {
    const arrows = {
      N: "↑",
      NE: "↗",
      E: "→",
      SE: "↘",
      S: "↓",
      SW: "↙",
      W: "←",
      NW: "↖",
    };

    const deg = direction || 0;
    if (deg >= 337.5 || deg < 22.5) return arrows.N;
    if (deg >= 22.5 && deg < 67.5) return arrows.NE;
    if (deg >= 67.5 && deg < 112.5) return arrows.E;
    if (deg >= 112.5 && deg < 157.5) return arrows.SE;
    if (deg >= 157.5 && deg < 202.5) return arrows.S;
    if (deg >= 202.5 && deg < 247.5) return arrows.SW;
    if (deg >= 247.5 && deg < 292.5) return arrows.W;
    if (deg >= 292.5 && deg < 337.5) return arrows.NW;
    return arrows.N;
  };

  // Format ETA countdown
  const formatETA = (etaDate) => {
    if (!etaDate) return null;

    const now = new Date();
    const eta = new Date(etaDate);
    const diffMs = eta - now;

    if (diffMs < 0) return "Arrived";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={darktheme ? "text-gray-400" : "text-gray-600"}>
            Loading tracking data...
          </p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className={`text-xl ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
            Bus not found
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { currentLocation, realTimeData, busInfo, routeHistory } = trackingData;
  
  const rawRoute = routeHistory
    ? routeHistory.map((point) => [point.coordinates[0], point.coordinates[1]]).filter(p => p[0] !== 0 || p[1] !== 0)
    : [];

  // Simplify route if it has too many points to prevent browser lag
  const displayRoute = rawRoute.length > 500 
    ? rawRoute.filter((_, i) => i % 5 === 0 || i === rawRoute.length - 1)
    : rawRoute;

  const busPosition = currentLocation?.coordinates?.[0] !== 0 && currentLocation?.coordinates?.[1] !== 0
    ? [currentLocation.coordinates[0], currentLocation.coordinates[1]]
    : (displayRoute.length > 0 ? displayRoute[displayRoute.length - 1] : [22.5726, 88.3639]);

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Navbar />
      <SOSButton deviceID={deviceID} busName={busInfo?.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
              darktheme
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ← Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-4xl font-bold mb-2 ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                {busInfo?.name || "Bus Tracking"}
              </h1>
              <p className={darktheme ? "text-gray-400" : "text-gray-600"}>
                Real-time location and status updates
              </p>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darktheme ? "bg-gray-800" : "bg-white shadow"
                }`}
              >
                <Activity
                  className={`w-5 h-5 ${
                    isConnected ? "text-green-500 animate-pulse" : "text-red-500"
                  }`}
                />
                <span className={darktheme ? "text-gray-300" : "text-gray-700"}>
                  {isConnected ? "Live Connected" : "Disconnected"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div
              className={`rounded-2xl overflow-hidden shadow-xl ${
                darktheme ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-bold ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Live Location
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-500 font-medium">
                      LIVE
                    </span>
                  </div>
                </div>

                <MapContainer
                  center={busPosition}
                  zoom={15}
                  style={{ height: "500px", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer
                    url={
                      darktheme
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                  />
                  <MapCenter center={busPosition} />

                  {/* Road-aligned route from origin to current position */}
                  {displayRoute.length > 0 && (
                    <Routing 
                      origin={displayRoute[0]} 
                      destination={busPosition} 
                    />
                  )}

                  {/* Bus marker */}
                  <Marker
                    position={busPosition}
                    icon={L.divIcon({
                      html: `
                        <div style="
                          transform: rotate(${realTimeData?.direction || 0}deg);
                          width: 40px;
                          height: 40px;
                          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          border: 3px solid white;
                          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                          font-size: 20px;
                        ">
                          🚌
                        </div>
                      `,
                      className: "",
                      iconSize: [40, 40],
                      iconAnchor: [20, 20],
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold">{busInfo?.name}</p>
                        <p className="text-sm">
                          Speed: {Math.round(realTimeData?.speed || 0)} km/h
                        </p>
                        <p className="text-sm">
                          Passengers: {realTimeData?.currentPassengers || 0}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Speed */}
              <div
                className={`p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  darktheme ? "bg-gray-800/50 border border-gray-700" : "bg-white shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {Math.round(realTimeData?.speed || 0)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      KM/H
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (realTimeData?.speed || 0))}%` }}
                  ></div>
                </div>
              </div>

              {/* Direction */}
              <div
                className={`p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  darktheme ? "bg-gray-800/50 border border-gray-700" : "bg-white shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                    <Navigation2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {getDirectionArrow(realTimeData?.direction)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      {Math.round(realTimeData?.direction || 0)}°
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-1000" 
                    style={{ width: `${((realTimeData?.direction || 0) / 360) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Passengers */}
              <div
                className={`p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  darktheme ? "bg-gray-800/50 border border-gray-700" : "bg-white shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {realTimeData?.currentPassengers || 0}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      LIVE
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, ((realTimeData?.currentPassengers || 0) / (busInfo?.capacity?.totalSeats || 40)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Traffic */}
              <div
                className={`p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  darktheme ? "bg-gray-800/50 border border-gray-700" : "bg-white shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <AlertTriangle
                      className={`w-6 h-6 ${getTrafficColor(realTimeData?.trafficLevel)}`}
                    />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {realTimeData?.trafficLevel || "Unknown"}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      TRAFFIC
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      realTimeData?.trafficLevel === 'light' ? 'bg-green-500' :
                      realTimeData?.trafficLevel === 'heavy' ? 'bg-red-500' :
                      'bg-orange-500'
                    }`} 
                    style={{ width: realTimeData?.trafficLevel ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Bus Info */}
            {busInfo && (
              <div
                className={`p-6 rounded-3xl overflow-hidden relative ${
                  darktheme ? "bg-gray-800/80 border border-gray-700/50" : "bg-white shadow-2xl border border-gray-100"
                } backdrop-blur-md`}
              >
                {/* Decorative background element */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${darktheme ? 'bg-blue-500' : 'bg-blue-300'}`}></div>

                <h3
                  className={`text-xl font-black mb-6 flex items-center gap-2 ${
                    darktheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  <div className={`w-2 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-600`}></div>
                  Bus Details
                </h3>

                <div className="space-y-6">
                  {/* Route */}
                  <div className={`group p-4 rounded-2xl transition-all duration-300 ${darktheme ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-blue-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BusIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${darktheme ? 'text-gray-300' : 'text-gray-500'}`}>Current Route</span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${darktheme ? "text-gray-200" : "text-gray-800"}`}>
                      {busInfo.from} <span className="text-blue-500 mx-1">→</span> {busInfo.to}
                    </p>
                  </div>

                  {/* Seat Availability / Crowd Density */}
                  {busInfo.capacity && (
                    <div className={`group p-4 rounded-2xl transition-all duration-300 ${darktheme ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-green-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-green-500" />
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${darktheme ? 'text-gray-300' : 'text-gray-500'}`}>Crowd Status</span>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${
                          (busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.5 ? 'bg-green-500/20 text-green-500' :
                          (busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.85 ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {(busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.5 ? '🟢 Low' :
                           (busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.85 ? '🟡 Medium' :
                           '🔴 High'}
                        </span>
                      </div>
                      
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2 shadow-inner">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            (busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.5 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            (busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) < 0.85 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{
                            width: `${(busInfo.capacity.occupiedSeats / busInfo.capacity.totalSeats) * 100}%`,
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className={`text-[11px] font-bold ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                          {busInfo.capacity.occupiedSeats} Seats Occupied
                        </p>
                        <p className={`text-[11px] font-bold ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
                          {busInfo.capacity.totalSeats} Total
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Traffic Condition */}
                  <div className={`group p-4 rounded-2xl transition-all duration-300 ${darktheme ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-orange-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        busInfo.trafficCondition === 'light' ? 'bg-green-500/10' :
                        busInfo.trafficCondition === 'heavy' ? 'bg-red-500/10' :
                        'bg-orange-500/10'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${getTrafficColor(busInfo.trafficCondition)}`} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${darktheme ? 'text-gray-300' : 'text-gray-500'}`}>Traffic Flow</span>
                    </div>
                    <p className={`text-sm font-black ${getTrafficColor(busInfo.trafficCondition)}`}>
                      {getTrafficLabel(busInfo.trafficCondition)}
                    </p>
                  </div>

                  {/* Estimated Arrival */}
                  {busInfo.estimatedArrival && (
                    <div className={`group p-4 rounded-2xl transition-all duration-300 ${darktheme ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-purple-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Timer className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${darktheme ? 'text-gray-300' : 'text-gray-500'}`}>Estimated Arrival</span>
                      </div>
                      <p className={`text-xl font-black ${darktheme ? "text-white" : "text-gray-900"} animate-pulse`}>
                        {formatETA(busInfo.estimatedArrival) || "Calculating..."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Live Status Indicator */}
                <div className={`mt-6 pt-4 border-t ${darktheme ? 'border-gray-700/50' : 'border-gray-100'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${darktheme ? 'text-gray-500' : 'text-gray-400'}`}>
                      Live Tracking Active
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium ${darktheme ? 'text-gray-500' : 'text-gray-400'}`}>
                    Refreshed: {trackingData.lastUpdated ? new Date(trackingData.lastUpdated).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            )}

            {/* Share Location */}
            <div
              className={`p-6 rounded-2xl ${
                darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow-xl"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                <Share2 className="w-5 h-5" />
                Share Location
              </h3>

              <div className="space-y-3">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darktheme
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button
                  onClick={handleShareLocation}
                  disabled={sharing || !isAuthenticated}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition ${
                    sharing || !isAuthenticated
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  {sharing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Share via Email
                    </>
                  )}
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-yellow-500">Login required to share</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={`p-6 rounded-2xl ${
                darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow-xl"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/bus/${deviceID}`)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-between transition ${
                    darktheme
                      ? "bg-gray-900 hover:bg-gray-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  <span>View Bus Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/makepayment/${deviceID}`)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-between transition ${
                    darktheme
                      ? "bg-gray-900 hover:bg-gray-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  <span>Book Ticket</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/bus/reviews/${deviceID}`)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-between transition ${
                    darktheme
                      ? "bg-gray-900 hover:bg-gray-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  <span>View Reviews</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBusTracking;
