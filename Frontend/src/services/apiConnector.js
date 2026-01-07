import axios from "axios"

// Set default base URL to backend port 8000 if env var is missing
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8000/api/v1",
    withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers, params,) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    });
}