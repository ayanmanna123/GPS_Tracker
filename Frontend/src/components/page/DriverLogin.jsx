import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { toast } from "sonner";
import {
  CreditCard,
  Award,
  User,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";

const DriverLogin = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const [driverExp, setDriverExp] = useState("");
  const [licenceId, setLicenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `https://gps-tracker-kq2q.vercel.app/api/v1/driver/veryfi/email/${user.email}`
        );
        if (res.data.success) {
          navigate("/");
        }
      } catch (error) {
        // Silent error - driver doesn't exist yet, which is expected
        console.log(
          "Driver verification:",
          error.response?.data || error.message
        );
      }
    };
    fetchData();
  }, [user, navigate]);

  const CreateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/driver/createUser`,
        {
          fullname: user.name,
          email: user.email,
          picture: user.picture,
          licenceId,
          driverExp,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        dispatch(setuser(res.data.userData));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      console.log("Create Driver error:", error.message);
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${
            darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
          } rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            darktheme ? "bg-purple-500/5" : "bg-purple-300/20"
          } rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div
          className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                  darktheme
                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                <Shield className="w-10 h-10 text-white" />
              </div>
              <Sparkles
                className={`absolute -top-1 -right-1 w-6 h-6 ${
                  darktheme ? "text-yellow-400" : "text-yellow-500"
                } animate-pulse`}
              />
            </div>
            <h2
              className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
                darktheme
                  ? "from-blue-400 to-purple-400"
                  : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              Complete Your Driver Profile
            </h2>
            <p
              className={`text-sm ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Just a few more details to get you started
            </p>
          </div>

          {/* User Info Display */}
          {user && (
            <div
              className={`mb-6 p-4 rounded-2xl border ${
                darktheme
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover ring-4 ring-blue-500/30 shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-lg mb-1 truncate ${
                      darktheme ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-sm truncate ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={CreateDriver} className="space-y-6">
            {/* License ID Field */}
            <div>
              <label
                className={`block text-sm font-semibold mb-3 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                License ID
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                    darktheme ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <CreditCard
                    className={`w-5 h-5 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={licenceId}
                  onChange={(e) => setLicenceId(e.target.value)}
                  required
                  placeholder="Enter your license ID"
                  className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-900"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                />
              </div>
            </div>

            {/* Driving Experience Field */}
            <div>
              <label
                className={`block text-sm font-semibold mb-3 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Award className="w-4 h-4 inline mr-2" />
                Driving Experience (years)
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                    darktheme ? "bg-purple-500/20" : "bg-purple-100"
                  }`}
                >
                  <Award
                    className={`w-5 h-5 ${
                      darktheme ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <input
                  type="number"
                  value={driverExp}
                  onChange={(e) => setDriverExp(e.target.value)}
                  required
                  min="0"
                  placeholder="Enter years of experience"
                  className={`w-full pl-16 pr-4 py-4 rounded-xl border-2 transition-all ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-900"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-white"
                  } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              } ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div
            className={`mt-6 text-center text-xs ${
              darktheme ? "text-gray-500" : "text-gray-500"
            }`}
          >
            🔒 Your information is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
