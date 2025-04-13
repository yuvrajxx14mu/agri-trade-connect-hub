import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, and business details provided during registration.",
        "Transaction Data: Information about your trades, bids, and payments on the platform.",
        "Usage Data: How you interact with our platform, including access times and pages visited.",
        "Device Information: Browser type, IP address, and device identifiers.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To provide and maintain our service",
        "To process your transactions",
        "To communicate with you about your account and transactions",
        "To improve our platform and user experience",
        "To detect and prevent fraud",
      ],
    },
    {
      title: "3. Information Sharing",
      content: [
        "We share information with other users as necessary for transactions",
        "With service providers who assist in our operations",
        "When required by law or to protect our rights",
        "We never sell your personal information to third parties",
      ],
    },
    {
      title: "4. Data Security",
      content: [
        "We implement appropriate security measures to protect your data",
        "Regular security assessments and updates",
        "Encrypted data transmission and storage",
        "Access controls and monitoring",
      ],
    },
    {
      title: "5. Your Rights",
      content: [
        "Access your personal information",
        "Correct inaccurate data",
        "Request deletion of your data",
        "Opt-out of marketing communications",
        "Export your data",
      ],
    },
    {
      title: "6. Cookies and Tracking",
      content: [
        "We use cookies to improve your experience",
        "You can control cookie settings in your browser",
        "We use analytics tools to understand platform usage",
        "Third-party cookies may be present on our platform",
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <p className="mb-8">
                At AgriTradeConnect, we take your privacy seriously. This Privacy Policy explains how
                we collect, use, and protect your personal information when you use our platform.
              </p>

              {sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {section.content.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about our Privacy Policy, please contact our Data
                  Protection Officer at{" "}
                  <a
                    href="mailto:privacy@agritradeconnect.com"
                    className="text-primary hover:underline"
                  >
                    privacy@agritradeconnect.com
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

export default PrivacyPolicy; 