import { View, TextInput, Pressable, Text } from "react-native";
import { COLORS } from "@/constants/theme";
import { studentProfileStyles as styles } from "@/styles/studentProfileStyles";

type FormData = {
  full_name: string;
  university_name: string;
  phone: string;
};

type Props = {
  formData: FormData;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function StudentProfileForm({
  formData,
  onChange,
  onSave,
  onCancel,
}: Props) {
  return (
    <View style={styles.editCard}>
      <TextInput
        style={[styles.input, styles.inputFirst]}
        value={formData.full_name}
        onChangeText={(userInput) => onChange("full_name", userInput)}
        placeholder="Full name"
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        value={formData.university_name}
        onChangeText={(userInput) => onChange("university_name", userInput)}
        placeholder="University"
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(userInput) => onChange("phone", userInput)}
        placeholder="Phone"
        placeholderTextColor={COLORS.textSecondary}
        keyboardType="phone-pad"
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
