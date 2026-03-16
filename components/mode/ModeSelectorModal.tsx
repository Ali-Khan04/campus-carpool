import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { ActiveMode } from '@/context/ProfileContext';
import { useProfile } from '@/hooks/ProfileContextHook';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ModeSelectorModal() {
  const { showModeSelector, activeMode, isDriver, setActiveMode, dismissModeSelector } =
    useProfile();

  const handleSelect = async (mode: ActiveMode) => {
    await setActiveMode(mode);
  };

  return (
    <Modal visible={showModeSelector} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>How are you riding today?</Text>
          <Text style={styles.subtitle}>You can switch anytime from the home screen</Text>

          <Pressable
            style={[styles.card, activeMode === 'student' && styles.cardActive]}
            onPress={() => handleSelect('student')}
          >
            <Ionicons
              name="school-outline"
              size={32}
              color={activeMode === 'student' ? COLORS.white : COLORS.primary}
            />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, activeMode === 'student' && styles.cardTitleActive]}>
                Student
              </Text>
              <Text style={[styles.cardDesc, activeMode === 'student' && styles.cardDescActive]}>
                Browse and request rides
              </Text>
            </View>
            {activeMode === 'student' && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.card,
              activeMode === 'driver' && styles.cardActive,
              !isDriver && styles.cardDisabled,
            ]}
            onPress={() => isDriver && handleSelect('driver')}
            disabled={!isDriver}
          >
            <Ionicons
              name="car-sport-outline"
              size={32}
              color={
                !isDriver
                  ? COLORS.textSecondary
                  : activeMode === 'driver'
                    ? COLORS.white
                    : COLORS.primary
              }
            />
            <View style={styles.cardText}>
              <Text
                style={[
                  styles.cardTitle,
                  activeMode === 'driver' && styles.cardTitleActive,
                  !isDriver && styles.cardTitleDisabled,
                ]}
              >
                Driver
              </Text>
              <Text
                style={[
                  styles.cardDesc,
                  activeMode === 'driver' && styles.cardDescActive,
                  !isDriver && styles.cardDescDisabled,
                ]}
              >
                {isDriver ? 'Post and manage your rides' : 'Complete driver profile to unlock'}
              </Text>
            </View>
            {activeMode === 'driver' && isDriver && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            )}
            {!isDriver && (
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
            )}
          </Pressable>

          <Pressable style={styles.continueBtn} onPress={dismissModeSelector}>
            <Text style={styles.continueBtnText}>Continue as {activeMode}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  cardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardTitleActive: {
    color: COLORS.white,
  },
  cardTitleDisabled: {
    color: COLORS.textSecondary,
  },
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardDescActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  cardDescDisabled: {
    color: COLORS.textSecondary,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  continueBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
    textTransform: 'capitalize',
  },
});
