import SwitchModeButton from '@/components/mode/SwitchModeButton';
import PendingRequestsModal from '@/components/rides/PendingRequestsModal';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { supabase } from '@/lib/supabase';
import { Ride, RideRequest } from '@/types/Profiles';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetch = async () => {
    setLoading(true);

    const { data: rideData } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', userId)
      .eq('status', 'active')
      .order('departure_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    setActiveRide(rideData ?? null);

    // count pending requests across ALL of driver's rides, not just active one
    // so the count is accurate even if activeRide is null
    // because pending requests can exist for future rides that haven't gone active yet
    const { data: allRides } = await supabase.from('rides').select('id').eq('driver_id', userId);

    if (allRides && allRides.length > 0) {
      const rideIds = allRides.map((r) => r.id);
      const { count } = await supabase
        .from('ride_requests')
        .select('id', { count: 'exact', head: true })
        .in('ride_id', rideIds)
        .eq('status', 'pending');
      setPendingCount(count ?? 0);
    } else {
      setPendingCount(0);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  // subscribe to changes in ride_requests for this driver's active ride to keep pending count updated in real-time
  useEffect(() => {
    if (!activeRide) return;

    const channel = supabase
      .channel(`driver-requests-${activeRide.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `ride_id=eq.${activeRide.id}`,
        },
        () => {
          // re-fetch counts whenever any request changes for this ride
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRide?.id]);
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`driver-all-requests-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_requests',
        },
        () => {
          // re-fetch everything when any new request is inserted
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // cancel ride
  const handleCancelRide = () => {
    if (!activeRide) return;
    Alert.alert(
      'Cancel Ride',
      'This will cancel your ride and reject all pending requests. Are you sure?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            await supabase
              .from('ride_requests')
              .update({ status: 'rejected' })
              .eq('ride_id', activeRide.id)
              .eq('status', 'pending');

            await supabase.from('rides').update({ status: 'cancelled' }).eq('id', activeRide.id);

            setCancelling(false);
            fetch();
          },
        },
      ]
    );
  };

  //complete ride
  const handleCompleteRide = () => {
    if (!activeRide) return;
    Alert.alert('Complete Ride', 'Mark this ride as completed?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setCancelling(true);
          await supabase.from('rides').update({ status: 'completed' }).eq('id', activeRide.id);
          // when ride is completed, all accepted requests should be marked as completed too not cancelled
          await supabase
            .from('ride_requests')
            .update({ status: 'cancelled' })
            .eq('ride_id', activeRide.id)
            .eq('status', 'accepted');

          setCancelling(false);
          fetch();
        },
      },
    ]);
  };

  if (loading)
    return <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />;

  return (
    <View style={styles.dashContainer}>
      <Pressable style={styles.statCard} onPress={() => setModalVisible(true)}>
        <Ionicons name="people-outline" size={28} color={COLORS.primary} />
        <Text style={styles.statNumber}>{pendingCount}</Text>
        <Text style={styles.statLabel}>Pending Requests</Text>
        <Text style={styles.statHint}>Tap to review</Text>
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
          {/* Cancell and Complete Button  */}
          <View style={styles.rideActions}>
            <Pressable
              style={[styles.completeBtn, cancelling && styles.btnDisabled]}
              onPress={handleCompleteRide}
              disabled={cancelling}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
              <Text style={styles.completeBtnText}>Complete</Text>
            </Pressable>
            <Pressable
              style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
              onPress={handleCancelRide}
              disabled={cancelling}
            >
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.cancelBtnText}>Cancel Ride</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active ride posted.</Text>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/rides')}>
            <Text style={styles.actionBtnText}>Post a Ride →</Text>
          </Pressable>
        </View>
      )}
      <PendingRequestsModal
        driverId={userId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onChanged={() => {
          // refresh dashboard counts after driver accepts/declines
          fetch();
        }}
      />
    </View>
  );
}

//Student Dashboard

function StudentDashboard({ userId }: { userId: string }) {
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
    } else {
      setRide(null);
    }

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  useEffect(() => {
    if (!activeRequest) return;

    const channel = supabase
      .channel(`student-request-${activeRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests',
          filter: `id=eq.${activeRequest.id}`,
        },
        (payload) => {
          // update request status from realtime payload directly
          setActiveRequest((prev) => (prev ? { ...prev, ...payload.new } : prev));
          // if request just got accepted or rejected, do a full re-fetch
          if (payload.new.status === 'accepted' || payload.new.status === 'rejected') {
            fetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequest?.id]);

  // student cancels their own pending request
  const handleCancelRequest = () => {
    if (!activeRequest) return;
    Alert.alert('Cancel Request', 'Are you sure you want to cancel your ride request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          const { error } = await supabase
            .from('ride_requests')
            .update({ status: 'cancelled' })
            .eq('id', activeRequest.id);
          console.log('cancel error:', error);
          console.log('cancel done, fetching...');
          setCancelling(false);
          fetch();
        },
      },
    ]);
  };

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
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/map',
                  params: { driverId: ride.driver_id },
                })
              }
            >
              <Text style={styles.actionBtnText}>Track Driver on Map →</Text>
            </Pressable>
          )}
          {/*cancel button */}
          {activeRequest.status === 'pending' && (
            <Pressable
              style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
              onPress={handleCancelRequest}
              disabled={cancelling}
            >
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
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
  statHint: {
    fontSize: FONT_SIZES.sm - 1,
    color: COLORS.primary,
    fontWeight: '500',
  },
  rideActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  completeBtnText: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
