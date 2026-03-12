import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function RoleSelectionScreen() {
  const { session, dispatch } = useProfile();

  const handleRoleSelect = async (role: "student" | "driver") => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", session.user.id);

    if (error) {
      console.error(error);
      return;
    }

    dispatch({ type: "UPDATE_PROFILE", payload: { role } });
    router.push({ pathname: "/(onboarding)/setup", params: { role } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome aboard 👋</Text>
      <Text style={styles.subtitle}>How will you be using Campus Carpool?</Text>

      <Pressable style={styles.card} onPress={() => handleRoleSelect("student")}>
        <Ionicons name="school-outline" size={36} color={COLORS.primary} />
        <Text style={styles.cardTitle}>I'm a Student</Text>
        <Text style={styles.cardDesc}>
          Find rides to and from university
        </Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => handleRoleSelect("driver")}>
        <Ionicons name="car-sport-outline" size={36} color={COLORS.primary} />
        <Text style={styles.cardTitle}>I'm a Driver</Text>
        <Text style={styles.cardDesc}>
          Offer rides and earn trust in the community
        </Text>
      </Pressable>
    </View>
  );
}
// will be refactored later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: "center",
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
