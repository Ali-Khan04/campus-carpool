import { DEFAULT_REGION, DEFAULT_ZOOM } from "@/constants/mapConfig";
import { styles } from "@/styles/mapStyles";
import { LocationCoords } from "@/types/Location";
import * as Location from "expo-location";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_DEFAULT,
  Region,
  UrlTile,
} from "react-native-maps";

interface ExtraMarker {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  pinColor?: string;
}

interface Props {
  onPress?: (e: MapPressEvent) => void;
  extraMarkers?: ExtraMarker[];
  showUserLocation?: boolean;
}

export default forwardRef<MapView, Props>(function BaseMap(
  { onPress, extraMarkers = [], showUserLocation = true },
  ref
) {
  const [location, setLocation] = useState<LocationCoords | null>(null);// to store user's live location
  const [region, setRegion] = useState<Region>(DEFAULT_REGION); // to which and how much region to show on maps
  const internalRef = useRef<MapView>(null);
  const mapRef = (ref as React.RefObject<MapView>) ?? internalRef;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();//ask for permissions
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }
      // to track live postion , check again
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("Location Services Off", "Please enable location services");
        return;
      }
       //let userLocation = await Location.getCurrentPositionAsync({}); //get user's current location
      // watch for live updates on user's location

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,//update every 2 seconds
          distanceInterval: 2,// or when user moves 2 meters
        },
        (loc) => {
          setLocation(loc.coords);
          setRegion((prev) => {
            if (
              prev.latitude === DEFAULT_REGION.latitude &&
              prev.longitude === DEFAULT_REGION.longitude
            ) {
              const newRegion = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                ...DEFAULT_ZOOM,
              };
              mapRef.current?.animateToRegion(newRegion, 800);
              return newRegion;
            }
            return prev;
          });
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}// use the device native map provider
        style={styles.map}
        initialRegion={region}// state variable region for only displaying intially
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        onPress={onPress}
      >
        <UrlTile // for custom map styling
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
          maximumZ={19}
          minimumZ={1}
          flipY={false}
          tileSize={1024}
        />

       
        {location && (// if user location is true then show marker at user's current location
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            description="Your current location"
          />
        )}

   
        {extraMarkers.map((m, i) => (     // Any extra markers passed in (pickup, destination, etc) 
          <Marker
            key={i}
            coordinate={m.coordinate}
            title={m.title}
            description={m.description}
            pinColor={m.pinColor}
          />
        ))}
      </MapView>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
});
