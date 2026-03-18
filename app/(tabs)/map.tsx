import BaseMap from '@/components/map/BaseMap';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { supabase } from '@/lib/supabase';
import { DriverLocation } from '@/types/Profiles';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default function MapScreen() {
  const { activeMode, session } = useProfile();
  const isDriverMode = activeMode === 'driver';

  // driverId passed as parameter from student's "Track Driver" button
  const { driverId } = useLocalSearchParams<{ driverId?: string }>();
  // driver's last known location fetched via realtime, shown as a marker for the student
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const mapRef = useRef<MapView>(null);
  // if driver mode then publish location to db table every 4 seconds
  //currently this runs only when map screen is open
  //later we will run this in background using expo TaskManager
  useEffect(() => {
    if (!isDriverMode || !session?.user?.id) return;

    let interval: ReturnType<typeof setInterval>;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // publish location immediately and then every 4 seconds
      const publishLocation = async () => {
        const loc = await Location.getCurrentPositionAsync({});
        await supabase.from('driver_locations').upsert({
          driver_id: session.user.id,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          updated_at: new Date().toISOString(),
        });
      };

      await publishLocation();
      interval = setInterval(publishLocation, 4000);
    })();

    return () => {
      clearInterval(interval);
    };
  }, [isDriverMode, session?.user?.id]);

  // subscribe to driver's location updates

  useEffect(() => {
    if (isDriverMode || !driverId) return;

    supabase
      .from('driver_locations')
      .select('*')
      .eq('driver_id', driverId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDriverLocation(data as DriverLocation);
      });

    //  subscribe to live updates
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          setDriverLocation(payload.new as DriverLocation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, isDriverMode]);

  //the driver location marker
  const driverMarker = driverLocation
    ? [
        {
          coordinate: {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          },
          title: 'Your Driver',
          description: 'Live location',
          pinColor: COLORS.primary,
        },
      ]
    : [];

  return (
    <>
      <Stack.Screen options={{ title: 'Map', headerShown: true }} />
      {!isDriverMode && driverId && (
        <View style={styles.trackingBanner}>
          <Text style={styles.trackingText}>
            {driverLocation ? '🟢 Tracking driver live' : '⏳ Waiting for driver location...'}
          </Text>
        </View>
      )}
      {/*Driver location banner */}
      {isDriverMode && (
        <View style={styles.broadcastBanner}>
          <Text style={styles.broadcastText}>📡 Broadcasting your location to passengers</Text>
        </View>
      )}
      <BaseMap ref={mapRef} extraMarkers={driverMarker} />
    </>
  );
}

const styles = StyleSheet.create({
  trackingBanner: {
    backgroundColor: '#D1FAE5',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  trackingText: {
    fontSize: FONT_SIZES.sm,
    color: '#065F46',
    fontWeight: '600',
  },
  broadcastBanner: {
    backgroundColor: '#DBEAFE',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  broadcastText: {
    fontSize: FONT_SIZES.sm,
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
