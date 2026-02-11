import { useReducer, useEffect, ReactNode } from "react";
import { ProfileContext } from "./ProfileContext";
import { Session } from "@supabase/supabase-js";
import { DriverProfile, Profile } from "@/types/Profiles";
import { supabase } from "@/lib/supabase";

interface ProfileState {
  profile: Profile | null;
  driverProfile: DriverProfile | null;
  session: Session | null;
  loading: boolean;
}

export type ProfileAction =
  | { type: "SET_PROFILE"; payload: Profile | null }
  | { type: "SET_DRIVER_PROFILE"; payload: DriverProfile | null }
  | { type: "SET_SESSION"; payload: Session | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" }
  | { type: "UPDATE_PROFILE"; payload: Partial<Profile> }
  | { type: "UPDATE_DRIVER_PROFILE"; payload: Partial<DriverProfile> };

const initialState: ProfileState = {
  profile: null,
  driverProfile: null,
  session: null,
  loading: true,
};

function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "SET_DRIVER_PROFILE":
      return { ...state, driverProfile: action.payload };
    case "SET_SESSION":
      return { ...state, session: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return { ...initialState, loading: false };
    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, ...action.payload }
          : state.profile,
      };
    case "UPDATE_DRIVER_PROFILE":
      return {
        ...state,
        driverProfile: state.driverProfile
          ? { ...state.driverProfile, ...action.payload }
          : state.driverProfile,
      };

    default:
      return state;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  const fetchProfile = async (userId: string) => {
    console.log("Fetching profile for userId:", userId);

    try {
      // Fetch base profile table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) {
        console.error("Profile error:", profileError);
        dispatch({ type: "SET_PROFILE", payload: null });
      } else {
        console.log("Setting profile:", profileData);
        dispatch({ type: "SET_PROFILE", payload: profileData });
      }
      // Fetch driver profile
      const { data: driverData, error: driverError } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (driverError) {
        console.error("Driver profile error:", driverError);
        dispatch({ type: "SET_DRIVER_PROFILE", payload: null });
      } else {
        console.log("Setting driver profile:", driverData);
        dispatch({ type: "SET_DRIVER_PROFILE", payload: driverData });
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      dispatch({ type: "SET_PROFILE", payload: null });
      dispatch({ type: "SET_DRIVER_PROFILE", payload: null });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    // profile fetched
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: "SET_SESSION", payload: session });

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    });

    // listen for auth changes to update profile
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      dispatch({ type: "SET_SESSION", payload: session });

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        dispatch({ type: "RESET" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile: state.profile,
        driverProfile: state.driverProfile,
        session: state.session,
        loading: state.loading,
        isDriver: !!state.driverProfile,
        dispatch,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
