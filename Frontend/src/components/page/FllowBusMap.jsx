import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import Navbar from "../shared/Navbar";
import { useTranslation } from "react-i18next";
import { MapPin, Navigation, Clock, Bus, Zap, Radio } from "lucide-react";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const Routing = ({ pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: pathCoordinates.map((coords) => L.latLng(...coords)),
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      lineOptions: {
        styles: [{ color: "blue", weight: 3 }],
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [pathCoordinates, map]);

  return null;
};

const userIcon = L.icon({
  iconUrl:
    "https://www.citypng.com/public/uploads/preview/red-gps-location-symbol-icon-hd-png-701751695035446zkphf8tfr3.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const TimelineBusIcon = () => (
  <div
    style={{
      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
      color: "white",
      fontSize: 20,
      width: 40,
      height: 40,
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "3px solid white",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    }}
  >
    🚌
  </div>
);

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getUserStepIndex = (userLocation, pathCoordinates) => {
  if (!userLocation) return null;

  const distances = pathCoordinates.map(([lat, lon]) =>
    getDistance(userLocation[0], userLocation[1], lat, lon),
  );

  const minDistance = Math.min(...distances);
  let closestIndex = distances.indexOf(minDistance);

  const distToStart = getDistance(
    userLocation[0],
    userLocation[1],
    ...pathCoordinates[0],
  );
  const distToEnd = getDistance(
    userLocation[0],
    userLocation[1],
    ...pathCoordinates[pathCoordinates.length - 1],
  );

  const snapThreshold = 100;

  if (distToStart < snapThreshold) return 0;
  if (distToEnd < snapThreshold) return pathCoordinates.length - 1;

  if (userLocation[0] < pathCoordinates[0][0] - 0.001) return 0;

  if (userLocation[0] > pathCoordinates[pathCoordinates.length - 1][0] + 0.001)
    return pathCoordinates.length - 1;

  return closestIndex;
};

const FllowBusMap = () => {
  const { path, darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (err) => {
        console.error("Error getting location", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!path || !path.pathCoordinates || path.pathCoordinates.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 left-10 w-96 h-96 ${
              darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
            } rounded-full blur-3xl animate-pulse`}
          ></div>
        </div>
        <div
          className={`text-center text-xl font-medium ${
            darktheme ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("followBusMap.loadingMap")}
        </div>
      </div>
    );
  }

  const { pathCoordinates, pathAddresses, busesUsed } = path;
  const center = pathCoordinates[0];
  const userStepIndex = getUserStepIndex(userLocation, pathCoordinates);

  const extractStreetOrPlace = (fullAddress) => {
    const parts = fullAddress.split(",");
    return parts.length >= 2 ? parts.slice(0, 2).join(", ") : fullAddress;
  };

  return (
    <div
      className={`w-full min-h-screen relative overflow-hidden ${
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

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Navigation
                className={`w-8 h-8 ${
                  darktheme ? "text-blue-400" : "text-white"
                }`}
              />
            </div>
          </div>
          <h1
            className={`text-4xl font-bold mb-3 bg-gradient-to-r ${
              darktheme
                ? "from-blue-400 via-purple-400 to-pink-400"
                : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            Live Journey Tracking
          </h1>
          <div
            className={`flex items-center justify-center gap-2 mt-4 ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <Radio
              className={`w-5 h-5 ${
                darktheme ? "text-green-400" : "text-green-600"
              } animate-pulse`}
            />
            <span className="font-medium">
              Tracking your location in real-time
            </span>
          </div>
        </div>

        {/* Map Section */}
        <div
          className={`rounded-3xl shadow-2xl overflow-hidden mb-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-xl ${
                  darktheme ? "bg-green-500/20" : "bg-green-100"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 ${
                    darktheme ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <h2
                className={`text-xl font-bold ${
                  darktheme ? "text-white" : "text-gray-800"
                }`}
              >
                Route Map
              </h2>
            </div>
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "500px", width: "100%", borderRadius: "16px" }}
            >
              <TileLayer
                url={
                  darktheme
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Routing pathCoordinates={pathCoordinates} />

              {pathAddresses.slice(1, -1).map((loc, idx) => (
                <Marker key={idx} position={loc.coordinates}>
                  <Popup>{extractStreetOrPlace(loc.address)}</Popup>
                </Marker>
              ))}

              {busesUsed.map((bus, idx) => {
                const coordIndex =
                  idx < pathCoordinates.length
                    ? idx
                    : pathCoordinates.length - 1;
                return (
                  <Marker
                    key={`bus-${idx}`}
                    position={pathCoordinates[coordIndex]}
                  >
                    <Popup>
                      <div>
                        <strong>{t("followBusMap.busName")}:</strong> {bus.name}
                        <br />
                        <strong>{t("followBusMap.from")}:</strong> {bus.from}
                        <br />
                        <strong>{t("followBusMap.to")}:</strong> {bus.to}
                        <br />
                        <strong>{t("followBusMap.time")}:</strong>{" "}
                        {bus.nextStartTime?.startTime}{" "}
                        {t("followBusMap.timeTo")} {bus.nextStartTime?.endTime}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>{t("followBusMap.yourLocation")}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Journey Timeline */}
        <div
          className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className={`p-2 rounded-xl ${
                darktheme ? "bg-purple-500/20" : "bg-purple-100"
              }`}
            >
              <Zap
                className={`w-5 h-5 ${
                  darktheme ? "text-purple-400" : "text-purple-600"
                }`}
              />
            </div>
            <h2
              className={`text-xl font-bold ${
                darktheme ? "text-white" : "text-gray-800"
              }`}
            >
              Journey Timeline
            </h2>
          </div>

          <div className="relative pl-8">
            {/* Vertical Line */}
            <div
              className={`absolute left-4 top-0 bottom-0 w-0.5 ${
                darktheme ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>

            {pathAddresses.map((addr, idx) => {
              const isStart = idx === 0;
              const isEnd = idx === pathAddresses.length - 1;
              const hasBus = busesUsed[idx];
              const showBusIcon = userStepIndex === idx;

              if (!isStart && !isEnd && !hasBus && !showBusIcon) return null;

              return (
                <div key={`step-${idx}`} className="relative mb-8 last:mb-0">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-[-18px] top-2 w-4 h-4 rounded-full border-4 ${
                      isStart
                        ? darktheme
                          ? "bg-green-500 border-green-400"
                          : "bg-green-500 border-green-400"
                        : isEnd
                          ? darktheme
                            ? "bg-red-500 border-red-400"
                            : "bg-red-500 border-red-400"
                          : darktheme
                            ? "bg-blue-500 border-blue-400"
                            : "bg-blue-500 border-blue-400"
                    }`}
                  ></div>

                  {/* User Bus Icon */}
                  {showBusIcon && (
                    <div
                      className="absolute -left-[38px] top-0"
                      title={t("followBusMap.yourLocationTooltip")}
                    >
                      <TimelineBusIcon />
                    </div>
                  )}

                  {/* Content */}
                  <div className="pl-4">
                    {/* Label */}
                    <div
                      className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                        isStart
                          ? darktheme
                            ? "text-green-400"
                            : "text-green-600"
                          : isEnd
                            ? darktheme
                              ? "text-red-400"
                              : "text-red-600"
                            : darktheme
                              ? "text-blue-400"
                              : "text-blue-600"
                      }`}
                    >
                      {isStart
                        ? t("followBusMap.start")
                        : isEnd
                          ? t("followBusMap.destination")
                          : t("followBusMap.changeHere")}
                    </div>

                    {/* Address */}
                    {(isStart || isEnd || hasBus) && (
                      <div
                        className={`text-sm mb-3 ${
                          darktheme ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {addr.address}
                      </div>
                    )}

                    {/* Bus Info Card */}
                    {hasBus && (
                      <div
                        className={`rounded-2xl p-5 border ${
                          darktheme
                            ? "bg-gray-900/50 border-blue-500/30"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`p-2 rounded-xl ${
                              darktheme ? "bg-blue-500/20" : "bg-blue-100"
                            }`}
                          >
                            <Bus
                              className={`w-5 h-5 ${
                                darktheme ? "text-blue-400" : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              darktheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {busesUsed[idx].name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <Navigation className="w-4 h-4" />
                            <span>
                              <strong>{t("followBusMap.route")}:</strong>{" "}
                              {busesUsed[idx].from} → {busesUsed[idx].to}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                            <span>
                              <strong>{t("followBusMap.device")}:</strong>{" "}
                              {busesUsed[idx].deviceID}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            <span>
                              <strong>{t("followBusMap.time")}:</strong>{" "}
                              {busesUsed[idx].nextStartTime?.startTime}{" "}
                              {t("followBusMap.timeTo")}{" "}
                              {busesUsed[idx].nextStartTime?.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FllowBusMap;
