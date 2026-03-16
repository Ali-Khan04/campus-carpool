import SwitchModeButton from '@/components/mode/SwitchModeButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { supabase } from '@/lib/supabase';
import { Ride, RideRequest } from '@/types/Profiles';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { profile, activeMode, session } = useProfile();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {`Hey, ${profile?.full_name?.split(' ')[0] ?? 'there'} 👋`}
          </Text>
          <Text style={styles.subGreeting}>
            {activeMode === 'driver' ? 'Ready to give a ride?' : 'Need a ride today?'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <SwitchModeButton />
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.textSecondary} />
          </Pressable>
        </View>
      </View>

      {session?.user?.id &&
        (activeMode === 'driver' ? (
          <DriverDashboard userId={session.user.id} />
        ) : (
          <StudentDashboard userId={session.user.id} />
        ))}
    </ScrollView>
  );
}

//Driver Dashboard

function DriverDashboard({ userId }: { userId: string }) {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);

    // Get active ride
    const { data: rideData } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', userId)
      .eq('status', 'active')
      .order('departure_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    setActiveRide(rideData ?? null);

    // Count pending requests
    if (rideData) {
      const { count } = await supabase
        .from('ride_requests')
        .select('id', { count: 'exact', head: true })
        .eq('ride_id', rideData.id)
        .eq('status', 'pending');

      setPendingCount(count ?? 0);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  if (loading)
    return <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />;

  return (
    <View style={styles.dashContainer}>
      <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/rides')}>
        <Ionicons name="people-outline" size={28} color={COLORS.primary} />
        <Text style={styles.statNumber}>{pendingCount}</Text>
        <Text style={styles.statLabel}>Pending Requests</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Your Next Ride</Text>
      {activeRide ? (
        <View style={styles.rideCard}>
          <Row label="Departure" value={new Date(activeRide.departure_time).toLocaleString()} />
          <Row label="Seats left" value={String(activeRide.seats_available)} />
          <Row label="Status" value={activeRide.status} />
          <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/rides')}>
            <Text style={styles.actionBtnText}>Manage Ride →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active ride posted.</Text>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/rides')}>
            <Text style={styles.actionBtnText}>Post a Ride →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

//Student Dashboard

function StudentDashboard({ userId }: { userId: string }) {
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);

    const { data: reqData } = await supabase
      .from('ride_requests')
      .select('*')
      .eq('student_id', userId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveRequest(reqData ?? null);

    if (reqData) {
      const { data: rideData } = await supabase
        .from('rides')
        .select('*')
        .eq('id', reqData.ride_id)
        .maybeSingle();
      setRide(rideData ?? null);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  if (loading)
    return <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />;

  return (
    <View style={styles.dashContainer}>
      <Text style={styles.sectionTitle}>Your Active Request</Text>

      {activeRequest && ride ? (
        <View style={styles.rideCard}>
          <StatusBadge status={activeRequest.status} />
          <Row label="Departure" value={new Date(ride.departure_time).toLocaleString()} />
          <Row label="Seats requested" value={String(activeRequest.seats_requested)} />
          {activeRequest.status === 'accepted' && (
            <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/map')}>
              <Text style={styles.actionBtnText}>Track Driver on Map →</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active ride request.</Text>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/rides')}>
            <Text style={styles.actionBtnText}>Browse Rides →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E' },
    accepted: { bg: '#D1FAE5', text: '#065F46' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoutBtn: { padding: SPACING.xs },
  dashContainer: { gap: SPACING.md },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '500' },
  actionBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { color: COLORS.white, fontWeight: '600', fontSize: FONT_SIZES.sm },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
