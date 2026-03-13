import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { Ride } from "@/types/Profiles";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  ride: Ride;
  actionLabel?: string;
  onAction?: (ride: Ride) => void;
  disabled?: boolean;
}

const locationCache = new Map<string, string>();

const formatCoordinates = (lat: number, lng: number) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

const reverseGeocode = async (lat: number, lng: number) => {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

  if (locationCache.has(key)) {
    return locationCache.get(key)!;
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location name");
  }

  const data = await response.json();
  const label = data.display_name || formatCoordinates(lat, lng);

  locationCache.set(key, label);

  return label;
};

export default function RideCard({ ride, actionLabel, onAction, disabled }: Props) {
  const departure = new Date(ride.departure_time).toLocaleString();
  const [pickupLabel, setPickupLabel] = useState(() =>
    formatCoordinates(ride.pickup_lat, ride.pickup_lng)
  );
  const [destinationLabel, setDestinationLabel] = useState(() =>
    formatCoordinates(ride.destination_lat, ride.destination_lng)
  );

  useEffect(() => {
    let mounted = true;

    const loadLocationLabels = async () => {
      try {
        const [pickupName, destinationName] = await Promise.all([
          reverseGeocode(ride.pickup_lat, ride.pickup_lng),
          reverseGeocode(ride.destination_lat, ride.destination_lng),
        ]);

        if (!mounted) return;

        setPickupLabel(pickupName);
        setDestinationLabel(destinationName);
      } catch {
        if (!mounted) return;

        setPickupLabel(formatCoordinates(ride.pickup_lat, ride.pickup_lng));
        setDestinationLabel(formatCoordinates(ride.destination_lat, ride.destination_lng));
      }
    };

    loadLocationLabels();

    return () => {
      mounted = false;
    };
  }, [ride.destination_lat, ride.destination_lng, ride.pickup_lat, ride.pickup_lng]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Pickup</Text>
        <Text style={styles.value}>
          {pickupLabel}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Destination</Text>
        <Text style={styles.value}>
          {destinationLabel}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Departure</Text>
        <Text style={styles.value}>{departure}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Seats Left</Text>
        <Text style={styles.value}>{ride.seats_available}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.badge, styles[ride.status] ?? styles.active]}>{ride.status}</Text>
      </View>

      {actionLabel && onAction && (
        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => onAction(ride)}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
// will be refactored later
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 99,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    overflow: "hidden",
  },
  active: { backgroundColor: "#D1FAE5", color: "#065F46" },
  full: { backgroundColor: "#FEF3C7", color: "#92400E" },
  completed: { backgroundColor: "#E5E7EB", color: "#374151" },
  cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  button: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONT_SIZES.sm,
  },
});
