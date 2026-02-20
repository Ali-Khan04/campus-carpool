import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "@/constants/theme";

export const driverProfileStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
