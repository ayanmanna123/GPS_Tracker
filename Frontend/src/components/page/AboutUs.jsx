import React from "react";
import {
  Navigation,
  MapPin,
  Bus,
  Clock,
  Shield,
  Users,
  Zap,
  Heart,
  Target,
  Award,
  TrendingUp,
  Globe,
  Sparkles,
  Github,
} from "lucide-react";

const AboutUs = () => {
  const [darktheme, setDarktheme] = React.useState(false);

  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description:
        "Track buses and vehicles with precise GPS coordinates updated in real-time on interactive maps.",
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description:
        "Access accurate bus timings, route information, and estimated arrival times for better journey planning.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Built with security in mind, ensuring your data and location information remain protected at all times.",
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description:
        "Lightning-fast updates and seamless navigation provide you with instant information when you need it.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Tracked Buses" },
    { value: "50+", label: "Routes Covered" },
    { value: "99.9%", label: "Uptime" },
  ];

  const team = [
    {
      name: "Real-Time Location",
      role: "Core Feature",
      description: "Live GPS tracking with sub-second accuracy",
    },
    {
      name: "Route Planning",
      role: "Smart Navigation",
      description: "AI-powered route suggestions and optimization",
    },
    {
      name: "Journey History",
      role: "Analytics",
      description: "Track and analyze your travel patterns",
    },
  ];

  const [contributors, setContributors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/ayanmanna123/GPS_Tracker/contributors');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContributors(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching contributors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        darktheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? "bg-blue-500/5" : "bg-blue-300/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? "bg-purple-500/5" : "bg-purple-300/20"} rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 w-96 h-96 ${darktheme ? "bg-pink-500/5" : "bg-pink-300/20"} rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Toggle Theme Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setDarktheme(!darktheme)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
            darktheme
              ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {darktheme ? "🌞 Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className={`p-4 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}
            >
              <Navigation
                className={`w-10 h-10 ${darktheme ? "text-blue-400" : "text-white"}`}
              />
            </div>
            <Sparkles
              className={`w-6 h-6 ${darktheme ? "text-yellow-400" : "text-yellow-500"} animate-pulse`}
            />
          </div>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${
              darktheme
                ? "from-blue-400 via-purple-400 to-pink-400"
                : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            About GPS Tracker
          </h1>
          <p
            className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Revolutionizing public transportation with real-time GPS tracking,
            smart route planning, and seamless journey management for a better
            commuting experience.
          </p>
        </div>

        {/* Mission Section */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-2xl ${darktheme ? "bg-purple-500/20" : "bg-purple-100"}`}
            >
              <Target
                className={`w-8 h-8 ${darktheme ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Our Mission
            </h2>
          </div>
          <p
            className={`text-lg leading-relaxed ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            We're dedicated to transforming urban mobility by providing
            accurate, real-time tracking solutions that make public
            transportation more accessible, reliable, and efficient. Our
            platform empowers commuters with the information they need to plan
            their journeys confidently, reducing wait times and improving
            overall travel experiences across cities.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl shadow-xl p-6 text-center border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                darktheme
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/90 border-white/50"
              }`}
            >
              <div
                className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                  darktheme
                    ? "from-blue-400 to-purple-400"
                    : "from-blue-600 to-purple-600"
                } bg-clip-text text-transparent`}
              >
                {stat.value}
              </div>
              <div
                className={`text-sm font-semibold ${
                  darktheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2
            className={`text-3xl font-bold text-center mb-10 ${
              darktheme ? "text-white" : "text-gray-900"
            }`}
          >
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl shadow-xl p-8 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    darktheme
                      ? "bg-gray-800/80 border-gray-700/50 hover:border-blue-500/50"
                      : "bg-white/90 border-white/50 hover:border-blue-500/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${darktheme ? "bg-blue-500/20" : "bg-blue-100"} flex-shrink-0`}
                    >
                      <Icon
                        className={`w-7 h-7 ${darktheme ? "text-blue-400" : "text-blue-600"}`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold mb-3 ${
                          darktheme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`leading-relaxed ${
                          darktheme ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Values */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`p-3 rounded-2xl ${darktheme ? "bg-pink-500/20" : "bg-pink-100"}`}
            >
              <Award
                className={`w-8 h-8 ${darktheme ? "text-pink-400" : "text-pink-600"}`}
              />
            </div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Our Core Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  darktheme
                    ? "bg-gray-900/50 border-gray-700 hover:border-pink-500/50"
                    : "bg-gray-50 border-gray-200 hover:border-pink-500/50"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${
                    darktheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-sm font-semibold mb-3 ${
                    darktheme ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={`text-sm ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors Section */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-2xl ${darktheme ? "bg-purple-500/20" : "bg-purple-100"}`}
            >
              <Github
                className={`w-8 h-8 ${darktheme ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Project Contributors
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className={`text-lg ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                Loading contributors...
              </div>
            </div>
          ) : error ? (
            <div className={`text-center p-6 rounded-xl ${darktheme ? "bg-red-900/30" : "bg-red-100"}`}>
              <p className={`${darktheme ? "text-red-400" : "text-red-600"}`}>
                Error loading contributors: {error}
              </p>
              <p className={`${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                Visit our <a href="https://github.com/ayanmanna123/GPS_Tracker" target="_blank" rel="noopener noreferrer" className="underline">GitHub repository</a> to see contributors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {contributors.map((contributor) => (
                <a
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block group p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    darktheme
                      ? "hover:bg-gray-700/50 border border-gray-700/50"
                      : "hover:bg-gray-100 border border-gray-200"
                  }`}
                  title={`${contributor.login} (${contributor.contributions} contributions)`}
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="w-16 h-16 rounded-full mb-3 object-cover border-2 border-transparent group-hover:border-purple-500 transition-colors duration-300"
                    />
                    <h3 className={`font-semibold text-center truncate w-full ${darktheme ? "text-white" : "text-gray-900"}`}>
                      {contributor.login}
                    </h3>
                    <p className={`text-sm mt-1 ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      {contributor.contributions} contributions
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Technology Stack */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-2xl ${darktheme ? "bg-green-500/20" : "bg-green-100"}`}
            >
              <Globe
                className={`w-8 h-8 ${darktheme ? "text-green-400" : "text-green-600"}`}
              />
            </div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Built with Modern Technology
            </h2>
          </div>
          <p
            className={`text-lg leading-relaxed mb-6 ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Our platform leverages cutting-edge technologies to deliver
            exceptional performance and reliability:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "React for dynamic user interfaces",
              "Leaflet for interactive mapping",
              "Real-time GPS integration",
              "Redux for state management",
              "RESTful API architecture",
              "Responsive design for all devices",
            ].map((tech, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  darktheme ? "bg-gray-900/50" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${darktheme ? "bg-green-400" : "bg-green-600"}`}
                ></div>
                <span
                  className={`font-medium ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {tech}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 text-center border backdrop-blur-sm ${
            darktheme
              ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-700/50"
              : "bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200"
          }`}
        >
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-white"} shadow-xl`}
            >
              <Heart
                className={`w-12 h-12 ${darktheme ? "text-blue-400" : "text-blue-600"} animate-pulse`}
                fill="currentColor"
              />
            </div>
          </div>
          <h2
            className={`text-3xl font-bold mb-4 ${
              darktheme ? "text-white" : "text-gray-900"
            }`}
          >
            Join Thousands of Happy Commuters
          </h2>
          <p
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Experience the future of public transportation. Start tracking your
            buses and planning smarter journeys today.
          </p>
          <button
            className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg inline-flex items-center gap-3 ${
              darktheme
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            } hover:shadow-2xl hover:scale-105`}
          >
            <Bus className="w-5 h-5" />
            <span>Get Started Now</span>
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
