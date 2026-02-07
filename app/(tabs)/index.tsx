import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function TabsHomeScreen() {
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            router.replace("/(auth)/sign-in");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.title}>Ready to go?</Text>
      <Text style={styles.subtitle}>start a carpool in just one tap</Text>
      <Pressable style={styles.ctaButton}>
        <Text style={styles.ctaText}>Start CarPool</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  logoutButton: {
    position: "absolute",
    top: SPACING.lg,
    right: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
});
