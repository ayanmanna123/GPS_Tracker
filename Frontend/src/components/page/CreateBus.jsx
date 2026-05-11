import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import TurnstileCaptcha from "../shared/TurnstileCaptcha";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// --- Internal Helper Components ---
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapUpdater = ({ waypoints, routePath }) => {
  const map = useMap();
  useEffect(() => {
    if (routePath.length > 1) {
      map.fitBounds(routePath, { padding: [50, 50] });
    } else if (waypoints.length > 1) {
      map.fitBounds(waypoints, { padding: [50, 50] });
    } else if (waypoints.length === 1) {
      map.setView(waypoints[0], 14);
    }
  }, [waypoints, routePath, map]);
  return null;
};

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
  RotateCcw,
  Eraser,
  Route as RouteIcon
} from "lucide-react";

const CreateBus = () => {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
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

  // Route States (inspired by SecretRouteEditor)
  const [waypoints, setWaypoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);

  // Separate states for "From" search
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);

  // Separate states for "To" search
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Map states
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);

  const fetchRouteFromOSRM = async (points) => {
    if (points.length < 2) return;
    try {
      const coordinatesString = points.map(p => `${p[1]},${p[0]}`).join(';');
      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?geometries=geojson&overview=full`);
      if (res.data.code === 'Ok') {
        const coordinates = res.data.routes[0].geometry.coordinates;
        // Simplify: Take every 10th point to keep it efficient while maintaining shape
        const simplified = coordinates.filter((_, index) => index % 10 === 0 || index === coordinates.length - 1);
        
        // Map to [lat, lng] and filter out any invalid points
        const latLngs = simplified
          .map(c => [c[1], c[0]])
          .filter(p => p[0] !== 0 || p[1] !== 0);
          
        setRoutePath(latLngs);
      }
    } catch (err) {
      console.error("OSRM Error:", err);
      // Fallback to waypoints if OSRM fails
      setRoutePath(points);
    }
  };

  // Reverse geocoding helper
  const reverseGeocode = async (lat, lon, setter, querySetter, type) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.display_name) {
        setter(data.display_name);
        querySetter(data.display_name);
        
        // Update waypoints accordingly
        const coords = [lat, lon];
        if (type === 'from') {
          updateWaypoints(coords, 0);
        } else if (type === 'to') {
          updateWaypoints(coords, waypoints.length > 1 ? waypoints.length - 1 : 1);
        }
      }
    } catch (error) {
      console.error("Reverse geocode failed:", error);
    }
  };

  const updateWaypoints = (coords, index) => {
    setWaypoints(prev => {
      const newWp = [...prev];
      if (index === 0 && prev.length === 0) {
        newWp[0] = coords;
      } else if (index >= prev.length) {
        newWp[prev.length] = coords;
      } else {
        newWp[index] = coords;
      }
      
      if (newWp.length >= 2) {
        fetchRouteFromOSRM(newWp);
      }
      return newWp;
    });
  };

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
    if (e) e.preventDefault();
    if (!turnstileToken) {
      toast.error("Please verify that you are human.");
      return;
    }
    setLoading(true);
    setSuccess(null);

    try {
      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (err) {
        if (
          err.error === "consent_required" ||
          err.message === "Consent required" ||
          err.error === "login_required"
        ) {
          token = await getAccessTokenWithPopup();
        } else {
          throw err;
        }
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
          turnstileToken,
          route: routePath // Send the generated route points
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(t("createBus.successMessage"));
      setDeviceID("");
      setFrom("");
      setTo("");
      setName("");
      setFromSearchQuery("");
      setToSearchQuery("");
      setFromCoords(null);
      setToCoords(null);
      setticketPrice("");
      setTurnstileToken("");
      setTimeSlots([{ startTime: "", endTime: "" }]);
      setWaypoints([]);
      setRoutePath([]);
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

  // Handle Map Click (to add custom waypoints)
  const handleMapClick = (coords) => {
    let newWaypoints;
    if (waypoints.length >= 2) {
      // Insert new point before the destination
      newWaypoints = [
        ...waypoints.slice(0, waypoints.length - 1),
        coords,
        waypoints[waypoints.length - 1]
      ];
    } else {
      newWaypoints = [...waypoints, coords];
    }
    
    setWaypoints(newWaypoints);
    if (newWaypoints.length >= 2) {
      fetchRouteFromOSRM(newWaypoints);
    }
  };

  const handleUndo = () => {
    if (waypoints.length === 0) return;
    let newWaypoints;
    if (waypoints.length > 2) {
      newWaypoints = [...waypoints.slice(0, waypoints.length - 2), waypoints[waypoints.length - 1]];
    } else {
      newWaypoints = waypoints.slice(0, -1);
    }
    setWaypoints(newWaypoints);
    if (newWaypoints.length >= 2) fetchRouteFromOSRM(newWaypoints);
    else setRoutePath([]);
  };

  const handleClearRoute = () => {
    setWaypoints([]);
    setRoutePath([]);
    setFromCoords(null);
    setToCoords(null);
    setFrom("");
    setTo("");
    setFromSearchQuery("");
    setToSearchQuery("");
  };

  // Handle "From" suggestion click
  const handleFromSuggestionClick = (place) => {
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    setFrom(place.display_name);
    setFromSearchQuery(place.display_name);
    setFromCoords(coords);
    updateWaypoints(coords, 0);
    setFromSuggestions([]);
    setShowFromSuggestions(false);
  };

  // Handle "To" suggestion click
  const handleToSuggestionClick = (place) => {
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    setTo(place.display_name);
    setToSearchQuery(place.display_name);
    setToCoords(coords);
    
    setWaypoints(prev => {
       let newWp;
       if (prev.length === 0) newWp = [coords];
       else newWp = [...prev.slice(0, prev.length > 1 ? -1 : undefined), coords];
       
       if (newWp.length >= 2) fetchRouteFromOSRM(newWp);
       return newWp;
    });
    
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
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}>
              <Bus className={`w-8 h-8 ${darktheme ? "text-blue-400" : "text-white"}`} />
            </div>
          </div>
          <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${darktheme ? "from-blue-400 via-purple-400 to-pink-400" : "from-blue-600 via-purple-600 to-pink-600"} bg-clip-text text-transparent`}>
            {t("createBus.pageTitle")}
          </h1>
        </div>

        <div className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm max-w-4xl mx-auto ${darktheme ? "bg-gray-800/80 border-gray-700/50" : "bg-white/90 border-white/50"}`}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                    <Bus className="w-4 h-4" /> {t("createBus.busName")}
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("createBus.busNamePlaceholder")} className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} required />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                      <Navigation className="w-4 h-4" /> {t("createBus.deviceID")}
                    </label>
                    <input value={deviceID} onChange={(e) => setDeviceID(e.target.value)} placeholder={t("createBus.deviceIDPlaceholder")} className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} required />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                      <DollarSign className="w-4 h-4" /> {t("createBus.ticketPrice")}
                    </label>
                    <input value={ticketPrice} onChange={(e) => setticketPrice(e.target.value)} placeholder={t("createBus.ticketPricePlaceholder")} className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} required />
                  </div>
                </div>

                {/* From Search */}
                <div className="relative">
                  <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                    <MapPin className="w-4 h-4 text-green-500" /> Start Point
                  </label>
                  <input type="text" value={fromSearchQuery} onChange={async (e) => {
                    const val = e.target.value; setFromSearchQuery(val);
                    if (val.length > 2) {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
                      setFromSuggestions(await res.json()); setShowFromSuggestions(true);
                    }
                  }} placeholder="Search start location..." className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <ul className={`absolute z-50 w-full mt-2 rounded-xl border-2 overflow-hidden shadow-2xl backdrop-blur-md ${darktheme ? "bg-gray-800/95 border-gray-700" : "bg-white/95"}`}>
                      {fromSuggestions.map(p => <li key={p.place_id} onClick={() => handleFromSuggestionClick(p)} className={`p-4 cursor-pointer text-sm border-b last:border-b-0 hover:bg-blue-500/10 ${darktheme ? "text-gray-200 border-gray-700" : "text-gray-700"}`}>{p.display_name}</li>)}
                    </ul>
                  )}
                </div>

                {/* To Search */}
                <div className="relative">
                  <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                    <MapPin className="w-4 h-4 text-red-500" /> End Point
                  </label>
                  <input type="text" value={toSearchQuery} onChange={async (e) => {
                    const val = e.target.value; setToSearchQuery(val);
                    if (val.length > 2) {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
                      setToSuggestions(await res.json()); setShowToSuggestions(true);
                    }
                  }} placeholder="Search destination..." className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <ul className={`absolute z-50 w-full mt-2 rounded-xl border-2 overflow-hidden shadow-2xl backdrop-blur-md ${darktheme ? "bg-gray-800/95 border-gray-700" : "bg-white/95"}`}>
                      {toSuggestions.map(p => <li key={p.place_id} onClick={() => handleToSuggestionClick(p)} className={`p-4 cursor-pointer text-sm border-b last:border-b-0 hover:bg-blue-500/10 ${darktheme ? "text-gray-200 border-gray-700" : "text-gray-700"}`}>{p.display_name}</li>)}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Column: Route Map Editor */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-bold flex items-center gap-2 ${darktheme ? "text-blue-400" : "text-blue-600"}`}>
                    <RouteIcon className="w-5 h-5" /> Define Bus Route
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleUndo} disabled={waypoints.length === 0} className={`p-2 rounded-lg transition-colors ${darktheme ? "bg-gray-700 hover:bg-gray-600 text-yellow-400" : "bg-yellow-50 hover:bg-yellow-100 text-yellow-700"}`} title="Undo Last Point">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={handleClearRoute} disabled={waypoints.length === 0} className={`p-2 rounded-lg transition-colors ${darktheme ? "bg-gray-700 hover:bg-gray-600 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-700"}`} title="Clear Route">
                      <Eraser className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-[450px] w-full rounded-2xl overflow-hidden border-2 relative z-0 shadow-inner group">
                   <MapContainer 
                     center={waypoints[0] || [22.5726, 88.3639]} 
                     zoom={12} 
                     style={{ height: "100%", width: "100%" }}
                   >
                     <TileLayer url={darktheme ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                     <MapClickHandler onMapClick={handleMapClick} />
                     <MapUpdater waypoints={waypoints} routePath={routePath} />
                     
                     {waypoints.map((pt, idx) => (
                       <Marker key={idx} position={pt} draggable={true} eventHandlers={{
                         dragend: (e) => {
                            const pos = e.target.getLatLng();
                            const newWp = [...waypoints];
                            newWp[idx] = [pos.lat, pos.lng];
                            setWaypoints(newWp);
                            if (newWp.length >= 2) fetchRouteFromOSRM(newWp);
                            
                            // Also update text address for start/end
                            if (idx === 0) reverseGeocode(pos.lat, pos.lng, setFrom, setFromSearchQuery, 'from');
                            if (idx === newWp.length - 1) reverseGeocode(pos.lat, pos.lng, setTo, setToSearchQuery, 'to');
                         }
                       }}>
                         <Popup className="font-bold">{idx === 0 ? "START" : idx === waypoints.length - 1 ? "END" : `Waypoint ${idx}`}</Popup>
                       </Marker>
                     ))}

                     {routePath.length > 1 && <Polyline positions={routePath} color="#3b82f6" weight={5} opacity={0.7} />}
                   </MapContainer>
                   <div className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                     Click map to add waypoints
                   </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 border-dashed ${darktheme ? "bg-blue-500/5 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                   <p className="text-xs font-medium text-center">
                     {waypoints.length < 2 
                       ? "Add at least two points on the map to define the route."
                       : `Route generated with ${routePath.length} path coordinates.`}
                   </p>
                </div>
              </div>
            </div>

            {/* Time Slots Section */}
            <div className={`p-6 rounded-2xl border ${darktheme ? "bg-gray-900/40 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <label className={`text-sm font-bold mb-4 flex items-center gap-2 ${darktheme ? "text-gray-300" : "text-gray-700"}`}>
                <Clock className="w-5 h-5 text-purple-500" /> {t("createBus.timeSlots")}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 items-center bg-transparent p-2 rounded-xl">
                    <input type="time" value={slot.startTime} onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)} className={`flex-1 p-3 border-2 rounded-xl ${darktheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`} required />
                    <span className="opacity-50">→</span>
                    <input type="time" value={slot.endTime} onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)} className={`flex-1 p-3 border-2 rounded-xl ${darktheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`} required />
                    {timeSlots.length > 1 && (
                      <button type="button" onClick={() => removeTimeSlot(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTimeSlot} className={`mt-4 w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-dashed ${darktheme ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/10" : "border-purple-200 text-purple-600 hover:bg-purple-50"}`}>
                <Plus className="w-5 h-5" /> {t("createBus.addTimeSlot")}
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              <TurnstileCaptcha onVerify={(token) => setTurnstileToken(token)} />
              <button type="submit" onClick={handleSubmit} disabled={loading} className={`w-full max-w-md py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 ${loading ? "opacity-50 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-105 hover:shadow-blue-500/40 text-white"}`}>
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>{t("createBus.creating")}</span></> : <><Send className="w-6 h-6" /><span>{t("createBus.createButton")}</span></>}
              </button>
            </div>
            
            {success && <div className={`p-4 rounded-xl text-center font-bold border-2 animate-bounce ${success.includes(t("createBus.successMessage")) ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>{success}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBus;
