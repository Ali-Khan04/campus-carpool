import { View, Text } from "react-native";
import { studentProfileStyles as styles } from "@/styles/studentProfileStyles";

export default function StudentProfileEmpty() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>No Profile Found</Text>
      <Text style={styles.label}>Please sign in to view your profile</Text>
    </View>
  );
}
