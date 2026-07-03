import { COLORS, SPACING } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { authStyles } from '@/styles/authStyles';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
//Password strength checker function
function getPasswordStrength(password: string) {
  let score = 0;
  const hints: string[] = [];
  if (password.length >= 8) score++;
  else hints.push('At least 8 characters');
  if (/[A-Z]/.test(password)) score++;
  else hints.push('One uppercase letter');
  if (/[0-9]/.test(password)) score++;
  else hints.push('One number');
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else hints.push('One special character');
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const levels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, color: colors[score], label: levels[score], hints };
}
//main react component
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;
  const mismatch = !!confirm && password !== confirm;

  const handleReset = async () => {
    if (!password || !confirm) {
      Alert.alert('Fill in both fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (strength && strength.score < 2) {
      Alert.alert('Password too weak', 'Please choose a stronger password.');
      return;
    }

    setLoading(true);
    //Get current session to retrieve auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setLoading(false);
      Alert.alert('Session expired', 'Please request a new reset code.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') },
      ]);
      return;
    }

    //Call the api directly with the auth token to update the password
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY!,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to update password.');
        return;
      }

      await supabase.auth.signOut();
      Alert.alert('Password updated!', 'You can now sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
      ]);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
      <Text style={authStyles.title}>Set new password</Text>
      <Text style={authStyles.subtitle}>Choose a strong password for your account.</Text>

      {/*New password */}
      <View style={authStyles.inputWrapper}>
        <TextInput
          style={authStyles.input}
          value={password}
          placeholder="New Password"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />
        <Pressable style={authStyles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
          <Text style={authStyles.eyeIconText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>

      {/*Strength meter */}
      {strength && (
        <View style={authStyles.strengthContainer}>
          <View style={authStyles.strengthBars}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  authStyles.strengthBar,
                  i < strength.score && { backgroundColor: strength.color },
                ]}
              />
            ))}
          </View>
          <Text style={[authStyles.strengthLabel, { color: strength.color }]}>
            {strength.label} password
          </Text>
          {strength.hints.map((h) => (
            <Text key={h} style={authStyles.strengthHintText}>
              · {h}
            </Text>
          ))}
        </View>
      )}

      {/*Confirm */}
      <View style={authStyles.inputWrapper}>
        <TextInput
          style={[authStyles.input, mismatch && { borderColor: '#EF4444' }]}
          value={confirm}
          placeholder="Confirm New Password"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!showConfirm}
          onChangeText={setConfirm}
        />
        <Pressable style={authStyles.eyeIcon} onPress={() => setShowConfirm((v) => !v)}>
          <Text style={authStyles.eyeIconText}>{showConfirm ? 'Hide' : 'Show'}</Text>
        </Pressable>
        {mismatch && (
          <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
            Passwords do not match
          </Text>
        )}
      </View>

      <Pressable
        style={[authStyles.button, loading && authStyles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={authStyles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
      </Pressable>
    </View>
  );
}
