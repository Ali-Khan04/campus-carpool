import { View, Text, TextInput, Pressable } from "react-native";
import { COLORS } from "@/constants/theme";
import { AuthInput } from "@/types/AuthInput";
import { authStyles } from "@/styles/authStyles";

type Props = {
  title: string;
  subtitle: string;
  formData: AuthInput;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
};

export default function AuthForm({
  title,
  subtitle,
  formData,
  loading,
  submitLabel,
  loadingLabel,
  onChange,
  onSubmit,
}: Props) {
  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>{title}</Text>
      <Text style={authStyles.subtitle}>{subtitle}</Text>

      <TextInput
        style={authStyles.input}
        value={formData.email}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => onChange("email", text)}
      />

      <TextInput
        style={authStyles.input}
        value={formData.password}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry
        onChangeText={(text) => onChange("password", text)}
      />

      <Pressable
        style={[authStyles.button, loading && authStyles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={authStyles.buttonText}>
          {loading ? loadingLabel : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
