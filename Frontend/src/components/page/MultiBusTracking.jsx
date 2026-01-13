import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { toast } from "sonner";
import websocketService from "../../services/websocketService";
import {
  Plus,
  X,
  MapPin,
  Users,
  Gauge,
  Navigation2,
  Activity,
  Eye,
  EyeOff,
  Maximize2,
} from "lucide-react";

const MultiBusTracking = () => {
  const navigate = useNavigate();
  const { darktheme } = useSelector((store) => store.auth);

  const [trackedBuses, setTrackedBuses] = useState([]);
  const [trackingData, setTrackingData] = useState([]);
  const [newBusId, setNewBusId] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const hasInitialized = useRef(false);

  // Fetch multiple bus tracking data
  const fetchMultipleBusData = async (deviceIDs) => {
    if (!deviceIDs || deviceIDs.length === 0) {
      setTrackingData([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/tracking/multiple-buses`,
        { deviceIDs }
      );

      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching multiple bus data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add bus to tracking
  const handleAddBus = async () => {
    if (!newBusId.trim()) {
      toast.error("Please enter a bus ID");
      return;
    }

    if (trackedBuses.includes(newBusId)) {
      toast.error("Bus is already being tracked");
      return;
    }

    if (trackedBuses.length >= 10) {
      toast.error("Maximum 10 buses can be tracked simultaneously");
      return;
    }

    setAdding(true);
    try {
      // Verify bus exists
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/tracking/bus/${newBusId}`
      );

      if (response.data.success) {
        const updatedBuses = [...trackedBuses, newBusId];
        setTrackedBuses(updatedBuses);
        setSelectedBuses(updatedBuses); // Show all by default
        localStorage.setItem("trackedBuses", JSON.stringify(updatedBuses));
        setNewBusId("");
        toast.success("Bus added to tracking");
        fetchMultipleBusData(updatedBuses);
      }
    } catch (error) {
      console.error("Error adding bus:", error);
      toast.error(error.response?.data?.message || "Bus not found");
    } finally {
      setAdding(false);
    }
  };

  // Remove bus from tracking
  const handleRemoveBus = (deviceID) => {
    const updatedBuses = trackedBuses.filter((id) => id !== deviceID);
    setTrackedBuses(updatedBuses);
    setSelectedBuses(selectedBuses.filter((id) => id !== deviceID));
    localStorage.setItem("trackedBuses", JSON.stringify(updatedBuses));
    toast.success("Bus removed from tracking");
    fetchMultipleBusData(updatedBuses);
  };

  // Toggle bus visibility on map
  const toggleBusVisibility = (deviceID) => {
    if (selectedBuses.includes(deviceID)) {
      setSelectedBuses(selectedBuses.filter((id) => id !== deviceID));
    } else {
      setSelectedBuses([...selectedBuses, deviceID]);
    }
  };

  // Load tracked buses from localStorage and initialize WebSocket
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeTracking = async () => {
      try {
        // Connect to WebSocket
        await websocketService.connect();
        setIsConnected(true);

        // Load buses from localStorage
        const saved = localStorage.getItem("trackedBuses");
        if (saved) {
          const buses = JSON.parse(saved);
          setTrackedBuses(buses);
          setSelectedBuses(buses);
          
          // Fetch initial data
          await fetchMultipleBusData(buses);

          // Start tracking all buses via WebSocket
          websocketService.trackMultipleBuses(buses);
        }
      } catch (error) {
        console.error("Failed to initialize tracking:", error);
        toast.error("Failed to connect to live tracking");
      }
    };

    initializeTracking();

    // Set up WebSocket event listeners for real-time updates
    const cleanupLocation = websocketService.onLocationUpdate((data) => {
      if (trackedBuses.includes(data.deviceID)) {
        setTrackingData((prev) => {
          const index = prev.findIndex((b) => b.deviceID === data.deviceID);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            currentLocation: data.location,
            lastUpdated: data.lastUpdated,
          };
          return updated;
        });
      }
    });

    const cleanupTracking = websocketService.onTrackingUpdate((data) => {
      if (trackedBuses.includes(data.deviceID)) {
        setTrackingData((prev) => {
          const index = prev.findIndex((b) => b.deviceID === data.deviceID);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            realTimeData: {
              ...updated[index].realTimeData,
              ...data.realTimeData,
            },
            busInfo: {
              ...updated[index].busInfo,
              capacity: data.capacity || updated[index].busInfo?.capacity,
            },
          };
          return updated;
        });
      }
    });

    const cleanupPassenger = websocketService.onPassengerUpdate((data) => {
      if (trackedBuses.includes(data.deviceID)) {
        setTrackingData((prev) => {
          const index = prev.findIndex((b) => b.deviceID === data.deviceID);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            busInfo: {
              ...updated[index].busInfo,
              capacity: {
                occupiedSeats: data.occupiedSeats,
                availableSeats: data.availableSeats,
                totalSeats: data.totalSeats,
              },
            },
          };
          return updated;
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (trackedBuses.length > 0) {
        websocketService.stopTrackingMultipleBuses(trackedBuses);
      }
      cleanupLocation();
      cleanupTracking();
      cleanupPassenger();
    };
  }, []);

  // Update WebSocket tracking when buses change
  useEffect(() => {
    if (!hasInitialized.current || !isConnected) return;

    // This runs when buses are added/removed
    if (trackedBuses.length > 0) {
      websocketService.trackMultipleBuses(trackedBuses);
    }
  }, [trackedBuses, isConnected]);

  // Get bus color by index
  const getBusColor = (index) => {
    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
      "#f97316", // orange
      "#6366f1", // indigo
      "#14b8a6", // teal
    ];
    return colors[index % colors.length];
  };

  // Calculate map center
  const getMapCenter = () => {
    const visibleBuses = trackingData.filter((bus) =>
      selectedBuses.includes(bus.deviceID)
    );

    if (visibleBuses.length === 0) {
      return [28.6139, 77.209]; // Default: New Delhi
    }

    if (visibleBuses.length === 1) {
      return [
        visibleBuses[0].currentLocation.coordinates[0],
        visibleBuses[0].currentLocation.coordinates[1],
      ];
    }

    // Calculate center of all visible buses
    const avgLat =
      visibleBuses.reduce(
        (sum, bus) => sum + bus.currentLocation.coordinates[0],
        0
      ) / visibleBuses.length;
    const avgLng =
      visibleBuses.reduce(
        (sum, bus) => sum + bus.currentLocation.coordinates[1],
        0
      ) / visibleBuses.length;

    return [avgLat, avgLng];
  };

  return (
    <div
      className={`min-h-screen ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className={`text-4xl font-bold mb-2 ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                Multi-Bus Tracking
              </h1>
              <p className={darktheme ? "text-gray-400" : "text-gray-600"}>
                Track up to 10 buses simultaneously in real-time
              </p>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darktheme ? "bg-gray-800" : "bg-white shadow"
                }`}
              >
                <Activity
                  className={`w-5 h-5 ${
                    isConnected ? "text-green-500 animate-pulse" : "text-red-500"
                  }`}
                />
                <span className={darktheme ? "text-gray-300" : "text-gray-700"}>
                  {isConnected ? "Live Connected" : "Disconnected"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Add Bus Input */}
          <div
            className={`p-4 rounded-xl ${
              darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
            }`}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={newBusId}
                onChange={(e) => setNewBusId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddBus()}
                placeholder="Enter Bus Device ID (e.g., 1234567890)"
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darktheme
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                disabled={trackedBuses.length >= 10}
              />
              <button
                onClick={handleAddBus}
                disabled={adding || trackedBuses.length >= 10}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${
                  adding || trackedBuses.length >= 10
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } text-white`}
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Bus
                  </>
                )}
              </button>
            </div>
            {trackedBuses.length >= 10 && (
              <p className="text-yellow-500 text-sm mt-2">
                Maximum limit reached (10 buses)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Bus List */}
          <div className="lg:col-span-1 space-y-4">
            <h2
              className={`text-lg font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Tracked Buses ({trackedBuses.length}/10)
            </h2>

            {trackedBuses.length === 0 ? (
              <div
                className={`p-6 rounded-xl text-center ${
                  darktheme ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}
              >
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className={darktheme ? "text-gray-400" : "text-gray-600"}>
                  No buses tracked yet.
                  <br />
                  Add a bus to start tracking
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {trackedBuses.map((busId, index) => {
                  const busData = trackingData.find((b) => b.deviceID === busId);
                  const isVisible = selectedBuses.includes(busId);
                  const busColor = getBusColor(index);

                  return (
                    <div
                      key={busId}
                      className={`p-4 rounded-xl border-l-4 ${
                        darktheme
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white shadow"
                      }`}
                      style={{ borderLeftColor: busColor }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p
                            className={`font-bold ${
                              darktheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {busData?.busInfo?.name || busId}
                          </p>
                          <p
                            className={`text-xs ${
                              darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            ID: {busId}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleBusVisibility(busId)}
                            className={`p-1 rounded ${
                              isVisible
                                ? "bg-blue-500/20 text-blue-500"
                                : darktheme
                                  ? "bg-gray-700 text-gray-400"
                                  : "bg-gray-200 text-gray-500"
                            }`}
                            title={isVisible ? "Hide on map" : "Show on map"}
                          >
                            {isVisible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveBus(busId)}
                            className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {busData && (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <Gauge className="w-3 h-3" />
                            <span>{Math.round(busData.realTimeData?.speed || 0)} km/h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>
                              {busData.realTimeData?.currentPassengers || 0}{" "}
                              passengers
                            </span>
                          </div>
                          {busData.busInfo?.capacity && (
                            <div
                              className={`text-xs px-2 py-1 rounded mt-2 ${
                                busData.busInfo.capacity.availableSeats > 10
                                  ? "bg-green-500/20 text-green-500"
                                  : busData.busInfo.capacity.availableSeats > 5
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-red-500/20 text-red-500"
                              }`}
                            >
                              {busData.busInfo.capacity.availableSeats} seats available
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/track/${busId}`)}
                        className={`w-full mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          darktheme
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        <Maximize2 className="w-3 h-3 inline mr-1" />
                        Full View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-3">
            <div
              className={`rounded-2xl overflow-hidden shadow-xl ${
                darktheme ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-bold ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Live Map View
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-500 font-medium">
                      {selectedBuses.length} bus{selectedBuses.length !== 1 ? "es" : ""}{" "}
                      visible
                    </span>
                  </div>
                </div>

                <MapContainer
                  center={getMapCenter()}
                  zoom={12}
                  style={{ height: "600px", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer
                    url={
                      darktheme
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                  />

                  {trackingData.map((bus, index) => {
                    if (!selectedBuses.includes(bus.deviceID)) return null;

                    const position = [
                      bus.currentLocation.coordinates[0],
                      bus.currentLocation.coordinates[1],
                    ];
                    const busColor = getBusColor(
                      trackedBuses.indexOf(bus.deviceID)
                    );

                    return (
                      <React.Fragment key={bus.deviceID}>
                        {/* Bus marker */}
                        <Marker
                          position={position}
                          icon={L.divIcon({
                            html: `
                              <div style="
                                transform: rotate(${bus.realTimeData?.direction || 0}deg);
                                width: 40px;
                                height: 40px;
                                background: ${busColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border: 3px solid white;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                                font-size: 20px;
                              ">
                                🚌
                              </div>
                            `,
                            className: "",
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                          })}
                        >
                          <Popup>
                            <div className="p-2">
                              <p className="font-bold">
                                {bus.busInfo?.name || bus.deviceID}
                              </p>
                              <p className="text-sm">
                                Speed: {Math.round(bus.realTimeData?.speed || 0)} km/h
                              </p>
                              <p className="text-sm">
                                Passengers: {bus.realTimeData?.currentPassengers || 0}
                              </p>
                              {bus.busInfo?.capacity && (
                                <p className="text-sm">
                                  Available: {bus.busInfo.capacity.availableSeats} seats
                                </p>
                              )}
                              <button
                                onClick={() => navigate(`/track/${bus.deviceID}`)}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                View Details
                              </button>
                            </div>
                          </Popup>
                        </Marker>

                        {/* Circle around bus */}
                        <Circle
                          center={position}
                          radius={100}
                          pathOptions={{
                            color: busColor,
                            fillColor: busColor,
                            fillOpacity: 0.1,
                            weight: 2,
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                </MapContainer>

                {loading && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiBusTracking;
