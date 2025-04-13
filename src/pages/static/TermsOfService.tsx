import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using AgriTradeConnect, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
    },
    {
      title: "2. User Registration",
      content:
        "Users must provide accurate, current, and complete information during registration. Users are responsible for maintaining the confidentiality of their account credentials.",
    },
    {
      title: "3. Platform Rules",
      content:
        "Users must follow all platform guidelines, including but not limited to: honest representation of products, fair pricing practices, and respectful communication with other users.",
    },
    {
      title: "4. Transaction Guidelines",
      content:
        "All transactions must be conducted through the platform's official payment system. Direct dealings outside the platform are prohibited and may result in account suspension.",
    },
    {
      title: "5. User Responsibilities",
      content:
        "Users are responsible for ensuring their listings comply with all applicable laws and regulations. Prohibited items must not be listed on the platform.",
    },
    {
      title: "6. Platform Fees",
      content:
        "Users agree to pay all applicable platform fees as outlined in the pricing section. Fees may be updated with prior notice to users.",
    },
    {
      title: "7. Dispute Resolution",
      content:
        "Any disputes between users should first be addressed through the platform's dispute resolution system before seeking external remedies.",
    },
    {
      title: "8. Termination",
      content:
        "AgriTradeConnect reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities.",
    },
    {
      title: "9. Privacy",
      content:
        "User privacy is governed by our Privacy Policy. By using the platform, users agree to the collection and use of information as detailed in the Privacy Policy.",
    },
    {
      title: "10. Modifications",
      content:
        "These terms may be modified at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of modified terms.",
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Terms of Service</h1>
          <p className="text-gray-600 text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="mb-8">
                Welcome to AgriTradeConnect. These Terms of Service govern your use of our platform
                and services. Please read these terms carefully before using our platform.
              </p>

              {sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-gray-600">{section.content}</p>
                </div>
              ))}

              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@agritradeconnect.com" className="text-primary hover:underline">
                    legal@agritradeconnect.com
                  </a>
                </p>
              </div>
            </div>
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

export default TermsOfService; 