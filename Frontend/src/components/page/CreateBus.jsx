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
    // Extract coordinates from waypoint objects if needed
    const points = waypoints.map(w => Array.isArray(w) ? w : w.coordinates);
    if (routePath.length > 1) {
      map.fitBounds(routePath, { padding: [50, 50] });
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
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
  Route as RouteIcon,
  X,
  Info
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

  // Route States
  const [waypoints, setWaypoints] = useState([]); // Array of { coordinates: [lat, lng], name, price, arrivalTime }
  const [routePath, setRoutePath] = useState([]);
  
  // Modal States
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [currentStopData, setCurrentStopData] = useState({
    coordinates: null,
    name: "",
    price: "",
    arrivalTime: "",
    index: -1 // -1 for new, >=0 for edit
  });

  // Separate states for search
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fetchRouteFromOSRM = async (points) => {
    // points is an array of [lat, lng]
    if (points.length < 2) return;
    try {
      const coordinatesString = points.map(p => `${p[1]},${p[0]}`).join(';');
      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?geometries=geojson&overview=full`);
      if (res.data.code === 'Ok') {
        const coordinates = res.data.routes[0].geometry.coordinates;
        const simplified = coordinates.filter((_, index) => index % 10 === 0 || index === coordinates.length - 1);
        const latLngs = simplified.map(c => [c[1], c[0]]).filter(p => p[0] !== 0 || p[1] !== 0);
        setRoutePath(latLngs);
      }
    } catch (err) {
      console.error("OSRM Error:", err);
      setRoutePath(points);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data?.display_name || `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      return `Location at ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const handleMapClick = async (coords) => {
    const autoName = await reverseGeocode(coords[0], coords[1]);
    setCurrentStopData({
      coordinates: coords,
      name: autoName,
      price: "",
      arrivalTime: "",
      index: -1
    });
    setIsStopModalOpen(true);
  };

  const saveStopData = () => {
    let newWaypoints;
    if (currentStopData.index === -1) {
      // Adding new point
      if (waypoints.length >= 2) {
        newWaypoints = [
          ...waypoints.slice(0, waypoints.length - 1),
          currentStopData,
          waypoints[waypoints.length - 1]
        ];
      } else {
        newWaypoints = [...waypoints, currentStopData];
      }
    } else {
      // Editing existing point
      newWaypoints = [...waypoints];
      newWaypoints[currentStopData.index] = currentStopData;
    }
    
    setWaypoints(newWaypoints);
    fetchRouteFromOSRM(newWaypoints.map(w => w.coordinates));
    setIsStopModalOpen(false);
    
    // Auto-fill from/to if they are the first/last points
    if (currentStopData.index === 0 || (currentStopData.index === -1 && waypoints.length === 0)) {
       setFrom(currentStopData.name);
       setFromSearchQuery(currentStopData.name);
    } else if (currentStopData.index === waypoints.length - 1 || (currentStopData.index === -1 && waypoints.length >= 1)) {
       setTo(currentStopData.name);
       setToSearchQuery(currentStopData.name);
    }
  };

  const handleMarkerClick = (index) => {
    setCurrentStopData({ ...waypoints[index], index });
    setIsStopModalOpen(true);
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

    try {
      const token = await getAccessTokenSilently();
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
          route: routePath,
          stops: waypoints.map(w => ({
            name: w.name,
            coordinates: w.coordinates,
            price: parseFloat(w.price) || 0,
            arrivalTime: w.arrivalTime
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Bus created successfully!");
      navigate("/Bus");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create bus");
    } finally {
      setLoading(false);
    }
  };

  // Search handlers
  const handleFromSuggestionClick = async (place) => {
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    const stopObj = { coordinates: coords, name: place.display_name, price: "", arrivalTime: "", index: 0 };
    setFrom(place.display_name);
    setFromSearchQuery(place.display_name);
    
    setWaypoints(prev => {
      const newWp = prev.length === 0 ? [stopObj] : [stopObj, ...prev.slice(1)];
      if (newWp.length >= 2) fetchRouteFromOSRM(newWp.map(w => w.coordinates));
      return newWp;
    });
    setFromSuggestions([]);
    setShowFromSuggestions(false);
  };

  const handleToSuggestionClick = async (place) => {
    const coords = [parseFloat(place.lat), parseFloat(place.lon)];
    const stopObj = { coordinates: coords, name: place.display_name, price: "", arrivalTime: "", index: -1 };
    setTo(place.display_name);
    setToSearchQuery(place.display_name);
    
    setWaypoints(prev => {
      let newWp;
      if (prev.length === 0) newWp = [stopObj];
      else newWp = [...prev.slice(0, prev.length > 1 ? -1 : undefined), { ...stopObj, index: prev.length }];
      if (newWp.length >= 2) fetchRouteFromOSRM(newWp.map(w => w.coordinates));
      return newWp;
    });
    setToSuggestions([]);
    setShowToSuggestions(false);
  };

  return (
    <div className={`min-h-screen relative ${darktheme ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"}`}>
      <Navbar />
      
      {/* Stop Details Modal */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in zoom-in duration-200">
           <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border ${darktheme ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"}`}>
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="text-blue-500" /> Stoppage Details
                 </h2>
                 <button onClick={() => setIsStopModalOpen(false)} className="p-2 hover:bg-gray-500/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">Place Name</label>
                    <input 
                       value={currentStopData.name} 
                       onChange={(e) => setCurrentStopData({ ...currentStopData, name: e.target.value })}
                       className={`w-full p-3 rounded-xl border-2 focus:outline-none transition-all ${darktheme ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-500"}`}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">Price (₹)</label>
                       <input 
                          type="number"
                          placeholder="e.g. 20"
                          value={currentStopData.price} 
                          onChange={(e) => setCurrentStopData({ ...currentStopData, price: e.target.value })}
                          className={`w-full p-3 rounded-xl border-2 focus:outline-none transition-all ${darktheme ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-500"}`}
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 block">Arrival Time</label>
                       <input 
                          type="time"
                          value={currentStopData.arrivalTime} 
                          onChange={(e) => setCurrentStopData({ ...currentStopData, arrivalTime: e.target.value })}
                          className={`w-full p-3 rounded-xl border-2 focus:outline-none transition-all ${darktheme ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500" : "bg-white border-gray-100 focus:border-blue-500"}`}
                       />
                    </div>
                 </div>
                 
                 <div className={`p-4 rounded-xl flex gap-3 ${darktheme ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">Adding a price helps passengers calculate their fare automatically when they search for this bus.</p>
                 </div>
                 
                 <button 
                    onClick={saveStopData}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                 >
                    Save Stoppage
                 </button>
              </div>
           </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-black mb-4 bg-gradient-to-r ${darktheme ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"} bg-clip-text text-transparent`}>
            {t("createBus.pageTitle")}
          </h1>
          <p className="opacity-60 max-w-xl mx-auto">Design your route, set stoppage prices, and manage your bus schedule with precision.</p>
        </div>

        <div className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm grid grid-cols-1 lg:grid-cols-12 gap-8 ${darktheme ? "bg-gray-800/80 border-gray-700/50" : "bg-white/90 border-white/50"}`}>
          {/* Form Section */}
          <div className="lg:col-span-5 space-y-6">
             <div>
                <label className="text-sm font-bold flex items-center gap-2 mb-3">
                   <Bus className="w-4 h-4" /> Bus Name
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Royal Express" className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-bold flex items-center gap-2 mb-3">
                      <Navigation className="w-4 h-4" /> Device ID
                   </label>
                   <input value={deviceID} onChange={(e) => setDeviceID(e.target.value)} placeholder="GPS-101" className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} />
                </div>
                <div>
                   <label className="text-sm font-bold flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4" /> Base Price
                   </label>
                   <input value={ticketPrice} onChange={(e) => setticketPrice(e.target.value)} placeholder="50" className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700 text-white" : "bg-white border-gray-200"}`} />
                </div>
             </div>

             {/* Locations */}
             <div className="space-y-4">
                <div className="relative">
                   <label className="text-xs font-bold uppercase opacity-60 mb-2 block">Origin</label>
                   <input value={fromSearchQuery} onChange={async (e) => {
                      const val = e.target.value; setFromSearchQuery(val);
                      if (val.length > 2) {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
                        setFromSuggestions(await res.json()); setShowFromSuggestions(true);
                      }
                   }} className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"}`} />
                   {showFromSuggestions && fromSuggestions.length > 0 && (
                      <ul className={`absolute z-[100] w-full mt-2 rounded-xl border-2 shadow-2xl backdrop-blur-md ${darktheme ? "bg-gray-800/95 border-gray-700" : "bg-white/95"}`}>
                        {fromSuggestions.map(p => <li key={p.place_id} onClick={() => handleFromSuggestionClick(p)} className="p-4 cursor-pointer text-sm hover:bg-blue-500/10">{p.display_name}</li>)}
                      </ul>
                   )}
                </div>
                <div className="relative">
                   <label className="text-xs font-bold uppercase opacity-60 mb-2 block">Destination</label>
                   <input value={toSearchQuery} onChange={async (e) => {
                      const val = e.target.value; setToSearchQuery(val);
                      if (val.length > 2) {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
                        setToSuggestions(await res.json()); setShowToSuggestions(true);
                      }
                   }} className={`w-full p-4 border-2 rounded-xl ${darktheme ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"}`} />
                   {showToSuggestions && toSuggestions.length > 0 && (
                      <ul className={`absolute z-[100] w-full mt-2 rounded-xl border-2 shadow-2xl backdrop-blur-md ${darktheme ? "bg-gray-800/95 border-gray-700" : "bg-white/95"}`}>
                        {toSuggestions.map(p => <li key={p.place_id} onClick={() => handleToSuggestionClick(p)} className="p-4 cursor-pointer text-sm hover:bg-blue-500/10">{p.display_name}</li>)}
                      </ul>
                   )}
                </div>
             </div>

             {/* Time Slots */}
             <div className={`p-4 rounded-2xl border ${darktheme ? "bg-gray-900/40 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <label className="text-sm font-bold flex items-center gap-2 mb-4">
                   <Clock className="w-5 h-5 text-purple-500" /> Schedule Slots
                </label>
                <div className="space-y-3">
                   {timeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-center">
                         <input type="time" value={slot.startTime} onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)} className={`flex-1 p-3 border-2 rounded-xl ${darktheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} required />
                         <span className="opacity-30">→</span>
                         <input type="time" value={slot.endTime} onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)} className={`flex-1 p-3 border-2 rounded-xl ${darktheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} required />
                         {timeSlots.length > 1 && <button type="button" onClick={() => removeTimeSlot(index)} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>}
                      </div>
                   ))}
                   <button type="button" onClick={addTimeSlot} className="w-full p-3 rounded-xl border-2 border-dashed border-purple-500/30 text-purple-500 font-bold hover:bg-purple-500/5">
                      <Plus className="w-4 h-4 inline mr-2" /> Add Time Slot
                   </button>
                </div>
             </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-7 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-500 flex items-center gap-2">
                   <RouteIcon className="w-5 h-5" /> Interactive Route Builder
                </span>
                <div className="flex gap-2">
                   <button onClick={() => { setWaypoints(prev => prev.slice(0, -1)); fetchRouteFromOSRM(waypoints.slice(0, -1).map(w => w.coordinates)); }} className="p-2 bg-gray-500/10 rounded-lg"><RotateCcw className="w-4 h-4" /></button>
                   <button onClick={() => { setWaypoints([]); setRoutePath([]); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Eraser className="w-4 h-4" /></button>
                </div>
             </div>

             <div className="h-[550px] w-full rounded-3xl overflow-hidden border-2 relative z-0 shadow-inner group">
                <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: "100%", width: "100%" }}>
                   <TileLayer url={darktheme ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                   <MapClickHandler onMapClick={handleMapClick} />
                   <MapUpdater waypoints={waypoints} routePath={routePath} />
                   
                   {waypoints.map((stop, idx) => (
                      <Marker 
                        key={idx} 
                        position={stop.coordinates} 
                        draggable={true}
                        eventHandlers={{ 
                          click: () => handleMarkerClick(idx),
                          dragend: async (e) => {
                             const pos = e.target.getLatLng();
                             const coords = [pos.lat, pos.lng];
                             
                             // Update waypoint data
                             const newWp = [...waypoints];
                             const updatedStop = { ...newWp[idx], coordinates: coords };
                             
                             // If it's a drag, we might want to update the name too
                             const newName = await reverseGeocode(pos.lat, pos.lng);
                             updatedStop.name = newName;
                             
                             newWp[idx] = updatedStop;
                             setWaypoints(newWp);
                             
                             // Re-calculate route
                             fetchRouteFromOSRM(newWp.map(w => w.coordinates));
                             
                             // Update the search query inputs if it's start/end
                             if (idx === 0) {
                               setFrom(newName);
                               setFromSearchQuery(newName);
                             } else if (idx === newWp.length - 1) {
                               setTo(newName);
                               setToSearchQuery(newName);
                             }
                          }
                        }}
                      >
                         <Popup className="font-bold">
                            <div className="p-1">
                               <p className="text-blue-600">{stop.name}</p>
                               {stop.price && <p className="text-xs text-gray-500">Price: ₹{stop.price}</p>}
                               {stop.arrivalTime && <p className="text-xs text-gray-500">Time: {stop.arrivalTime}</p>}
                               <p className="text-[10px] text-gray-400 italic mt-1">(Click marker to edit details)</p>
                            </div>
                         </Popup>
                      </Marker>
                   ))}

                   {routePath.length > 1 && <Polyline positions={routePath} color="#3b82f6" weight={6} opacity={0.8} />}
                </MapContainer>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                   Click on the map to add stops and set prices
                </div>
             </div>

             <div className="flex flex-col items-center gap-6 mt-4">
                <TurnstileCaptcha onVerify={(token) => setTurnstileToken(token)} />
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                   {loading ? "Creating Bus..." : "Launch Bus Service"}
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBus;
