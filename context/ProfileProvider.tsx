import { useReducer, useEffect, ReactNode } from "react";
import { ProfileContext } from "./ProfileContext";
import { Session } from "@supabase/supabase-js";
import { DriverProfile, Profile } from "@/types/Profiles";
import { supabase } from "@/lib/supabase";

interface AuthState {
  profile: Profile | null;
  driverProfile: DriverProfile | null;
  session: Session | null;
  loading: boolean;
}

type AuthAction =
  | { type: "SET_PROFILE"; payload: Profile | null }
  | { type: "SET_DRIVER_PROFILE"; payload: DriverProfile | null }
  | { type: "SET_SESSION"; payload: Session | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: AuthState = {
  profile: null,
  driverProfile: null,
  session: null,
  loading: true,
};

function profileReducer(state: AuthState, action: AuthAction): AuthState {
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

      console.log("Profile data:", profileData);
      console.log("Profile error:", profileError);

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

      console.log("Driver data:", driverData);
      console.log("Driver error:", driverError);

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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
