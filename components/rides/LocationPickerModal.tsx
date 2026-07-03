import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
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

function formatLabel(item: { display_name: string; address?: any }): string {
  const a = item.address;
  if (!a) return item.display_name.split(',')[0];

  return (
    a.amenity ||
    a.shop ||
    a.building ||
    (a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road) ||
    a.neighbourhood ||
    a.suburb ||
    a.road ||
    item.display_name.split(',')[0]
  );
}
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let shift = 0,
      result = 0,
      byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
export default function LocationPickerModal({ visible, onClose, onConfirm, mode = 'full' }: Props) {
  const [activePin, setActivePin] = useState<ActivePin>('pickup');
  const [pickup, setPickup] = useState<PickedLocation | null>(null);
  const [destination, setDestination] = useState<PickedLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(
    null
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mapRef = useRef<any>(null);
  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    if (mode !== 'full' || !pickup || !destination) {
      setRouteCoords([]);
      setRouteInfo(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords = decodePolyline(data.routes[0].geometry);
          setRouteCoords(coords);
          setRouteInfo({
            distanceKm: data.routes[0].distance / 1000,
            durationMin: data.routes[0].duration / 60,
          });

          // Zoom out to fit the entire route with padding to show both markers and route clearly
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 80, right: 60, bottom: 250, left: 60 },
              animated: true,
            });
          }, 300);
        }
      } catch (e) {
        console.error('Route fetch error:', e);
        setRouteCoords([]);
        setRouteInfo(null);
      }
    };

    fetchRoute();
  }, [pickup, destination, mode]);
  const searchLocation = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=5&countrycodes=pk&addressdetails=1&accept-language=en`,
          {
            headers: { 'User-Agent': 'CampusCarpool/1.0' },
            signal: controller.signal,
          }
        );
        const contentType = res.headers.get('content-type') ?? '';
        if (!res.ok || !contentType.includes('application/json')) {
          console.warn('Nominatim returned non-JSON response, status:', res.status);
          setSearchResults([]);
          return;
        }
        const data = await res.json();
        setSearchResults(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Search error:', e);
          setSearchResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result: SearchResult) => {
    const loc: PickedLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      label: formatLabel(result),
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
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`,
      { headers: { 'User-Agent': 'CampusCarpool/1.0' } }
    )
      .then((r) => r.json())
      .then((data) => {
        const label = data.display_name
          ? formatLabel(data)
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
  const handleLiveLocation = async (coords: { latitude: number; longitude: number }) => {
    if (mode !== 'full' || pickup || hasPrefilledRef.current) return;
    hasPrefilledRef.current = true; // only ever prefill once per modal session

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'CampusCarpool/1.0' } }
      );
      const data = await res.json();
      const label = data.display_name ? formatLabel(data) : 'Current Location';

      setPickup({ lat: coords.latitude, lng: coords.longitude, label });
      setActivePin('destination');
    } catch (e) {
      console.error('Prefill location error:', e);
    }
  };
  const handleClose = () => {
    setPickup(null);
    setDestination(null);
    setSearchQuery('');
    setSearchResults([]);
    setActivePin('pickup');
    hasPrefilledRef.current = false;
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
            ref={mapRef}
            onPress={handleMapPress}
            routeCoordinates={routeCoords}
            onLocationUpdate={handleLiveLocation}
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
