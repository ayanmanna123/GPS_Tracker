import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Bus as BusIcon,
  MapPin,
  Navigation,
  User,
  Mail,
  CreditCard,
  ArrowLeft,
  Plus,
  Radio,
  AlertCircle,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { addActiveBus, removeActiveBus } from "@/Redux/locationSlice";

const Bus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);
  const locationIntervals = useRef({});

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/driver/allBus`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast(res.data.message);
        setBuses(res.data.AllBus || []);
      } catch (error) {
        const msg = error?.response?.data?.message || error.message;
        toast.error(msg || t("bus.fetchError"));
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [getAccessTokenSilently, t]);

  useEffect(() => {
    return () => {
      Object.values(locationIntervals.current).forEach(clearInterval);
    };
  }, []);

  const toggleBusActive = async (busId) => {
    const isActive = activeBusIDs.includes(busId);

    if (isActive) {
      dispatch(removeActiveBus(busId));
      clearInterval(locationIntervals.current[busId]);
      delete locationIntervals.current[busId];
    } else {
      dispatch(addActiveBus(busId));

      const sendLocation = async () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await axios.put(
                `${import.meta.env.VITE_BASE_URL}/update/location`,
                {
                  deviceID: busId,
                  latitude,
                  longitude,
                }
              );
            } catch (err) {
              console.error(t("bus.locationError"), err.message);
            }
          },
          (err) => {
            console.error(t("bus.geolocationError"), err.message);
          }
        );
      };

      sendLocation();
      locationIntervals.current[busId] = setInterval(sendLocation, 5000);
    }
  };

  const handleBusClick = (bus) => {
    navigate(`/bus/${bus.deviceID}`);
  };

  const handleCreateBus = () => {
    navigate("/createbus");
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
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              darktheme
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1
                className={`text-5xl font-bold mb-3 bg-gradient-to-r ${
                  darktheme
                    ? "from-blue-400 via-purple-400 to-pink-400"
                    : "from-blue-600 via-purple-600 to-pink-600"
                } bg-clip-text text-transparent`}
              >
                Bus Fleet Management
              </h1>
              <p
                className={`text-lg ${
                  darktheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Monitor and manage your fleet in real-time
              </p>
            </div>

            <button
              onClick={handleCreateBus}
              className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-3 ${
                darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              } hover:shadow-2xl hover:scale-105`}
            >
              <Plus className="w-5 h-5" />
              Create New Bus
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p
                className={`text-lg font-medium ${
                  darktheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Loading your buses...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className={`rounded-2xl p-8 border ${
              darktheme
                ? "bg-red-500/10 border-red-500/30"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle
                className={`w-6 h-6 ${
                  darktheme ? "text-red-400" : "text-red-600"
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  darktheme ? "text-red-400" : "text-red-700"
                }`}
              >
                Error Loading Buses
              </h3>
            </div>
            <p className={darktheme ? "text-red-300" : "text-red-600"}>
              {error}
            </p>
          </div>
        )}

        {/* Bus Grid */}
        {!loading && !error && (
          <>
            {buses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buses.map((bus) => {
                  const isActive = activeBusIDs.includes(bus.deviceID);

                  return (
                    <div
                      key={bus._id}
                      className={`rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 overflow-hidden border ${
                        darktheme
                          ? "bg-gray-800/80 border-gray-700/50 hover:shadow-blue-500/20"
                          : "bg-white/90 border-white/50 hover:shadow-2xl"
                      } hover:scale-[1.02]`}
                    >
                      {/* Bus Header with Status */}
                      <div
                        className={`p-6 border-b ${
                          darktheme ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1"
                            onClick={() => handleBusClick(bus)}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isActive
                                  ? darktheme
                                    ? "bg-green-500/20 border border-green-500/30"
                                    : "bg-green-100 border border-green-200"
                                  : darktheme
                                  ? "bg-gray-700"
                                  : "bg-gray-100"
                              }`}
                            >
                              <BusIcon
                                className={`w-6 h-6 ${
                                  isActive
                                    ? darktheme
                                      ? "text-green-400"
                                      : "text-green-600"
                                    : darktheme
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-lg font-bold truncate ${
                                  darktheme ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {bus.deviceID}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isActive
                                      ? "bg-green-500 animate-pulse"
                                      : darktheme
                                      ? "bg-gray-600"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs font-medium ${
                                    isActive
                                      ? darktheme
                                        ? "text-green-400"
                                        : "text-green-600"
                                      : darktheme
                                      ? "text-gray-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={isActive}
                              onChange={() => toggleBusActive(bus.deviceID)}
                            />
                            <div
                              className={`w-14 h-7 rounded-full transition-colors ${
                                isActive
                                  ? "bg-green-500"
                                  : darktheme
                                  ? "bg-gray-700"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                                  isActive ? "translate-x-7" : "translate-x-0"
                                }`}
                              ></div>
                            </div>
                          </label>
                        </div>

                        {/* Live Tracking Badge */}
                        {isActive && (
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                              darktheme ? "bg-green-500/10" : "bg-green-50"
                            }`}
                          >
                            <Radio
                              className={`w-4 h-4 ${
                                darktheme ? "text-green-400" : "text-green-600"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                darktheme ? "text-green-400" : "text-green-700"
                              }`}
                            >
                              Live Tracking Active
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Route Information */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg mt-1 ${
                                darktheme ? "bg-blue-500/20" : "bg-blue-100"
                              }`}
                            >
                              <MapPin
                                className={`w-4 h-4 ${
                                  darktheme ? "text-blue-400" : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  darktheme ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                {t("bus.from")}
                              </span>
                              <p
                                className={`text-sm font-medium truncate mt-1 ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {bus.from}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg mt-1 ${
                                darktheme ? "bg-purple-500/20" : "bg-purple-100"
                              }`}
                            >
                              <Navigation
                                className={`w-4 h-4 ${
                                  darktheme
                                    ? "text-purple-400"
                                    : "text-purple-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  darktheme ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                {t("bus.to")}
                              </span>
                              <p
                                className={`text-sm font-medium truncate mt-1 ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {bus.to}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Driver Info */}
                      {bus.driver ? (
                        <div
                          className={`p-6 border-t ${
                            darktheme
                              ? "bg-gray-900/50 border-gray-700"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <h4
                            className={`text-sm font-bold mb-4 flex items-center gap-2 ${
                              darktheme ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            <User className="w-4 h-4" />
                            {t("bus.driverDetails")}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  darktheme ? "bg-gray-800" : "bg-white"
                                }`}
                              >
                                <User
                                  className={`w-3 h-3 ${
                                    darktheme
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-sm ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {bus.driver.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  darktheme ? "bg-gray-800" : "bg-white"
                                }`}
                              >
                                <Mail
                                  className={`w-3 h-3 ${
                                    darktheme
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-sm truncate ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {bus.driver.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  darktheme ? "bg-gray-800" : "bg-white"
                                }`}
                              >
                                <CreditCard
                                  className={`w-3 h-3 ${
                                    darktheme
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-sm ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {t("bus.license")} {bus.driver.licenceId}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-6 border-t text-center ${
                            darktheme
                              ? "bg-gray-900/50 border-gray-700"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <AlertCircle
                            className={`w-8 h-8 mx-auto mb-2 ${
                              darktheme ? "text-gray-600" : "text-gray-400"
                            }`}
                          />
                          <p
                            className={`text-sm font-medium ${
                              darktheme ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {t("bus.noDriverAssigned")}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`rounded-3xl shadow-2xl p-16 text-center backdrop-blur-sm border ${
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
                  <BusIcon
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
                  {t("bus.noBusesFound")}
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    darktheme ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Get started by creating your first bus
                </p>
                <button
                  onClick={handleCreateBus}
                  className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all ${
                    darktheme
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  } hover:scale-105`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create Your First Bus
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Bus;
