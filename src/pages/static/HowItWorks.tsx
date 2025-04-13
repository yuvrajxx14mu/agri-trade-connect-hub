import { Leaf, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      title: "Create an Account",
      description: "Sign up as either a farmer or trader and complete your profile verification.",
    },
    {
      title: "List or Browse Products",
      description: "Farmers can list their products, while traders can browse available listings.",
    },
    {
      title: "Participate in Auctions",
      description: "Engage in transparent bidding processes for agricultural products.",
    },
    {
      title: "Secure Transactions",
      description: "Complete secure transactions through our platform's payment system.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">AgriTradeConnect</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">How It Works</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Learn how AgriTradeConnect revolutionizes agricultural trade in four simple steps
          </p>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/auth?tab=signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          © 2024 AgriTradeConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks; 