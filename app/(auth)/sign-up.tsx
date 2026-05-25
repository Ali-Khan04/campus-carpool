import AuthFooterLink from '@/components/auth/AuthFooterLink';
import AuthForm from '@/components/auth/AuthForm';
import { COLORS, SPACING } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { AuthInput } from '@/types/AuthInput';
import { useState } from 'react';
import { Alert, View } from 'react-native';

type SignUpInput = AuthInput & { confirmPassword: string };

export default function SignUp() {
  const [loginInfo, setLoginInfo] = useState<SignUpInput>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginInfo = (field: string, value: string) => {
    setLoginInfo((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async () => {
    if (loginInfo.password !== loginInfo.confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
      return;
    }
    if (loginInfo.password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: loginInfo.email,
      password: loginInfo.password,
    });

    setLoading(false);

    if (error) {
      // Show clean messages instead of raw Supabase errors
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists')
      ) {
        Alert.alert(
          'Account exists',
          'An account with this email already exists. Try signing in instead.'
        );
      } else {
        Alert.alert('Sign Up Failed', error.message);
      }
      return;
    }

    //Supabase returns identities [] when the email already exists
    //check for [] to catch duplicate email signups
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      Alert.alert(
        'Account exists',
        'An account with this email already exists. Try signing in instead.'
      );
      return;
    }

    if (!data.session) {
      Alert.alert(
        'Almost there!',
        'Please check your inbox to verify your email before signing in.'
      );
    }
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
        title="Create account"
        subtitle="Join Campus Carpool today"
        formData={loginInfo}
        loading={loading}
        submitLabel="Sign Up"
        loadingLabel="Creating account..."
        isSignUp
        onChange={handleLoginInfo}
        onSubmit={handleSubmit}
      />
      <AuthFooterLink label="Already have an account? Sign in" href="./sign-in" />
    </View>
  );
}
