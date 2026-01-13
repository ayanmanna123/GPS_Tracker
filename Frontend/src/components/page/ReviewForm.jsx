import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import { Star, MessageSquare, Send, CheckCircle, Image as ImageIcon } from "lucide-react";

const ReviewForm = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    punctuality: 3,
    comfort: 3,
    cleanliness: 3,
    driverBehavior: 3,
    safety: 3,
    valueForMoney: 3,
    comment: "",
  });
  const { busId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoURLs, setPhotoURLs] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const navigate = useNavigate();

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle photo upload
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setPhotos((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURLs((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // remove photo
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoURLs((prev) => prev.filter((_, i) => i !== index));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v3",
      });

      // For now, we'll send photo URLs as base64 (in production, upload to cloud storage)
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/review/reviews`,
        {
          busId,
          ratings: {
            punctuality: formData.punctuality,
            comfort: formData.comfort,
            cleanliness: formData.cleanliness,
            driverBehavior: formData.driverBehavior,
            safety: formData.safety,
            valueForMoney: formData.valueForMoney,
          },
          comment: formData.comment,
          photos: photoURLs,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage(t("review.successMessage"));
      console.log("Review response:", res.data);
      setFormData({
        punctuality: 3,
        comfort: 3,
        cleanliness: 3,
        driverBehavior: 3,
        safety: 3,
        valueForMoney: 3,
        comment: "",
      });
      setPhotos([]);
      setPhotoURLs([]);
      toast(res.data.message);
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage(t("review.failureMessage"));
      const errorMessage =
        err.response?.data?.message || err.message || t("review.genericError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    punctuality: t("review.punctuality"),
    comfort: t("review.comfort"),
    cleanliness: t("review.cleanliness"),
    driverBehavior: t("review.driverBehavior"),
    safety: t("review.safety"),
    valueForMoney: t("review.valueForMoney"),
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background Elements */}
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
      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-2xl ${
                darktheme
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Star
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
            {t("review.pageTitle")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("review.pageSubtitle")}
          </p>
        </div>

        {/* Review Form Card */}
        <div
          className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <form onSubmit={handleSubmit}>
            {/* Rating Grid - 2 columns, 3 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Object.entries(ratingLabels).map(([field, label]) => (
                <div key={field} className="space-y-3">
                  <label
                    className={`block text-sm font-semibold ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className={`flex-1 border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all ${
                        darktheme
                          ? "bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                          : "bg-white border-gray-200 text-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                    >
                      {[1, 2, 3, 4, 5].map((val) => (
                        <option key={val} value={val}>
                          {val}{" "}
                          {val === 1 ? t("review.star") : t("review.stars")}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 transition-colors ${
                            star <= formData[field]
                              ? "text-yellow-400 fill-current"
                              : darktheme
                                ? "text-gray-600"
                                : "text-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Section - Full Width */}
            <div className="space-y-3 mb-8">
              <label
                className={` text-sm font-semibold flex items-center gap-2 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t("review.comment")}
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 transition-all resize-none ${
                  darktheme
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                rows="4"
                placeholder={t("review.commentPlaceholder")}
              ></textarea>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-3 mb-8">
              <label
                className={`text-sm font-semibold flex items-center gap-2 ${
                  darktheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Add Photos (Optional, max 5)
              </label>
              
              <div className="flex flex-wrap gap-4">
                {/* Photo Previews */}
                {photoURLs.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {photoURLs.length < 5 && (
                  <label
                    className={`w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition ${
                      darktheme
                        ? "border-gray-700 hover:border-gray-600 bg-gray-900/50"
                        : "border-gray-300 hover:border-gray-400 bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <span className="text-xs text-gray-400">Add Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className={`text-xs ${
                darktheme ? "text-gray-500" : "text-gray-500"
              }`}>
                You can upload up to 5 photos. Supported formats: JPG, PNG, WebP
              </p>
            </div>

            {/* Submit Button - Full Width */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                loading
                  ? darktheme
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-2xl hover:scale-[1.02]"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t("review.submitting")}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t("review.submitButton")}</span>
                </>
              )}
            </button>

            {message && (
              <div
                className={`mt-6 p-4 rounded-xl text-center font-medium border-2 flex items-center justify-center gap-3 ${
                  message.includes(t("review.successMessage"))
                    ? darktheme
                      ? "bg-green-900/30 text-green-300 border-green-700/50"
                      : "bg-green-50 text-green-700 border-green-200"
                    : darktheme
                      ? "bg-red-900/30 text-red-300 border-red-700/50"
                      : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {message.includes(t("review.successMessage")) && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
