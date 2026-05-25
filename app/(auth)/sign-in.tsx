import AuthFooterLink from '@/components/auth/AuthFooterLink';
import AuthForm from '@/components/auth/AuthForm';
import { COLORS, SPACING } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/types/AuthInput';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export default function SignIn() {
  const [signIn, setSignIn] = useState<AuthInput>({ email: '', password: '' });
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
    if (error) Alert.alert('Sign In Failed', error.message);
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
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
        showForgotPassword
        onChange={handleSignIn}
        onSubmit={handleSubmit}
        onForgotPassword={() => router.push('./forgot-password')}
      />
      <AuthFooterLink label="Don't have an account? Sign up" href="./sign-up" />
    </View>
  );
}
