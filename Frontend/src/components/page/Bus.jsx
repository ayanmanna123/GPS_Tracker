import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bus as BusIcon,
  MapPin,
  Navigation,
  User,
  Mail,
  CreditCard,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { addActiveBus, removeActiveBus } from "@/Redux/locationSlice";

const Bus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

  const locationIntervals = useRef({});

  // ✅ Fetch all buses on mount
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
        toast.error(msg || "Failed to fetch buses.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [getAccessTokenSilently]);

  // ✅ Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(locationIntervals.current).forEach(clearInterval);
    };
  }, []);

  // ✅ Toggle active state and start/stop location updates
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
              await axios.put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
                deviceID: busId,
                latitude,
                longitude,
              });
            } catch (err) {
              console.error("Failed to send location:", err.message);
            }
          },
          (err) => {
            console.error("Geolocation error:", err.message);
          }
        );
      };

      sendLocation(); // send immediately
      locationIntervals.current[busId] = setInterval(sendLocation, 5000);
    }
  };

  const handleBusClick = (bus) => {
    navigate(`/bus/${bus.deviceID}`);
  };

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
      }`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.length > 0 ? (
              buses.map((bus) => (
                <div
                  key={bus._id}
                  className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    darktheme
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-green-100"
                  }`}
                >
                  {/* Bus Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center"
                      onClick={() => handleBusClick(bus)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          darktheme ? "bg-green-900/50" : "bg-green-100"
                        }`}
                      >
                        <BusIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3
                        className={`text-lg font-bold ${
                          darktheme ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {bus.deviceID}
                      </h3>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={activeBusIDs.includes(bus.deviceID)}
                            onChange={() => toggleBusActive(bus.deviceID)}
                          />
                          <div
                            className={`w-10 h-5 rounded-full shadow-inner transition ${
                              activeBusIDs.includes(bus.deviceID)
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${
                              activeBusIDs.includes(bus.deviceID)
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="space-y-3 mb-4">
                    <div
                      className={`flex items-center ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">From:</span>
                        <p className="text-sm truncate">{bus.from}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <Navigation className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">To:</span>
                        <p className="text-sm truncate">{bus.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {bus.driver ? (
                    <div
                      className={`border-t pt-4 mt-4 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl ${
                        darktheme
                          ? "bg-gray-900/50 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 flex items-center ${
                          darktheme ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Driver Details
                      </h4>
                      <div className="space-y-2">
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <User className="w-3 h-3 mr-2" />
                          <span className="text-sm">{bus.driver.name}</span>
                        </div>
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="text-sm truncate">
                            {bus.driver.email}
                          </span>
                        </div>
                        <div
                          className={`flex items-center ${
                            darktheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <CreditCard className="w-3 h-3 mr-2" />
                          <span className="text-sm">
                            License: {bus.driver.licenceId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-t pt-4 mt-4 text-center ${
                        darktheme ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm italic ${
                          darktheme ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        No driver assigned
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No buses found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bus;
