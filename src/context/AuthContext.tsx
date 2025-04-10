import React, { createContext, useState, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate as useReactRouterNavigate } from "react-router-dom";

interface Profile {
  id: string;
  name: string;
  role: "farmer" | "trader";
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  bio?: string;
  [key: string]: any;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "farmer" | "trader", phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  updateProfile: (newProfileData: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderContent = ({ 
  children, 
  navigate 
}: { 
  children: React.ReactNode; 
  navigate: (path: string) => void;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    console.log("Fetching profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log("Profile fetched successfully:", data);
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
    console.log("Auth state changed:", event, "Session:", currentSession?.user?.email);
    
    try {
      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        setUser(currentSession.user);
        
        const profileData = await fetchProfile(currentSession.user.id);
        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error("Error in handleAuthStateChange:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      console.log("Initializing auth...");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (mounted) {
          if (initialSession?.user) {
            console.log("Initial session found:", initialSession.user.email);
            const profileData = await fetchProfile(initialSession.user.id);
            
            setSession(initialSession);
            setUser(initialSession.user);
            
            if (profileData) {
              setProfile(profileData);
            } else {
              const basicProfile = {
                id: initialSession.user.id,
                name: initialSession.user.user_metadata?.name || "User",
                role: initialSession.user.user_metadata?.role || "trader",
                email: initialSession.user.email,
              };
              
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([basicProfile]);
                
              if (!profileError) {
                setProfile(basicProfile as Profile);
              }
            }
          }
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Initialize auth first
    initializeAuth();

    // Set up auth state listener after initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change event:", event);
      if (mounted && initialized) {
        await handleAuthStateChange(event, currentSession);
      }
    });

    return () => {
      console.log("Cleaning up auth effect");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Auth state change listener will handle session update
      const roleRedirect = data.user?.user_metadata?.role === 'farmer' 
        ? '/farmer-dashboard' 
        : '/trader-dashboard';
      
      navigate(roleRedirect);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: "farmer" | "trader", phone?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone,
          },
        },
      });

      if (error) throw error;
      
      // Auth state change listener will handle session update
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = (newProfileData: Partial<Profile>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      ...newProfileData
    });
  };

  // Show loading spinner while initializing
  if (!initialized) {
    console.log("Waiting for auth initialization...");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3">Initializing...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        signIn,
        signUp,
        signOut,
        loading,
        isLoading: loading,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  try {
    const navigate = useReactRouterNavigate();
    return <AuthProviderContent navigate={navigate}>{children}</AuthProviderContent>;
  } catch (error) {
    console.warn("Router not available, navigation will be logged but not performed");
    const fallbackNavigate = (path: string) => console.log(`Navigation intended to: ${path}`);
    return <AuthProviderContent navigate={fallbackNavigate}>{children}</AuthProviderContent>;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
