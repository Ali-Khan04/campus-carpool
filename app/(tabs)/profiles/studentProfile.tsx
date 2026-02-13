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
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Helper function to clean NULL bug from supabase
const cleanValue = (value: string | null | undefined): string => {
  if (!value || value === "NULL" || value === "null") {
    return "";
  }
  return value;
};

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

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>No Profile Found</Text>
        <Text style={styles.label}>Please sign in to view your profile</Text>
      </View>
    );
  }

  return editing ? (
    <View style={styles.editCard}>
      <TextInput
        style={[styles.input, styles.inputFirst]}
        value={profileData.full_name}
        onChangeText={(userInput) => handleProfileData("full_name", userInput)}
        placeholder="Full name"
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        value={profileData.university_name}
        onChangeText={(userInput) =>
          handleProfileData("university_name", userInput)
        }
        placeholder="University"
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        value={profileData.phone}
        onChangeText={(userInput) => handleProfileData("phone", userInput)}
        placeholder="Phone"
        placeholderTextColor={COLORS.textSecondary}
        keyboardType="phone-pad"
      />
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.cancelBtn}
          onPress={() => {
            setProfileData({
              full_name: cleanValue(profile?.full_name),
              university_name: cleanValue(profile?.university_name),
              phone: cleanValue(profile?.phone),
            });
            setEditing(false);
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <Pressable
      onPress={() => {
        setProfileData({
          full_name: cleanValue(profile?.full_name),
          university_name: cleanValue(profile?.university_name),
          phone: cleanValue(profile?.phone),
        });
        setEditing(true);
      }}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Student Profile</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Name</Text>
        <Text
          style={[
            styles.value,
            !cleanValue(profile?.full_name) && styles.placeholder,
          ]}
        >
          {cleanValue(profile?.full_name) || "Tap to add your name"}
        </Text>

        <Text style={styles.label}>University</Text>
        <Text
          style={[
            styles.value,
            !cleanValue(profile?.university_name) && styles.placeholder,
          ]}
        >
          {cleanValue(profile?.university_name) || "Tap to add your university"}
        </Text>

        <Text style={styles.label}>Phone</Text>
        <Text
          style={[
            styles.value,
            !cleanValue(profile?.phone) && styles.placeholder,
          ]}
        >
          {cleanValue(profile?.phone) || "Tap to add your phone number"}
        </Text>
      </View>
    </Pressable>
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
  editCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
  },

  input: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },

  inputFirst: {
    marginTop: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },

  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  saveBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
    backgroundColor: COLORS.textPrimary,
  },

  saveText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: "600",
  },
});
