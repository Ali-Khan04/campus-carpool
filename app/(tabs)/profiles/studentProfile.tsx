import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";

export default function StudentProfile() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>No Profile Found</Text>
        <Text style={styles.label}>Please sign in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Student Profile</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{profile.email}</Text>

      <Text style={styles.label}>Name</Text>
      <Text style={[styles.value, !profile.full_name && styles.placeholder]}>
        {profile.full_name ? profile.full_name : "Tap to add your name"}
      </Text>

      <Text style={styles.label}>University</Text>
      <Text
        style={[styles.value, !profile.university_name && styles.placeholder]}
      >
        {profile.university_name
          ? profile.university_name
          : "Tap to add your university"}
      </Text>

      <Text style={styles.label}>Phone</Text>
      <Text style={[styles.value, !profile.phone && styles.placeholder]}>
        {profile.phone ? profile.phone : "Tap to add your phone number"}
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
