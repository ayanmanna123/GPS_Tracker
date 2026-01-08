import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

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

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/Bus/createbus`,
        { name, deviceID, from, to, timeSlots, ticketPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(t("createBus.successMessage"));
      setDeviceID("");
      setFrom("");
      setTo("");
      setName("");
      setFromSearchQuery("");
      setToSearchQuery("");
      setTimeSlots([{ startTime: "", endTime: "" }]);
      toast(res.data.message);
      navigate("/Bus");
    } catch (error) {
      console.error("Error creating bus:", error);
      setSuccess(t("createBus.errorMessage"));
      const errorMessage =
        error.response?.data?.message || error.message || t("createBus.genericError");
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
      className={`min-h-screen ${darktheme
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card
          className={`max-w-md mx-auto mt-6 shadow-xl rounded-2xl border ${darktheme
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-green-100"
            }`}
        >
          <CardHeader>
            <CardTitle
              className={`text-2xl font-bold text-center ${darktheme ? "text-white" : "text-gray-800"
                }`}
            >
              {t("createBus.pageTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Bus Name */}
              <div>
                <Label
                  htmlFor="name"
                  className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t("createBus.busName")}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("createBus.busNamePlaceholder")}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                    }`}
                  required
                />
              </div>

              {/* Device ID */}
              <div>
                <Label
                  htmlFor="deviceID"
                  className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t("createBus.deviceID")}
                </Label>
                <Input
                  id="deviceID"
                  value={deviceID}
                  onChange={(e) => setDeviceID(e.target.value)}
                  placeholder={t("createBus.deviceIDPlaceholder")}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                    }`}
                  required
                />
              </div>

              {/* Ticket Price */}
              <div>
                <Label
                  htmlFor="ticket-Price"
                  className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t("createBus.ticketPrice")}
                </Label>
                <Input
                  id="ticket-Price"
                  value={ticketPrice}
                  onChange={(e) => setticketPrice(e.target.value)}
                  placeholder={t("createBus.ticketPricePlaceholder")}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${darktheme
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                    }`}
                  required
                />
              </div>

              {/* From Location */}
              <div>
                <div
                  className={`rounded-2xl p-6 shadow-lg border ${darktheme
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xl">🔍</span>
                    <h2
                      className={`text-xl font-bold ${darktheme ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {t("createBus.from")}
                    </h2>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={fromSearchQuery}
                      onChange={handleFromSearchChange}
                      placeholder={t("createBus.fromPlaceholder")}
                      className={`w-full border-2 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 transition-all ${darktheme
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
                        }`}
                      required
                    />
                    <div
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${darktheme ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <ul
                        className={`absolute border-2 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 ${darktheme
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                          }`}
                      >
                        {fromSuggestions.map((place) => (
                          <li
                            key={place.place_id}
                            onClick={() => handleFromSuggestionClick(place)}
                            className={`p-4 cursor-pointer text-sm border-b last:border-b-0 flex items-start gap-3 transition-colors ${darktheme
                              ? "text-gray-200 border-gray-700 hover:bg-gray-700"
                              : "text-gray-700 border-gray-100 hover:bg-gray-50"
                              }`}
                          >
                            <span className="text-lg mt-0.5">📍</span>
                            <span className="flex-1">{place.display_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* To Location */}
              <div>
                <div
                  className={`rounded-2xl p-6 shadow-lg border ${darktheme
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xl">🔍</span>
                    <h2
                      className={`text-xl font-bold ${darktheme ? "text-white" : "text-gray-800"
                        }`}
                    >
                      {t("createBus.to")}
                    </h2>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={toSearchQuery}
                      onChange={handleToSearchChange}
                      placeholder={t("createBus.toPlaceholder")}
                      className={`w-full border-2 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 transition-all ${darktheme
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
                        }`}
                      required
                    />
                    <div
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${darktheme ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {showToSuggestions && toSuggestions.length > 0 && (
                      <ul
                        className={`absolute border-2 rounded-xl shadow-2xl w-full mt-2 max-h-64 overflow-y-auto z-50 ${darktheme
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                          }`}
                      >
                        {toSuggestions.map((place) => (
                          <li
                            key={place.place_id}
                            onClick={() => handleToSuggestionClick(place)}
                            className={`p-4 cursor-pointer text-sm border-b last:border-b-0 flex items-start gap-3 transition-colors ${darktheme
                              ? "text-gray-200 border-gray-700 hover:bg-gray-700"
                              : "text-gray-700 border-gray-100 hover:bg-gray-50"
                              }`}
                          >
                            <span className="text-lg mt-0.5">📍</span>
                            <span className="flex-1">{place.display_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <Label
                  className={`block text-sm font-medium mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t("createBus.timeSlots")}
                </Label>
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleTimeSlotChange(index, "startTime", e.target.value)
                      }
                      required
                      className={`flex-1 p-3 border rounded-xl ${darktheme
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                        }`}
                    />
                    <span
                      className={darktheme ? "text-gray-400" : "text-gray-600"}
                    >
                      {t("createBus.to")}
                    </span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleTimeSlotChange(index, "endTime", e.target.value)
                      }
                      required
                      className={`flex-1 p-3 border rounded-xl ${darktheme
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                        }`}
                    />
                    {timeSlots.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        {t("createBus.remove")}
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addTimeSlot}
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  {t("createBus.addTimeSlot")}
                </Button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? t("createBus.creating") : t("createBus.createButton")}
              </Button>
            </form>

            {success && (
              <p
                className={`mt-4 text-center font-medium ${darktheme ? "text-green-400" : "text-green-700"
                  }`}
              >
                {success}
              </p>
            )}
          </CardContent>
        </Card>

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