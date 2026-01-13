import React, { useState } from "react";
import MicInput from "./MicInput";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import L from "leaflet";
import {
  MapPin,
  Calculator,
  CreditCard,
  Navigation,
  Route as RouteIcon,
  IndianRupee,
  CheckCircle,
} from "lucide-react";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";

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
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

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
      toast.error(t("payment.geolocationNotSupported"));
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
        toast.error(t("payment.unableToGetLocation"));
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
        placeholder={t("payment.typePlaceholder")}
        onChange={(e) => handleSearch(e.target.value)}
        className={`border-2 p-4 w-full rounded-xl focus:ring-4 transition-all ${
          darktheme
            ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
            : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />

      {enableUseMyLocation && (
        <button
          type="button"
          className={`text-sm mt-3 font-semibold flex items-center gap-2 ${
            darktheme
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-700"
          }`}
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
        >
          <MapPin className="w-4 h-4" />
          {loadingLocation
            ? t("payment.gettingLocation")
            : t("payment.useMyLocation")}
        </button>
      )}

      {loading && (
        <p
          className={`text-sm mt-2 flex items-center gap-2 ${
            darktheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          {t("payment.searching")}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          className={`absolute z-10 w-full shadow-2xl rounded-2xl mt-2 max-h-60 overflow-y-auto backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/95 border-gray-700"
              : "bg-white/95 border-gray-200"
          }`}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className={`p-4 cursor-pointer text-sm flex items-start gap-3 border-b last:border-b-0 transition-all ${
                darktheme
                  ? "text-gray-200 hover:bg-gray-700 border-gray-700"
                  : "text-gray-900 hover:bg-blue-50 border-gray-100"
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

const RazorpayPayment = () => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [busId, setBusId] = useState("BUS-111");
  const [ticketData, setTicketData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { deviceid } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loadingPrice, setLoadingPrice] = useState(false);

  const handleCalculatePrice = async () => {
    if (!from || !to) {
      toast.error(t("payment.selectBothLocations"));
      return;
    }

    try {
      setLoadingPrice(true);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/Bus/calculate/price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: deviceid,
            fromLat: from.lat,
            fromLng: from.lon,
            toLat: to.lat,
            toLng: to.lon,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to calculate price");
      }
      setTicketData(data.data);
    } catch (error) {
      console.error("Calculate price error:", error);
      toast.error(error.message || "Failed to calculate price");
    } finally {
      setLoadingPrice(false);
    }
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
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <CreditCard
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
            {t("payment.pageTitle")}
          </h1>
          <p
            className={`text-lg ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Select your journey and book your ticket
          </p>
        </div>

        <div
          className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="mb-8">
            <PlaceSearch
              label={t("payment.from")}
              enableUseMyLocation={true}
              onSelect={(place) => setFrom({ lat: place.lat, lon: place.lon })}
            />
            <PlaceSearch
              label={t("payment.to")}
              onSelect={(place) => setTo({ lat: place.lat, lon: place.lon })}
            />
          </div>

          <button
            className={`w-full px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              darktheme
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            } ${
              !from || !to ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            onClick={handleCalculatePrice}
            disabled={loadingPrice || !from || !to}
          >
            {loadingPrice ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("payment.calculating")}</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>{t("payment.getTicketPrice")}</span>
              </>
            )}
          </button>

          {ticketData && (
            <div
              className={`mt-8 rounded-2xl p-6 border ${
                darktheme
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 rounded-xl ${
                    darktheme ? "bg-green-500/20" : "bg-green-100"
                  }`}
                >
                  <CheckCircle
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
                  Ticket Details
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    darktheme ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Navigation
                      className={`w-5 h-5 ${
                        darktheme ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("payment.fromIndex")}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {ticketData.fromIndex}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    darktheme ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className={`w-5 h-5 ${
                        darktheme ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("payment.toIndex")}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {ticketData.toIndex}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    darktheme ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RouteIcon
                      className={`w-5 h-5 ${
                        darktheme ? "text-orange-400" : "text-orange-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("payment.passengerDistance")}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {ticketData.passengerDistance} {t("payment.km")}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    darktheme
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IndianRupee
                      className={`w-6 h-6 ${
                        darktheme ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <div>
                      <span
                        className={`font-bold text-lg ${
                          darktheme ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        {t("payment.ticketPrice")}
                      </span>
                      <p
                        className={`text-xs ${
                          darktheme ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        @ ₹{ticketData.pricePerKm}/km
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-2xl ${
                      darktheme ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    ₹{ticketData.ticketPrice}
                  </span>
                </div>
              </div>
              {/* Turnstile CAPTCHA */}
              <div className="my-6 flex justify-center">
                <TurnstileCaptcha onVerify={setTurnstileToken} />
              </div>
              <button
                className={`w-full px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  darktheme
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                } hover:scale-105`}
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${import.meta.env.VITE_BASE_URL}/Bus/create-order`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          amount: ticketData.ticketPrice,
                        }),
                      }
                    );
                    const order = await res.json();

                    const options = {
                      key: "rzp_test_RPcZFwp7G16Gjf",
                      amount: order.amount,
                      currency: order.currency,
                      name: t("payment.busTicketBooking"),
                      description: `${t("payment.ticketFor")} ${busId}`,
                      order_id: order.id,
                      handler: async function (response) {
                        try {
                          if (!turnstileToken) {
                            toast.error("Please verify CAPTCHA");
                            return;
                          }

                          const token = await getAccessTokenSilently({
                            audience: "http://localhost:5000/api/v3",
                          });

                          const verifyRes = await axios.post(
                            `${
                              import.meta.env.VITE_BASE_URL
                            }/Bus/verify-payment`,
                            {
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature,
                              ticketData,
                              busId: deviceid,
                              fromLat: from.lat,
                              fromLng: from.lon,
                              toLat: to.lat,
                              toLng: to.lon,
                              turnstileToken,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          const verifyData = verifyRes.data; // ✅ correct
                          toast.success(verifyData.message);
                          console.log("✅ Verify Response:", verifyData);
                        } catch (err) {
                          console.error("Payment verification failed:", err);
                          toast.error("Payment verification failed");
                        }
                      },

                      prefill: {
                        name: "Ayan Manna",
                        email: "mannaayan777@gmail.com",
                        contact: "9907072795",
                      },
                      theme: { color: "#3399cc" },
                    };

                    const rzp1 = new window.Razorpay(options);
                    rzp1.on("payment.failed", function (response) {
                      setProcessingPayment(false);
                      toast.error(
                        response.error.description || "Payment failed"
                      );
                    });
                    rzp1.open();
                  } catch (error) {
                    setProcessingPayment(false);
                    toast.error("Failed to initiate payment");
                    console.error("Payment error:", error);
                  }
                }}
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {t("payment.pay")} ₹{ticketData.ticketPrice}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
