import { Leaf, Search, ChevronDown, ChevronUp, MessageCircle, FileText, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const HelpCenter = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const faqs = {
    "Getting Started": [
      {
        question: "How do I create an account?",
        answer:
          "Click on the 'Get Started' button, choose your role (Farmer or Trader), and fill in the required information. Verify your email to complete registration.",
      },
      {
        question: "What documents do I need for verification?",
        answer:
          "You'll need a valid government ID, proof of address, and relevant business documentation (for traders).",
      },
      {
        question: "How long does verification take?",
        answer:
          "Verification typically takes 1-2 business days. We'll notify you via email once completed.",
      },
    ],
    "Trading & Transactions": [
      {
        question: "How do I list a product?",
        answer:
          "Go to your dashboard, click 'Add Product', fill in the product details, add photos, and set your price or auction details.",
      },
      {
        question: "How does the bidding process work?",
        answer:
          "Traders can place bids on listed items. The highest bid wins when the auction ends. All bids are binding.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept bank transfers, UPI, and other major payment methods. All transactions are secured through our platform.",
      },
    ],
    "Account & Security": [
      {
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
      },
      {
        question: "How can I update my profile?",
        answer:
          "Go to Settings in your dashboard to update your profile information, contact details, and preferences.",
      },
      {
        question: "Is my information secure?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your data and transactions.",
      },
    ],
  };

  const supportResources = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat Support",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      link: "#",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentation",
      description: "Detailed guides and tutorials",
      action: "View Docs",
      link: "#",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Talk to our support team",
      action: "Call Now",
      link: "#",
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
          <h1 className="text-4xl font-bold text-center mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 text-center mb-8">
            How can we help you today?
          </p>

          {/* Search Bar */}
          <div className="relative mb-12">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-4 py-3 pl-12 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          {/* Support Resources */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {supportResources.map((resource) => (
              <div
                key={resource.title}
                className="bg-white p-6 rounded-lg shadow-sm text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Button variant="outline" asChild>
                  <Link to={resource.link}>{resource.action}</Link>
                </Button>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            {Object.entries(faqs).map(([category, questions]) => (
              <div key={category} className="mb-6">
                <button
                  className="flex items-center justify-between w-full text-left font-semibold text-lg py-2"
                  onClick={() => setOpenSection(openSection === category ? null : category)}
                >
                  {category}
                  {openSection === category ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {openSection === category && (
                  <div className="mt-4 space-y-4">
                    {questions.map((faq) => (
                      <div key={faq.question} className="pl-4">
                        <h3 className="font-medium mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-b my-4" />
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is available 24/7 to assist you
            </p>
            <Button asChild>
              <Link to="/static/contact">Contact Support</Link>
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

export default HelpCenter; 