import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { AuthInput } from "@/types/AuthInput";
import { supabase } from "@/lib/supabase";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { router } from "expo-router";

export default function SignUp() {
  const [loginInfo, setLoginInfo] = useState<AuthInput>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const handleLoginInfo = (field: string, value: string) => {
    setLoginInfo((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: loginInfo.email,
      password: loginInfo.password,
    });
    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>
        Sign in or create an account to continue
      </Text>

      <TextInput
        style={styles.input}
        value={loginInfo.email}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => handleLoginInfo("email", text)}
      />

      <TextInput
        style={styles.input}
        value={loginInfo.password}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        onChangeText={(text) => handleLoginInfo("password", text)}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating Account..." : "Sign Up"}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push("./sign-in")}>
        <Text style={{ marginTop: SPACING.sm, color: COLORS.textSecondary }}>
          Already have an account?
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
