
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  name: string;
  role: "farmer" | "trader";
  phone?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('id, name, role, phone')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              // Cast the role to ensure it's a valid type
              const typedProfile: Profile = {
                id: data.id,
                name: data.name,
                role: data.role as "farmer" | "trader",
                phone: data.phone
              };
              setProfile(typedProfile);
            }
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, name, role, phone')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          // Cast the role to ensure it's a valid type
          const typedProfile: Profile = {
            id: data.id,
            name: data.name,
            role: data.role as "farmer" | "trader",
            phone: data.phone
          };
          setProfile(typedProfile);
        }
      }
      
      setIsLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
