import { createContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { DriverProfile, Profile } from "@/types/Profiles";
import { ProfileAction } from "./ProfileProvider";

interface ProfileContextType {
  profile: Profile | null;
  driverProfile: DriverProfile | null;
  session: Session | null;
  loading: boolean;
  isDriver: boolean;
  dispatch: React.Dispatch<ProfileAction>;
}
export const ProfileContext = createContext<ProfileContextType | null>(null);
