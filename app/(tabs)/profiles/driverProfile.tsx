import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverProfile() {
  const { driverProfile, isDriver, loading, dispatch, profile } = useProfile();

  const [driverProfileData, setDriverProfile] = useState({
    car_model: driverProfile?.car_model ?? "",
    car_color: driverProfile?.car_color ?? "",
    car_plate: driverProfile?.car_plate ?? "",
    seats_available: driverProfile?.seats_available ?? 0,
    license_number: driverProfile?.license_number ?? "",
  });

  const [editing, setEditing] = useState<boolean>(false);
  // handle driver profile data change
  const handleDriverProfileData = (
    field: keyof typeof driverProfileData,
    value: string,
  ) => {
    setDriverProfile((prev) => ({
      ...prev,
      [field]: field === "seats_available" ? Number(value) : value,
    }));
  };
  // update or create driver profile
  const handleSubmit = async () => {
    const { car_model, car_color, car_plate, seats_available, license_number } =
      driverProfileData;
    if (
      !car_model.trim() ||
      !car_color.trim() ||
      !car_plate.trim() ||
      !license_number.trim() ||
      !seats_available ||
      seats_available <= 0
    ) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all the fields before continuing.",
      );
      return;
    }

    try {
      if (driverProfile?.id) {
        // Update existing driver profile
        const { error } = await supabase
          .from("driver_profiles")
          .update(driverProfileData)
          .eq("id", profile?.id);

        if (error) {
          console.error("Update error:", error);
          return;
        }
        dispatch({
          type: "UPDATE_DRIVER_PROFILE",
          payload: driverProfileData,
        });

        Alert.alert("Your driver profile has been updated");
      } else {
        // Insert new driver profile if not already a driver
        const { data, error } = await supabase.from("driver_profiles").insert({
          id: profile?.id,
          ...driverProfileData,
        });

        if (error) {
          console.error("Insert error:", error);
          return;
        }
        dispatch({
          type: "SET_DRIVER_PROFILE",
          payload: data,
        });

        Alert.alert("Your driver profile has been created.");
      }

      setEditing(false);
    } catch (error: any) {
      console.error("Driver profile error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isDriver && !editing) {
    return (
      <View style={styles.card}>
        <Pressable onPress={() => setEditing(!editing)}>
          <Text style={styles.heading}>Not a Driver</Text>
          <Text style={styles.placeholder}>
            You haven't registered as a driver yet. Tap here to become a driver.
          </Text>
        </Pressable>
      </View>
    );
  }

  return editing ? (
    <View style={styles.card}>
      <Text style={styles.heading}>Edit Driver Profile</Text>

      <Text style={styles.label}>Car Model</Text>
      <TextInput
        style={styles.input}
        value={driverProfileData.car_model}
        placeholder="Enter car model"
        onChangeText={(text) => handleDriverProfileData("car_model", text)}
      />

      <Text style={styles.label}>Car Color</Text>
      <TextInput
        style={styles.input}
        value={driverProfileData.car_color}
        placeholder="Enter car color"
        onChangeText={(text) => handleDriverProfileData("car_color", text)}
      />

      <Text style={styles.label}>Car Plate</Text>
      <TextInput
        style={styles.input}
        value={driverProfileData.car_plate}
        placeholder="Enter car plate"
        autoCapitalize="characters"
        onChangeText={(text) => handleDriverProfileData("car_plate", text)}
      />

      <Text style={styles.label}>Seats Available</Text>
      <TextInput
        style={styles.input}
        value={String(driverProfileData.seats_available)}
        placeholder="Enter seats available"
        keyboardType="numeric"
        onChangeText={(text) =>
          handleDriverProfileData("seats_available", text)
        }
      />

      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        value={driverProfileData.license_number}
        placeholder="Enter license number"
        onChangeText={(text) => handleDriverProfileData("license_number", text)}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setDriverProfile({
              car_model: driverProfile?.car_model ?? "",
              car_color: driverProfile?.car_color ?? "",
              car_plate: driverProfile?.car_plate ?? "",
              seats_available: driverProfile?.seats_available ?? 0,
              license_number: driverProfile?.license_number ?? "",
            });
            setEditing(false);
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.saveButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <View style={styles.card}>
      <Pressable onPress={() => setEditing(!editing)}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 4,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },

  button: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },

  cancelButton: {
    backgroundColor: COLORS.textSecondary,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
