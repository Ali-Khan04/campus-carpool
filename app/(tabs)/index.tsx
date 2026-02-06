import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";

export default function TabsHomeScreen() {
  return (
    <View style={styles.container}>
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
});
