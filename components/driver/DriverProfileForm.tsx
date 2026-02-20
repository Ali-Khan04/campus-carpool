import { View, Text, TextInput, Pressable } from "react-native";
import { driverProfileStyles as styles } from "@/styles/driverProfileStyles";

type DriverFormData = {
  car_model: string;
  car_color: string;
  car_plate: string;
  seats_available: number;
  license_number: string;
};

type Props = {
  formData: DriverFormData;
  onChange: (field: keyof DriverFormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function DriverProfileForm({
  formData,
  onChange,
  onSave,
  onCancel,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Edit Driver Profile</Text>

      <Text style={styles.label}>Car Model</Text>
      <TextInput
        style={styles.input}
        value={formData.car_model}
        placeholder="Enter car model"
        onChangeText={(text) => onChange("car_model", text)}
      />

      <Text style={styles.label}>Car Color</Text>
      <TextInput
        style={styles.input}
        value={formData.car_color}
        placeholder="Enter car color"
        onChangeText={(text) => onChange("car_color", text)}
      />

      <Text style={styles.label}>Car Plate</Text>
      <TextInput
        style={styles.input}
        value={formData.car_plate}
        placeholder="Enter car plate"
        autoCapitalize="characters"
        onChangeText={(text) => onChange("car_plate", text)}
      />

      <Text style={styles.label}>Seats Available</Text>
      <TextInput
        style={styles.input}
        value={String(formData.seats_available)}
        placeholder="Enter seats available"
        keyboardType="numeric"
        onChangeText={(text) => onChange("seats_available", text)}
      />

      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        value={formData.license_number}
        placeholder="Enter license number"
        onChangeText={(text) => onChange("license_number", text)}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.saveButton]} onPress={onSave}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
