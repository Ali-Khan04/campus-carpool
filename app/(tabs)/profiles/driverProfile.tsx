import { View, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { COLORS } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { supabase } from "@/lib/supabase";
import { driverProfileStyles as styles } from "@/styles/driverProfileStyles";
import DriverProfileEmpty from "@/components/driver/DriverProfileEmpty";
import DriverProfileForm from "@/components/driver/DriverProfileForm";
import DriverProfileView from "@/components/driver/DriverProfileView";

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

        dispatch({ type: "UPDATE_DRIVER_PROFILE", payload: driverProfileData });
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

        dispatch({ type: "SET_DRIVER_PROFILE", payload: data });
        Alert.alert("Your driver profile has been created.");
      }

      setEditing(false);
    } catch (error: any) {
      console.error("Driver profile error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  const handleCancel = () => {
    setDriverProfile({
      car_model: driverProfile?.car_model ?? "",
      car_color: driverProfile?.car_color ?? "",
      car_plate: driverProfile?.car_plate ?? "",
      seats_available: driverProfile?.seats_available ?? 0,
      license_number: driverProfile?.license_number ?? "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isDriver && !editing) {
    return <DriverProfileEmpty onPress={() => setEditing(true)} />;
  }

  if (editing) {
    return (
      <DriverProfileForm
        formData={driverProfileData}
        onChange={handleDriverProfileData}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <DriverProfileView
      driverProfile={driverProfile}
      onEdit={() => setEditing(true)}
    />
  );
}
