const locationLabelCache = new Map<string, string>();

const toKey = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

export const getLocationLabel = (lat: number, lng: number) => {
  return locationLabelCache.get(toKey(lat, lng));
};

export const setLocationLabel = (lat: number, lng: number, label: string) => {
  locationLabelCache.set(toKey(lat, lng), label);
};
