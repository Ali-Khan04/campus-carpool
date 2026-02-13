import React, { useState, useEffect } from "react";
import MapView, {
  UrlTile,
  Marker,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import { StyleSheet, View, Text, Alert } from "react-native";
import { Stack } from "expo-router";
import * as Location from "expo-location";
import { COLORS } from "@/constants/theme";
import { LocationCoords } from "@/types/Location";

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 33.6844, // default location set to Islamabad
    longitude: 73.0479,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
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
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
            maximumZ={19}
            minimumZ={1}
            flipY={false}
            tileSize={1024}
          />
          {location && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  attribution: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    color: "#666",
  },
});
