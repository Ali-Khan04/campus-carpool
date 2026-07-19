export const DEFAULT_REGION = {
  latitude: 33.6844, // Islamabad
  longitude: 73.0479,
};

// MapLibre uses a zoom level, not lat/lng deltas.
export const DEFAULT_ZOOM_LEVEL = 16;

// Inline style pointing at the same tiles you already used.
export const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: 'raster' as const,
      tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
      tileSize: 512,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [{ id: 'carto-tiles', type: 'raster' as const, source: 'carto' }],
};
