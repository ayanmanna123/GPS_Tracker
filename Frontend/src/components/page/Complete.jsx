import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import { User, Car, CheckCircle } from "lucide-react";

const Complete = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/driver/veryfi/email/${user.email}`
        );

        dispatch(setuser(res.data.newUser));

        if (res.data.success) {
          toast.success("Already registered! Redirecting...");
          navigate("/");
        }
      } catch (error) {
        console.log(
          "Verification error:",
          error.response?.data || error.message
        );
        // User not registered yet, which is fine for this page
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col justify-center items-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to BusBooking
          </h1>
          <p className="text-lg text-gray-400">
            Choose how you'd like to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User/Passenger Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                <User className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-4 text-white">
              Continue as Passenger
            </h2>

            <p className="text-gray-400 text-center mb-6">
              Book bus tickets, track buses in real-time, and travel with ease
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Browse and search available buses
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Book tickets instantly
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Track bus location on map
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  View booking history
                </span>
              </div>
            </div>

            <Button
              onClick={() => handleRoleSelection("user")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Continue as Passenger
            </Button>
          </div>

          {/* Driver Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30">
                <Car className="w-12 h-12 text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-4 text-white">
              Continue as Driver
            </h2>

            <p className="text-gray-400 text-center mb-6">
              Register your bus, manage bookings, and earn by providing
              transportation
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Register and manage your bus
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Accept and manage bookings
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Track earnings and trip history
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Update bus location in real-time
                </span>
              </div>
            </div>

            <Button
              onClick={() => handleRoleSelection("driver")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-green-500/50 transition-all"
            >
              Continue as Driver
            </Button>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          You can always switch roles later from your account settings
        </p>
      </div>
    </div>
  );
};

export default Complete;
