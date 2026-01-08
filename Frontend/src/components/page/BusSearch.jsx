import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Bus, Search, Navigation } from "lucide-react";
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
        className={`block mb-2 font-medium text-sm ${darktheme ? "text-gray-300" : "text-gray-700"
          }`}
      >
        {label}
      </label>

      <MicInput
        type="text"
        value={query}
        placeholder={t("busSearch.typePlaceholder")}
        onChange={(e) => handleSearch(e.target.value)}
        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
            ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900"
          }`}
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className={`text-sm mt-2 underline font-medium transition-colors ${darktheme
              ? "text-green-400 hover:text-green-300"
              : "text-green-600 hover:text-green-700"
            }`}
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? t("busSearch.gettingLocation") : t("busSearch.useMyLocation")}
        </button>
      )}

      {loading && (
        <p
          className={`text-sm mt-2 ${darktheme ? "text-gray-400" : "text-gray-500"
            }`}
        >
          {t("busSearch.searching")}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          className={`absolute z-10 w-full shadow-xl rounded-xl mt-2 max-h-60 overflow-y-auto border ${darktheme
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
            }`}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className={`p-3 cursor-pointer text-sm transition-colors border-b last:border-b-0 ${darktheme
                  ? "hover:bg-gray-700 text-gray-200 border-gray-600"
                  : "hover:bg-green-50 text-gray-900 border-gray-200"
                }`}
              onClick={() => {
                const pos = { lat: parseFloat(s.lat), lon: parseFloat(s.lon) };
                setQuery(s.display_name);
                setSelectedPos(pos);
                onSelect({ ...pos, address: s.display_name });
                setSuggestions([]);
              }}
            >
              <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {selectedPos && (
        <div
          className={`mt-4 h-64 rounded-xl overflow-hidden shadow-lg border ${darktheme ? "border-gray-600" : "border-gray-200"
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
        error.response?.data?.message || error.message || t("busSearch.errorOccurred");
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
      className={`min-h-screen ${darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
    >
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-800"
              }`}
          >
            {t("busSearch.pageTitle")}
          </h1>
          <p
            className={`text-lg ${darktheme ? "text-gray-300" : "text-gray-600"
              }`}
          >
            {t("busSearch.pageDescription")}
          </p>
        </div>

        {/* Search Card */}
        <div
          className={`rounded-2xl shadow-xl p-8 mb-8 border ${darktheme
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-green-100"
            }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 text-center ${darktheme ? "text-white" : "text-gray-800"
              }`}
          >
            {t("busSearch.searchOptions")}
          </h2>

          {/* Search Type Selector */}
          <div className="flex justify-center mb-6">
            <div
              className={`rounded-full p-2 transition-all duration-200 inline-flex flex-wrap gap-2 ${darktheme ? "bg-gray-700" : "bg-gray-100"
                }`}
            >
              <button
                onClick={() => setSearchType("route")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${searchType === "route"
                    ? "bg-green-500 text-white shadow-lg"
                    : darktheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                {t("busSearch.byRoute")}
              </button>
              <button
                onClick={() => setSearchType("device")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${searchType === "device"
                    ? "bg-green-500 text-white shadow-lg"
                    : darktheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <Navigation className="w-4 h-4 inline mr-2" />
                {t("busSearch.byDeviceId")}
              </button>
              <button
                onClick={() => setSearchType("name")}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${searchType === "name"
                    ? "bg-green-500 text-white shadow-lg"
                    : darktheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <Bus className="w-4 h-4 inline mr-2" />
                {t("busSearch.byBusName")}
              </button>
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
                className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                {t("busSearch.enterDeviceIdLabel")}
              </label>
              <input
                placeholder={t("busSearch.deviceIdPlaceholder")}
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                  }`}
              />
            </div>
          )}

          {/* Name Search */}
          {searchType === "name" && (
            <div className="max-w-md mx-auto">
              <label
                className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                {t("busSearch.enterBusNameLabel")}
              </label>
              <input
                placeholder={t("busSearch.busNamePlaceholder")}
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                  }`}
              />
            </div>
          )}

          {/* Search Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSearch}
              disabled={!canSearch() || loading}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg transform flex items-center mx-auto ${canSearch() && !loading
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105"
                  : darktheme
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? t("busSearch.searching") : t("busSearch.searchBuses")}
            </button>

            {searchType === "route" && results && (
              <button
                className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/fllow/path")}
              >
                {t("busSearch.startJourney")}
              </button>
            )}
          </div>

          {/* Search Tips */}
          <div className="mt-4 text-center">
            <p
              className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
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
                  className={`space-y-6 rounded-2xl shadow-xl p-8 border ${darktheme
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-green-100"
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <h2
                      className={`text-lg font-bold ${darktheme ? "text-green-400" : "text-green-700"
                        }`}
                    >
                      {t("busSearch.start")}
                    </h2>
                    <p
                      className={`text-xs mt-1 ${darktheme ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      {results.pathAddresses?.[0]?.address ||
                        t("busSearch.unknownStartLocation")}
                    </p>
                  </div>

                  {results.busesUsed.map((bus) => (
                    <Card
                      key={bus._id}
                      className={`shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow duration-300 ${darktheme ? "bg-gray-700" : "bg-white"
                        }`}
                      onClick={() => navigate(`bus/${bus.deviceID}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Bus className="w-8 h-8 text-green-600" />
                          <div>
                            <h3
                              className={`font-semibold text-lg ${darktheme ? "text-white" : "text-gray-900"
                                }`}
                            >
                              {bus.name || "N/A"}
                            </h3>
                            <p
                              className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-600"
                                }`}
                            >
                              {t("busSearch.route")} {bus.from || "N/A"} → {bus.to || "N/A"}
                            </p>
                            <p
                              className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              {t("busSearch.device")} {bus.deviceID}
                            </p>
                            {bus.nextStartTime && (
                              <p
                                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                                  }`}
                              >
                                {t("busSearch.time")} {bus.nextStartTime.startTime} {t("busSearch.to")} {bus.nextStartTime.endTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex flex-col items-center">
                    <h2
                      className={`text-lg font-bold ${darktheme ? "text-red-400" : "text-red-700"
                        }`}
                    >
                      {t("busSearch.destination")}
                    </h2>
                    <p
                      className={`text-xs mt-1 ${darktheme ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      {results.pathAddresses?.[results.pathAddresses.length - 1]
                        ?.address || t("busSearch.unknownDestination")}
                    </p>
                  </div>
                </div>
              )}

              {results.type === "multi-hop" && (
                <div
                  className={`space-y-6 rounded-2xl shadow-xl p-8 border ${darktheme
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-green-100"
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <h2
                      className={`text-lg font-bold ${darktheme ? "text-green-400" : "text-green-700"
                        }`}
                    >
                      {t("busSearch.start")}
                    </h2>
                    <p
                      className={`text-xs mt-1 ${darktheme ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      {results.pathAddresses?.[0].address}
                    </p>
                  </div>

                  {results.busesUsed.map((bus, idx) => {
                    const isLast = idx === results.busesUsed.length - 1;
                    const changeLocation = results.pathAddresses?.[idx + 2];

                    return (
                      <div
                        key={bus._id}
                        className="flex items-start gap-6"
                        onClick={() => navigate(`bus/${bus.deviceID}`)}
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-1 h-12 ${darktheme ? "bg-gray-600" : "bg-gray-400"
                              }`}
                          ></div>
                          <div
                            className={`text-sm font-medium text-center ${darktheme ? "text-gray-300" : "text-gray-700"
                              }`}
                          >
                            {isLast ? t("busSearch.destination") : t("busSearch.changeHere")}
                            {changeLocation?.address && (
                              <p
                                className={`text-xs mt-1 ${darktheme ? "text-gray-400" : "text-gray-500"
                                  }`}
                              >
                                {changeLocation.address}
                              </p>
                            )}
                          </div>
                          <div
                            className={`w-1 h-12 ${darktheme ? "bg-gray-600" : "bg-gray-400"
                              }`}
                          ></div>
                        </div>

                        <Card
                          className={`flex-1 shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow duration-300 ${darktheme ? "bg-gray-700" : "bg-white"
                            }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Bus className="w-8 h-8 text-green-600" />
                              <div>
                                <h3
                                  className={`font-semibold text-lg ${darktheme ? "text-white" : "text-gray-900"
                                    }`}
                                >
                                  {t("busSearch.bus")} {bus.name}
                                </h3>
                                <p
                                  className={`text-sm ${darktheme
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                    }`}
                                >
                                  {t("busSearch.route")} {bus.from} → {bus.to}
                                </p>
                                <p
                                  className={`text-sm ${darktheme
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                    }`}
                                >
                                  {t("busSearch.device")} {bus.deviceID}
                                </p>
                                <p
                                  className={`text-sm ${darktheme
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                    }`}
                                >
                                  {t("busSearch.time")} {bus.nextStartTime.startTime} {t("busSearch.to")} {bus.nextStartTime.endTime}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : Array.isArray(results) && results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((bus, idx) => (
                <Card
                  key={idx}
                  className={`shadow-lg rounded-2xl cursor-pointer hover:shadow-xl transition-shadow duration-300 border ${darktheme
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-green-100"
                    }`}
                  onClick={() => navigate(`bus/${bus.deviceID}`)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${darktheme ? "bg-green-900" : "bg-green-100"
                        }`}
                    >
                      <Bus className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2
                        className={`text-lg font-semibold ${darktheme ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {t("busSearch.busName")} {bus.name || "N/A"}
                      </h2>
                      <p
                        className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        {t("busSearch.deviceId")} {bus.deviceID}
                      </p>
                      <p
                        className={`text-sm ${darktheme ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        {t("busSearch.route")} {bus.from} → {bus.to}
                      </p>
                      {bus.driver && (
                        <p
                          className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                          {t("busSearch.driverId")} {bus.driver}
                        </p>
                      )}
                    </div>
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !loading &&
            results === null && (
              <div
                className={`rounded-2xl shadow-xl p-12 text-center border ${darktheme
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                  }`}
              >
                <Bus
                  className={`w-16 h-16 mx-auto mb-4 ${darktheme ? "text-gray-600" : "text-gray-300"
                    }`}
                />
                <p
                  className={`text-lg ${darktheme ? "text-gray-300" : "text-gray-500"
                    }`}
                >
                  {t("busSearch.noBusesFound")}
                </p>
                <p
                  className={`text-sm mt-2 ${darktheme ? "text-gray-500" : "text-gray-400"
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