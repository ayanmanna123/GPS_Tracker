import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Bus,
  Search,
  Navigation,
  ArrowRight,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDispatch, useSelector } from "react-redux";
import { setpath } from "@/Redux/auth.reducer";
import MicInput from "./MicInput";
import { toast } from "sonner";
import { addToHistory } from "@/Redux/history.reducer";
import Navbar from "../shared/Navbar";
import { useTranslation } from "react-i18next";

const API_BASE = `${import.meta.env.VITE_BASE_URL}/Myroute`;
const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
};

const PlaceSearch = ({ label, onSelect, enableUseMyLocation = false }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const { darktheme } = useSelector((store) => store.auth);

  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length < 3) return setSuggestions([]);

    try {
      setLoading(true);
      const res = await fetch(
        `${GEOCODE_API}?q=${encodeURIComponent(value)}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocode error:", err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `${GEOCODE_API}?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`
      );
      const data = await res.json();
      return data[0]?.display_name || `${lat}, ${lon}`;
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return `${lat}, ${lon}`;
    }
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert(t("busSearch.geolocationNotSupported"));
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setQuery(address);
          setSelectedPos({ lat: latitude, lon: longitude });
          onSelect({ lat: latitude, lon: longitude, address });
          setSuggestions([]);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        alert(t("busSearch.unableToGetLocation"));
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="mb-6 relative">
      <label
        className={`block mb-3 font-semibold text-sm ${
          darktheme ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>

      <MicInput
        type="text"
        value={query}
        placeholder={t("busSearch.typePlaceholder")}
        onChange={(e) => handleSearch(e.target.value)}
        className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
          darktheme
            ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
            : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className={`text-sm mt-3 font-semibold transition-all flex items-center gap-2 ${
            darktheme
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-700"
          }`}
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          <MapPin className="w-4 h-4" />
          {loadingLocation
            ? t("busSearch.gettingLocation")
            : t("busSearch.useMyLocation")}
        </button>
      )}

      {loading && (
        <p
          className={`text-sm mt-2 flex items-center gap-2 ${
            darktheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          {t("busSearch.searching")}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          className={`absolute z-10 w-full shadow-2xl rounded-xl mt-2 max-h-60 overflow-y-auto border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/95 border-gray-700"
              : "bg-white/95 border-gray-200"
          }`}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className={`p-4 cursor-pointer text-sm transition-all border-b last:border-b-0 flex items-start gap-3 ${
                darktheme
                  ? "hover:bg-gray-700 text-gray-200 border-gray-700"
                  : "hover:bg-blue-50 text-gray-900 border-gray-100"
              }`}
              onClick={() => {
                const pos = { lat: parseFloat(s.lat), lon: parseFloat(s.lon) };
                setQuery(s.display_name);
                setSelectedPos(pos);
                onSelect({ ...pos, address: s.display_name });
                setSuggestions([]);
              }}
            >
              <MapPin
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  darktheme ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span>{s.display_name}</span>
            </li>
          ))}
        </ul>
      )}

      {selectedPos && (
        <div
          className={`mt-4 h-72 rounded-2xl overflow-hidden shadow-2xl border-2 ${
            darktheme ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <MapContainer
            center={[selectedPos.lat, selectedPos.lon]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url={
                darktheme
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={[selectedPos.lat, selectedPos.lon]}
              icon={markerIcon}
            />
            <LocationPicker
              onSelect={async (pos) => {
                setSelectedPos(pos);
                const address = await reverseGeocode(pos.lat, pos.lon);
                setQuery(address);
                onSelect({ ...pos, address });
              }}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

const BusSearch = () => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState("route");
  const [from, setFrom] = useState({ lat: "", lon: "" });
  const [to, setTo] = useState({ lat: "", lon: "" });
  const [deviceId, setDeviceId] = useState("");
  const [busName, setBusName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res;

      if (searchType === "route") {
        if (!from.lat || !from.lon || !to.lat || !to.lon) {
          alert(t("busSearch.selectBothLocations"));
          return;
        }
        console.log(from);
        console.log(to);
        res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/Myroute/find-bus`,
          {
            fromLat: from.lat,
            fromLng: from.lon,
            toLat: to.lat,
            toLng: to.lon,
          }
        );
        console.log(res);
      } else if (searchType === "device") {
        if (!deviceId) return alert(t("busSearch.enterDeviceId"));
        res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/Myroute/find-bus-By-id`,
          {
            DeviceId: deviceId,
          }
        );
      } else if (searchType === "name") {
        if (!busName) return alert(t("busSearch.enterBusName"));
        res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/Myroute/find-bus-bu-name`,
          {
            BusName: busName,
          }
        );
      }
      toast(res.data.message);
      const data = res.data;

      if (data.success) {
        if (searchType === "route") {
          dispatch(setpath(data));
          dispatch(
            addToHistory({
              type: res.data.type,
              pathCoordinates: res.data.pathCoordinates,
              pathAddresses: res.data.pathAddresses,
              busesUsed: res.data.busesUsed,
            })
          );
        }

        console.log(data);

        if (searchType === "route") setResults(data);
        else if (searchType === "device") setResults([data.allbus]);
        else setResults(data.allBus || []);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("busSearch.errorOccurred");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canSearch = () => {
    if (searchType === "route") return from.lat && from.lon && to.lat && to.lon;
    if (searchType === "device") return deviceId.trim().length > 0;
    if (searchType === "name") return busName.trim().length > 0;
    return false;
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background Elements */}
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
      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Bus
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
            {t("busSearch.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("busSearch.pageDescription")}
          </p>
        </div>

        {/* Search Card */}
        <div
          className={`rounded-3xl shadow-2xl p-8 mb-8 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-8 text-center ${
              darktheme ? "text-white" : "text-gray-800"
            }`}
          >
            {t("busSearch.searchOptions")}
          </h2>

          {/* Search Type Selector */}
          <div className="flex justify-center mb-8">
            <div
              className={`rounded-2xl p-2 transition-all duration-200 inline-flex flex-wrap gap-2 ${
                darktheme
                  ? "bg-gray-900/50 border border-gray-700"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full mt-6">
                <button
                  onClick={() => setSearchType("route")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 ${
                    searchType === "route"
                      ? darktheme
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : darktheme
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  {t("busSearch.byRoute")}
                </button>

                <button
                  onClick={() => setSearchType("device")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 ${
                    searchType === "device"
                      ? darktheme
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : darktheme
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <Navigation className="w-5 h-5" />
                  {t("busSearch.byDeviceId")}
                </button>

                <button
                  onClick={() => setSearchType("name")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 ${
                    searchType === "name"
                      ? darktheme
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : darktheme
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <Bus className="w-5 h-5" />
                  {t("busSearch.byBusName")}
                </button>
              </div>
            </div>
          </div>

          {/* Route Search */}
          {searchType === "route" && (
            <div>
              <PlaceSearch
                label={t("busSearch.from")}
                enableUseMyLocation={true}
                onSelect={(place) =>
                  setFrom({ lat: place.lat, lon: place.lon })
                }
              />
              <PlaceSearch
                label={t("busSearch.to")}
                onSelect={(place) => setTo({ lat: place.lat, lon: place.lon })}
              />
            </div>
          )}

          {/* Device Search */}
          {searchType === "device" && (
            <div className="max-w-md mx-auto">
              <label
                className={`block text-sm font-semibold mb-3 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("busSearch.enterDeviceIdLabel")}
              </label>
              <input
                placeholder={t("busSearch.deviceIdPlaceholder")}
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
                  darktheme
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />
            </div>
          )}

          {/* Name Search */}
          {searchType === "name" && (
            <div className="max-w-md mx-auto">
              <label
                className={`block text-sm font-semibold mb-3 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("busSearch.enterBusNameLabel")}
              </label>
              <input
                placeholder={t("busSearch.busNamePlaceholder")}
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
                  darktheme
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />
            </div>
          )}

          {/* Search Button */}
          <div className="text-center mt-8 space-y-4">
            <button
              onClick={handleSearch}
              disabled={!canSearch() || loading}
              className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto ${
                canSearch() && !loading
                  ? darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-2xl hover:scale-105"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-105"
                  : darktheme
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t("busSearch.searching")}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>{t("busSearch.searchBuses")}</span>
                </>
              )}
            </button>

            {searchType === "route" && results && (
              <button
                className={`px-10 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto ${
                  darktheme
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                } hover:shadow-2xl hover:scale-105`}
                onClick={() => navigate("/fllow/path")}
              >
                <Zap className="w-5 h-5" />
                <span>{t("busSearch.startJourney")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Tips */}
          <div className="mt-6 text-center">
            <p
              className={`text-sm ${
                darktheme ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {searchType === "route" && t("busSearch.routeTip")}
              {searchType === "device" && t("busSearch.deviceTip")}
              {searchType === "name" && t("busSearch.nameTip")}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {searchType === "route" && results ? (
            <>
              {results.type === "direct" && (
                <div
                  className={`space-y-6 rounded-3xl shadow-2xl p-8 border backdrop-blur-sm ${
                    darktheme
                      ? "bg-gray-800/80 border-gray-700/50"
                      : "bg-white/90 border-white/50"
                  }`}
                >
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className={`p-3 rounded-2xl mb-3 ${
                        darktheme ? "bg-green-500/20" : "bg-green-100"
                      }`}
                    >
                      <MapPin
                        className={`w-6 h-6 ${
                          darktheme ? "text-green-400" : "text-green-600"
                        }`}
                      />
                    </div>
                    <h2
                      className={`text-xl font-bold ${
                        darktheme ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      {t("busSearch.start")}
                    </h2>
                    <p
                      className={`text-sm mt-2 text-center max-w-md ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {results.pathAddresses?.[0].address}
                    </p>
                  </div>

                  {results.busesUsed.map((bus, idx) => {
                    const isLast = idx === results.busesUsed.length - 1;
                    const changeLocation = results.pathAddresses?.[idx + 2];

                    return (
                      <div key={bus._id} className="relative">
                        {!isLast && (
                          <div className="flex items-center justify-center my-6">
                            <div
                              className={`flex items-center gap-3 px-4 py-2 rounded-full ${
                                darktheme
                                  ? "bg-yellow-500/20 border border-yellow-500/30"
                                  : "bg-yellow-100 border border-yellow-200"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  darktheme ? "bg-yellow-400" : "bg-yellow-500"
                                }`}
                              ></div>
                              <span
                                className={`text-sm font-semibold ${
                                  darktheme
                                    ? "text-yellow-400"
                                    : "text-yellow-700"
                                }`}
                              >
                                {t("busSearch.changeHere")}
                              </span>
                            </div>
                          </div>
                        )}

                        <Card
                          className={`shadow-xl border-l-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                            darktheme
                              ? "bg-gradient-to-r from-gray-700 to-gray-800 border-purple-500 hover:shadow-purple-500/20"
                              : "bg-white border-purple-500 hover:shadow-2xl"
                          }`}
                          onClick={() => navigate(`bus/${bus.deviceID}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-xl ${
                                  darktheme
                                    ? "bg-purple-500/20"
                                    : "bg-purple-100"
                                }`}
                              >
                                <Bus
                                  className={`w-8 h-8 ${
                                    darktheme
                                      ? "text-purple-400"
                                      : "text-purple-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <h3
                                  className={`font-bold text-lg mb-1 ${
                                    darktheme ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {t("busSearch.bus")} {bus.name}
                                </h3>
                                <p
                                  className={`text-sm mb-1 flex items-center gap-2 ${
                                    darktheme
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                  {t("busSearch.route")} {bus.from} → {bus.to}
                                </p>
                                <p
                                  className={`text-sm mb-1 flex items-center gap-2 ${
                                    darktheme
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <Navigation className="w-4 h-4" />
                                  {t("busSearch.device")} {bus.deviceID}
                                </p>
                                <p
                                  className={`text-sm flex items-center gap-2 ${
                                    darktheme
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                  {bus.nextStartTime.startTime}{" "}
                                  {t("busSearch.to")}{" "}
                                  {bus.nextStartTime.endTime}
                                </p>
                              </div>
                              <ArrowRight
                                className={`w-6 h-6 ${
                                  darktheme ? "text-gray-600" : "text-gray-400"
                                }`}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {changeLocation?.address && !isLast && (
                          <div className="text-center mt-4">
                            <p
                              className={`text-sm ${
                                darktheme ? "text-gray-500" : "text-gray-600"
                              }`}
                            >
                              {changeLocation.address}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex flex-col items-center mt-6">
                    <div
                      className={`p-3 rounded-2xl mb-3 ${
                        darktheme ? "bg-red-500/20" : "bg-red-100"
                      }`}
                    >
                      <MapPin
                        className={`w-6 h-6 ${
                          darktheme ? "text-red-400" : "text-red-600"
                        }`}
                      />
                    </div>
                    <h2
                      className={`text-xl font-bold ${
                        darktheme ? "text-red-400" : "text-red-700"
                      }`}
                    >
                      {t("busSearch.destination")}
                    </h2>
                    <p
                      className={`text-sm mt-2 text-center max-w-md ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {
                        results.pathAddresses?.[
                          results.pathAddresses.length - 1
                        ]?.address
                      }
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : Array.isArray(results) && results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((bus, idx) => (
                <Card
                  key={idx}
                  className={`shadow-xl rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
                    darktheme
                      ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:shadow-blue-500/20"
                      : "bg-white border-gray-200 hover:shadow-2xl"
                  }`}
                  onClick={() => navigate(`bus/${bus.deviceID}`)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        darktheme ? "bg-blue-500/20" : "bg-blue-100"
                      }`}
                    >
                      <Bus
                        className={`w-7 h-7 ${
                          darktheme ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h2
                        className={`text-lg font-bold mb-1 ${
                          darktheme ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {t("busSearch.busName")} {bus.name || "N/A"}
                      </h2>
                      <p
                        className={`text-sm mb-1 flex items-center gap-2 ${
                          darktheme ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Navigation className="w-4 h-4" />
                        {t("busSearch.deviceId")} {bus.deviceID}
                      </p>
                      <p
                        className={`text-sm mb-1 flex items-center gap-2 ${
                          darktheme ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        {t("busSearch.route")} {bus.from} → {bus.to}
                      </p>
                      {bus.driver && (
                        <p
                          className={`text-sm flex items-center gap-2 ${
                            darktheme ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          {t("busSearch.driverId")} {bus.driver}
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      className={`w-6 h-6 ${
                        darktheme ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading &&
            results === null && (
              <div
                className={`rounded-3xl shadow-2xl p-12 text-center border backdrop-blur-sm ${
                  darktheme
                    ? "bg-gray-800/80 border-gray-700/50"
                    : "bg-white/90 border-white/50"
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                    darktheme ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Bus
                    className={`w-12 h-12 ${
                      darktheme ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("busSearch.noBusesFound")}
                </h3>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {t("busSearch.adjustSearch")}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BusSearch;
