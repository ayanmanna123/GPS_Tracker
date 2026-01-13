import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  CreditCard,
  Calendar,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Clock,
  Hash,
  Award,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { setuser } from "../../Redux/auth.reducer";
import Navbar from "../shared/Navbar";
import { toast } from "sonner";

const Profile = () => {
  const { usere, darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently } = useAuth0();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(usere?.name || "");
  const [licenceId, setLicenceId] = useState(usere?.licenceId || "");
  const [driverExp, setDriverExp] = useState(usere?.driverExp || "");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  if (!usere) {
    return (
      <div
        className={`min-h-screen relative overflow-hidden ${
          darktheme
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 left-10 w-96 h-96 ${
              darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
            } rounded-full blur-3xl animate-pulse`}
          ></div>
        </div>
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <p
            className={`text-center text-lg ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("profile.noUserData")}
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/driver/update/profile`,
        { name, licenceId, driverExp, picture: usere.picture },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(setuser(res.data.newDetails));
      setIsEditing(false);
      toast.success(t("profile.updateSuccess"));
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || t("profile.updateError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
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

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <User
                className={`w-8 h-8 ${
                  darktheme ? "text-blue-400" : "text-white"
                }`}
              />
            </div>
          </div>
          <h1
            className={`text-5xl font-bold mb-4 bg-gradient-to-r ${
              darktheme
                ? "from-blue-400 via-purple-400 to-pink-400"
                : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            My Profile
          </h1>
          <p
            className={`text-lg ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your account information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card
            className={`shadow-2xl rounded-3xl border backdrop-blur-sm ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <CardHeader className="flex flex-col items-center space-y-6 pb-8">
              <div className="relative">
                <Avatar
                  className={`w-40 h-40 border-4 shadow-2xl ring-4 ${
                    darktheme
                      ? "border-gray-700 ring-blue-500/20"
                      : "border-white ring-blue-500/30"
                  }`}
                >
                  {usere.picture ? (
                    <AvatarImage
                      src={usere.picture}
                      alt={usere.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback
                      className={`text-4xl font-bold ${
                        darktheme
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                      }`}
                    >
                      {usere.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Sparkles
                    className={`w-8 h-8 ${
                      darktheme ? "text-yellow-400" : "text-yellow-500"
                    }`}
                  />
                </div>
                <div
                  className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    darktheme
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-purple-500"
                  }`}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <CardTitle
                  className={`text-3xl font-bold ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  {usere.name}
                </CardTitle>
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${
                    darktheme
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      darktheme ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    {usere.email}
                  </span>
                </div>
                {usere.status && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      darktheme
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${
                        darktheme ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold uppercase tracking-wide ${
                        darktheme ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      {usere.status}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Information Card */}
          {usere.status === "driver" && (
            <Card
              className={`shadow-2xl rounded-3xl border backdrop-blur-sm ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <CardHeader
                className="border-b pb-6"
                style={{ borderColor: darktheme ? "#374151" : "#e5e7eb" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darktheme ? "bg-purple-500/20" : "bg-purple-100"
                      }`}
                    >
                      <Shield
                        className={`w-5 h-5 ${
                          darktheme ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                    </div>
                    <CardTitle
                      className={`text-xl ${
                        darktheme ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Driver Information
                    </CardTitle>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className={`rounded-xl font-semibold transition-all ${
                        darktheme
                          ? "bg-blue-600 hover:bg-blue-500 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`border-2 p-3 rounded-xl ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    ) : (
                      <div
                        className={`p-4 rounded-xl border ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-gray-300"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {name || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* License ID */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      License ID
                    </label>
                    {isEditing ? (
                      <Input
                        value={licenceId}
                        onChange={(e) => setLicenceId(e.target.value)}
                        className={`border-2 p-3 rounded-xl ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    ) : (
                      <div
                        className={`p-4 rounded-xl border ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-gray-300"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {licenceId || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darktheme ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <Award className="w-4 h-4 inline mr-2" />
                      Driving Experience (years)
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={driverExp}
                        onChange={(e) => setDriverExp(e.target.value)}
                        className={`border-2 p-3 rounded-xl ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    ) : (
                      <div
                        className={`p-4 rounded-xl border ${
                          darktheme
                            ? "bg-gray-900/50 border-gray-700 text-gray-300"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {driverExp ? `${driverExp} years` : "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          darktheme
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setName(usere.name);
                          setLicenceId(usere.licenceId);
                          setDriverExp(usere.driverExp);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          darktheme
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card
            className={`shadow-2xl rounded-3xl border backdrop-blur-sm ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <CardHeader
              className="border-b pb-6"
              style={{ borderColor: darktheme ? "#374151" : "#e5e7eb" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    darktheme ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <Hash
                    className={`w-5 h-5 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <CardTitle
                  className={`text-xl ${
                    darktheme ? "text-white" : "text-gray-800"
                  }`}
                >
                  Account Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Hash
                      className={`w-4 h-4 ${
                        darktheme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      User ID
                    </span>
                  </div>
                  <p
                    className={`text-sm font-mono ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {usere._id?.slice(-12) || "N/A"}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        darktheme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        darktheme ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Member Since
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {usere.createdAt
                      ? new Date(usere.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm">
          <p className={darktheme ? "text-gray-500" : "text-gray-500"}>
            {t("profile.copyright")}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Profile;
