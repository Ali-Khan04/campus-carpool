import ModeSelectorModal from '@/components/mode/ModeSelectorModal';
import { ProfileProvider } from '@/context/ProfileProvider';
import { useProfile } from '@/hooks/ProfileContextHook';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';

function StackNavigation() {
  const segments = useSegments();
  const { session, profile, loading } = useProfile();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === '(auth)'; //User is on a public auth screen (sign-in, sign-up, forgot-password, reset-password)
    const inOnboarding = segments[0] === '(onboarding)'; //User is completing their profile for the first time
    const inTabs = segments[0] === '(tabs)'; //User is inside the main app
    const inResetPassword = segments[1] === 'reset-password'; //Temporarily has a session from OTP verify — don't redirect away mid-flow

    if (!session) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }
    if (inResetPassword) return;
    const hasRole = !!profile?.role;
    const isComplete = !!profile?.full_name && !!profile?.university_name && !!profile?.phone;

    if (!hasRole || !isComplete) {
      if (!inOnboarding) router.replace('/(onboarding)');
    } else {
      if (!inTabs) router.replace('/(tabs)');
    }
  }, [loading, session, profile]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <ModeSelectorModal />
    </>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StackNavigation />
    </ProfileProvider>
  );
}
