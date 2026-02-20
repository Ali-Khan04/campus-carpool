import { View, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { COLORS } from "@/constants/theme";
import { useProfile } from "@/hooks/ProfileContextHook";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";
import { studentProfileStyles as styles } from "@/styles/studentProfileStyles";
import StudentProfileEmpty from "@/components/student/StudentProfileEmpty";
import StudentProfileView from "@/components/student/StudentProfileView";
import StudentProfileForm from "@/components/student/StudentProfileForm";
import { cleanValue } from "@/utils/cleanValue";

export default function StudentProfile() {
  const { profile, loading, dispatch } = useProfile();

  const [profileData, setProfileData] = useState({
    full_name: cleanValue(profile?.full_name),
    university_name: cleanValue(profile?.university_name),
    phone: cleanValue(profile?.phone),
  });

  const [editing, setEditing] = useState<boolean>(false);

  // Update state when profile changes with clean values without NULL bug
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: cleanValue(profile.full_name),
        university_name: cleanValue(profile.university_name),
        phone: cleanValue(profile.phone),
      });
    }
  }, [profile]);

  const handleProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Update profile function
  const handleSubmit = async () => {
    if (!profile) return;
    const { full_name, university_name, phone } = profileData;

    if (
      !full_name ||
      !university_name ||
      !phone ||
      full_name.trim() === "" ||
      university_name.trim() === "" ||
      phone.trim() === ""
    ) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all the fields before continuing.",
      );
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        university_name: profileData.university_name,
        phone: profileData.phone,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
      return;
    }

    dispatch({
      type: "UPDATE_PROFILE",
      payload: {
        full_name: profileData.full_name,
        university_name: profileData.university_name,
        phone: profileData.phone,
      },
    });

    Alert.alert("Success", "Your profile has been updated.");
    setEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      full_name: cleanValue(profile?.full_name),
      university_name: cleanValue(profile?.university_name),
      phone: cleanValue(profile?.phone),
    });
    setEditing(false);
  };

  const handleEditPress = () => {
    setProfileData({
      full_name: cleanValue(profile?.full_name),
      university_name: cleanValue(profile?.university_name),
      phone: cleanValue(profile?.phone),
    });
    setEditing(true);
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) return <StudentProfileEmpty />;

  if (editing) {
    return (
      <StudentProfileForm
        formData={profileData}
        onChange={handleProfileData}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return <StudentProfileView profile={profile} onEdit={handleEditPress} />;
}
