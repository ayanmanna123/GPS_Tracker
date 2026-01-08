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
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// Helper to create a custom marker with bus emoji
const createBusIcon = (isActive = true) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${isActive ? "#16a34a" : "#6b7280"}; 
      color: white; 
      font-size: 20px; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">🚌</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom user location icon
const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6; 
      color: white; 
      font-size: 16px; 
      width: 28px; 
      height: 28px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">📍</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const BusMap = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639]); // default Kolkata
  const [busLocations, setBusLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  // Get user location
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

  // Fetch all bus details
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
          error.response?.data?.message || error.message || t("busMap.errorOccurred");
        toast.error(errorMessage);
      }
    };

    // Call immediately once
    fetchBusLocations();

    // Set interval for every 5 sec
    const interval = setInterval(fetchBusLocations, 5000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, [t]);

  // Manual refresh function
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
        error.response?.data?.message || error.message || t("busMap.errorOccurred");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user location again
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
        () => {
          setLocationError(t("busMap.currentLocationError"));
        }
      );
    }
  };

  return (
    <div
      className={`min-h-screen ${darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1
            className={`text-4xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-800"
              }`}
          >
            {t("busMap.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${darktheme ? "text-gray-300" : "text-gray-600"
              }`}
          >
            {t("busMap.pageDescription")}
          </p>
        </div>

        {/* Controls Section */}
        <div
          className={`rounded-2xl shadow-xl p-6 mb-6 ${darktheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-green-100"
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center text-sm ${darktheme ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                <MapPin className="w-4 h-4 mr-1 text-green-500" />
                <span className="font-medium">{busLocations.length}</span> {t("busMap.busesTracked")}
              </div>
              {lastUpdated && (
                <div
                  className={`flex items-center text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {t("busMap.lastUpdated")} {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleGetCurrentLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center text-sm"
              >
                <Locate className="w-4 h-4 mr-1" />
                {t("busMap.myLocation")}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm ${isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                  }`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? t("busMap.refreshing") : t("busMap.refresh")}
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div
            className={`rounded-xl p-4 mb-6 ${darktheme
                ? "bg-red-900/50 border border-red-800"
                : "bg-red-50 border border-red-200"
              }`}
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3
                  className={`font-medium mb-1 ${darktheme ? "text-red-300" : "text-red-800"
                    }`}
                >
                  {t("busMap.error")}
                </h3>
                <p
                  className={`text-sm ${darktheme ? "text-red-400" : "text-red-700"
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
            className={`rounded-xl p-4 mb-6 ${darktheme
                ? "bg-yellow-900/50 border border-yellow-800"
                : "bg-yellow-50 border border-yellow-200"
              }`}
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3
                  className={`font-medium mb-1 ${darktheme ? "text-yellow-300" : "text-yellow-800"
                    }`}
                >
                  {t("busMap.locationNotice")}
                </h3>
                <p
                  className={`text-sm ${darktheme ? "text-yellow-400" : "text-yellow-700"
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
          className={`rounded-2xl shadow-xl overflow-hidden ${darktheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-green-100"
            }`}
        >
          <div className="relative">
            {isLoading && (
              <div
                className={`absolute top-4 left-4 z-[1000] rounded-lg shadow-lg px-3 py-2 flex items-center ${darktheme ? "bg-gray-800 border border-gray-700" : "bg-white"
                  }`}
              >
                <RefreshCw className="w-4 h-4 mr-2 animate-spin text-green-500" />
                <span
                  className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-600"
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
              style={{ height: "600px", width: "100%" }}
              className="rounded-2xl"
            >
              <TileLayer
                url={
                  darktheme
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Marker */}
              <Marker position={userLocation} icon={createUserIcon()}>
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h3 className="font-bold text-blue-600 mb-1">
                      📍 {t("busMap.yourLocation")}
                    </h3>
                    <p className="text-sm text-gray-600">{t("busMap.youAreHere")}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Bus Markers */}
              {busLocations.map((bus, index) => {
                const lastUpdatedTime = new Date(bus.location.lastUpdated);
                const now = new Date();
                const minutesAgo = Math.floor(
                  (now - lastUpdatedTime) / (1000 * 60)
                );
                const isRecent = minutesAgo < 10; // Consider bus active if updated within 10 minutes

                return (
                  <Marker
                    key={bus.deviceID || index}
                    position={[
                      bus.location.coordinates[0],
                      bus.location.coordinates[1],
                    ]}
                    icon={createBusIcon(isRecent)}
                  >
                    <Popup className="custom-popup" maxWidth={300}>
                      <div className="p-3">
                        <h3 className="font-bold text-green-600 mb-3 text-lg flex items-center">
                          🚌 {bus.deviceID}
                          {!isRecent && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {t("busMap.inactive")}
                            </span>
                          )}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <Route className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">
                                {t("busMap.route")}
                              </span>
                              <p className="text-gray-600">
                                {bus.from} → {bus.to}
                              </p>
                            </div>
                          </div>

                          {bus.driver && (
                            <div className="flex items-start">
                              <User className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">
                                  {t("busMap.driver")}
                                </span>
                                <p className="text-gray-600">
                                  {bus.driver.name} ({bus.driver.experience})
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start">
                            <Clock className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">
                                {t("busMap.lastUpdated")}
                              </span>
                              <p className="text-gray-600">
                                {minutesAgo === 0
                                  ? t("busMap.justNow")
                                  : `${minutesAgo} ${t("busMap.minAgo")}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lastUpdatedTime.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Navigation className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">
                                {t("busMap.coordinates")}
                              </span>
                              <p className="text-gray-600 font-mono text-xs">
                                {bus.location.coordinates.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                            onClick={() => navigate(`/bus/${bus.deviceID}`)}
                          >
                            {t("busMap.trackThisBus")}
                          </button>
                        </div>
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
          className={`rounded-2xl shadow-lg p-6 mt-6 ${darktheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-green-100"
            }`}
        >
          <h3
            className={`text-lg font-bold mb-4 ${darktheme ? "text-white" : "text-gray-800"
              }`}
          >
            {t("busMap.mapLegend")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                📍
              </div>
              <div>
                <p
                  className={`font-medium ${darktheme ? "text-gray-200" : "text-gray-700"
                    }`}
                >
                  {t("busMap.yourLocation")}
                </p>
                <p
                  className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {t("busMap.currentGPS")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                🚌
              </div>
              <div>
                <p
                  className={`font-medium ${darktheme ? "text-gray-200" : "text-gray-700"
                    }`}
                >
                  {t("busMap.activeBus")}
                </p>
                <p
                  className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {t("busMap.activeBusDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                🚌
              </div>
              <div>
                <p
                  className={`font-medium ${darktheme ? "text-gray-200" : "text-gray-700"
                    }`}
                >
                  {t("busMap.inactiveBus")}
                </p>
                <p
                  className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {t("busMap.inactiveBusDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-16 text-center text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
            }`}
        >
          <p>{t("busMap.footer")}</p>
        </footer>
      </main>
    </div>
  );
};

export default BusMap;