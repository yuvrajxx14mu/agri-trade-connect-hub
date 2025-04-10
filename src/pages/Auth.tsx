
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Don't redirect immediately to give auth context time to initialize
    const checkAuth = async () => {
      try {
        // Don't redirect if we're still loading
        if (loading) return;

        if (user) {
          // User is authenticated, redirect based on role
          const redirectPath = profile?.role === 'farmer' ? '/farmer-dashboard' : '/trader-dashboard';
          navigate(redirectPath);
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user, profile, navigate, loading]);

  // Show loading spinner while checking auth
  if (loading || checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
