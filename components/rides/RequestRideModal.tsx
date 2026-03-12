import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { supabase } from "@/lib/supabase";
import { Ride } from "@/types/Profiles";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LocationPickerModal, { PickedLocation } from "./LocationPickerModal";

interface Props {
  ride: Ride | null;
  visible: boolean;
  onClose: () => void;
  onRequested: () => void;
}

export default function RequestRideModal({ ride, visible, onClose, onRequested }: Props) {
  const { session } = useProfile();
  const [seats, setSeats] = useState("1");
  const [meetupLocation, setMeetupLocation] = useState<PickedLocation | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!ride || !session?.user?.id) return;

    const seatsNum = parseInt(seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > ride.seats_available) {
      Alert.alert("Error", `Enter seats between 1 and ${ride.seats_available}.`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("ride_requests").insert({
      ride_id: ride.id,
      student_id: session.user.id,
      seats_requested: seatsNum,
      meetup_lat: meetupLocation?.lat ?? null,
      meetup_lng: meetupLocation?.lng ?? null,
      status: "pending",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Requested!", "Your ride request has been sent.");
      setSeats("1");
      setMeetupLocation(null);
      onRequested();
      onClose();
    }
  };

  const handleClose = () => {
    setSeats("1");
    setMeetupLocation(null);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Request Ride</Text>

            {ride && (
              <Text style={styles.subtitle}>
                Leaving at {new Date(ride.departure_time).toLocaleString()} •{" "}
                {ride.seats_available} seats left
              </Text>
            )}

            <Text style={styles.label}>Seats Needed</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={seats}
              onChangeText={setSeats}
            />

            {/* Meetup location picker */}
            <Text style={styles.label}>Meetup Point (optional)</Text>
            <Pressable
              style={styles.mapPickerBtn}
              onPress={() => setMapVisible(true)}
            >
              <Ionicons name="map-outline" size={18} color={COLORS.primary} />
              <Text style={styles.mapPickerText} numberOfLines={1}>
                {meetupLocation ? meetupLocation.label : "Tap to set meetup location"}
              </Text>
              {meetupLocation && (
                <Pressable onPress={() => setMeetupLocation(null)}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </Pressable>
              )}
            </Pressable>

            <View style={styles.actions}>
              <Pressable style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.confirmBtn}
                onPress={handleRequest}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

     
      <LocationPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onConfirm={(p) => {
          setMeetupLocation(p);
          setMapVisible(false);
        }}
      />
    </>
  );
}
// will be refactored later
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
  },
  mapPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  mapPickerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});