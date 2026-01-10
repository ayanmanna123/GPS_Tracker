import React from "react";
import { useSelector } from "react-redux";
import { Clock, MapPin, AlertTriangle, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { routePredictionService } from "@/services/routePredictionService";

/**
 * PredictionCard - Displays route prediction information
 */
const PredictionCard = ({
    route,
    isRecommended = false,
    onClick = null,
}) => {
    const { darktheme } = useSelector((store) => store.auth);

    const reliabilityColor = routePredictionService.getReliabilityColor(
        route.reliabilityScore || 50
    );
    const delayStyle = routePredictionService.getDelayRiskStyle(
        route.delayProbability || 0
    );
    const confidenceColor = routePredictionService.getConfidenceColor(
        route.confidence || 50
    );

    return (
        <div
            className={`rounded-2xl p-6 transition-all duration-300 cursor-pointer border-2 ${isRecommended
                    ? darktheme
                        ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 shadow-lg shadow-blue-500/20"
                        : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-lg shadow-blue-200"
                    : darktheme
                        ? "bg-gray-800/80 border-gray-700/50 hover:border-gray-600"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}
            onClick={onClick}
        >
            {/* Recommended Badge */}
            {isRecommended && (
                <div className="flex items-center gap-2 mb-4">
                    <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${darktheme
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                    >
                        <Zap className="w-3 h-3" />
                        Recommended
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3
                        className={`text-lg font-bold mb-1 ${darktheme ? "text-white" : "text-gray-900"
                            }`}
                    >
                        {route.busName || `Route ${route.busId}`}
                    </h3>
                    <p
                        className={`text-sm flex items-center gap-2 ${darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        {route.from} → {route.to}
                    </p>
                </div>

                {/* ETA */}
                <div className="text-right">
                    <div
                        className={`text-2xl font-bold ${darktheme ? "text-blue-400" : "text-blue-600"
                            }`}
                    >
                        {route.estimatedMinutes} min
                    </div>
                    <div
                        className={`text-xs ${darktheme ? "text-gray-500" : "text-gray-500"
                            }`}
                    >
                        Arrival: {route.estimatedArrival}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Reliability Score */}
                <div
                    className={`p-3 rounded-xl ${darktheme ? "bg-gray-900/50" : "bg-gray-50"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4" style={{ color: reliabilityColor }} />
                        <span
                            className={`text-xs font-medium ${darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            Reliability
                        </span>
                    </div>
                    <div
                        className="text-lg font-bold"
                        style={{ color: reliabilityColor }}
                    >
                        {route.reliabilityScore || "N/A"}%
                    </div>
                </div>

                {/* Confidence */}
                <div
                    className={`p-3 rounded-xl ${darktheme ? "bg-gray-900/50" : "bg-gray-50"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4" style={{ color: confidenceColor }} />
                        <span
                            className={`text-xs font-medium ${darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            Confidence
                        </span>
                    </div>
                    <div
                        className="text-lg font-bold"
                        style={{ color: confidenceColor }}
                    >
                        {route.confidence || "N/A"}%
                    </div>
                </div>

                {/* Delay Risk */}
                <div
                    className={`p-3 rounded-xl ${darktheme ? "bg-gray-900/50" : "bg-gray-50"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" style={{ color: delayStyle.color }} />
                        <span
                            className={`text-xs font-medium ${darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            Delay Risk
                        </span>
                    </div>
                    <div
                        className="text-lg font-bold"
                        style={{ color: delayStyle.color }}
                    >
                        {route.delayProbability || 0}%
                    </div>
                </div>
            </div>

            {/* Delay Warning */}
            {route.delayProbability > 30 && (
                <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${darktheme ? "bg-yellow-500/10" : "bg-yellow-50"
                        }`}
                    style={{ borderLeft: `3px solid ${delayStyle.color}` }}
                >
                    <span>{delayStyle.icon}</span>
                    <span style={{ color: delayStyle.color }}>
                        {delayStyle.label}: Average delay of {route.averageDelay || 0} minutes
                    </span>
                </div>
            )}

            {/* Distance & Factors */}
            <div
                className={`flex items-center justify-between mt-4 pt-4 border-t ${darktheme ? "border-gray-700" : "border-gray-200"
                    }`}
            >
                <div className="flex items-center gap-4">
                    {route.distance && (
                        <span
                            className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                        >
                            📍 {route.distance} km
                        </span>
                    )}
                    {route.factors?.timeSlot > 1.3 && (
                        <span
                            className={`text-xs px-2 py-1 rounded-full ${darktheme
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                        >
                            Peak Hours
                        </span>
                    )}
                </div>
                <Clock
                    className={`w-5 h-5 ${darktheme ? "text-gray-600" : "text-gray-400"}`}
                />
            </div>
        </div>
    );
};

export default PredictionCard;
