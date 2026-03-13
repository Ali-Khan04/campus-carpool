//This file was for testing a simple in-memory cache for location labels, but it ended up not being worth the added complexity
//cache changes are commented out in RideCard and CreateRideForm, but the cache itself is left here in case we want to revisit 

/*const locationLabelCache = new Map<string, string>();

const toKey = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

export const getLocationLabel = (lat: number, lng: number) => {
  return locationLabelCache.get(toKey(lat, lng));
};

export const setLocationLabel = (lat: number, lng: number, label: string) => {
  locationLabelCache.set(toKey(lat, lng), label);
};
*/