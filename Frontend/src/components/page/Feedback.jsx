import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import { submitFeedback } from "../../services/feedbackService";

const AVAILABLE_CATEGORIES = [
  "Delay",
  "Cleanliness",
  "Safety",
  "Driver Behavior",
  "Route Efficiency",
  "Other",
];

const Feedback = ({ busId: propBusId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const { darktheme } = useSelector((s) => s.auth);

  const [rating, setRating] = useState(5);
  const [categories, setCategories] = useState([]);
  const [comment, setComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({ audience: "http://localhost:5000/api/v3" });
      const payload = {
        busId: propBusId || null,
        rating: Number(rating),
        categories,
        comment,
        suggestion,
      };

      const res = await submitFeedback(token, payload);
      toast.success(res.message || "Feedback submitted");
      setRating(5);
      setCategories([]);
      setComment("");
      setSuggestion("");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to submit feedback";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darktheme ? "bg-slate-900" : "bg-gray-50"}`}>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Give Feedback</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-32 p-2 border rounded">
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>{v} star{v>1?"s":""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Categories</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full border ${categories.includes(cat) ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block font-medium mb-1">Suggestion (optional)</label>
            <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={3} className="w-full p-2 border rounded" />
          </div>

          <div>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
