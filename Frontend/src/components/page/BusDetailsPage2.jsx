import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Clock,
  Gauge,
  Route as RouteIcon,
  User,
  Mail,
  CreditCard,
  Award,
  Ticket,
  Star,
  Navigation,
  Activity,
  Sparkles,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useApiCall } from "../../hooks/useApiCall";
import { toast } from "sonner";

const busIcon = new L.DivIcon({
  html: "🚌",
  className: "text-3xl",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function Routing({ path }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length < 2) return;

    const route = L.Routing.control({
      waypoints: path.map((p) => L.latLng(p.coordinates[0], p.coordinates[1])),
      addWaypoints: false,
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      show: false,
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(route);
  }, [map, path]);

  return null;
}

const BusDetailsPage2 = () => {
  const { deviceID } = useParams();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/Myroute/bus-details/${deviceID}`,
        );
        const data = await res.json();
        setBus(data);
      } catch (err) {
        console.error(t("busDetails.errorFetchingBus"), err);
        toast.error(t("busDetails.errorFetchingBus"));
      } finally {
        setLoading(false);
      }
    };
    fetchBusData();
  }, [deviceID, t]);

  useEffect(() => {
    if (!bus?.timeSlots) return;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    const active = bus.timeSlots.find(
      (slot) => currentTime >= slot.startTime && currentTime <= slot.endTime,
    );
    setActiveSlot(active);
  }, [bus]);

  // Loading state
  if (loading) {
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
        <Navbar />
        <div
          className={`rounded-3xl shadow-2xl p-12 flex flex-col items-center backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <span
            className={`text-xl font-semibold ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("busDetails.loadingMessage")}
          </span>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`rounded-3xl shadow-2xl p-8 mb-6 backdrop-blur-sm border ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <h1
              className={`text-4xl font-bold mb-4 bg-gradient-to-r ${
                darktheme
                  ? "from-blue-400 via-purple-400 to-pink-400"
                  : "from-blue-600 via-purple-600 to-pink-600"
              } bg-clip-text text-transparent`}
            >
              {bus.name}
            </h1>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                darktheme
                  ? "bg-blue-500/10 border border-blue-500/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <Navigation
                className={`w-4 h-4 ${
                  darktheme ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span
                className={`font-semibold ${
                  darktheme ? "text-blue-400" : "text-blue-700"
                }`}
              >
                {bus.deviceID}
              </span>
            </div>

            <div
              className={`flex items-center justify-center gap-3 mb-6 ${
                darktheme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    darktheme ? "bg-green-500/20" : "bg-green-100"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      darktheme ? "text-green-400" : "text-green-600"
                    }`}
                  />
                </div>
                <span className="font-semibold">{bus.from}</span>
              </div>
              <div className="text-2xl">→</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{bus.to}</span>
                <div
                  className={`p-2 rounded-lg ${
                    darktheme ? "bg-red-500/20" : "bg-red-100"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      darktheme ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(`/bus/review/${bus.deviceID}`)}
                className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                  darktheme
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200"
                } hover:scale-105`}
              >
                <Star className="w-5 h-5" />
                {t("busDetails.reviewButton")}
              </Button>

              <Button
                onClick={() => navigate(`/makepayment/${bus.deviceID}`)}
                className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                  darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                } hover:scale-105`}
              >
                <Ticket className="w-5 h-5" />
                {t("busDetails.getTicketButton")}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div
              className={`rounded-3xl shadow-2xl p-6 backdrop-blur-sm border ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 rounded-xl ${
                    darktheme ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <User
                    className={`w-5 h-5 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("busDetails.driverDetails")}
                </h3>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={bus.driver.picture}
                    alt={bus.driver.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg"
                  />
                  <Sparkles
                    className={`absolute -top-2 -right-2 w-5 h-5 ${
                      darktheme ? "text-yellow-400" : "text-yellow-500"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-bold text-lg mb-1 ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {bus.driver.name}
                  </p>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <p className="truncate">{bus.driver.email}</p>
                  </div>
                </div>
              </div>

              <div
                className={`space-y-3 rounded-2xl p-4 border ${
                  darktheme
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darktheme ? "bg-purple-500/20" : "bg-purple-100"
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 ${
                        darktheme ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {t("busDetails.licenseId")}
                    </p>
                    <p
                      className={`font-semibold ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {bus.driver.licenceId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darktheme ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <Award
                      className={`w-4 h-4 ${
                        darktheme ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {t("busDetails.experience")}
                    </p>
                    <p
                      className={`font-semibold ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {bus.driver.driverExp} {t("busDetails.years")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div
              className={`rounded-3xl shadow-2xl p-6 backdrop-blur-sm border ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 rounded-xl ${
                    darktheme ? "bg-orange-500/20" : "bg-orange-100"
                  }`}
                >
                  <Clock
                    className={`w-5 h-5 ${
                      darktheme ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("busDetails.timeSlots")}
                </h3>
              </div>
              <div className="space-y-3">
                {bus.timeSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`p-4 rounded-xl text-center font-semibold transition-all duration-300 ${
                      activeSlot && activeSlot._id === slot._id
                        ? darktheme
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105 ring-2 ring-green-500/50"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                        : darktheme
                          ? "bg-gray-900/50 text-gray-300 border border-gray-700 hover:border-gray-600"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                    {activeSlot && activeSlot._id === slot._id && (
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span>Active Now</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map & Stats */}
          <div
            className={`col-span-1 lg:col-span-2 rounded-3xl shadow-2xl p-6 backdrop-blur-sm border ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
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
              <h3
                className={`text-xl font-bold ${
                  darktheme ? "text-white" : "text-gray-800"
                }`}
              >
                {t("busDetails.liveLocation")}
              </h3>
              <div
                className={`flex items-center gap-2 ml-auto px-3 py-1.5 rounded-full ${
                  darktheme
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-semibold ${
                    darktheme ? "text-red-400" : "text-red-600"
                  }`}
                >
                  LIVE
                </span>
              </div>
            </div>

            <MapContainer
              center={bus.liveLocation.coordinates}
              zoom={14}
              style={{ height: "400px", width: "100%", borderRadius: "16px" }}
              className="mb-6 shadow-lg"
            >
              <TileLayer
                url={
                  darktheme
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              <Routing path={bus.path} />
              <Marker position={bus.liveLocation.coordinates} icon={busIcon}>
                <Popup>
                  <b>{t("busDetails.busLiveLocation")}</b>
                  <br />
                  {bus.name}
                </Popup>
              </Marker>
            </MapContainer>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {
                  icon: Gauge,
                  label: t("busDetails.speed"),
                  value: `${bus.speed} ${t("busDetails.kmh")}`,
                  color: "green",
                },
                {
                  icon: RouteIcon,
                  label: t("busDetails.total"),
                  value: `${bus.totalDistance} ${t("busDetails.km")}`,
                  color: "gray",
                },
                {
                  icon: MapPin,
                  label: t("busDetails.covered"),
                  value: `${bus.coveredDistance} ${t("busDetails.km")}`,
                  color: "blue",
                },
                {
                  icon: RouteIcon,
                  label: t("busDetails.remaining"),
                  value: `${bus.remainingDistance} ${t("busDetails.km")}`,
                  color: "orange",
                },
                {
                  icon: Clock,
                  label: t("busDetails.eta"),
                  value: bus.ETA,
                  color: "purple",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-4 text-center border ${
                      darktheme
                        ? `bg-${stat.color}-500/10 border-${stat.color}-500/30`
                        : `bg-${stat.color}-50 border-${stat.color}-200`
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        darktheme
                          ? `text-${stat.color}-400`
                          : `text-${stat.color}-600`
                      }`}
                    />
                    <p
                      className={`text-xs mb-1 ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`font-bold text-sm ${
                        darktheme ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusDetailsPage2;
