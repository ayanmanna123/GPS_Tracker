import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // 👈 backend URL only here
  withCredentials: false, // true if you use cookies
});

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method,
    url,                 // only endpoint path
    data: bodyData || null,
    headers: headers || {},
    params: params || {},
  });
};
