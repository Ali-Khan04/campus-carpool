import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LocationPickerModal, { PickedLocation } from "./LocationPickerModal";

interface Props {
  onRideCreated: () => void;
}

export default function CreateRideForm({ onRideCreated }: Props) {
  const { session } = useProfile();

  const [pickup, setPickup] = useState<PickedLocation | null>(null);
  const [destination, setDestination] = useState<PickedLocation | null>(null);
  const [seats, setSeats] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLocationsConfirmed = (p: PickedLocation, d: PickedLocation) => {
    setPickup(p);
    setDestination(d);
  };

  const handleSubmit = async () => {
    if (!pickup || !destination) {
      Alert.alert("Error", "Please set pickup and destination on the map.");
      return;
    }
    if (!seats || isNaN(Number(seats)) || Number(seats) < 1) {
      Alert.alert("Error", "Enter a valid number of seats.");
      return;
    }
    if (!departureDate) {
      Alert.alert("Error", "Enter a departure time.");
      return;
    }
    if (!session?.user?.id) return;

    setLoading(true);
    const { error } = await supabase.from("rides").insert({
      driver_id: session.user.id,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      seats_available: parseInt(seats),
    departure_time: departureDate.toISOString(),
      status: "active",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Ride posted!");
      setPickup(null);
      setDestination(null);
      setSeats("");
      setDepartureDate(new Date());
      onRideCreated();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a Ride</Text>

      {/* Location picker*/}
      <Pressable style={styles.mapPickerBtn} onPress={() => setMapVisible(true)}>
        <Ionicons name="map-outline" size={20} color={COLORS.primary} />
        <Text style={styles.mapPickerText}>
          {pickup && destination ? "Change Locations" : "Set Pickup & Destination"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </Pressable>

      {/* Show selected locations */}
      {pickup && (
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.locationText} numberOfLines={1}>{pickup.label}</Text>
        </View>
      )}
      {destination && (
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: "#EF4444" }]} />
          <Text style={styles.locationText} numberOfLines={1}>{destination.label}</Text>
        </View>
      )}

      <Text style={styles.label}>Seats Available</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="e.g. 3"
        value={seats}
        onChangeText={setSeats}
        placeholderTextColor={COLORS.textSecondary}
      />
<Text style={styles.label}>Departure Time</Text>
<Pressable style={styles.input} onPress={() => setShowPicker(true)}>
  <Text style={{ color: COLORS.textPrimary }}>
    {departureDate.toLocaleString()}
  </Text>
</Pressable>

{showPicker && (
  <DateTimePicker
    value={departureDate}
    mode="datetime"
    display="default"
    minimumDate={new Date()}
    onChange={(event, selected) => {
      setShowPicker(false);
      if (selected) setDepartureDate(selected);
    }}
  />
)}


      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Post Ride</Text>
        )}
      </Pressable>

      <LocationPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onConfirm={handleLocationsConfirmed}
      />
    </ScrollView>
  );
}
// will be refactored later
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  mapPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mapPickerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONT_SIZES.md,
  },
});