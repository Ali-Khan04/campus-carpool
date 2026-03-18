import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useProfile } from '@/hooks/ProfileContextHook';
import { supabase } from '@/lib/supabase';
import { Ride, RideRequest } from '@/types/Profiles';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { activeMode, session } = useProfile();
  const isDriverMode = activeMode === 'driver';
  const [items, setItems] = useState<(Ride | RideRequest)[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    if (isDriverMode) {
      // driver history
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', session!.user.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false });
      setItems((data as Ride[]) ?? []);
    } else {
      // student history
      const { data } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('student_id', session!.user.id)
        .in('status', ['cancelled', 'rejected'])
        .order('created_at', { ascending: false });
      setItems((data as RideRequest[]) ?? []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [isDriverMode])
  );

  //check if the item is a Ride or RideRequest by checking for driver_id field
  const isRide = (item: Ride | RideRequest): item is Ride => 'driver_id' in item;

  const renderItem = ({ item }: { item: Ride | RideRequest }) => {
    if (isRide(item)) {
      return <DriverHistoryCard ride={item} />;
    }
    return <StudentHistoryCard request={item} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No history yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function DriverHistoryCard({ ride }: { ride: Ride }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    completed: { bg: '#D1FAE5', text: '#065F46' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = statusColors[ride.status] ?? statusColors.cancelled;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="car-outline" size={20} color={COLORS.primary} />
        <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
          <Text style={[styles.statusText, { color: c.text }]}>{ride.status.toUpperCase()}</Text>
        </View>
      </View>
      <Row label="Pickup" value={ride.pickup_label ?? '—'} />
      <Row label="Destination" value={ride.destination_label ?? '—'} />
      <Row label="Departed" value={new Date(ride.departure_time).toLocaleString()} />
      <Row label="Date" value={new Date(ride.created_at!).toLocaleDateString()} />
    </View>
  );
}

function StudentHistoryCard({ request }: { request: RideRequest }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    rejected: { bg: '#FEF3C7', text: '#92400E' },
  };
  const c = statusColors[request.status] ?? statusColors.cancelled;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
          <Text style={[styles.statusText, { color: c.text }]}>{request.status.toUpperCase()}</Text>
        </View>
      </View>
      <Row label="Meetup" value={request.meetup_label ?? '—'} />
      <Row label="Seats" value={String(request.seats_requested)} />
      <Row label="Date" value={new Date(request.created_at!).toLocaleDateString()} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusText: {
    fontSize: FONT_SIZES.sm - 1,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  rowValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
});
