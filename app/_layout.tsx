import { ProfileProvider } from "@/context/ProfileProvider";
import { useProfile } from "@/hooks/ProfileContextHook";
import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";

function StackNavigation() {
  const segments = useSegments();
  const { session, profile, loading } = useProfile();

  // Handle redirects based on auth/profile state
  useEffect(() => {
    // Wait until ProfileProvider has finished fetching
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";
    const inTabs = segments[0] === "(tabs)";

    if (!session) {
      if (!inAuth) router.replace("/(auth)/sign-in");
      return;
    }

    const hasRole = !!profile?.role;
    const isComplete =
      !!profile?.full_name &&
      !!profile?.university_name &&
      !!profile?.phone;

    if (!hasRole || !isComplete) {
      if (!inOnboarding) router.replace("/(onboarding)");
    } else {
      if (!inTabs) router.replace("/(tabs)");
    }
  }, [loading, session, profile]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StackNavigation />
    </ProfileProvider>
  );
}