import { COLORS } from '@/constants/theme';
import { authStyles } from '@/styles/authStyles';
import { AuthInput } from '@/types/AuthInput';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

// password strength logic when creating a new password
type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number; // 0-4
  color: string;
  hints: string[];
}
//Function to check password strength
function getPasswordStrength(password: string): StrengthResult {
  const hints: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else hints.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score++;
  else hints.push('One uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else hints.push('One number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else hints.push('One special character (!@#$...)');

  const levels: StrengthLevel[] = ['weak', 'weak', 'fair', 'good', 'strong'];
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  return { level: levels[score], score, color: colors[score], hints };
}
type Props = {
  title: string;
  subtitle: string;
  formData: AuthInput & { confirmPassword?: string };
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  isSignUp?: boolean;
  showForgotPassword?: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onForgotPassword?: () => void;
};

export default function AuthForm({
  title,
  subtitle,
  formData,
  loading,
  submitLabel,
  loadingLabel,
  isSignUp = false,
  showForgotPassword = false,
  onChange,
  onSubmit,
  onForgotPassword,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const strength = isSignUp && formData.password ? getPasswordStrength(formData.password) : null;

  const passwordMismatch =
    isSignUp && !!formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>{title}</Text>
      <Text style={authStyles.subtitle}>{subtitle}</Text>

      {/*Email */}
      <View style={authStyles.inputWrapper}>
        <TextInput
          style={[authStyles.input, emailFocused && authStyles.inputFocused]}
          value={formData.email}
          placeholder="Email"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          onChangeText={(text) => onChange('email', text)}
        />
      </View>

      {/*Password */}
      <View style={authStyles.inputWrapper}>
        <TextInput
          style={[authStyles.input, passwordFocused && authStyles.inputFocused]}
          value={formData.password}
          placeholder="Password"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!showPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          onChangeText={(text) => onChange('password', text)}
        />
        <Pressable style={authStyles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
          <Text style={authStyles.eyeIconText}>{showPassword ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>

      {/*Forgot password) */}
      {showForgotPassword && (
        <Pressable style={authStyles.forgotPassword} onPress={onForgotPassword}>
          <Text style={authStyles.forgotPasswordText}>Forgot password?</Text>
        </Pressable>
      )}

      {/*Password strength */}
      {isSignUp && !!formData.password && strength && (
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
            {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)} password
          </Text>
          {strength.hints.length > 0 && (
            <View style={authStyles.strengthHints}>
              {strength.hints.map((hint) => (
                <Text key={hint} style={authStyles.strengthHintText}>
                  · {hint}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/*Confirm password */}
      {isSignUp && (
        <View style={authStyles.inputWrapper}>
          <TextInput
            style={[
              authStyles.input,
              confirmFocused && authStyles.inputFocused,
              passwordMismatch && { borderColor: '#EF4444' },
            ]}
            value={formData.confirmPassword ?? ''}
            placeholder="Confirm Password"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry={!showConfirm}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            onChangeText={(text) => onChange('confirmPassword', text)}
          />
          <Pressable style={authStyles.eyeIcon} onPress={() => setShowConfirm((v) => !v)}>
            <Text style={authStyles.eyeIconText}>{showConfirm ? '🙈' : '👁️'}</Text>
          </Pressable>
          {passwordMismatch && (
            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
              Passwords do not match
            </Text>
          )}
        </View>
      )}

      <Pressable
        style={[authStyles.button, loading && authStyles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={authStyles.buttonText}>{loading ? loadingLabel : submitLabel}</Text>
      </Pressable>
    </View>
  );
}
