export const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json`
  );
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    return {
      coords: { lat: parseFloat(lat), lon: parseFloat(lon) },
      address: display_name,
    };
  } else {
    return null;
  }
};
