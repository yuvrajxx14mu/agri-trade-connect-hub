import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { CheckCircle2, Leaf, Truck, Users, BarChart2, Star } from "lucide-react";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (!loading && user && profile) {
      const redirectPath = profile.role === "farmer" ? "/farmer-dashboard" : "/trader-dashboard";
      navigate(redirectPath);
    }
  }, [user, profile, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b sm:px-6 sticky top-0 bg-white z-50">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg">AgriTradeConnect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="sm" className="sm:text-base px-4 py-2 h-auto" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="sm:text-base px-4 py-2 h-auto bg-green-600 hover:bg-green-700 text-white" asChild>
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-50 to-emerald-50 py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                Connecting Farmers and Traders
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                A digital marketplace revolutionizing agricultural trade. Empowering farmers with direct market access and providing traders with quality produce.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/auth?tab=signup&role=farmer">Join as Farmer</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to="/auth?tab=signup&role=trader">Join as Trader</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="/images/farmer-market.jpg" 
                alt="Farmer and Trader Connection"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AgriTradeConnect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
              <Truck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Direct Market Access</h3>
              <p className="text-gray-600">Farmers can directly connect with traders, eliminating middlemen and maximizing profits.</p>
            </div>
            <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Community</h3>
              <p className="text-gray-600">Join a trusted network of verified farmers and traders for secure transactions.</p>
            </div>
            <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
              <BarChart2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Market Insights</h3>
              <p className="text-gray-600">Access real-time market prices and trends to make informed decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-gray-600">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-gray-600">Verified Traders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">₹50M+</div>
              <div className="text-gray-600">Monthly Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg border bg-gray-50">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 mb-4">"AgriTradeConnect has transformed my farming business. I now get better prices and have direct access to reliable traders."</p>
              <div className="font-semibold">- Rajesh Kumar, Farmer</div>
            </div>
            <div className="p-6 rounded-lg border bg-gray-50">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 mb-4">"As a trader, I've found consistent quality produce and built strong relationships with farmers through this platform."</p>
              <div className="font-semibold">- Priya Sharma, Trader</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Agricultural Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of farmers and traders who are already benefiting from our platform.</p>
          <Button size="lg" variant="secondary" className="text-primary" asChild>
            <Link to="/auth?tab=signup">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-gray-50">
        <div className="container px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              <p className="text-sm text-gray-600">AgriTradeConnect is dedicated to revolutionizing agricultural trade through technology and innovation.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/how-it-works" className="text-sm text-gray-600 hover:underline">How It Works</Link></li>
                <li><Link to="/pricing" className="text-sm text-gray-600 hover:underline">Pricing</Link></li>
                <li><Link to="/blog" className="text-sm text-gray-600 hover:underline">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-sm text-gray-600 hover:underline">Help Center</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-600 hover:underline">Contact Us</Link></li>
                <li><Link to="/help" className="text-sm text-gray-600 hover:underline">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-sm text-gray-600 hover:underline">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-600 hover:underline">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="text-sm text-gray-600 hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            © 2024 AgriTradeConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
