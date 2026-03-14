import DriverProfile from '@/app/(tabs)/profiles/driverProfile';
import StudentProfile from '@/app/(tabs)/profiles/studentProfile';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function OnboardingSetupScreen() {
  const { role } = useLocalSearchParams<{ role: 'student' | 'driver' }>();
  const { profile } = useProfile();

  // Once profile is complete then move to tabs
  useEffect(() => {
    if (!profile) return;
    const isComplete = !!profile.full_name && !!profile.university_name && !!profile.phone;
    if (isComplete) {
      router.replace('/(tabs)');
    }
  }, [profile]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {role === 'driver' ? 'Set up your driver profile' : 'Tell us about yourself'}
      </Text>
      <Text style={styles.subtitle}>You can update this anytime from your profile tab</Text>

      {role === 'driver' ? <DriverProfile /> : <StudentProfile />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});
