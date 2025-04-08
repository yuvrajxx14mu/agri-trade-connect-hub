
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && profile) {
      const redirectPath = profile.role === "farmer" ? "/farmer-dashboard" : "/trader-dashboard";
      navigate(redirectPath);
    }
  }, [user, profile, isLoading, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 border-b">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <span className="font-bold text-lg">AgriTradeConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 grid place-items-center px-6 py-12">
        <div className="container flex flex-col items-center text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Connecting Farmers and Traders
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
            A digital marketplace for agricultural products. Empowering farmers with direct access to markets and providing traders with quality produce.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link to="/auth?role=farmer">Join as Farmer</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?role=trader">Join as Trader</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 AgriTradeConnect. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
