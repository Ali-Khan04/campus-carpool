import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { RideRequestWithStudent } from '@/types/Profiles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  driverId: string | null;
  visible: boolean;
  onClose: () => void;
  onChanged: () => void; // to refresh data after accepting/declining requests
}

export default function PendingRequestsModal({ driverId, visible, onClose, onChanged }: Props) {
  const [requests, setRequests] = useState<RideRequestWithStudent[]>([]);
  const [loading, setLoading] = useState(false);
  // process id to preveny multiple requests at the same time
  const [processingId, setProcessingId] = useState<string | null>(null);
  // Fetches all pending ride requests for the current driver's rides,with student names
  const fetchRequests = async () => {
    if (!driverId) return;
    setLoading(true);

    const { data: ridesData, error: ridesError } = await supabase
      .from('rides')
      .select('id')
      .eq('driver_id', driverId);

    if (ridesError || !ridesData || ridesData.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const rideIds = ridesData.map((r) => r.id);
    const { data: requestData, error } = await supabase
      .from('ride_requests')
      .select('*')
      .in('ride_id', rideIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error || !requestData) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // fetch student names for requests
    const studentIds = requestData.map((r) => r.student_id);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds);

    // merge student name into requests
    const merged: RideRequestWithStudent[] = requestData.map((req) => ({
      ...req,
      student_name:
        profileData?.find((p) => p.id === req.student_id)?.full_name ?? 'Unknown Student',
    }));

    setRequests(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) fetchRequests();
  }, [visible, driverId]);

  // for accepting a ride request
  const handleAccept = async (req: RideRequestWithStudent) => {
    setProcessingId(req.id);

    const { error: reqError } = await supabase
      .from('ride_requests')
      .update({ status: 'accepted' })
      .eq('id', req.id);

    if (reqError) {
      Alert.alert('Error', reqError.message);
      setProcessingId(null);
      return;
    }
    const { data: rideData, error: rideError } = await supabase
      .from('rides')
      .select('seats_available')
      .eq('id', req.ride_id)
      .single();

    if (rideError || !rideData) {
      Alert.alert('Error', 'Could not fetch ride details.');
      setProcessingId(null);
      return;
    }

    const newSeats = rideData.seats_available - req.seats_requested;
    const { error: updateError } = await supabase
      .from('rides')
      .update({
        seats_available: Math.max(0, newSeats),
        status: newSeats <= 0 ? 'full' : 'active',
      })
      .eq('id', req.ride_id);

    if (updateError) {
      Alert.alert('Error', updateError.message);
      setProcessingId(null);
      return;
    }

    setProcessingId(null);
    onChanged();
    fetchRequests(); // refresh list
  };

  // for declined request
  const handleDecline = async (req: RideRequestWithStudent) => {
    setProcessingId(req.id);

    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id);

    if (error) {
      Alert.alert('Error', error.message);
      setProcessingId(null);
      return;
    }

    setProcessingId(null);
    onChanged();
    fetchRequests();
  };

  //render each pending request card with student info + accept/decline buttons
  const renderRequest = ({ item }: { item: RideRequestWithStudent }) => {
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
          <View style={styles.cardInfo}>
            <Text style={styles.studentName}>{item.student_name}</Text>
            <Text style={styles.cardDetail}>
              {item.seats_requested} seat{item.seats_requested > 1 ? 's' : ''} requested
            </Text>
          </View>
        </View>

        {item.meetup_label && (
          <View style={styles.meetupRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.meetupLabel} numberOfLines={1}>
              {item.meetup_label}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {/* Decline button */}
          <Pressable
            style={[styles.declineBtn, isProcessing && styles.btnDisabled]}
            onPress={() => handleDecline(item)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <>
                <Ionicons name="close" size={16} color="#DC2626" />
                <Text style={styles.declineBtnText}>Decline</Text>
              </>
            )}
          </Pressable>

          {/* Accept button */}
          <Pressable
            style={[styles.acceptBtn, isProcessing && styles.btnDisabled]}
            onPress={() => handleAccept(item)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Pending Requests</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
          ) : requests.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequest}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  list: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  meetupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  meetupLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  declineBtn: {
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
  declineBtnText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#16A34A',
  },
  acceptBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
