import CreateRideForm from '@/components/rides/CreateRideForm';
import RequestRideModal from '@/components/rides/RequestRideModal';
import RideCard from '@/components/rides/RideCard';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { supabase } from '@/lib/supabase';
import { Ride } from '@/types/Profiles';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function RidesScreen() {
  const { activeMode, session, isDriver } = useProfile();
  const isDriverMode = activeMode === 'driver';

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchRides = async () => {
    setLoading(true);
    let query = supabase.from('rides').select('*').order('departure_time', { ascending: true });

    if (isDriverMode) {
      query = query.eq('driver_id', session!.user.id);
    } else {
      query = query.eq('status', 'active').gt('seats_available', 0);
    }

    const { data, error } = await query;
    setLoading(false);

    if (!error && data) setRides(data as Ride[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [isDriverMode])
  );

  const handleRequestRide = (ride: Ride) => {
    setSelectedRide(ride);
    setModalVisible(true);
  };

  if (isDriverMode && showCreateForm) {
    return (
      <View style={{ flex: 1 }}>
        <Pressable style={styles.backBtn} onPress={() => setShowCreateForm(false)}>
          <Text style={styles.backText}>← Back to My Rides</Text>
        </Pressable>
        <CreateRideForm
          onRideCreated={() => {
            setShowCreateForm(false);
            fetchRides();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isDriverMode ? 'My Rides' : 'Available Rides'}</Text>
        {isDriverMode && (
          <Pressable style={styles.createBtn} onPress={() => setShowCreateForm(true)}>
            <Text style={styles.createBtnText}>+ New Ride</Text>
          </Pressable>
        )}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            !isDriverMode && !isDriver ? (
              <Pressable
                style={styles.driverBanner}
                onPress={() => router.push('/(tabs)/profiles/driverProfile')}
              >
                <Ionicons name="car-sport-outline" size={20} color={COLORS.primary} />
                <View style={styles.driverBannerText}>
                  <Text style={styles.driverBannerTitle}>Want to offer rides?</Text>
                  <Text style={styles.driverBannerDesc}>
                    Complete your driver profile to start posting rides
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </Pressable>
            ) : null
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <RideCard
              ride={item}
              actionLabel={isDriverMode ? undefined : 'Request Ride'}
              onAction={isDriverMode ? undefined : handleRequestRide}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {isDriverMode ? 'No rides posted yet.' : 'No rides available right now.'}
            </Text>
          }
        />
      )}

      <RequestRideModal
        ride={selectedRide}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onRequested={fetchRides}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  list: {
    padding: SPACING.md,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    fontSize: FONT_SIZES.md,
  },
  backBtn: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  driverBannerText: {
    flex: 1,
    gap: 2,
  },
  driverBannerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  driverBannerDesc: {
    fontSize: FONT_SIZES.sm - 1,
    color: COLORS.textSecondary,
  },
});
