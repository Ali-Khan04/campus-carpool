import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import StudentProfile from "./studentProfile";
import DriverProfile from "./driverProfile";
import { COLORS, SPACING } from "@/constants/theme";

export default function ProfileScreen() {
  const [role, setRole] = useState<"student" | "driver">("student");

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Pressable
          style={[styles.switchBtn, role === "student" && styles.active]}
          onPress={() => setRole("student")}
        >
          <Text>Student</Text>
        </Pressable>

        <Pressable
          style={[styles.switchBtn, role === "driver" && styles.active]}
          onPress={() => setRole("driver")}
        >
          <Text>Driver</Text>
        </Pressable>
      </View>
      {role === "student" ? <StudentProfile /> : <DriverProfile />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  switchContainer: {
    flexDirection: "row",
    margin: SPACING.md,
    borderRadius: 8,
    overflow: "hidden",
  },
  switchBtn: {
    flex: 1,
    padding: SPACING.md,
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
});
