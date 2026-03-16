import { DriverProfile, Profile } from '@/types/Profiles';
import { Session } from '@supabase/supabase-js';
import { createContext } from 'react';
import { ProfileAction } from './ProfileProvider';

export type ActiveMode = 'student' | 'driver';

interface ProfileContextType {
  profile: Profile | null;
  driverProfile: DriverProfile | null;
  session: Session | null;
  loading: boolean;
  isDriver: boolean;
  activeMode: ActiveMode;
  showModeSelector: boolean;
  setActiveMode: (mode: ActiveMode) => Promise<void>;
  dismissModeSelector: () => void;
  dispatch: React.Dispatch<ProfileAction>;
}
export const ProfileContext = createContext<ProfileContextType | null>(null);
