import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import { User, Car, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Complete = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("user");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/driver/veryfi/email/${user.email}`,
        );
        dispatch(setuser(res.data.newUser));
        if (res.data.success) {
          toast.success("Already registered! Redirecting...");
          navigate("/");
        }
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, dispatch, navigate]);

  const handleRoleSelection = (role) => {
    if (role === "driver") {
      navigate("/Login/driver");
    } else {
      navigate("/Login/User");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col justify-center items-center p-6 overflow-hidden">
      
      {/* Header Section */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Welcome to <span className="text-blue-500">Bus</span>Booking
        </h1>
        <p className="text-lg text-gray-400">
          Choose how you'd like to continue
        </p>
      </div>

      {/* Main Container - Restored Dark Slate Style */}
      <div className="relative w-full max-w-xl bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        
        {/* Sliding Toggle Switch */}
        <div className="flex justify-center mb-10">
          <div className="bg-black/40 p-1.5 rounded-2xl flex relative w-full max-w-[300px] border border-gray-700 shadow-inner">
            <motion.div
              className="absolute top-1.5 bottom-1.5 left-1.5 bg-blue-600 rounded-xl shadow-lg"
              initial={false}
              animate={{
                x: activeTab === "user" ? 0 : "100%",
                width: "calc(50% - 3px)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("user")}
              className={`relative z-10 w-1/2 py-2 text-sm font-bold transition-colors duration-300 ${
                activeTab === "user" ? "text-white" : "text-gray-400"
              }`}
            >
              Passenger
            </button>
            <button
              onClick={() => setActiveTab("driver")}
              className={`relative z-10 w-1/2 py-2 text-sm font-bold transition-colors duration-300 ${
                activeTab === "driver" ? "text-white" : "text-gray-400"
              }`}
            >
              Driver
            </button>
          </div>
        </div>

        {/* Sliding Content Area */}
        <div className="relative h-[480px]">
          <AnimatePresence mode="wait">
            {activeTab === "user" ? (
              <motion.div
                key="user"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                    <User className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Continue as Passenger</h2>
                <p className="text-gray-400 text-center mb-8 px-4">
                  Book bus tickets, track buses in real-time, and travel with ease
                </p>
                
                <div className="space-y-3 mb-10 px-4">
                  {["Browse and search available buses", "Book tickets instantly", "Track bus location on map", "View booking history"].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleRoleSelection("user")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all mt-auto"
                >
                  Continue as Passenger
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="driver"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30">
                    <Car className="w-12 h-12 text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Continue as Driver</h2>
                <p className="text-gray-400 text-center mb-8 px-4">
                  Register your bus, manage bookings, and earn by providing transportation
                </p>

                <div className="space-y-3 mb-10 px-4">
                  {["Register and manage your bus", "Accept and manage bookings", "Track earnings and trip history", "Update bus location in real-time"].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleRoleSelection("driver")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-green-500/50 transition-all mt-auto"
                >
                  Continue as Driver
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-10 text-sm">
        You can always switch roles later from your account settings
      </p>

      {/* Decorative Blobs - Fixed Positioning */}
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default Complete;