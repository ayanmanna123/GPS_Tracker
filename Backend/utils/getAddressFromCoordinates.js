import axios from "axios";

const OPENCAGE_API_KEY = "9aef89cb32dd491d8b961021dafaff47";

const getAddressFromCoordinates = async ([lat, lon]) => {
  try {
    const res = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: `${lat}+${lon}`,
          key: OPENCAGE_API_KEY,
          language: "en",
          pretty: 1,
        },
      }
    );

    const result = res.data.results[0];
    return result?.formatted || "Unknown location";
  } catch (err) {
    console.error("Geocoding error:", err.response?.status, err.message);
    return "Unknown location";
  }
};

export default getAddressFromCoordinates;
