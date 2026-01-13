import {
  Navigation,
  Github,
  Mail,
  MapPin,
  FileText,
  Shield,
  Heart,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";

const Footer = () => {
  const { darktheme } = useSelector((store) => store.auth);

  return (
    <footer
      className={`w-full mt-16 border-t backdrop-blur-lg relative ${
        darktheme
          ? "border-gray-800 bg-gray-900/95"
          : "border-gray-200 bg-white/95"
      }`}
    >
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  darktheme
                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <Sparkles
                className={`absolute -top-1 -right-1 w-4 h-4 ${
                  darktheme ? "text-yellow-400" : "text-yellow-500"
                }`}
              />
            </div>
            <h2
              className={`text-xl font-bold bg-gradient-to-r ${
                darktheme
                  ? "from-blue-400 to-purple-400"
                  : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              GPS Tracker
            </h2>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Real-time GPS tracking system for buses and vehicles with live map
            visualization, route tracking, and smart travel assistance.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/ayanmanna123/GPS_Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-all ${
                darktheme
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@gpstracker.app"
              className={`p-2 rounded-lg transition-all ${
                darktheme
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3
            className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              darktheme ? "text-gray-300" : "text-gray-800"
            }`}
          >
            <div
              className={`w-1 h-4 rounded-full ${
                darktheme ? "bg-blue-500" : "bg-blue-600"
              }`}
            ></div>
            Quick Links
          </h3>
          <ul className="space-y-3">
            {[
              { label: "Live Map", href: "/view/map" },
              { label: "Find Ticket", href: "/find/ticket" },
              { label: "Nearby Stops", href: "/nearBy/search" },
              { label: "History", href: "/see-history" },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`text-sm flex items-center gap-2 group transition-all ${
                    darktheme
                      ? "text-gray-400 hover:text-blue-400"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      darktheme
                        ? "bg-gray-700 group-hover:bg-blue-400"
                        : "bg-gray-300 group-hover:bg-blue-600"
                    }`}
                  ></div>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h3
            className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              darktheme ? "text-gray-300" : "text-gray-800"
            }`}
          >
            <div
              className={`w-1 h-4 rounded-full ${
                darktheme ? "bg-purple-500" : "bg-purple-600"
              }`}
            ></div>
            Legal
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/privacy-policy"
                className={`text-sm flex items-center gap-2 group transition-all ${
                  darktheme
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <Shield
                  className={`w-4 h-4 transition-all ${
                    darktheme
                      ? "text-gray-600 group-hover:text-purple-400"
                      : "text-gray-400 group-hover:text-purple-600"
                  }`}
                />
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms-and-conditions"
                className={`text-sm flex items-center gap-2 group transition-all ${
                  darktheme
                    ? "text-gray-400 hover:text-purple-400"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                <FileText
                  className={`w-4 h-4 transition-all ${
                    darktheme
                      ? "text-gray-600 group-hover:text-purple-400"
                      : "text-gray-400 group-hover:text-purple-600"
                  }`}
                />
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div className="space-y-4">
          <h3
            className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              darktheme ? "text-gray-300" : "text-gray-800"
            }`}
          >
            <div
              className={`w-1 h-4 rounded-full ${
                darktheme ? "bg-pink-500" : "bg-pink-600"
              }`}
            ></div>
            Connect
          </h3>
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 text-sm ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  darktheme ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <MapPin
                  className={`w-4 h-4 ${
                    darktheme ? "text-pink-400" : "text-pink-600"
                  }`}
                />
              </div>
              <span>India</span>
            </div>
            <a
              href="https://github.com/ayanmanna123/GPS_Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 text-sm group transition-all ${
                darktheme
                  ? "text-gray-400 hover:text-pink-400"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-all ${
                  darktheme
                    ? "bg-gray-800 group-hover:bg-gray-700"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <Github className="w-4 h-4" />
              </div>
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <div
              className={`flex items-center gap-3 text-sm ${
                darktheme ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  darktheme ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <Mail
                  className={`w-4 h-4 ${
                    darktheme ? "text-pink-400" : "text-pink-600"
                  }`}
                />
              </div>
              <span className="truncate">support@gpstracker.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`border-t ${
          darktheme ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className={`text-sm ${
              darktheme ? "text-gray-500" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} GPS Tracker. All rights reserved.
          </p>
          <div
            className={`flex items-center gap-2 text-sm ${
              darktheme ? "text-gray-500" : "text-gray-600"
            }`}
          >
            <span>Built with</span>
            <Heart
              className={`w-4 h-4 animate-pulse ${
                darktheme ? "text-pink-500" : "text-pink-600"
              }`}
              fill="currentColor"
            />
            <span>using React & Leaflet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
