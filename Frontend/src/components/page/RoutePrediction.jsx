import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    MapPin,
    Search,
    Brain,
    TrendingUp,
    Clock,
    AlertTriangle,
    ArrowRight,
    Sparkles,
    BarChart3,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import PredictionCard from "../shared/PredictionCard";
import { routePredictionService } from "@/services/routePredictionService";

const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

const LocationInput = ({ label, value, onChange, onSelect, placeholder, enableMyLocation = false }) => {
    const { t } = useTranslation();
    const { darktheme } = useSelector((store) => store.auth);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleSearch = async (searchValue) => {
        setQuery(searchValue);
        onChange(searchValue);
        if (searchValue.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(
                `${GEOCODE_API}?q=${encodeURIComponent(searchValue)}&format=json&limit=5`
            );
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("Geocode error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUseMyLocation = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `${GEOCODE_API}?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
                    );
                    const data = await res.json();
                    const address = data[0]?.display_name || `${latitude}, ${longitude}`;
                    setQuery(address);
                    onChange(address);
                    onSelect({ lat: latitude, lng: longitude, address });
                    setSuggestions([]);
                } finally {
                    setLoadingLocation(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                toast.error("Unable to get your location");
                setLoadingLocation(false);
            }
        );
    };

    return (
        <div className="mb-6 relative">
            <label
                className={`block mb-2 font-semibold text-sm ${darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
            >
                {label}
            </label>
            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
            />

            {enableMyLocation && (
                <button
                    type="button"
                    className={`text-sm mt-2 font-semibold transition-all flex items-center gap-2 ${darktheme
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                    onClick={handleUseMyLocation}
                    disabled={loadingLocation}
                >
                    <MapPin className="w-4 h-4" />
                    {loadingLocation ? "Getting location..." : "Use my current location"}
                </button>
            )}

            {loading && (
                <p
                    className={`text-sm mt-2 flex items-center gap-2 ${darktheme ? "text-gray-400" : "text-gray-500"
                        }`}
                >
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    Searching...
                </p>
            )}

            {suggestions.length > 0 && (
                <ul
                    className={`absolute z-10 w-full shadow-2xl rounded-xl mt-2 max-h-60 overflow-y-auto border backdrop-blur-sm ${darktheme
                            ? "bg-gray-800/95 border-gray-700"
                            : "bg-white/95 border-gray-200"
                        }`}
                >
                    {suggestions.map((s, idx) => (
                        <li
                            key={idx}
                            className={`p-4 cursor-pointer text-sm transition-all border-b last:border-b-0 flex items-start gap-3 ${darktheme
                                    ? "hover:bg-gray-700 text-gray-200 border-gray-700"
                                    : "hover:bg-blue-50 text-gray-900 border-gray-100"
                                }`}
                            onClick={() => {
                                const pos = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
                                setQuery(s.display_name);
                                onChange(s.display_name);
                                onSelect({ ...pos, address: s.display_name });
                                setSuggestions([]);
                            }}
                        >
                            <MapPin
                                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darktheme ? "text-blue-400" : "text-blue-600"
                                    }`}
                            />
                            <span>{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const RoutePrediction = () => {
    const { t } = useTranslation();
    const { darktheme } = useSelector((store) => store.auth);
    const navigate = useNavigate();

    const [from, setFrom] = useState({ lat: null, lng: null, address: "" });
    const [to, setTo] = useState({ lat: null, lng: null, address: "" });
    const [fromQuery, setFromQuery] = useState("");
    const [toQuery, setToQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState(null);
    const [modelStats, setModelStats] = useState(null);

    // Fetch model stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            const result = await routePredictionService.getModelStats();
            if (result.success) {
                setModelStats(result);
            }
        };
        fetchStats();
    }, []);

    const handlePredict = async () => {
        if (!from.lat || !from.lng || !to.lat || !to.lng) {
            toast.error("Please select both origin and destination locations");
            return;
        }

        setLoading(true);
        try {
            const result = await routePredictionService.getOptimalRoutes(
                { lat: from.lat, lng: from.lng },
                { lat: to.lat, lng: to.lng }
            );

            if (result.success) {
                setPredictions(result);
                toast.success(`Found ${result.routes.length} route predictions`);
            } else {
                toast.error(result.error || "Failed to get predictions");
            }
        } catch (error) {
            console.error("Prediction error:", error);
            toast.error("Failed to get route predictions");
        } finally {
            setLoading(false);
        }
    };

    const canPredict = from.lat && from.lng && to.lat && to.lng;

    return (
        <div
            className={`min-h-screen relative overflow-hidden ${darktheme
                    ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
                    : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
                }`}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? "bg-purple-500/5" : "bg-purple-300/20"
                        } rounded-full blur-3xl animate-pulse`}
                ></div>
                <div
                    className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
                        } rounded-full blur-3xl animate-pulse`}
                    style={{ animationDelay: "1s" }}
                ></div>
            </div>

            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div
                            className={`p-3 rounded-2xl ${darktheme
                                    ? "bg-purple-500/20 border border-purple-500/30"
                                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                                }`}
                        >
                            <Brain
                                className={`w-8 h-8 ${darktheme ? "text-purple-400" : "text-white"
                                    }`}
                            />
                        </div>
                    </div>
                    <h1
                        className={`text-5xl font-bold mb-4 bg-gradient-to-r ${darktheme
                                ? "from-purple-400 via-pink-400 to-blue-400"
                                : "from-purple-600 via-pink-600 to-blue-600"
                            } bg-clip-text text-transparent`}
                    >
                        AI Route Prediction
                    </h1>
                    <p
                        className={`text-lg max-w-2xl mx-auto ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        Get intelligent route predictions with estimated arrival times,
                        reliability scores, and delay forecasts powered by machine learning.
                    </p>
                </div>

                {/* Model Stats Banner */}
                {modelStats && (
                    <div
                        className={`rounded-2xl p-4 mb-8 flex items-center justify-center gap-8 ${darktheme
                                ? "bg-gray-800/50 border border-gray-700/50"
                                : "bg-white/70 border border-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3
                                className={`w-5 h-5 ${darktheme ? "text-purple-400" : "text-purple-600"
                                    }`}
                            />
                            <span
                                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                {modelStats.statistics?.totalTripsLast30Days || 0} trips analyzed
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp
                                className={`w-5 h-5 ${darktheme ? "text-green-400" : "text-green-600"
                                    }`}
                            />
                            <span
                                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                Data Quality: {modelStats.statistics?.dataQuality || "Limited"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles
                                className={`w-5 h-5 ${darktheme ? "text-blue-400" : "text-blue-600"
                                    }`}
                            />
                            <span
                                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                Model v{modelStats.modelInfo?.version || "1.0.0"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Search Card */}
                <div
                    className={`rounded-3xl shadow-2xl p-8 mb-8 border backdrop-blur-sm ${darktheme
                            ? "bg-gray-800/80 border-gray-700/50"
                            : "bg-white/90 border-white/50"
                        }`}
                >
                    <h2
                        className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darktheme ? "text-white" : "text-gray-800"
                            }`}
                    >
                        <Search className="w-6 h-6" />
                        Route Prediction Search
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <LocationInput
                            label="From (Origin)"
                            value={fromQuery}
                            onChange={setFromQuery}
                            onSelect={setFrom}
                            placeholder="Enter starting location..."
                            enableMyLocation={true}
                        />
                        <LocationInput
                            label="To (Destination)"
                            value={toQuery}
                            onChange={setToQuery}
                            onSelect={setTo}
                            placeholder="Enter destination..."
                        />
                    </div>

                    {/* Predict Button */}
                    <div className="text-center mt-8">
                        <button
                            onClick={handlePredict}
                            disabled={!canPredict || loading}
                            className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto ${canPredict && !loading
                                    ? darktheme
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-2xl hover:scale-105"
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-2xl hover:scale-105"
                                    : darktheme
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>Analyzing Routes...</span>
                                </>
                            ) : (
                                <>
                                    <Brain className="w-5 h-5" />
                                    <span>Get AI Predictions</span>
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {predictions && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2
                                className={`text-2xl font-bold ${darktheme ? "text-white" : "text-gray-800"
                                    }`}
                            >
                                Route Predictions
                            </h2>
                            <div
                                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                {predictions.routes?.length || 0} routes found •{" "}
                                {predictions.metadata?.routesAnalyzed || 0} analyzed
                            </div>
                        </div>

                        {/* Current Conditions */}
                        {predictions.metadata?.currentConditions && (
                            <div
                                className={`flex flex-wrap gap-3 ${darktheme ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                <span
                                    className={`text-xs px-3 py-1 rounded-full ${darktheme ? "bg-gray-800" : "bg-gray-100"
                                        }`}
                                >
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    Hour: {predictions.metadata.currentConditions.hour}:00
                                </span>
                                {predictions.metadata.currentConditions.timeSlotFactor > 1.3 && (
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full ${darktheme
                                                ? "bg-orange-500/20 text-orange-400"
                                                : "bg-orange-100 text-orange-700"
                                            }`}
                                    >
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        Peak Traffic Hours
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Prediction Cards */}
                        {predictions.routes?.length > 0 ? (
                            <div className="grid gap-4">
                                {predictions.routes.map((route, idx) => (
                                    <PredictionCard
                                        key={route.busId || idx}
                                        route={route}
                                        isRecommended={idx === 0}
                                        onClick={() => navigate(`/bus/${route.busId}`)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className={`rounded-2xl p-12 text-center ${darktheme ? "bg-gray-800/50" : "bg-gray-50"
                                    }`}
                            >
                                <Brain
                                    className={`w-16 h-16 mx-auto mb-4 ${darktheme ? "text-gray-600" : "text-gray-400"
                                        }`}
                                />
                                <h3
                                    className={`text-xl font-bold mb-2 ${darktheme ? "text-gray-300" : "text-gray-700"
                                        }`}
                                >
                                    No Predictions Available
                                </h3>
                                <p
                                    className={`text-sm ${darktheme ? "text-gray-500" : "text-gray-500"
                                        }`}
                                >
                                    No buses found for this route. Try adjusting your locations.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoutePrediction;
