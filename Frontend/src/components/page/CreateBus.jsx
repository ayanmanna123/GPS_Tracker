import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";

import {
  Bus,
  MapPin,
  Search,
  Clock,
  Plus,
  Trash2,
  Send,
  DollarSign,
  Navigation,
} from "lucide-react";

const CreateBus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();
  const [deviceID, setDeviceID] = useState("");
  const [ticketPrice, setticketPrice] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [name, setName] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ startTime: "", endTime: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Separate states for "From" search
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);

  // Separate states for "To" search
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const navigate = useNavigate();

  const handleTimeSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: "", endTime: "" }]);
  };

  const removeTimeSlot = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      if (!turnstileToken) {
        toast.error("Please verify CAPTCHA");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/Bus/createbus`,
        {
          name,
          deviceID,
          from,
          to,
          timeSlots,
          ticketPrice,
          turnstileToken, // 👈 ADD THIS
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(t("createBus.successMessage"));
      setDeviceID("");
      setFrom("");
      setTo("");
      setName("");
      setFromSearchQuery("");
      setToSearchQuery("");
      setticketPrice("");
      setTimeSlots([{ startTime: "", endTime: "" }]);
      toast(res.data.message);
      navigate("/Bus");
    } catch (error) {
      console.error("Error creating bus:", error);
      setSuccess(t("createBus.errorMessage"));
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("createBus.genericError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle "From" search
  const handleFromSearchChange = async (e) => {
    const value = e.target.value;
    setFromSearchQuery(value);

    if (value.length < 3) {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setFromSuggestions(data);
      setShowFromSuggestions(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Handle "To" search
  const handleToSearchChange = async (e) => {
    const value = e.target.value;
    setToSearchQuery(value);

    if (value.length < 3) {
      setToSuggestions([]);
      setShowToSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setToSuggestions(data);
      setShowToSuggestions(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Handle "From" suggestion click
  const handleFromSuggestionClick = (place) => {
    setFrom(place.display_name);
    setFromSearchQuery(place.display_name);
    setFromSuggestions([]);
    setShowFromSuggestions(false);
  };

  // Handle "To" suggestion click
  const handleToSuggestionClick = (place) => {
    setTo(place.display_name);
    setToSearchQuery(place.display_name);
    setToSuggestions([]);
    setShowToSuggestions(false);
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

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
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
            {t("createBus.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Create a new bus route and manage schedules
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm max-w-3xl mx-auto ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Bus Name */}
              <div>
                <label
                  htmlFor="name"
                  className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  {t("createBus.busName")}
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("createBus.busNamePlaceholder")}
                  className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  required
                />
              </div>

              {/* Device ID and Ticket Price - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Device ID */}
                <div>
                  <label
                    htmlFor="deviceID"
                    className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    {t("createBus.deviceID")}
                  </label>
                  <input
                    id="deviceID"
                    value={deviceID}
                    onChange={(e) => setDeviceID(e.target.value)}
                    placeholder={t("createBus.deviceIDPlaceholder")}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                </div>

                {/* Ticket Price */}
                <div>
                  <label
                    htmlFor="ticket-Price"
                    className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    {t("createBus.ticketPrice")}
                  </label>
                  <input
                    id="ticket-Price"
                    value={ticketPrice}
                    onChange={(e) => setticketPrice(e.target.value)}
                    placeholder={t("createBus.ticketPricePlaceholder")}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* From Location */}
              <div>
                <label
                  className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {t("createBus.from")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromSearchQuery}
                    onChange={handleFromSearchChange}
                    placeholder={t("createBus.fromPlaceholder")}
                    className={`w-full border-2 p-4 pr-12 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                  <div
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      darktheme ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <Search className="w-5 h-5" />
                  </div>

                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <ul
                      className={`absolute border-2 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 backdrop-blur-sm ${
                        darktheme
                          ? "bg-gray-800/95 border-gray-700"
                          : "bg-white/95 border-gray-200"
                      }`}
                    >
                      {fromSuggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleFromSuggestionClick(place)}
                          className={`p-4 cursor-pointer text-sm border-b last:border-b-0 flex items-start gap-3 transition-colors ${
                            darktheme
                              ? "text-gray-200 border-gray-700 hover:bg-gray-700"
                              : "text-gray-700 border-gray-100 hover:bg-blue-50"
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              darktheme ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className="flex-1">{place.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* To Location */}
              <div>
                <label
                  className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {t("createBus.to")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={toSearchQuery}
                    onChange={handleToSearchChange}
                    placeholder={t("createBus.toPlaceholder")}
                    className={`w-full border-2 p-4 pr-12 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                  <div
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      darktheme ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <Search className="w-5 h-5" />
                  </div>

                  {showToSuggestions && toSuggestions.length > 0 && (
                    <ul
                      className={`absolute border-2 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 backdrop-blur-sm ${
                        darktheme
                          ? "bg-gray-800/95 border-gray-700"
                          : "bg-white/95 border-gray-200"
                      }`}
                    >
                      {toSuggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleToSuggestionClick(place)}
                          className={`p-4 cursor-pointer text-sm border-b last:border-b-0 flex items-start gap-3 transition-colors ${
                            darktheme
                              ? "text-gray-200 border-gray-700 hover:bg-gray-700"
                              : "text-gray-700 border-gray-100 hover:bg-blue-50"
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              darktheme ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span className="flex-1">{place.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label
                  className={` text-sm font-semibold mb-3 flex items-center gap-2 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {t("createBus.timeSlots")}
                </label>
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleTimeSlotChange(
                            index,
                            "startTime",
                            e.target.value
                          )
                        }
                        required
                        className={`flex-1 p-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          darktheme ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("createBus.to")}
                      </span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleTimeSlotChange(index, "endTime", e.target.value)
                        }
                        required
                        className={`flex-1 p-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className={`p-3 rounded-xl transition-all ${
                            darktheme
                              ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                              : "bg-red-50 hover:bg-red-100 text-red-600"
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className={`w-full p-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      darktheme
                        ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-2 border-blue-500/30"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    {t("createBus.addTimeSlot")}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              {/* Turnstile CAPTCHA */}
              <div className="mt-6 flex justify-center">
                <TurnstileCaptcha onVerify={setTurnstileToken} />
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                  loading
                    ? darktheme
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-2xl hover:scale-[1.02]"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t("createBus.creating")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t("createBus.createButton")}</span>
                  </>
                )}
              </button>
            </div>

            {success && (
              <div
                className={`mt-6 p-4 rounded-xl text-center font-medium border-2 ${
                  success.includes(t("createBus.successMessage"))
                    ? darktheme
                      ? "bg-green-900/30 text-green-300 border-green-700/50"
                      : "bg-green-50 text-green-700 border-green-200"
                    : darktheme
                    ? "bg-red-900/30 text-red-300 border-red-700/50"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm">
          <p className={darktheme ? "text-gray-500" : "text-gray-500"}>
            {t("createBus.footer")}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CreateBus;
