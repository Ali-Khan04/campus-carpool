import { createContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { DriverProfile, Profile } from "@/types/Profiles";

interface ProfileContextType {
  profile: Profile | null;
  driverProfile: DriverProfile | null;
  session: Session | null;
  loading: boolean;
  isDriver: boolean;
}
export const ProfileContext = createContext<ProfileContextType | null>(null);
