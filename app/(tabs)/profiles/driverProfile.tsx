import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";

export default function DriverProfile() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Driver Profile</Text>

      <Text style={styles.label}>Car Model</Text>
      <Text style={styles.value}>Honda Civic</Text>

      <Text style={styles.label}>Seats Available</Text>
      <Text style={styles.value}>3</Text>

      <Text style={styles.label}>License Status</Text>
      <Text style={styles.value}>Verified</Text>
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
  },
});
