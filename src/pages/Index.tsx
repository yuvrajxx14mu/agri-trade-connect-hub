import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthForm from "@/components/AuthForm";
import { Gavel, Sprout, TrendingUp, FileText, ShoppingCart, Truck, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-agri-primary p-1 rounded">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">AgriTradeConnect</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition">Benefits</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="min-h-[calc(100vh-80px)] flex items-center">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect, Trade, and Grow Together</h1>
              <p className="text-xl text-muted-foreground mb-6">
                A digital marketplace bringing farmers and traders together, eliminating the need for physical APMC visits.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-agri-primary" 
                  size="lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div>
              <AuthForm />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to connect, trade, and manage agricultural products efficiently.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <Gavel className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Online Auctions</h3>
                  <p className="text-muted-foreground">
                    Participate in live auctions for agricultural products, just like at the APMC yard but from anywhere.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <Sprout className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Product Listings</h3>
                  <p className="text-muted-foreground">
                    Create detailed listings for your agricultural products with specifications and pricing.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Reports & Analytics</h3>
                  <p className="text-muted-foreground">
                    Access detailed reports and analytics to track performance and make informed decisions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Role-Based Access</h3>
                  <p className="text-muted-foreground">
                    Custom dashboards and features tailored for farmers and traders based on their specific needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Order Management</h3>
                  <p className="text-muted-foreground">
                    Track and manage orders from placement to delivery with real-time updates.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Profile Management</h3>
                  <p className="text-muted-foreground">
                    Manage your profile, track your reputation, and build trust in the marketplace.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A simple process that connects farmers with traders for efficient agricultural commerce.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Register & List Products</h3>
                <p className="text-muted-foreground">
                  Farmers register and list their agricultural products with details and pricing.
                </p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Participate in Auctions</h3>
                <p className="text-muted-foreground">
                  Traders browse listings and participate in auctions to bid on products.
                </p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Complete Transactions</h3>
                <p className="text-muted-foreground">
                  Secure transactions are completed and logistics are arranged for delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Benefits</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Why farmers and traders choose AgriTradeConnect for their agricultural commerce needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4 flex items-center">
                    <div className="bg-agri-farmer text-white p-1 rounded mr-2">
                      <Sprout className="h-5 w-5" />
                    </div>
                    For Farmers
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-agri-farmer mr-2">✓</span>
                      <span>Access to a wider market of traders without physical travel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-farmer mr-2">✓</span>
                      <span>Better price discovery through competitive bidding</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-farmer mr-2">✓</span>
                      <span>Reduced costs and time spent in traditional markets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-farmer mr-2">✓</span>
                      <span>Detailed analytics to track sales and market trends</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-farmer mr-2">✓</span>
                      <span>Secure payment processing and order management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4 flex items-center">
                    <div className="bg-agri-trader text-white p-1 rounded mr-2">
                      <Truck className="h-5 w-5" />
                    </div>
                    For Traders
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-agri-trader mr-2">✓</span>
                      <span>Access to a diverse range of agricultural products</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-trader mr-2">✓</span>
                      <span>Transparent auction process with real-time bidding</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-trader mr-2">✓</span>
                      <span>Efficient sourcing without visiting multiple physical markets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-trader mr-2">✓</span>
                      <span>Detailed product information and quality specifications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-agri-trader mr-2">✓</span>
                      <span>Advanced reporting and inventory management tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-agri-primary p-1 rounded">
                <Gavel className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">AgriTradeConnect</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; 2025 AgriTradeConnect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
