import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../shared/Navbar';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const SecretRouteEditor = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { darktheme } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/AllLocation?limit=100`);
        if (res.data.success) {
          setBuses(res.data.buses);
        }
      } catch (err) {
        console.error('Error fetching buses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const fetchRouteFromOSRM = async (points) => {
    if (points.length < 2) return;
    try {
      const coordinatesString = points.map(p => `${p[1]},${p[0]}`).join(';');
      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?geometries=geojson&overview=full`);
      if (res.data.code === 'Ok') {
        const coordinates = res.data.routes[0].geometry.coordinates;
        // Simplify: Take every 10th point to keep it efficient
        const simplified = coordinates.filter((_, index) => index % 10 === 0 || index === coordinates.length - 1);
        
        // Map to [lat, lng] and filter out any invalid points
        const latLngs = simplified
          .map(c => [c[1], c[0]])
          .filter(p => p[0] !== 0 || p[1] !== 0);
          
        setRoutePath(latLngs);
      }
    } catch (err) {
      console.error("OSRM Error:", err);
      setRoutePath(points);
    }
  };

  const handleBusChange = async (e) => {
    const deviceID = e.target.value;
    setSelectedBus(deviceID);
    const busObj = buses.find(b => b.deviceID === deviceID);
    
    if (deviceID) {
       try {
         setLoading(true);
         const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/get/location/${deviceID}`);
         let validRoute = false;
         
         if (res.data.success && res.data.data.route && res.data.data.route.length > 1) {
           const existingPoints = res.data.data.route.map(p => p.coordinates);
           // Ignore default [0,0] points
           const nonZeroPoints = existingPoints.filter(p => p[0] !== 0 && p[1] !== 0);
           if (nonZeroPoints.length > 1) {
             setRoutePath(nonZeroPoints);
             setWaypoints([nonZeroPoints[0], nonZeroPoints[nonZeroPoints.length - 1]]);
             validRoute = true;
           }
         }
         
         if (!validRoute) {
            // Geocode 'from' and 'to'
            if (busObj && busObj.from && busObj.to) {
               const geocode = async (address) => {
                 try {
                   // Add a small delay to respect Nominatim API limits
                   await new Promise(r => setTimeout(r, 1000));
                   const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                   if (res.data && res.data.length > 0) {
                     return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
                   }
                 } catch(e) { console.error("Geocoding failed", e); }
                 return null;
               };
               
               const fromCoords = await geocode(busObj.from);
               const toCoords = await geocode(busObj.to);
               
               if (fromCoords && toCoords) {
                 const newWaypoints = [fromCoords, toCoords];
                 setWaypoints(newWaypoints);
                 await fetchRouteFromOSRM(newWaypoints);
               } else {
                 setRoutePath([]);
                 setWaypoints([]);
                 alert("Could not automatically locate the From/To addresses. Please click on the map to set them.");
               }
            } else {
               setRoutePath([]);
               setWaypoints([]);
            }
         }
       } catch (err) {
         console.error('Error fetching bus route:', err);
         setRoutePath([]);
         setWaypoints([]);
       } finally {
         setLoading(false);
       }
    } else {
      setRoutePath([]);
      setWaypoints([]);
    }
  };

  const handleMapClick = (coords) => {
    if (!selectedBus) {
      alert("Please select a bus first");
      return;
    }
    
    let newWaypoints;
    if (waypoints.length >= 2) {
      // Insert the new point just before the last point (the "To" destination)
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
    } else {
      setRoutePath(newWaypoints);
    }
  };

  const handleUndo = () => {
    let newWaypoints;
    if (waypoints.length > 2) {
      // Remove the last added intermediate waypoint (at index length - 2)
      newWaypoints = [
        ...waypoints.slice(0, waypoints.length - 2),
        waypoints[waypoints.length - 1]
      ];
    } else {
      newWaypoints = waypoints.slice(0, -1);
    }
    
    setWaypoints(newWaypoints);
    if (newWaypoints.length >= 2) {
      fetchRouteFromOSRM(newWaypoints);
    } else {
      setRoutePath(newWaypoints);
    }
  };

  const handleClear = () => {
    setWaypoints([]);
    setRoutePath([]);
  };

  const handleSave = async () => {
    if (!selectedBus || routePath.length === 0) return;
    try {
      setSaving(true);
      const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/update/manual-route`, {
        deviceID: selectedBus,
        routePoints: routePath
      });
      if (res.data.success) {
        alert("Route saved successfully!");
      }
    } catch (err) {
      console.error('Error saving route:', err);
      alert("Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${darktheme ? "bg-gray-900" : "bg-gray-50"} flex flex-col`}>
      <Navbar />
      <div className="container mx-auto p-4 flex-1 flex flex-col">
        <h1 className={`text-2xl font-bold mb-4 ${darktheme ? "text-white" : "text-gray-800"}`}>Secret Route Editor</h1>
        
        <div className={`p-4 mb-4 rounded-lg shadow ${darktheme ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className={`block mb-2 text-sm font-medium ${darktheme ? "text-gray-300" : "text-gray-700"}`}>Select Bus</label>
              <select 
                value={selectedBus} 
                onChange={handleBusChange}
                disabled={loading}
                className={`w-full p-2 border rounded ${darktheme ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="">-- Select a Bus --</option>
                {buses.map(bus => (
                  <option key={bus.deviceID} value={bus.deviceID}>
                    {bus.deviceID} {bus.from && bus.to ? `(${bus.from} -> ${bus.to})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <button onClick={handleUndo} disabled={waypoints.length === 0} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50">
              Undo Last Point
            </button>
            <button onClick={handleClear} disabled={waypoints.length === 0 && routePath.length === 0} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
              Clear All
            </button>
            <button onClick={handleSave} disabled={!selectedBus || saving || routePath.length === 0} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Route'}
            </button>
          </div>
          
          <div className={`mt-2 text-sm flex justify-between ${darktheme ? "text-gray-400" : "text-gray-500"}`}>
            <div>{loading ? <span className="text-blue-500">Loading / Geocoding...</span> : <span>Waypoints: {waypoints.length} | Generated Route Points: {routePath.length}</span>}</div>
            <div className="italic">Tip: You can drag the markers to adjust their locations.</div>
          </div>
        </div>

        <div className="flex-1 rounded-lg overflow-hidden border border-gray-300 shadow-lg" style={{ height: '600px', minHeight: '600px' }}>
          <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: '600px', width: '100%', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            <MapUpdater waypoints={waypoints} routePath={routePath} />
            
            {waypoints.map((pt, index) => (
              <Marker 
                key={index} 
                position={pt}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    const newWaypoints = [...waypoints];
                    newWaypoints[index] = [position.lat, position.lng];
                    setWaypoints(newWaypoints);
                    if (newWaypoints.length >= 2) {
                      fetchRouteFromOSRM(newWaypoints);
                    } else {
                      setRoutePath(newWaypoints);
                    }
                  }
                }}
              >
                <Popup>{index === 0 ? "From (Draggable)" : index === waypoints.length - 1 ? "To (Draggable)" : `Waypoint ${index + 1} (Draggable)`}</Popup>
              </Marker>
            ))}
            
            {routePath.length > 1 && (
              <Polyline positions={routePath} color="blue" weight={4} opacity={0.7} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SecretRouteEditor;
