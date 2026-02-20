import React, { useState, useEffect, useRef } from "react";
import MapView, {
  UrlTile,
  Marker,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import { View, Text, Alert } from "react-native";
import { Stack } from "expo-router";
import * as Location from "expo-location";
import { LocationCoords } from "@/types/Location";
import { DEFAULT_ZOOM, DEFAULT_REGION } from "@/constants/mapConfig";
import { styles } from "@/styles/mapStyles";

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null); // to store user's live location
  const [region, setRegion] = useState<Region>(DEFAULT_REGION); // to which and how much region to show on map
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync(); // ask for permission
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }

      // to track live postion , check again
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("Location Services Off", "Please enable location Services");
        return;
      }

      //let userLocation = await Location.getCurrentPositionAsync({}); //get user's current location
      // watch for live updates on user's location
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // update every 2 seconds
          distanceInterval: 2, // or when user moves 2 meters
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
        },
      );
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Find a Car",
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <MapView //to render the actual map
          provider={PROVIDER_DEFAULT} // use the device native map provider
          style={styles.map}
          initialRegion={region} // state variable region for only displaying intially
          showsUserLocation={true}
          showsMyLocationButton={true}
          ref={mapRef}
        >
          <UrlTile // for custom map styling
            urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png" // custom map template form openStreet
            maximumZ={19}
            minimumZ={1}
            flipY={false}
            tileSize={1024}
          />
          {location && ( // if user location is true then show marker at user's current location
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description="Your current location"
            />
          )}
        </MapView>

        <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
      </View>
    </>
  );
}
