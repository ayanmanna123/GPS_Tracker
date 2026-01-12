import React, { useState } from "react";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  MessageSquare,
  Clock,
  Navigation,
  Sparkles,
  Github,
  CheckCircle,
  User,
  FileText
} from "lucide-react";

const ContactUs = () => {
  const [darktheme, setDarktheme] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@gpstracker.app",
      link: "mailto:support@gpstracker.app",
      color: "blue"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 (123) 456-7890",
      link: "tel:+911234567890",
      color: "purple"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "India",
      link: null,
      color: "pink"
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "Mon - Fri: 9AM - 6PM IST",
      link: null,
      color: "green"
    }
  ];

  const faqs = [
    {
      question: "How accurate is the GPS tracking?",
      answer: "Our GPS tracking system provides real-time updates with sub-second accuracy, ensuring you always know where your bus is."
    },
    {
      question: "Can I track multiple buses at once?",
      answer: "Yes! You can track multiple buses simultaneously and switch between them seamlessly on our interactive map."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Our platform is fully responsive and works perfectly on all mobile devices through your web browser."
    }
  ];

  const colorClasses = {
    blue: darktheme ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-600",
    purple: darktheme ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-purple-100 text-purple-600",
    pink: darktheme ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "bg-pink-100 text-pink-600",
    green: darktheme ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-600"
  };

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
        <div className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? 'bg-blue-500/5' : 'bg-blue-300/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? 'bg-purple-500/5' : 'bg-purple-300/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${darktheme ? 'bg-pink-500/5' : 'bg-pink-300/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
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
            <div className={`p-4 rounded-2xl ${darktheme ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
              <MessageSquare className={`w-10 h-10 ${darktheme ? 'text-blue-400' : 'text-white'}`} />
            </div>
            <Sparkles className={`w-6 h-6 ${darktheme ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
          </div>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${
              darktheme ? "from-blue-400 via-purple-400 to-pink-400" : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            Get in Touch
          </h1>
          <p
            className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Have questions or feedback? We'd love to hear from you. Our team is here to help you 
            make the most of your GPS tracking experience.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl shadow-xl p-6 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  darktheme
                    ? "bg-gray-800/80 border-gray-700/50"
                    : "bg-white/90 border-white/50"
                }`}
              >
                <div className={`p-3 rounded-xl ${colorClasses[info.color]} inline-flex mb-4 ${darktheme ? 'border' : ''}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3
                  className={`font-bold text-lg mb-2 ${
                    darktheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className={`text-sm transition-colors ${
                      darktheme
                        ? "text-gray-400 hover:text-blue-400"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {info.content}
                  </a>
                ) : (
                  <p
                    className={`text-sm ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {info.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div
            className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${darktheme ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Send className={`w-6 h-6 ${darktheme ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h2
                className={`text-2xl font-bold ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                Send us a Message
              </h2>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${darktheme ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <CheckCircle className={`w-16 h-16 ${darktheme ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${darktheme ? 'text-white' : 'text-gray-900'}`}>
                  Message Sent!
                </h3>
                <p className={`${darktheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Thank you for contacting us. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${
                      darktheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us more about your inquiry..."
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all resize-none ${
                      darktheme
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
                  className={`w-full px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                    loading || !formData.name || !formData.email || !formData.subject || !formData.message
                      ? darktheme
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : darktheme
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-2xl hover:scale-105"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <div
            className={`rounded-3xl shadow-2xl p-8 border backdrop-blur-sm ${
              darktheme
                ? "bg-gray-800/80 border-gray-700/50"
                : "bg-white/90 border-white/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${darktheme ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                <MessageSquare className={`w-6 h-6 ${darktheme ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
              <h2
                className={`text-2xl font-bold ${
                  darktheme ? "text-white" : "text-gray-900"
                }`}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 hover:border-pink-500/50"
                      : "bg-gray-50 border-gray-200 hover:border-pink-500/50"
                  }`}
                >
                  <h3
                    className={`font-bold mb-3 flex items-start gap-2 ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${darktheme ? 'bg-pink-400' : 'bg-pink-600'}`}></div>
                    {faq.question}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className={`mt-8 p-6 rounded-xl border ${
              darktheme
                ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50"
                : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
            }`}>
              <p className={`text-sm mb-4 ${darktheme ? 'text-gray-300' : 'text-gray-700'}`}>
                Can't find what you're looking for? Check out our comprehensive documentation or reach out to us directly.
              </p>
              <button
                className={`text-sm font-semibold flex items-center gap-2 transition-colors ${
                  darktheme
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Navigation className="w-4 h-4" />
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Connect Section */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-12 text-center border backdrop-blur-sm ${
            darktheme
              ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-700/50"
              : "bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200"
          }`}
        >
          <h2
            className={`text-3xl font-bold mb-4 ${
              darktheme ? "text-white" : "text-gray-900"
            }`}
          >
            Connect With Us
          </h2>
          <p
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Follow our development journey and stay updated with the latest features and improvements.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/ayanmanna123/GPS_Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg inline-flex items-center gap-3 ${
                darktheme
                  ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              } hover:shadow-2xl hover:scale-105`}
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:support@gpstracker.app"
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg inline-flex items-center gap-3 ${
                darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              } hover:shadow-2xl hover:scale-105`}
            >
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;