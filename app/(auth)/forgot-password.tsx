import { COLORS, SPACING } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { authStyles } from '@/styles/authStyles';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Enter your email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setStep('otp');
  };
  //Verify the OTP code entered by the user
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Enter the code from your email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'recovery',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Invalid code', 'The code is wrong or has expired. Please try again.');
    } else {
      //Navigate to the reset password screen, passing the email as a param
      router.replace('/(auth)/reset-password');
    }
  };

  if (step === 'otp') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          padding: SPACING.lg,
        }}
      >
        <View style={authStyles.container}>
          <Text style={authStyles.title}>Check your email</Text>
          <Text style={[authStyles.subtitle, { marginBottom: SPACING.lg }]}>
            If <Text style={{ fontWeight: '600' }}>{email}</Text> is registered, we sent a 6-digit
            code. Enter it below.
          </Text>

          <View style={authStyles.inputWrapper}>
            <TextInput
              style={[
                authStyles.input,
                focused && authStyles.inputFocused,
                {
                  letterSpacing: 8,
                  textAlign: 'center',
                  fontSize: 22,
                },
              ]}
              value={otp}
              placeholder="000000"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              maxLength={8}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChangeText={setOtp}
            />
          </View>

          <Pressable
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            <Text style={authStyles.buttonText}>{loading ? 'Verifying...' : 'Verify Code'}</Text>
          </Pressable>

          <Pressable onPress={handleSendOtp} style={{ marginTop: SPACING.md }}>
            <Text style={[authStyles.backLink, { color: COLORS.textSecondary }]}>
              Didn't get it? Resend code
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={authStyles.backLink}>← Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        padding: SPACING.lg,
      }}
    >
      <View style={authStyles.container}>
        <Text style={authStyles.title}>Forgot password?</Text>
        <Text style={authStyles.subtitle}>Enter your email and we'll send you a reset code.</Text>

        <View style={authStyles.inputWrapper}>
          <TextInput
            style={[authStyles.input, focused && authStyles.inputFocused]}
            value={email}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChangeText={setEmail}
          />
        </View>

        <Pressable
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={authStyles.buttonText}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={authStyles.backLink}>← Back to Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}
