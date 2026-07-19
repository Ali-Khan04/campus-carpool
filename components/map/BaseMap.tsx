import { DEFAULT_REGION, DEFAULT_ZOOM_LEVEL, MAP_STYLE } from '@/constants/mapConfig';
import { styles } from '@/styles/mapStyles';
import { LocationCoords } from '@/types/Location';
import * as Location from 'expo-location';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MLMap,
  Marker,
} from '@maplibre/maplibre-react-native';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';

interface ExtraMarker {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  pinColor?: string;
}

interface Props {
  onPress?: (e: any) => void;
  extraMarkers?: ExtraMarker[];
  showUserLocation?: boolean;
  routeCoordinates?: { latitude: number; longitude: number }[];
  onLocationUpdate?: (coords: LocationCoords) => void;
}

export default forwardRef<any, Props>(function BaseMap(
  { onPress, extraMarkers = [], showUserLocation = true, routeCoordinates = [], onLocationUpdate },
  ref
) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const cameraRef = useRef<any>(null);
  const hasCenteredRef = useRef(false);

  // Keeps the same imperative API LocationPickerModal.tsx already calls,
  // so that file needs zero edits.
  useImperativeHandle(ref, () => ({
    fitToCoordinates: (
      coords: { latitude: number; longitude: number }[],
      options?: {
        edgePadding?: { top: number; right: number; bottom: number; left: number };
        animated?: boolean;
      }
    ) => {
      if (!coords.length) return;
      const lats = coords.map((c) => c.latitude);
      const lngs = coords.map((c) => c.longitude);
      const bounds: [number, number, number, number] = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
      ];
      cameraRef.current?.fitBounds(
        bounds,
        options?.edgePadding ?? { top: 40, right: 40, bottom: 40, left: 40 },
        options?.animated === false ? 0 : 1000
      );
    },
  }));

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert('Location Services Off', 'Please enable location services');
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
        (loc) => {
          setLocation(loc.coords);
          onLocationUpdate?.(loc.coords);

          if (!hasCenteredRef.current) {
            hasCenteredRef.current = true;
            cameraRef.current?.flyTo({
              center: [loc.coords.longitude, loc.coords.latitude],
              zoom: DEFAULT_ZOOM_LEVEL,
              duration: 800,
            });
          }
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: routeCoordinates.map((c) => [c.longitude, c.latitude]),
    },
  };

  return (
    <View style={styles.container}>
      <MLMap
        style={styles.map}
        mapStyle={MAP_STYLE}
        onPress={(e: any) => {
          const lngLat = e?.nativeEvent?.lngLat;
          if (!lngLat) return;
          // normalized back to react-native-maps' old shape so callers don't change
          onPress?.({ nativeEvent: { coordinate: { latitude: lngLat[1], longitude: lngLat[0] } } });
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [DEFAULT_REGION.longitude, DEFAULT_REGION.latitude],
            zoom: DEFAULT_ZOOM_LEVEL,
          }}
        />

        {location && showUserLocation && (
          <Marker lngLat={[location.longitude, location.latitude]}>
            <View style={styles.userDot} />
          </Marker>
        )}

        {extraMarkers.map((m, i) => (
          <Marker key={i} lngLat={[m.coordinate.longitude, m.coordinate.latitude]}>
            <View style={[styles.pin, { backgroundColor: m.pinColor ?? '#3B82F6' }]} />
          </Marker>
        ))}

        {routeCoordinates.length > 0 && (
          <GeoJSONSource id="routeSource" data={routeGeoJSON}>
            <Layer
              id="routeLine"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#3B82F6', 'line-width': 4 }}
            />
          </GeoJSONSource>
        )}
      </MLMap>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
});
