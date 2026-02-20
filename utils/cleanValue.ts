// Helper function to clean NULL bug from supabase
export const cleanValue = (value: string | null | undefined): string => {
  if (!value || value === "NULL" || value === "null") {
    return "";
  }
  return value;
};
