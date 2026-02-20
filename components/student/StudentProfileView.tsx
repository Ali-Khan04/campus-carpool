import { View, Text, Pressable } from "react-native";
import { studentProfileStyles as styles } from "@/styles/studentProfileStyles";
import { cleanValue } from "@/utils/cleanValue";

type ProfileData = {
  email?: string;
  full_name?: string | null;
  university_name?: string | null;
  phone?: string | null;
};

type Props = {
  profile: ProfileData;
  onEdit: () => void;
};

export default function StudentProfileView({ profile, onEdit }: Props) {
  return (
    <Pressable onPress={onEdit}>
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
