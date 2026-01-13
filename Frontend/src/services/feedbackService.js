import axios from "axios";

export const submitFeedback = async (token, payload) => {
  const res = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/feedback/feedbacks`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const fetchFeedbacks = async (token, params = {}) => {
  const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/feedback/feedbacks`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
};
