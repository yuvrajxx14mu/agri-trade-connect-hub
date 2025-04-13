import { Leaf, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Basic product listings",
        "Access to marketplace",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: "₹999/month",
      description: "Best for growing businesses",
      features: [
        "Unlimited product listings",
        "Priority marketplace placement",
        "Advanced analytics",
        "24/7 phone support",
        "Bulk listing tools",
        "Custom reporting",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large scale operations",
      features: [
        "All Pro features",
        "Dedicated account manager",
        "Custom integration",
        "API access",
        "Volume discounts",
        "Custom contract terms",
      ],
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Choose the plan that best fits your business needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-lg shadow-sm p-8 ${
                  plan.highlighted ? "ring-2 ring-primary" : ""
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">{plan.price}</div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted ? "bg-primary" : "bg-gray-900"
                  } hover:opacity-90`}
                  asChild
                >
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-gray-600 mb-6">
              Contact our sales team for a tailored package that meets your specific requirements
            </p>
            <Button variant="outline" asChild>
              <Link to="/static/contact">Contact Sales</Link>
            </Button>
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

export default Pricing; 