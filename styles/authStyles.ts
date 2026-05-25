import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingRight: 48,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  eyeIconText: {
    fontSize: 18,
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: SPACING.md,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthHints: {
    marginTop: 4,
  },
  strengthHintText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  backLink: {
    marginTop: SPACING.lg,
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
});
