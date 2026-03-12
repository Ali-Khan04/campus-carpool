import BaseMap from "@/components/map/BaseMap";
import { Stack } from "expo-router";

export default function MapScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Open Map", headerShown: true }} />
      <BaseMap />
    </>
  );
}