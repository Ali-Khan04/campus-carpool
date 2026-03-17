import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BaseMap from '../map/BaseMap';

export interface PickedLocation {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  // mode='full' (default): pickup + destination, used by CreateRideForm
  // mode='single': single pin only (meetup), used by RequestRideModal
  mode?: 'single' | 'full';
  onConfirm: (pickup: PickedLocation, destination: PickedLocation) => void;
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

type ActivePin = 'pickup' | 'destination';

export default function LocationPickerModal({ visible, onClose, onConfirm, mode = 'full' }: Props) {
  const [activePin, setActivePin] = useState<ActivePin>('pickup');
  const [pickup, setPickup] = useState<PickedLocation | null>(null);
  const [destination, setDestination] = useState<PickedLocation | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pk`,
        { headers: { 'User-Agent': 'CampusCarpool/1.0' } }
      );
      // Fix Nominatim sometimes returns "Unexpected character: <" JSON parse crash
      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok || !contentType.includes('application/json')) {
        console.warn('Nominatim returned non-JSON response, status:', res.status);
        setSearchResults([]);
        return;
      }
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const loc: PickedLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      label: result.display_name.split(',').slice(0, 2).join(','),
    };

    if (activePin === 'pickup') {
      setPickup(loc);
    } else {
      setDestination(loc);
    }

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    // Reverse geocode using Nominatim api
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { 'User-Agent': 'CampusCarpool/1.0' } }
    )
      .then((r) => r.json())
      .then((data) => {
        const label = data.display_name
          ? data.display_name.split(',').slice(0, 2).join(',')
          : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        const loc: PickedLocation = { lat: latitude, lng: longitude, label };

        if (activePin === 'pickup') {
          setPickup(loc);
          // Auto switch to destination after pickup is set — only in full mode
          if (mode === 'full' && !destination) setActivePin('destination');
        } else {
          setDestination(loc);
        }
      })
      .catch(() => {
        const loc: PickedLocation = {
          lat: latitude,
          lng: longitude,
          label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        };
        if (activePin === 'pickup') {
          setPickup(loc);
          // Auto switch to destination after pickup is set — only in full mode
          if (mode === 'full' && !destination) setActivePin('destination');
        } else {
          setDestination(loc);
        }
      });
  };

  const handleConfirm = () => {
    // In single mode only pickup is required
    // In full mode both pickup and destination are required
    if (mode === 'single') {
      if (!pickup) return;
      onConfirm(pickup, pickup); // destination unused in single mode, pass pickup as placeholder
    } else {
      if (!pickup || !destination) return;
      onConfirm(pickup, destination);
    }
    onClose();
  };

  const handleClose = () => {
    setPickup(null);
    setDestination(null);
    setSearchQuery('');
    setSearchResults([]);
    setActivePin('pickup');
    onClose();
  };

  // Confirm button disabled logic differs per mode
  const confirmDisabled = mode === 'single' ? !pickup : !pickup || !destination;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>
              {/* Title reflects what is being picked */}
              {mode === 'single' ? 'Set Meetup Point' : 'Set Locations'}
            </Text>
            <Pressable
              style={[styles.confirmBtn, confirmDisabled && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={confirmDisabled}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          </View>

          {/* Pin toggle hidden in single mode, only one pin needed */}
          {mode === 'full' && (
            <View style={styles.pinToggle}>
              <Pressable
                style={[styles.pinBtn, activePin === 'pickup' && styles.pinBtnActive]}
                onPress={() => setActivePin('pickup')}
              >
                <Ionicons
                  name="radio-button-on"
                  size={16}
                  color={activePin === 'pickup' ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[styles.pinBtnText, activePin === 'pickup' && styles.pinBtnTextActive]}
                >
                  {pickup ? pickup.label : 'Set Pickup'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.pinBtn, activePin === 'destination' && styles.pinBtnDestActive]}
                onPress={() => setActivePin('destination')}
              >
                <Ionicons
                  name="location"
                  size={16}
                  color={activePin === 'destination' ? COLORS.white : '#EF4444'}
                />
                <Text
                  style={[
                    styles.pinBtnText,
                    activePin === 'destination' && styles.pinBtnTextActive,
                  ]}
                >
                  {destination ? destination.label : 'Set Destination'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={
                mode === 'single'
                  ? 'Search meetup point...'
                  : `Search ${activePin === 'pickup' ? 'pickup' : 'destination'}...`
              }
              value={searchQuery}
              onChangeText={(t) => {
                setSearchQuery(t);
                searchLocation(t);
              }}
              placeholderTextColor={COLORS.textSecondary}
            />
            {searching && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable style={styles.resultItem} onPress={() => handleSelectResult(item)}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.resultText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          <BaseMap
            onPress={handleMapPress}
            extraMarkers={[
              ...(pickup
                ? [
                    {
                      coordinate: { latitude: pickup.lat, longitude: pickup.lng },
                      // Label differs per mode
                      title: mode === 'single' ? 'Meetup' : 'Pickup',
                      description: pickup.label,
                      pinColor: COLORS.primary,
                    },
                  ]
                : []),
              // Destination marker only shown in full mode
              ...(mode === 'full' && destination
                ? [
                    {
                      coordinate: { latitude: destination.lat, longitude: destination.lng },
                      title: 'Destination',
                      description: destination.label,
                      pinColor: '#EF4444',
                    },
                  ]
                : []),
            ]}
          />

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.hintText}>
              Tap on map or search to place{' '}
              <Text style={{ fontWeight: '700' }}>
                {mode === 'single'
                  ? 'meetup point (blue)'
                  : activePin === 'pickup'
                    ? 'pickup (blue)'
                    : 'destination (red)'}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
// will be refactored later
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: { padding: SPACING.xs },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  confirmDisabled: { backgroundColor: COLORS.border },
  confirmText: { color: COLORS.white, fontWeight: '600', fontSize: FONT_SIZES.sm },
  pinToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  pinBtnActive: { backgroundColor: COLORS.primary },
  pinBtnDestActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  pinBtnText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
    numberOfLines: 1,
  } as any,
  pinBtnTextActive: { color: COLORS.white },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
  },
  searchIcon: { marginRight: SPACING.xs },
  searchInput: {
    flex: 1,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  resultsContainer: {
    position: 'absolute',
    top: 185,
    left: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 999,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  map: { flex: 1 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
