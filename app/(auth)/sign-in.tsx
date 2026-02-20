import { useState } from "react";
import { Alert, View } from "react-native";
import { AuthInput } from "@/types/AuthInput";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/auth/AuthForm";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import { COLORS, SPACING } from "@/constants/theme";

export default function SignIn() {
  const [signIn, setSignIn] = useState<AuthInput>({ email: "", password: "" });
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
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        padding: SPACING.lg,
      }}
    >
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to continue"
        formData={signIn}
        loading={loading}
        submitLabel="Sign In"
        loadingLabel="Signing in..."
        onChange={handleSignIn}
        onSubmit={handleSubmit}
      />
      <AuthFooterLink label="Don't have an account?" href="./sign-up" />
    </View>
  );
}
