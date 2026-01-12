import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../shared/Navbar";
import MicInput from "./MicInput";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Sparkles } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const NearbyPOIMap = () => {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const routingControlRef = useRef(null);
  const { darktheme } = useSelector((store) => store.auth);
  const latestRequestRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchMarkerRef = useRef(null);

  const POI_TYPES = [
    { label: t("nearbyPOI.hospital"), tag: "hospital", icon: "🏥" },
    { label: t("nearbyPOI.clinic"), tag: "clinic", icon: "🩺" },
    { label: t("nearbyPOI.pharmacy"), tag: "pharmacy", icon: "💊" },
    { label: t("nearbyPOI.park"), tag: "park", icon: "🌳" },
    { label: t("nearbyPOI.petrolPump"), tag: "fuel", icon: "⛽" },
    { label: t("nearbyPOI.atm"), tag: "atm", icon: "🏧" },
    { label: t("nearbyPOI.bank"), tag: "bank", icon: "🏦" },
    { label: t("nearbyPOI.school"), tag: "school", icon: "🏫" },
    { label: t("nearbyPOI.college"), tag: "college", icon: "🎓" },
    { label: t("nearbyPOI.restaurant"), tag: "restaurant", icon: "🍽️" },
    { label: t("nearbyPOI.supermarket"), tag: "supermarket", icon: "🛒" },
    { label: t("nearbyPOI.busStop"), tag: "bus_station", icon: "🚌" },
    { label: t("nearbyPOI.policeStation"), tag: "police", icon: "🚓" },
    { label: t("nearbyPOI.fireStation"), tag: "fire_station", icon: "🚒" },
    { label: t("nearbyPOI.library"), tag: "library", icon: "📚" },
    { label: t("nearbyPOI.cinema"), tag: "cinema", icon: "🎬" },
  ];

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    const tileUrl = darktheme
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution =
      '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, { attribution }).addTo(map);

    mapInstanceRef.current = map;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ lat, lon });

        map.setView([lat, lon], 14);
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(t("nearbyPOI.youAreHere"))
          .openPopup();
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
    );

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [darktheme, t]);

  const fetchNearbyPlaces = async (type) => {
    if (!userLocation) return [];

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
        way["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
        relation["amenity"="${type}"](around:20000,${userLocation.lat},${userLocation.lon});
      );
      out center 10;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query.trim(),
      });

      const data = await res.json();
      return data.elements.slice(0, 10);
    } catch (error) {
      console.error("Failed to fetch nearby places:", error);
      return [];
    }
  };

  const handleBadgeClick = async (type) => {
    if (selectedType === type) {
      //deselection
      setSelectedType(null);

      if (markersLayer) {
        markersLayer.clearLayers();
        mapInstanceRef.current.removeLayer(markersLayer);
        setMarkersLayer(null);
      }
      return;
    }

    setSelectedType(type);

    const requestId = ++latestRequestRef.current;
    const places = await fetchNearbyPlaces(type);
    if (latestRequestRef.current !== requestId) return; // Prevent race condition

    if (markersLayer) {
      markersLayer.clearLayers();
      mapInstanceRef.current.removeLayer(markersLayer);
    }

    const newLayer = L.layerGroup();
    places.forEach((place) => {
      const lat = place.lat || place.center?.lat;
      const lon = place.lon || place.center?.lon;
      const name = place.tags?.name || t("nearbyPOI.unnamed");

      if (!lat || !lon) return;

      const marker = L.marker([lat, lon]).bindPopup(
        `<strong>${name}</strong><br/>${t("nearbyPOI.type")}: ${type}<br/><button id="go-${lat}-${lon}">${t("nearbyPOI.goHere")}</button>`,
      );

      marker.on("popupopen", () => {
        const btn = document.getElementById(`go-${lat}-${lon}`);
        if (btn) {
          btn.onclick = () => handleRoute(lat, lon);
        }
      });

      newLayer.addLayer(marker);
    });

    newLayer.addTo(mapInstanceRef.current);
    setMarkersLayer(newLayer);
  };

  const handleRoute = (destLat, destLon) => {
    if (!userLocation) return;

    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(destLat, destLon),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
        alternatives: true,
      }),
      showAlternatives: true,
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      altLineOptions: {
        styles: [{ color: "gray", weight: 3, dashArray: "5,5" }],
      },
      addWaypoints: false,
    }).addTo(mapInstanceRef.current);

    routingControlRef.current = control;
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}&addressdetails=1&limit=5`,
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSuggestionClick = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    mapInstanceRef.current.setView([lat, lon], 14);

    if (searchMarkerRef.current) {
      mapInstanceRef.current.removeLayer(searchMarkerRef.current);
    }

    const marker = L.marker([lat, lon])
      .addTo(mapInstanceRef.current)
      .bindPopup(
        `<b>${place.display_name}</b><br/><button id="go-${lat}-${lon}">${t("nearbyPOI.goHere")}</button>`,
      )
      .openPopup();

    marker.on("popupopen", () => {
      const btn = document.getElementById(`go-${lat}-${lon}`);
      if (btn) {
        btn.onclick = () => handleRoute(lat, lon);
      }
    });

    searchMarkerRef.current = marker;
    setSuggestions([]);
    setSearchQuery(place.display_name);
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
          className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? "bg-blue-500/5" : "bg-blue-300/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? "bg-purple-500/5" : "bg-purple-300/20"} rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Navbar />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}
            >
              <MapPin
                className={`w-8 h-8 ${darktheme ? "text-blue-400" : "text-white"}`}
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
            {t("nearbyPOI.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("nearbyPOI.pageDescription")}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-2/5 space-y-6">
            {/* POI Categories */}
            <div
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 rounded-xl ${darktheme ? "bg-purple-500/20" : "bg-purple-100"}`}
                >
                  <Sparkles
                    className={`w-5 h-5 ${darktheme ? "text-purple-400" : "text-purple-600"}`}
                  />
                </div>
                <h2
                  className={`text-xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("nearbyPOI.nearbyPlaces")}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {POI_TYPES.map((type) => (
                  <button
                    key={type.tag}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      selectedType === type.tag
                        ? darktheme
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                        : darktheme
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                    }`}
                    onClick={() => handleBadgeClick(type.tag)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Section */}
            <div
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 rounded-xl ${darktheme ? "bg-blue-500/20" : "bg-blue-100"}`}
                >
                  <Search
                    className={`w-5 h-5 ${darktheme ? "text-blue-400" : "text-blue-600"}`}
                  />
                </div>
                <h2
                  className={`text-xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("nearbyPOI.searchLocation")}
                </h2>
              </div>

              <div className="relative">
                <MicInput
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("nearbyPOI.searchPlaceholder")}
                  className={`w-full border-2 p-4 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />

                {suggestions.length > 0 && (
                  <ul
                    className={`absolute border-2 rounded-2xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 backdrop-blur-sm ${
                      darktheme
                        ? "bg-gray-800/95 border-gray-700"
                        : "bg-white/95 border-gray-200"
                    }`}
                  >
                    {suggestions.map((place) => (
                      <li
                        key={place.place_id}
                        onClick={() => handleSuggestionClick(place)}
                        className={`p-4 cursor-pointer text-sm border-b last:border-b-0 flex items-start gap-3 transition-all ${
                          darktheme
                            ? "text-gray-200 border-gray-700 hover:bg-gray-700"
                            : "text-gray-700 border-gray-100 hover:bg-blue-50"
                        }`}
                      >
                        <MapPin
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darktheme ? "text-blue-400" : "text-blue-600"}`}
                        />
                        <span className="flex-1">{place.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="w-full lg:w-3/5">
            <div
              className={`rounded-3xl p-6 shadow-2xl h-[500px] lg:h-[700px] backdrop-blur-sm border ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-xl ${darktheme ? "bg-green-500/20" : "bg-green-100"}`}
                >
                  <span className="text-xl">🌍</span>
                </div>
                <h2
                  className={`text-xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("nearbyPOI.interactiveMap")}
                </h2>
              </div>

              <div
                ref={mapContainerRef}
                id="map"
                className={`h-[calc(100%-56px)] w-full rounded-2xl border-2 shadow-lg overflow-hidden ${
                  darktheme ? "border-gray-700" : "border-gray-200"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyPOIMap;
