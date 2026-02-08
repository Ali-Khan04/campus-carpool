import { useEffect, useState } from "react";
import { Stack, router, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { ProfileProvider } from "@/context/ProfileProvider";

export default function StackNavigation() {
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  //2 useEffect hooks to avoid the closure bug where the listener gets stuck with old values
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/sign-in");
      }
      setInitializing(false);
    });
  }, []);

  useEffect(() => {
    if (initializing) return; //this hook should only run after we check the initial session

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const inAuthGroup = segments[0] === "(auth)";

      if (session && inAuthGroup) {
        router.replace("/(tabs)");
      } else if (!session && !inAuthGroup && segments[0] !== undefined) {
        router.replace("/(auth)/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializing, segments]);

  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ProfileProvider>
  );
}
