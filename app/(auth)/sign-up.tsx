import { useState } from "react";
import { Alert, View } from "react-native";
import { AuthInput } from "@/types/AuthInput";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/auth/AuthForm";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import { COLORS, SPACING } from "@/constants/theme";
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
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        padding: SPACING.lg,
      }}
    >
      <AuthForm
        title="Welcome"
        subtitle="Sign in or create an account to continue"
        formData={loginInfo}
        loading={loading}
        submitLabel="Sign Up"
        loadingLabel="Creating Account..."
        onChange={handleLoginInfo}
        onSubmit={handleSubmit}
      />
      <AuthFooterLink label="Already have an account?" href="./sign-in" />
    </View>
  );
}
