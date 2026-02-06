import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";

export default function StudentProfile() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Student Profile</Text>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>Ali Khan</Text>

      <Text style={styles.label}>University</Text>
      <Text style={styles.value}>Air University</Text>

      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>Student</Text>
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
