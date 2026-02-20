import { View, Text, Pressable } from "react-native";
import { driverProfileStyles as styles } from "@/styles/driverProfileStyles";

type DriverData = {
  car_model?: string;
  car_color?: string;
  car_plate?: string;
  seats_available?: number;
  license_number?: string;
};

type Props = {
  driverProfile: DriverData | null;
  onEdit: () => void;
};

export default function DriverProfileView({ driverProfile, onEdit }: Props) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onEdit}>
        <Text style={styles.heading}>Driver Profile</Text>

        <Text style={styles.label}>Car Model</Text>
        <Text
          style={[
            styles.value,
            !driverProfile?.car_model && styles.placeholder,
          ]}
        >
          {driverProfile?.car_model || "Tap to add your car model"}
        </Text>

        <Text style={styles.label}>Car Color</Text>
        <Text
          style={[
            styles.value,
            !driverProfile?.car_color && styles.placeholder,
          ]}
        >
          {driverProfile?.car_color || "Tap to add your car color"}
        </Text>

        <Text style={styles.label}>Car Plate</Text>
        <Text
          style={[
            styles.value,
            !driverProfile?.car_plate && styles.placeholder,
          ]}
        >
          {driverProfile?.car_plate || "Tap to add your car plate"}
        </Text>

        <Text style={styles.label}>Seats Available</Text>
        <Text style={styles.value}>{driverProfile?.seats_available || 4}</Text>

        <Text style={styles.label}>License Number</Text>
        <Text
          style={[
            styles.value,
            !driverProfile?.license_number && styles.placeholder,
          ]}
        >
          {driverProfile?.license_number || "Tap to add your license number"}
        </Text>
      </Pressable>
    </View>
  );
}
