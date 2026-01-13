import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Loader2,
  Ticket,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  IndianRupee,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const MyTickets = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/Bus/user/all-ticket`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setTickets(res.data.allTicket || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          t("tickets.fetchError");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTickets();
  }, [isAuthenticated, getAccessTokenSilently, t]);

  if (loading) {
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
        <div className="flex flex-col justify-center items-center min-h-[80vh] relative z-10">
          <div
            className={`rounded-3xl shadow-2xl p-12 flex flex-col items-center backdrop-blur-sm border ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="relative mb-6">
              <Loader2 className="animate-spin w-16 h-16 text-blue-500" />
              <Sparkles
                className={`absolute -top-2 -right-2 w-6 h-6 ${
                  darktheme ? "text-yellow-400" : "text-yellow-500"
                } animate-pulse`}
              />
            </div>
            <span
              className={`text-xl font-semibold ${
                darktheme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("tickets.loading")}
            </span>
            <span
              className={`text-sm mt-2 ${
                darktheme ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Please wait while we fetch your tickets...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
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
        <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 relative z-10">
          <div
            className={`rounded-3xl shadow-2xl p-12 text-center max-w-md backdrop-blur-sm border ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Ticket
                className={`w-12 h-12 ${
                  darktheme ? "text-blue-400" : "text-white"
                }`}
              />
            </div>
            <h2
              className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
                darktheme
                  ? "from-blue-400 to-purple-400"
                  : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              {t("tickets.noTicketsTitle")}
            </h2>
            <p
              className={`mb-8 text-lg ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("tickets.noTicketsMessage")}
            </p>
            <button
              onClick={() => navigate("/")}
              className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto ${
                darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              } hover:scale-105`}
            >
              {t("tickets.bookFirstTicket")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Ticket
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
            {t("tickets.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("tickets.pageSubtitle")}
          </p>

          {/* Ticket Count */}
          <div
            className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full ${
              darktheme
                ? "bg-blue-500/10 border border-blue-500/30"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 ${
                darktheme ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`font-semibold ${
                darktheme ? "text-blue-400" : "text-blue-700"
              }`}
            >
              {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}
            </span>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50 hover:shadow-blue-500/20"
                  : "bg-white/90 border-white/50 hover:shadow-2xl"
              } hover:scale-[1.02]`}
              onClick={() => navigate(`/ticket/${ticket._id}`)}
            >
              {/* Header with Status Banner */}
              <div
                className={`p-6 border-b ${
                  ticket.paymentStatus === "Success"
                    ? darktheme
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-green-50 border-green-200"
                    : darktheme
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        ticket.paymentStatus === "Success"
                          ? darktheme
                            ? "bg-green-500/20"
                            : "bg-green-100"
                          : darktheme
                            ? "bg-red-500/20"
                            : "bg-red-100"
                      }`}
                    >
                      <Ticket
                        className={`w-6 h-6 ${
                          ticket.paymentStatus === "Success"
                            ? darktheme
                              ? "text-green-400"
                              : "text-green-600"
                            : darktheme
                              ? "text-red-400"
                              : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h2
                        className={`text-lg font-bold ${
                          darktheme ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {ticket.busId || t("tickets.busInfo")}
                      </h2>
                      <p
                        className={`text-xs ${
                          darktheme ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Ticket ID: {ticket._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  {ticket.paymentStatus === "Success" ? (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        darktheme ? "bg-green-500/20" : "bg-green-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          darktheme ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          darktheme ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        {t("tickets.confirmed")}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        darktheme ? "bg-red-500/20" : "bg-red-100"
                      }`}
                    >
                      <XCircle
                        className={`w-4 h-4 ${
                          darktheme ? "text-red-400" : "text-red-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          darktheme ? "text-red-400" : "text-red-700"
                        }`}
                      >
                        {t("tickets.failed")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6">
                {/* Route Information */}
                <div
                  className={`rounded-xl p-4 mb-4 border ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          darktheme ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 ${
                            darktheme ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          darktheme ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {t("tickets.stop")} {ticket.fromIndex}
                      </span>
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 ${
                        darktheme ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          darktheme ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {t("tickets.stop")} {ticket.toIndex}
                      </span>
                      <div
                        className={`p-2 rounded-lg ${
                          darktheme ? "bg-purple-500/20" : "bg-purple-100"
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 ${
                            darktheme ? "text-purple-400" : "text-purple-600"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-center text-xs ${
                      darktheme ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {t("tickets.distance")}{" "}
                    <span className="font-bold">
                      {ticket.passengerDistance} {t("tickets.km")}
                    </span>
                  </div>
                </div>

                {/* Price Card */}
                <div
                  className={`rounded-xl p-4 mb-4 border ${
                    darktheme
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee
                        className={`w-5 h-5 ${
                          darktheme ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          darktheme ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("tickets.totalFare")}
                      </span>
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        darktheme ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      ₹{ticket.ticketPrice}
                    </span>
                  </div>
                </div>

                {/* Date Info */}
                <div
                  className={`flex items-center gap-2 mb-4 text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(ticket.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ticket/${ticket._id}`);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    darktheme
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  } hover:scale-105`}
                >
                  {t("tickets.viewDetails")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyTickets;
