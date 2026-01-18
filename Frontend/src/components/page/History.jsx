import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  MapPin,
  Route,
  Clock,
  Trash2,
  History as HistoryIcon,
  Sparkles,
  Play,
} from "lucide-react";
import { setpath } from "@/Redux/auth.reducer";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { clearHistory } from "@/Redux/history.reducer";
import { useTranslation } from "react-i18next";

const History = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items } = useSelector((store) => store.history);
  const { darktheme } = useSelector((store) => store.auth);

  const handelClick = (index) => {
    dispatch(setpath(items[index]));
    navigate("/fllow/path");
  };

  const handelRefresh = () => {
    dispatch(clearHistory([]));
  };

  if (items.length === 0) {
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
              <Clock
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
              {t("history.noHistoryTitle")}
            </h2>
            <p
              className={`text-lg ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("history.noHistoryMessage")}
            </p>
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
              <HistoryIcon
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
            {t("history.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto mb-6 ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("history.pageDescription")}
          </p>

          {/* Stats and Clear Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darktheme
                  ? "bg-blue-500/10 border border-blue-500/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <Route
                className={`w-5 h-5 ${
                  darktheme ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span
                className={`font-semibold ${
                  darktheme ? "text-blue-400" : "text-blue-700"
                }`}
              >
                {items.length} {items.length === 1 ? "Route" : "Routes"}
              </span>
            </div>

            <button
              onClick={handelRefresh}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                darktheme
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              } hover:scale-105`}
            >
              <Trash2 className="w-4 h-4" />
              {t("history.clearHistory")}
            </button>
          </div>
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const from =
              item.pathAddresses?.[0]?.address || t("history.unknown");
            const to =
              item.pathAddresses?.[item.pathAddresses.length - 1]?.address ||
              t("history.unknown");

            return (
              <div
                key={index}
                className={`shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
                  darktheme
                    ? "bg-gray-800/80 border-gray-700/50 hover:shadow-blue-500/20"
                    : "bg-white/90 border-white/50 hover:shadow-2xl"
                } hover:scale-[1.02]`}
                onClick={() => handelClick(index)}
              >
                {/* Header */}
                <div
                  className={`p-6 border-b ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          darktheme ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                      >
                        <Route
                          className={`w-6 h-6 ${
                            darktheme ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h2
                          className={`text-lg font-bold ${
                            darktheme ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {t("history.routeNumber", { number: index + 1 })}
                        </h2>
                        <p
                          className={`text-xs ${
                            darktheme ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Route #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full ${
                        darktheme ? "bg-purple-500/20" : "bg-purple-100"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          darktheme ? "text-purple-400" : "text-purple-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Route Information */}
                  <div
                    className={`rounded-xl p-4 mb-4 border ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* From */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg mt-1 ${
                            darktheme ? "bg-green-500/20" : "bg-green-100"
                          }`}
                        >
                          <MapPin
                            className={`w-4 h-4 ${
                              darktheme ? "text-green-400" : "text-green-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                              darktheme ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {t("history.from")}
                          </p>
                          <p
                            className={`text-sm font-medium line-clamp-2 ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {from}
                          </p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowRight
                          className={`w-5 h-5 ${
                            darktheme ? "text-gray-600" : "text-gray-400"
                          }`}
                        />
                      </div>

                      {/* To */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg mt-1 ${
                            darktheme ? "bg-red-500/20" : "bg-red-100"
                          }`}
                        >
                          <MapPin
                            className={`w-4 h-4 ${
                              darktheme ? "text-red-400" : "text-red-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                              darktheme ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {t("history.to")}
                          </p>
                          <p
                            className={`text-sm font-medium line-clamp-2 ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {to}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View Route Button */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handelClick(index);
                      }}
                      className={`py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        darktheme
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      } hover:scale-105`}
                    >
                      {t("history.viewRoute")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to route playback - using a mock deviceID for demo
                        navigate(`/route-playback/BUS${index + 1}`);
                      }}
                      className={`py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        darktheme
                          ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white"
                          : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                      } hover:scale-105`}
                    >
                      <Play className="w-4 h-4" />
                      Playback
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default History;
