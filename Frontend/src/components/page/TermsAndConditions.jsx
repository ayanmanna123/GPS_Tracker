import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import {
  FileText,
  Shield,
  CreditCard,
  AlertCircle,
  Scale,
  Mail,
  CheckCircle,
} from "lucide-react";

const TermsAndConditions = () => {
  const { darktheme } = useSelector((store) => store.auth);

  const sections = [
    {
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      content:
        "By accessing or using Where is My Bus, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please discontinue use of the service.",
      color: "blue",
    },
    {
      icon: FileText,
      title: "2. Description of Service",
      content:
        "Where is My Bus provides real-time GPS tracking, route visualization, ticketing, and related transportation services. Features may evolve over time.",
      color: "purple",
    },
    {
      icon: Shield,
      title: "3. User Responsibilities",
      list: [
        "Provide accurate and lawful information",
        "Do not misuse or abuse the platform",
        "Do not interfere with tracking systems or APIs",
        "Comply with all applicable laws and regulations",
      ],
      color: "green",
    },
    {
      icon: Shield,
      title: "4. Accounts & Security",
      content:
        "You are responsible for maintaining the confidentiality of your account credentials. We are not liable for unauthorized access resulting from user negligence.",
      color: "orange",
    },
    {
      icon: CreditCard,
      title: "5. Payments & Tickets",
      content:
        "Payments are processed via third-party providers. Where is My Bus does not store sensitive payment details. Refunds, if any, are subject to provider policies.",
      color: "pink",
    },
    {
      icon: AlertCircle,
      title: "6. Service Availability",
      content:
        "We strive to maintain uninterrupted service but do not guarantee uptime. Temporary outages may occur due to maintenance or technical issues.",
      color: "yellow",
    },
    {
      icon: AlertCircle,
      title: "7. Limitation of Liability",
      content:
        "Where is My Bus shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the service.",
      color: "red",
    },
    {
      icon: Shield,
      title: "8. Termination",
      content:
        "We reserve the right to suspend or terminate access to the platform for violations of these terms or misuse of the service.",
      color: "indigo",
    },
    {
      icon: FileText,
      title: "9. Intellectual Property",
      content:
        "All content, trademarks, and software associated with Where is My Bus remain the intellectual property of their respective owners.",
      color: "teal",
    },
    {
      icon: Scale,
      title: "10. Governing Law",
      content:
        "These Terms & Conditions are governed by the laws of India. Any disputes shall fall under the jurisdiction of Indian courts.",
      color: "cyan",
    },
    {
      icon: Mail,
      title: "11. Contact Information",
      content:
        "For questions regarding these Terms & Conditions, contact us at:",
      email: "support@gpstracker.app",
      color: "violet",
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
          className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? "bg-blue-500/5" : "bg-blue-300/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? "bg-purple-500/5" : "bg-purple-300/20"} rounded-full blur-3xl animate-pulse`}
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
                className={`p-3 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}
              >
                <FileText
                  className={`w-8 h-8 ${darktheme ? "text-blue-400" : "text-white"}`}
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
              Terms & Conditions
            </h1>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                darktheme
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-white/50 border border-gray-200"
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 ${darktheme ? "text-blue-400" : "text-blue-600"}`}
              />
              <span
                className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"}`}
              >
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Content Card */}
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
                    className={`p-6 rounded-2xl border transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl flex-shrink-0 ${
                          darktheme
                            ? `bg-${section.color}-500/20`
                            : `bg-${section.color}-100`
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            darktheme
                              ? `text-${section.color}-400`
                              : `text-${section.color}-600`
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
                              darktheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {section.content}
                          </p>
                        )}
                        {section.list && (
                          <ul className="space-y-2 mt-3">
                            {section.list.map((item, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-3 ${
                                  darktheme ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                <CheckCircle
                                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                    darktheme
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.email && (
                          <div className="mt-3">
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

            {/* Footer Notice */}
            <div
              className={`mt-8 p-6 rounded-2xl border ${
                darktheme
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <AlertCircle
                  className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    darktheme ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div>
                  <h3
                    className={`font-bold mb-2 ${
                      darktheme ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    Important Notice
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      darktheme ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    By continuing to use our services, you acknowledge that you
                    have read, understood, and agree to be bound by these Terms
                    & Conditions. We reserve the right to modify these terms at
                    any time, and your continued use constitutes acceptance of
                    any changes.
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

export default TermsAndConditions;
