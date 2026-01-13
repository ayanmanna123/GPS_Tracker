// components/LocationTracker.jsx
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const INITIAL_DELAY = 2000; // 2 seconds
const MAX_DELAY = 60000; // 60 seconds
const BACKOFF_MULTIPLIER = 2;

const LocationTracker = () => {
  const activeBusIDs = useSelector((state) => state.location.activeBusIDs);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const retryDelayRef = useRef(INITIAL_DELAY);
  const timeoutRef = useRef(null);

  const syncLocationWithBackoff = () => {
    // If no active buses, stop syncing
    if (!activeBusIDs || activeBusIDs.length === 0) return;

    // If user is offline, wait and retry later
    if (!navigator.onLine) {
      retryDelayRef.current = Math.min(
        retryDelayRef.current * BACKOFF_MULTIPLIER,
        MAX_DELAY
      );

      timeoutRef.current = setTimeout(
        syncLocationWithBackoff,
        retryDelayRef.current
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await Promise.all(
            activeBusIDs.map((busId) =>
              axios.put(`${import.meta.env.VITE_BASE_URL}/update/location`, {
                deviceID: busId,
                latitude,
                longitude,
              })
            )
          );

          // ✅ Success → reset delay
          retryDelayRef.current = INITIAL_DELAY;
        } catch (err) {
          console.error("Failed to sync GPS location:", err);
          setError("Failed to update location.");

          // ❌ Failure → increase delay
          retryDelayRef.current = Math.min(
            retryDelayRef.current * BACKOFF_MULTIPLIER,
            MAX_DELAY
          );
        } finally {
          setIsLoading(false);

          // Schedule next attempt using current delay
          timeoutRef.current = setTimeout(
            syncLocationWithBackoff,
            retryDelayRef.current
          );
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to fetch GPS location.");

        // ❌ GPS error → increase delay
        retryDelayRef.current = Math.min(
          retryDelayRef.current * BACKOFF_MULTIPLIER,
          MAX_DELAY
        );

        setIsLoading(false);

        timeoutRef.current = setTimeout(
          syncLocationWithBackoff,
          retryDelayRef.current
        );
      }
    );
  };

  useEffect(() => {
    if (!activeBusIDs || activeBusIDs.length === 0) return;

    // Start syncing
    syncLocationWithBackoff();

    // When internet comes back online, reset delay and sync immediately
    const handleOnline = () => {
      retryDelayRef.current = INITIAL_DELAY;
      syncLocationWithBackoff();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("online", handleOnline);
    };
  }, [activeBusIDs]);

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 14px",
            background: "#000",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          Fetching location…
        </div>
      )}

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            right: "20px",
            padding: "10px 14px",
            background: "#c0392b",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          {error}
        </div>
      )}
    </>
  );
};

export default LocationTracker;
