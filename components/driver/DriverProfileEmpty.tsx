import { View, Text, Pressable } from "react-native";
import { driverProfileStyles as styles } from "@/styles/driverProfileStyles";

type Props = {
  onPress: () => void;
};

export default function DriverProfileEmpty({ onPress }: Props) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <Text style={styles.heading}>Not a Driver</Text>
        <Text style={styles.placeholder}>
          You haven't registered as a driver yet. Tap here to become a driver.
        </Text>
      </Pressable>
    </View>
  );
}
