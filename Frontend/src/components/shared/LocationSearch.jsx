// components/shared/LocationSearch.jsx - FIXED VERSION
import { useState, useEffect } from "react";
import { ArrowLeftRight, MapPin, Loader2, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSpeechToText from "../../hooks/useSpeechToText";
import { geocodeAddress } from "../../services/geocode";
import { Mic, X } from "lucide-react";

export default function LocationSearch({
  onCoordsSelect,
  onLocationChange,
  searchType = "route",
}) {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  // Fetch address suggestions with debouncing
  const fetchSuggestions = async (query, setFn, type) => {
    if (query.length < 2) {
      setFn([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();

      console.log("Fetched suggestions:", data);

      if (!Array.isArray(data)) {
        console.warn("Expected array, got:", data);
        throw new Error("Invalid API response");
      }

      setFn(data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setFn([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced fetch suggestions
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  // Handle input changes
  const handleFromLocationChange = (value) => {
    setFromLocation(value);
    setActiveInput("from");
    if (value.length >= 2) {
      debouncedFetchSuggestions(value, setFromSuggestions, "from");
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToLocationChange = (value) => {
    setToLocation(value);
    setActiveInput("to");
    if (value.length >= 2) {
      debouncedFetchSuggestions(value, setToSuggestions, "to");
    } else {
      setToSuggestions([]);
    }
  };

  // FIXED: Select from suggestion with proper coordinate handling
  const selectFrom = (place) => {
    // FIXED: Ensure coordinates are properly formatted as numbers with correct naming
    const coords = {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon), // Use 'lon' not 'lng' to match backend
    };

    console.log("From coordinates selected:", coords);

    setFromLocation(place.display_name);
    setFromCoords(coords);
    setFromSuggestions([]);
    setActiveInput(null);

    // Notify parent component
    if (onLocationChange) {
      onLocationChange("from", {
        address: place.display_name,
        coords: coords,
        place: place,
      });
    }

    // For route search, notify with both coordinates when both are available
    if (searchType === "route" && onCoordsSelect) {
      onCoordsSelect({
        from: coords,
        to: toCoords,
        fromAddress: place.display_name,
        toAddress: toLocation,
      });
    }

    // For location search, notify immediately
    if (searchType === "location" && onCoordsSelect) {
      onCoordsSelect({
        from: coords,
        to: null,
        fromAddress: place.display_name,
        toAddress: "",
      });
    }
  };

  // FIXED: Select to suggestion with proper coordinate handling
  const selectTo = (place) => {
    // FIXED: Ensure coordinates are properly formatted as numbers with correct naming
    const coords = {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon), // Use 'lon' not 'lng' to match backend
    };

    console.log("To coordinates selected:", coords);

    setToLocation(place.display_name);
    setToCoords(coords);
    setToSuggestions([]);
    setActiveInput(null);

    // Notify parent component
    if (onLocationChange) {
      onLocationChange("to", {
        address: place.display_name,
        coords: coords,
        place: place,
      });
    }

    // For route search, notify with both coordinates when both are available
    if (searchType === "route" && onCoordsSelect && fromCoords) {
      onCoordsSelect({
        from: fromCoords,
        to: coords,
        fromAddress: fromLocation,
        toAddress: place.display_name,
      });
    }
  };

  // FIXED: Use current location with proper coordinate handling
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Current location:", { latitude, longitude });

        try {
          const res = await fetch(
            `${
              import.meta.env.VITE_BASE_URL
            }/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );

          // FIXED: Use proper coordinate format
          const coords = { lat: latitude, lon: longitude }; // Use 'lon' not 'lng'

          if (!res.ok) {
            // If reverse geocoding fails, still use coordinates
            const locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )}`;
            setFromLocation(locationName);
            setFromCoords(coords);

            if (onLocationChange) {
              onLocationChange("from", {
                address: locationName,
                coords: coords,
                place: {
                  lat: latitude,
                  lon: longitude, // Use 'lon' not 'lng'
                  display_name: locationName,
                },
              });
            }

            // For location search, notify immediately
            if (searchType === "location" && onCoordsSelect) {
              onCoordsSelect({
                from: coords,
                to: null,
                fromAddress: locationName,
                toAddress: "",
              });
            }

            setIsLoadingLocation(false);
            return;
          }

          const data = await res.json();

          if (data.display_name) {
            setFromLocation(data.display_name);
            setFromCoords(coords);

            if (onLocationChange) {
              onLocationChange("from", {
                address: data.display_name,
                coords: coords,
                place: data,
              });
            }

            // For location search, notify immediately
            if (searchType === "location" && onCoordsSelect) {
              onCoordsSelect({
                from: coords,
                to: null,
                fromAddress: data.display_name,
                toAddress: "",
              });
            }
          } else {
            // Fallback to coordinates if no display name
            const locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )}`;
            setFromLocation(locationName);
            setFromCoords(coords);

            if (onLocationChange) {
              onLocationChange("from", {
                address: locationName,
                coords: coords,
                place: {
                  lat: latitude,
                  lon: longitude, // Use 'lon' not 'lng'
                  display_name: locationName,
                },
              });
            }

            // For location search, notify immediately
            if (searchType === "location" && onCoordsSelect) {
              onCoordsSelect({
                from: coords,
                to: null,
                fromAddress: locationName,
                toAddress: "",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          // Still use coordinates even if reverse geocoding fails
          const coords = { lat: latitude, lon: longitude }; // Use 'lon' not 'lng'
          const locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )}`;
          setFromLocation(locationName);
          setFromCoords(coords);

          if (onLocationChange) {
            onLocationChange("from", {
              address: locationName,
              coords: coords,
              place: {
                lat: latitude,
                lon: longitude, // Use 'lon' not 'lng'
                display_name: locationName,
              },
            });
          }

          // For location search, notify immediately
          if (searchType === "location" && onCoordsSelect) {
            onCoordsSelect({
              from: coords,
              to: null,
              fromAddress: locationName,
              toAddress: "",
            });
          }
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Error getting your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "Location request timed out.";
            break;
          default:
            message += "Please try again.";
            break;
        }
        alert(message);
        setIsLoadingLocation(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Swap locations
  const swapLocations = () => {
    // Only allow swapping in route mode
    if (searchType !== "route") return;

    // Swap display names
    const tempLocation = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempLocation);

    // Swap coordinates
    const tempCoords = fromCoords;
    setFromCoords(toCoords);
    setToCoords(tempCoords);

    // Notify parent component
    if (onLocationChange && fromCoords && toCoords) {
      onLocationChange("from", {
        address: toLocation,
        coords: toCoords,
      });
      onLocationChange("to", {
        address: fromLocation,
        coords: tempCoords,
      });
    }

    // Notify with swapped coordinates
    if (onCoordsSelect && fromCoords && toCoords) {
      onCoordsSelect({
        from: toCoords,
        to: tempCoords,
        fromAddress: toLocation,
        toAddress: tempLocation,
      });
    }
  };

  // Clear input
  const clearFromLocation = () => {
    setFromLocation("");
    setFromCoords(null);
    setFromSuggestions([]);
    if (onLocationChange) {
      onLocationChange("from", { address: "", coords: null });
    }
  };

  const clearToLocation = () => {
    setToLocation("");
    setToCoords(null);
    setToSuggestions([]);
    if (onLocationChange) {
      onLocationChange("to", { address: "", coords: null });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveInput(null);
      setFromSuggestions([]);
      setToSuggestions([]);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const LANGUAGES = {
    en: { name: "English", flag: "🇺🇸" },
    hi: { name: "हिन्दी", flag: "🇮🇳" },
    ta: { name: "தமிழ்", flag: "🇮🇳" },
    te: { name: "తెలుగు", flag: "🇮🇳" },
    kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
    ml: { name: "മലയാളം", flag: "🇮🇳" },
    bn: { name: "বাংলা", flag: "🇮🇳" },
    gu: { name: "ગુજરાતી", flag: "🇮🇳" },
    mr: { name: "मराठी", flag: "🇮🇳" },
    pa: { name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    ur: { name: "اُردُو", flag: "🇵🇰" }, // or 🇮🇳 if preferred
    kok: { name: "कोंकणी", flag: "🇮🇳" },
    or: { name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    ne: { name: "नेपाली", flag: "🇳🇵" },
    sat: { name: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
    sd: { name: "سنڌي", flag: "🇵🇰" }, // or 🇮🇳 if preferred
    mni: { name: "মেইতেই লোন", flag: "🇮🇳" },
    ks: { name: "كٲشُر", flag: "🇮🇳" },
    as: { name: "অসমীয়া", flag: "🇮🇳" },
  };

  // Handle language change with i18next
  const handleLanguageChange = (langCode) => {
    if (!langCode) return;

    const currentLang = localStorage.getItem("selectedLanguage");
    if (currentLang === langCode) return;

    setSelectedLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);

    // Change language using i18next
    i18n.changeLanguage(langCode);
  };

  // Initialize language on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  const [address, setAddress] = useState("");
  const { listening, startListening } = useSpeechToText();

  const handleMicClick = (type) => {
    startListening(async (spokenText) => {
      setAddress(spokenText); // Show in input
      setActiveInput(spokenText);
      if (type === "from") {
        setFromLocation(spokenText);
      }
      if (type === "to") {
        setToLocation(spokenText);
      }
      const geoData = await geocodeAddress(spokenText);
      console.log("Geo data : ", geoData);
      if (geoData) {
        if (type === "from") {
          setFromLocation(geoData.address);
          setFromCoords(geoData.coords); // Send back to parent
          if (searchType === "route" && onCoordsSelect && toCoords) {
            onCoordsSelect({
              from: geoData.coords,
              to: toCoords,
              fromAddress: geoData.address,
              toAddress: toLocation,
            });
          }
        } else if (type === "to") {
          setToCoords(geoData.coords);
          setToLocation(geoData.address);
          if (searchType === "route" && onCoordsSelect && fromCoords) {
            onCoordsSelect({
              from: fromCoords,
              to: geoData.coords,
              fromAddress: fromLocation,
              toAddress: geoData.address,
            });
          }
        }
      } else {
        alert("Couldn't find the location. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* From Location */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {searchType === "location"
            ? t("locationSearch.searchLocation")
            : t("locationSearch.from")}
        </label>
        <div className="relative">
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => handleFromLocationChange(e.target.value)}
            onFocus={() => setActiveInput("from")}
            placeholder={
              searchType === "location"
                ? t("locationSearch.enterLocation")
                : t("locationSearch.enterStarting")
            }
            className="w-full p-4 pl-12 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {!fromLocation && (
            <button
              onClick={() => handleMicClick("from")}
              type="button"
              className={`p-3 absolute right-6 top-1/2 transform -translate-y-1/2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition ${
                listening ? "animate-pulse bg-green-200" : ""
              }`}
              title="Speak now"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {fromLocation && (
            <button
              onClick={clearFromLocation}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5 " />
            </button>
          )}
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isLoadingLocation}
          className="mt-2 text-sm text-green-600 hover:text-green-700 flex items-center transition-colors disabled:opacity-50"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-1" />
          )}
          {isLoadingLocation
            ? t("locationSearch.gettingLocation")
            : t("locationSearch.useCurrentLocation")}
        </button>

        {/* From Location Suggestions */}
        {fromSuggestions.length > 0 && activeInput === "from" && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {isLoadingSuggestions && (
              <div className="p-3 text-center text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                {t("locationSearch.searching")}
              </div>
            )}
            {fromSuggestions.map((place, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  selectFrom(place);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {place.display_name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {listening && (
              <p className="text-xs text-green-600 mt-1">Listening...</p>
            )}
          </div>
        )}
      </div>

      {/* Only show swap button and To field for route search */}
      {searchType === "route" && (
        <>
          <div className="flex justify-center my-2">
            {/* Swap Button */}
            <button
              onClick={swapLocations}
              className="p-3 bg-green-100 hover:bg-green-200 rounded-full transition-all duration-300 hover:scale-110"
              title="Swap locations"
            >
              <ArrowLeftRight className="w-5 h-5 text-green-600" />
            </button>
          </div>

          <div className="relative">
            {/* To Location Input & Suggestions */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("locationSearch.to")}
              </label>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => handleToLocationChange(e.target.value)}
                onFocus={() => setActiveInput("to")}
                className="w-full p-4 pl-12 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder={t("locationSearch.selectDestination")}
              />
              <MapPin className="absolute left-4 top-8 transform -translate-y-1/2 text-gray-400 w-5 h-5 mt-6" />
              {!toLocation && (
                <button
                  onClick={() => handleMicClick("to")}
                  type="button"
                  className={`p-3 absolute right-6 top-2/3 transform -translate-y-1/2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition ${
                    listening ? "animate-pulse bg-green-200" : ""
                  }`}
                  title="Speak now"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}

              {toLocation && (
                <button
                  onClick={clearToLocation}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* To Suggestions */}
              {toSuggestions.length > 0 && activeInput === "to" && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {toSuggestions.map((place, idx) => (
                    <li
                      key={idx}
                      onClick={() => selectTo(place)}
                      className="p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {place.display_name.split(",")[0]}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {place.display_name}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Debug Info - Show current coordinates */}
      {(fromCoords || toCoords) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          {fromCoords && (
            <p>
              From: {fromLocation} → ({fromCoords.lat.toFixed(6)},{" "}
              {fromCoords.lon.toFixed(6)})
            </p>
          )}
          {toCoords && (
            <p>
              To: {toLocation} → ({toCoords.lat.toFixed(6)},{" "}
              {toCoords.lon.toFixed(6)})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
