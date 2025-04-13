import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  const sections = [
    {
      title: "What Are Cookies",
      content:
        "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.",
    },
    {
      title: "Types of Cookies We Use",
      subsections: [
        {
          title: "Essential Cookies",
          content:
            "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
        },
        {
          title: "Analytics Cookies",
          content:
            "We use analytics cookies to understand how visitors interact with our website, helping us improve our services and user experience.",
        },
        {
          title: "Functional Cookies",
          content:
            "These cookies enable us to provide enhanced functionality and personalization, such as remembering your preferences and settings.",
        },
        {
          title: "Advertising Cookies",
          content:
            "These cookies are used to deliver advertisements more relevant to you and your interests.",
        },
      ],
    },
    {
      title: "Managing Cookies",
      content:
        "Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience of our website.",
    },
    {
      title: "Third-Party Cookies",
      content:
        "Some of our pages may contain content from third parties (like social media widgets) which may set their own cookies. We do not control these cookies and recommend checking their respective privacy policies.",
    },
    {
      title: "Updates to This Policy",
      content:
        "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.",
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
          <h1 className="text-4xl font-bold text-center mb-4">Cookie Policy</h1>
          <p className="text-gray-600 text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              {sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  {section.content && (
                    <p className="text-gray-600 mb-4">{section.content}</p>
                  )}
                  {section.subsections && (
                    <div className="space-y-4 pl-4">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.title}>
                          <h3 className="text-lg font-semibold mb-2">
                            {subsection.title}
                          </h3>
                          <p className="text-gray-600">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold mb-3">Questions?</h2>
                <p className="text-gray-600">
                  If you have any questions about our Cookie Policy, please{" "}
                  <Link to="/static/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
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

export default CookiePolicy; 