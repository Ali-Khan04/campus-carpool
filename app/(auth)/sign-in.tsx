import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { AuthInput } from "@/types/AuthInput";
import { supabase } from "@/lib/supabase";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { router } from "expo-router";

export default function SignIn() {
  const [signIn, setSignIn] = useState<AuthInput>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const handleSignIn = (field: string, value: string) => {
    setSignIn((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signIn.email,
      password: signIn.password,
    });
    console.log("Signing in with", signIn.email);
    if (error) Alert.alert(error.message);
    console.log("Sign in successful, redirecting...");

    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        value={signIn.email}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(userInput) => handleSignIn("email", userInput)}
      />

      <TextInput
        style={styles.input}
        value={signIn.password}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        onChangeText={(userInput) => handleSignIn("password", userInput)}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push("./sign-up")}>
        <Text style={{ marginTop: SPACING.sm, color: COLORS.textSecondary }}>
          Don't have an account?
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
});
