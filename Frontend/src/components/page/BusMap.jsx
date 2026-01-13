import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Route,
  AlertTriangle,
  RefreshCw,
  Locate,
  Activity,
  Zap,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const createBusIcon = (isActive = true) => {
  return L.divIcon({
    html: `<div style="
      background: ${
        isActive
          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
          : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
      }; 
      color: white; 
      font-size: 20px; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: ${isActive ? "pulse 2s infinite" : "none"};
    ">🚌</div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        50% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.8); }
      }
    </style>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
      color: white; 
      font-size: 18px; 
      width: 36px; 
      height: 36px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    ">📍</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const BusMap = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639]);
  const [busLocations, setBusLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setLocationError(null);
        },
        (err) => {
          console.error("Error getting location:", err);
          setLocationError(t("busMap.locationError"));
        }
      );
    } else {
      setLocationError(t("busMap.geolocationNotSupported"));
    }
  }, [t]);

  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        setError(null);
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/AllLocation`
        );
        setBusLocations(res.data.buses || []);
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bus locations:", error);
        setError(t("busMap.fetchError"));
        setIsLoading(false);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          t("busMap.errorOccurred");
        toast.error(errorMessage);
      }
    };

    fetchBusLocations();
    const interval = setInterval(fetchBusLocations, 5000);
    return () => clearInterval(interval);
  }, [t]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/AllLocation`
      );
      setBusLocations(res.data.buses || []);
      setLastUpdated(new Date());
      setError(null);
      toast(res.data.message);
    } catch (error) {
      setError(t("busMap.refreshError"));
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("busMap.errorOccurred");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setLocationError(null);
        },
        (err) => {
          setLocationError(t("busMap.currentLocationError"));
        }
      );
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${
            darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
          } rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            darktheme ? "bg-purple-500/5" : "bg-purple-300/20"
          } rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <MapPin
                className={`w-8 h-8 ${
                  darktheme ? "text-blue-400" : "text-white"
                }`}
              />
            </div>
          </div>
          <h1
            className={`text-5xl font-bold mb-4 bg-gradient-to-r ${
              darktheme
                ? "from-blue-400 via-purple-400 to-pink-400"
                : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            {t("busMap.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("busMap.pageDescription")}
          </p>
        </div>

        {/* Stats & Controls */}
        <div
          className={`rounded-3xl shadow-2xl p-6 mb-6 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Bus Count */}
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                  darktheme
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <Activity
                  className={`w-6 h-6 ${
                    darktheme ? "text-green-400" : "text-green-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      darktheme ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {busLocations.length}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("busMap.busesTracked")}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    darktheme ? "bg-blue-500/10" : "bg-blue-50"
                  }`}
                >
                  <Clock
                    className={`w-5 h-5 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {t("busMap.lastUpdated")}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Indicator */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  darktheme
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-sm font-semibold ${
                    darktheme ? "text-red-400" : "text-red-600"
                  }`}
                >
                  LIVE
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGetCurrentLocation}
                className={`px-5 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                  darktheme
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } hover:scale-105`}
              >
                <Locate className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {t("busMap.myLocation")}
                </span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`px-5 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                  isLoading
                    ? darktheme
                      ? "bg-gray-700 text-gray-500"
                      : "bg-gray-300 text-gray-500"
                    : darktheme
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                } ${!isLoading && "hover:scale-105"}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isLoading ? t("busMap.refreshing") : t("busMap.refresh")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div
            className={`rounded-2xl p-5 mb-6 border ${
              darktheme
                ? "bg-red-500/10 border-red-500/30"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2 rounded-xl ${
                  darktheme ? "bg-red-500/20" : "bg-red-100"
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    darktheme ? "text-red-400" : "text-red-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    darktheme ? "text-red-400" : "text-red-800"
                  }`}
                >
                  {t("busMap.error")}
                </h3>
                <p
                  className={`text-sm ${
                    darktheme ? "text-red-300" : "text-red-700"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {locationError && (
          <div
            className={`rounded-2xl p-5 mb-6 border ${
              darktheme
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2 rounded-xl ${
                  darktheme ? "bg-yellow-500/20" : "bg-yellow-100"
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    darktheme ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    darktheme ? "text-yellow-400" : "text-yellow-800"
                  }`}
                >
                  {t("busMap.locationNotice")}
                </h3>
                <p
                  className={`text-sm ${
                    darktheme ? "text-yellow-300" : "text-yellow-700"
                  }`}
                >
                  {locationError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="relative">
            {isLoading && (
              <div
                className={`absolute top-6 left-6 z-[1000] rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 ${
                  darktheme
                    ? "bg-gray-800/95 border border-gray-700"
                    : "bg-white/95 border border-gray-200"
                } backdrop-blur-sm`}
              >
                <RefreshCw
                  className={`w-5 h-5 animate-spin ${
                    darktheme ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("busMap.loadingBuses")}
                </span>
              </div>
            )}

            <MapContainer
              center={userLocation}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "650px", width: "100%" }}
              className="rounded-3xl"
            >
              <TileLayer
                url={
                  darktheme
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <Marker position={userLocation} icon={createUserIcon()}>
                <Popup className="custom-popup">
                  <div className="p-3">
                    <h3 className="font-bold text-blue-600 mb-2 text-lg flex items-center gap-2">
                      📍 {t("busMap.yourLocation")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("busMap.youAreHere")}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {busLocations.map((bus, index) => {
                const lastUpdatedTime = new Date(bus.location.lastUpdated);
                const now = new Date();
                const minutesAgo = Math.floor(
                  (now - lastUpdatedTime) / (1000 * 60)
                );
                const isRecent = minutesAgo < 10;

                return (
                  <Marker
                    key={bus.deviceID || index}
                    position={[
                      bus.location.coordinates[0],
                      bus.location.coordinates[1],
                    ]}
                    icon={createBusIcon(isRecent)}
                  >
                    <Popup className="custom-popup" maxWidth={320}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-green-600 text-xl flex items-center gap-2">
                            🚌 {bus.deviceID}
                          </h3>
                          {!isRecent && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                              {t("busMap.inactive")}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex items-start gap-3 p-2 bg-purple-50 rounded-lg">
                            <Route className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-gray-700 block mb-1">
                                {t("busMap.route")}
                              </span>
                              <p className="text-gray-600">
                                {bus.from} → {bus.to}
                              </p>
                            </div>
                          </div>

                          {bus.driver && (
                            <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                              <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="font-semibold text-gray-700 block mb-1">
                                  {t("busMap.driver")}
                                </span>
                                <p className="text-gray-600">
                                  {bus.driver.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {bus.driver.experience}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-gray-700 block mb-1">
                                {t("busMap.lastUpdated")}
                              </span>
                              <p className="text-gray-600">
                                {minutesAgo === 0
                                  ? t("busMap.justNow")
                                  : `${minutesAgo} ${t("busMap.minAgo")}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {lastUpdatedTime.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                          onClick={() => navigate(`/bus/${bus.deviceID}`)}
                        >
                          <Zap className="w-4 h-4" />
                          {t("busMap.trackThisBus")}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Legend */}
        <div
          className={`rounded-3xl shadow-2xl p-8 mt-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <h3
            className={`text-2xl font-bold mb-8 text-center ${
              darktheme ? "text-white" : "text-gray-800"
            }`}
          >
            {t("busMap.mapLegend")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Your Location */}
            <div
              className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 hover:scale-105 ${
                darktheme
                  ? "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30"
                  : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg ring-4 ring-blue-200/50">
                📍
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-base mb-2 ${
                    darktheme ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  {t("busMap.yourLocation")}
                </p>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("busMap.currentGPS")}
                </p>
              </div>
            </div>

            {/* Active Bus */}
            <div
              className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 hover:scale-105 ${
                darktheme
                  ? "bg-green-500/10 hover:bg-green-500/20 border border-green-500/30"
                  : "bg-green-50 hover:bg-green-100 border border-green-200"
              }`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg ring-4 ring-green-200/50">
                🚌
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-base mb-2 ${
                    darktheme ? "text-green-400" : "text-green-700"
                  }`}
                >
                  {t("busMap.activeBus")}
                </p>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("busMap.activeBusDescription")}
                </p>
              </div>
            </div>

            {/* Inactive Bus */}
            <div
              className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 hover:scale-105 ${
                darktheme
                  ? "bg-gray-700/50 hover:bg-gray-700 border border-gray-600"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg ring-4 ring-gray-200/50">
                🚌
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-base mb-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("busMap.inactiveBus")}
                </p>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("busMap.inactiveBusDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusMap;
