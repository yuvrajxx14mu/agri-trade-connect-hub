
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
  isLoading: boolean; // Add isLoading property
  updateProfile: (newProfileData: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a component that doesn't use useNavigate
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // User will be set by the onAuthStateChange listener
      const roleRedirect = data.user?.user_metadata?.role === 'farmer' 
        ? '/farmer-dashboard' 
        : '/trader-dashboard';
      
      navigate(roleRedirect);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: "farmer" | "trader", phone?: string) => {
    try {
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
      
      // User will be set by the onAuthStateChange listener
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // User will be cleared by the onAuthStateChange listener
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const updateProfile = (newProfileData: Partial<Profile>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      ...newProfileData
    });
  };

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
        isLoading: loading, // Set isLoading to match loading state
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a wrapper component that uses useNavigate
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // This is a wrapper to prevent the useNavigate call until we know we're in a Router context
  try {
    const navigate = useReactRouterNavigate();
    return <AuthProviderContent navigate={navigate}>{children}</AuthProviderContent>;
  } catch (error) {
    // If useNavigate fails, use a fallback that just logs the intent to navigate
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
