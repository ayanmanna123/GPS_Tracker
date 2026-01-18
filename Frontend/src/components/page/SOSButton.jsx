import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Share2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

const SOSButton = ({ deviceID, busName }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Emergency number (configurable)
  const EMERGENCY_NUMBER = "100";

  const handleCall = () => {
    window.location.href = `tel:${EMERGENCY_NUMBER}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: "🚨 SOS - Emergency Location Share",
      text: `Emergency! I am tracking this bus (${busName || 'Bus'}). Here is the live location:`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Location shared successfully");
      } else {
        // Fallback for desktop/unsupported browsers
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-2"
          >
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors backdrop-blur-md"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-semibold whitespace-nowrap">Share Location</span>
            </motion.button>

            {/* Call Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors backdrop-blur-md"
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold whitespace-nowrap">Call Police ({EMERGENCY_NUMBER})</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
          isOpen 
            ? "bg-gray-800 text-white" 
            : "bg-red-600 text-white animate-pulse-slow"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Simple pulse effect ring */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
        )}
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="alert"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <AlertTriangle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default SOSButton;
