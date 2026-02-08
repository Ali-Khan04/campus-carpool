import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";

export default function DriverProfile() {
  const { driverProfile, isDriver, loading } = useProfile();

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isDriver || !driverProfile) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Not a Driver</Text>
        <Text style={styles.placeholder}>
          You haven't registered as a driver yet. Tap here to become a driver.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Driver Profile</Text>

      <Text style={styles.label}>Car Model</Text>
      <Text
        style={[styles.value, !driverProfile.car_model && styles.placeholder]}
      >
        {driverProfile.car_model || "Tap to add your car model"}
      </Text>

      <Text style={styles.label}>Car Color</Text>
      <Text
        style={[styles.value, !driverProfile.car_color && styles.placeholder]}
      >
        {driverProfile.car_color || "Tap to add your car color"}
      </Text>

      <Text style={styles.label}>Car Plate</Text>
      <Text
        style={[styles.value, !driverProfile.car_plate && styles.placeholder]}
      >
        {driverProfile.car_plate || "Tap to add your car plate"}
      </Text>

      <Text style={styles.label}>Seats Available</Text>
      <Text style={styles.value}>{driverProfile.seats_available || 4}</Text>

      <Text style={styles.label}>License Number</Text>
      <Text
        style={[
          styles.value,
          !driverProfile.license_number && styles.placeholder,
        ]}
      >
        {driverProfile.license_number || "Tap to add your license number"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});
