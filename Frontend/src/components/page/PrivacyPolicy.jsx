import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import {
  Shield,
  Lock,
  Eye,
  Share2,
  Database,
  User,
  Mail,
  CheckCircle,
} from "lucide-react";

const PrivacyPolicy = () => {
  const { darktheme } = useSelector((store) => store.auth);

  const sections = [
    {
      icon: Shield,
      title: "1. Introduction",
      content: `Where is My Bus ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our GPS tracking platform.`,
    },
    {
      icon: Database,
      title: "2. Information We Collect",
      items: [
        "Personal details such as name and email",
        "Real-time and historical GPS location data",
        "Device and browser information",
        "Usage analytics and interaction logs",
        "Payment metadata (no card details stored)",
      ],
    },
    {
      icon: CheckCircle,
      title: "3. How We Use Information",
      items: [
        "Provide real-time bus tracking",
        "Improve service accuracy and reliability",
        "Enable ticketing and payments",
        "Ensure system security and prevent misuse",
      ],
    },
    {
      icon: Eye,
      title: "4. Location Data",
      content: `Location data is used strictly for navigation, route tracking, and live map visualization. We do not sell or misuse precise location data.`,
    },
    {
      icon: Share2,
      title: "5. Data Sharing",
      content: `We only share data with trusted third-party services (maps, authentication, payments) strictly to deliver core functionality.`,
    },
    {
      icon: Lock,
      title: "6. Data Security",
      content: `We use industry-standard security practices; however, no digital platform can guarantee absolute security.`,
    },
    {
      icon: User,
      title: "7. Your Rights",
      items: [
        "Access and update your information",
        "Request account deletion",
        "Withdraw consent where applicable",
      ],
    },
    {
      icon: Mail,
      title: "8. Contact",
      content: `For privacy-related questions, contact us at:`,
      email: "support@gpstracker.app",
    },
  ];

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${
            darktheme ? "bg-blue-500/5" : "bg-blue-300/20"
          } rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            darktheme ? "bg-purple-500/5" : "bg-purple-300/20"
          } rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Navbar />

      <div className="px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div
                className={`p-3 rounded-2xl ${
                  darktheme
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                <Shield
                  className={`w-8 h-8 ${
                    darktheme ? "text-blue-400" : "text-white"
                  }`}
                />
              </div>
            </div>
            <h1
              className={`text-5xl font-bold mb-4 bg-gradient-to-r ${
                darktheme
                  ? "from-blue-400 via-purple-400 to-pink-400"
                  : "from-blue-600 via-purple-600 to-pink-600"
              } bg-clip-text text-transparent`}
            >
              Privacy Policy
            </h1>
            <p
              className={`text-sm ${
                darktheme ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Last updated: 9 January 2026
            </p>
          </div>

          {/* Content */}
          <div
            className={`backdrop-blur-sm border rounded-3xl p-8 md:p-12 shadow-2xl ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <section
                    key={index}
                    className={`p-6 rounded-2xl border ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl flex-shrink-0 ${
                          darktheme ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            darktheme ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h2
                          className={`text-xl font-bold mb-3 ${
                            darktheme ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {section.title}
                        </h2>
                        {section.content && (
                          <p
                            className={`leading-relaxed ${
                              darktheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {section.content}
                          </p>
                        )}
                        {section.items && (
                          <ul className="space-y-3 mt-3">
                            {section.items.map((item, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-3 ${
                                  darktheme ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${
                                    darktheme ? "bg-blue-400" : "bg-blue-600"
                                  }`}
                                ></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.email && (
                          <div className="mt-4">
                            <a
                              href={`mailto:${section.email}`}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                darktheme
                                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              <Mail className="w-4 h-4" />
                              {section.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Footer Note */}
            <div
              className={`mt-8 p-6 rounded-2xl border-2 ${
                darktheme
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <Shield
                  className={`w-6 h-6 flex-shrink-0 ${
                    darktheme ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div>
                  <h3
                    className={`font-bold mb-2 ${
                      darktheme ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    Your Privacy Matters
                  </h3>
                  <p
                    className={`text-sm ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    We are committed to maintaining the trust you place in us.
                    If you have any concerns about how your data is handled,
                    please don't hesitate to reach out to us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
