import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";

import { router } from "expo-router";

export default function SignInIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarPool</Text>
      <Pressable onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.subtitle}>
          Sign in or create an account to continue
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
