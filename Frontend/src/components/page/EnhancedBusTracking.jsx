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
  const busPosition = [
    currentLocation?.coordinates?.[0] || 0,
    currentLocation?.coordinates?.[1] || 0,
  ];

  const routeCoordinates = routeHistory
    ? routeHistory.map((point) => [point.coordinates[0], point.coordinates[1]])
    : [];

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

                  {/* Bus route polyline */}
                  {routeCoordinates.length > 0 && (
                    <Polyline
                      positions={routeCoordinates}
                      color="#3b82f6"
                      weight={3}
                      opacity={0.6}
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
                className={`p-4 rounded-xl ${
                  darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Gauge className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {Math.round(realTimeData?.speed || 0)}
                    </p>
                    <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      km/h
                    </p>
                  </div>
                </div>
              </div>

              {/* Direction */}
              <div
                className={`p-4 rounded-xl ${
                  darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Navigation2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {getDirectionArrow(realTimeData?.direction)}
                    </p>
                    <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      {Math.round(realTimeData?.direction || 0)}°
                    </p>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div
                className={`p-4 rounded-xl ${
                  darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {realTimeData?.currentPassengers || 0}
                    </p>
                    <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      passengers
                    </p>
                  </div>
                </div>
              </div>

              {/* Traffic */}
              <div
                className={`p-4 rounded-xl ${
                  darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertTriangle
                      className={`w-6 h-6 ${getTrafficColor(realTimeData?.trafficLevel)}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${darktheme ? "text-white" : "text-gray-900"}`}
                    >
                      {realTimeData?.trafficLevel || "Unknown"}
                    </p>
                    <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      traffic
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Bus Info */}
            {busInfo && (
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
                  Bus Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BusIcon
                      className={`w-5 h-5 mt-0.5 ${
                        darktheme ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                        Route
                      </p>
                      <p className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                        {busInfo.from} → {busInfo.to}
                      </p>
                    </div>
                  </div>

                  {busInfo.capacity && (
                    <>
                      <div className="flex items-start gap-3">
                        <Users
                          className={`w-5 h-5 mt-0.5 ${
                            darktheme ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                            Seat Availability
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  busInfo.capacity.availableSeats > 10
                                    ? "bg-green-500"
                                    : busInfo.capacity.availableSeats > 5
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${
                                    (busInfo.capacity.availableSeats / busInfo.capacity.totalSeats) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${darktheme ? "text-white" : "text-gray-900"}`}>
                            <span className="font-bold">
                              {busInfo.capacity.availableSeats}
                            </span>{" "}
                            / {busInfo.capacity.totalSeats} seats available
                          </p>
                        </div>
                      </div>

                      {/* Seat Indicator */}
                      <div
                        className={`p-3 rounded-lg ${
                          busInfo.capacity.availableSeats > 10
                            ? "bg-green-500/20 border border-green-500/30"
                            : busInfo.capacity.availableSeats > 5
                              ? "bg-yellow-500/20 border border-yellow-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${
                            busInfo.capacity.availableSeats > 10
                              ? "text-green-500"
                              : busInfo.capacity.availableSeats > 5
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                        >
                          {busInfo.capacity.availableSeats > 10
                            ? "✓ Seats Available"
                            : busInfo.capacity.availableSeats > 5
                              ? "⚠ Limited Seats"
                              : "✗ Nearly Full"}
                        </p>
                      </div>
                    </>
                  )}

                  {busInfo.trafficCondition && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 ${getTrafficColor(busInfo.trafficCondition)}`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                          Traffic Condition
                        </p>
                        <p
                          className={`font-semibold ${getTrafficColor(busInfo.trafficCondition)}`}
                        >
                          {getTrafficLabel(busInfo.trafficCondition)}
                        </p>
                      </div>
                    </div>
                  )}

                  {busInfo.estimatedArrival && (
                    <div className="flex items-start gap-3">
                      <Timer
                        className={`w-5 h-5 mt-0.5 ${
                          darktheme ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                          Estimated Arrival
                        </p>
                        <p className={`font-semibold ${darktheme ? "text-white" : "text-gray-900"}`}>
                          {formatETA(busInfo.estimatedArrival) || "Calculating..."}
                        </p>
                      </div>
                    </div>
                  )}
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
