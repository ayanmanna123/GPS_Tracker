import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  Navigation,
  Globe,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  MapPin,
  Radio,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/page/theme-toggle";
import SidebarMenu from "./SidebarMenu";

const Navbar = () => {
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();
  const { usere, darktheme } = useSelector((store) => store.auth);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const LANGUAGES = {
    en: { name: "English", flag: "🇺🇸" },
    hi: { name: "हिन्दी", flag: "🇮🇳" },
    ta: { name: "தமிழ்", flag: "🇮🇳" },
    te: { name: "తెలుగు", flag: "🇮🇳" },
    kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
    ml: { name: "മലയാളം", flag: "🇮🇳" },
    bn: { name: "বাংলা", flag: "🇮🇳" },
    gu: { name: "ગુજરાતી", flag: "🇮🇳" },
    mr: { name: "मराठी", flag: "🇮🇳" },
    pa: { name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    kok: { name: "कोंकणी", flag: "🇮🇳" },
    or: { name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    ne: { name: "नेपाली", flag: "🇳🇵" },
    sat: { name: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
    sd: { name: "سنڌي", flag: "🇵🇰" },
    mni: { name: "মেইতেই লোন", flag: "🇮🇳" },
    ks: { name: "كٲشُر", flag: "🇮🇳" },
    as: { name: "অসমীয়া", flag: "🇮🇳" },
  };

  const isActiveRoute = (path) => location.pathname === path;

  const handleLanguageChange = (langCode) => {
    if (!langCode) return;
    setSelectedLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);
    i18n.changeLanguage(langCode);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("loginShown");
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setSelectedLang(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);





  return (
    <div
      className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? "shadow-2xl py-0" : "shadow-lg py-1"
        }`}
    >
      {/* Glassmorphism Background Layer */}
      <div className={`absolute inset-0 transition-all duration-500 ${darktheme
        ? "bg-gradient-to-r from-gray-900/80 via-gray-900/85 to-gray-800/80"
        : "bg-gradient-to-r from-white/80 via-blue-50/40 to-purple-50/40"
        } backdrop-blur-2xl`}>
        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 opacity-30 ${darktheme
          ? "bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"
          : "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
          } animate-pulse`} style={{ animationDuration: '4s' }}></div>
      </div>

      {/* Border with gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${darktheme
        ? "bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        : "bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
        }`}></div>

      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <header className="relative max-w-7xl mx-auto px-0 sm:px-1 py-3">
        <div className="flex justify-between items-center">
          {/* Left Side: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 group relative overflow-hidden ${darktheme
                ? "bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50"
                : "bg-white/50 text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 border border-gray-200/50"
                } backdrop-blur-md shadow-sm`}
            >
              <Menu className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {/* Subtle glass effect highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Logo Section - Enhanced with glow effect - Left Aligned */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-5 flex-shrink-0 group cursor-pointer justify-start -ml-[5px]"
            >
              <div className={`relative ${scrolled ? 'scale-95' : 'scale-100'} transition-all duration-300`}>
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-all group-hover:blur-2xl ${darktheme
                  ? "bg-gradient-to-br from-blue-600/40 to-purple-600/40"
                  : "bg-gradient-to-br from-blue-500/30 to-purple-500/30"
                  } group-hover:scale-110`}></div>

                {/* Icon container */}
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all group-hover:scale-105 group-hover:rotate-3 ${darktheme
                  ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                  }`}>
                  <Navigation className="w-6 h-6 text-white drop-shadow-lg" />
                </div>

                {/* Sparkle indicators */}
                <div className="absolute -top-1 -right-1 animate-bounce">
                  <Sparkles className={`w-4 h-4 ${darktheme ? 'text-yellow-400' : 'text-yellow-500'}`} style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute -bottom-1 -left-1 animate-pulse">
                  <MapPin className={`w-3 h-3 ${darktheme ? 'text-green-400' : 'text-green-500'}`} style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div className="hidden md:block">
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${darktheme ? "from-blue-400 via-purple-400 to-pink-400" : "from-blue-600 via-purple-600 to-pink-600"
                  } bg-clip-text text-transparent drop-shadow-lg transition-all group-hover:scale-105`}>
                  {t("navbar.appName")}
                </h1>
                <p className={`text-xs font-medium ${darktheme ? "text-gray-400" : "text-gray-600"} tracking-wide`}>
                  {t("navbar.tagline")}
                </p>
              </div>
            </div>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 ml-16">
            {/* Navigation Links - Enhanced with better hover effects */}
            <nav className="flex items-center gap-1 bg-gradient-to-r from-transparent via-gray-100/5 to-transparent px-2 py-1 rounded-2xl">
              {[
                { path: "/", label: t("navbar.home") },
                ...(usere?.status === "driver" ? [{ path: "/Bus", label: t("navbar.busDetails") }] : []),
                { path: "/view/map", label: t("navbar.map") },
                { path: "/find/ticket", label: t("navbar.ticket") },
                { path: "/nearBy/search", label: t("navbar.nearBy") },
                { path: "/see-history", label: t("navbar.history") },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 group overflow-hidden ${isActiveRoute(item.path)
                    ? darktheme
                      ? "text-white"
                      : "text-blue-700"
                    : darktheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                    }`}
                >
                  {/* Background effect */}
                  <span className={`absolute inset-0 transition-all duration-300 rounded-xl ${isActiveRoute(item.path)
                    ? darktheme
                      ? "bg-gradient-to-r from-blue-600/40 to-purple-600/40 scale-100"
                      : "bg-gradient-to-r from-blue-200 to-purple-200 scale-100"
                    : darktheme
                      ? "bg-gray-800/0 group-hover:bg-gray-700/70 scale-95 group-hover:scale-100"
                      : "bg-gray-100/0 group-hover:bg-gray-200 scale-95 group-hover:scale-100"
                    }`}></span>

                  {/* Text */}
                  <span className="relative z-10">{item.label}</span>

                  {/* Active indicator */}
                  {isActiveRoute(item.path) && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full ${darktheme
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gradient-to-r from-blue-600 to-purple-600"
                      } shadow-lg`}></span>
                  )}
                </button>
              ))}
            </nav>

            {/* Live Badge - Enhanced */}
            <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all hover:scale-105 cursor-pointer ${darktheme
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/40 hover:border-green-500/60"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:border-green-400"
              }`}>
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full">
                <div className={`absolute inset-0 rounded-full animate-ping ${darktheme ? "bg-green-500/20" : "bg-green-400/20"
                  }`} style={{ animationDuration: '2s' }}></div>
              </div>

              <Radio className={`w-4 h-4 ${darktheme ? "text-green-400" : "text-green-600"} relative z-10`} />
              <div className="relative w-2 h-2 bg-green-500 rounded-full">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className={`text-sm font-bold tracking-wide relative z-10 ${darktheme ? "text-green-400" : "text-green-700"
                }`}>
                {t("navbar.liveTracking")}
              </span>
            </div>

            {/* Language Selector - Enhanced */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all hover:scale-105 ${darktheme
                  ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-600/50 text-gray-200"
                  : "bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-300 hover:border-purple-400 text-gray-700"
                  }`}>
                  <Globe className="w-4 h-4" />
                  <span className="text-lg">{LANGUAGES[selectedLang].flag}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className={`w-64 max-h-80 overflow-y-auto ${darktheme
                ? "bg-gray-800/98 border-gray-700"
                : "bg-white/98 border-gray-200"
                } backdrop-blur-xl shadow-2xl rounded-2xl`}>
                <div className="space-y-1 p-1">
                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedLang === code
                        ? darktheme
                          ? "bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-blue-300 scale-105"
                          : "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-700 scale-105"
                        : darktheme
                          ? "hover:bg-gray-700/80 text-gray-300"
                          : "hover:bg-gray-200 text-gray-700"
                        }`}
                    >
                      <span className="text-xl">{flag}</span>
                      <span className="text-sm font-medium">{name}</span>
                      {selectedLang === code && (
                        <span className="ml-auto text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Authentication - Enhanced */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-3 px-3 py-2 rounded-2xl border-2 transition-all hover:scale-105 group ${darktheme
                    ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-600/50"
                    : "bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-300 hover:border-purple-400"
                    }`}>
                    <Avatar className="w-9 h-9 ring-2 ring-offset-2 ring-blue-500/50 transition-all group-hover:ring-purple-500/50">
                      <AvatarImage
                        src={user?.picture || usere?.picture || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`}
                        alt={user?.name}
                      />
                      <AvatarFallback className={`${darktheme
                        ? "bg-gradient-to-br from-blue-600 to-purple-600"
                        : "bg-gradient-to-br from-blue-500 to-purple-500"
                        } text-white font-bold`}>
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`font-semibold hidden xl:block ${darktheme ? "text-gray-200" : "text-gray-800"
                      }`}>
                      {user?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${darktheme ? "text-gray-400" : "text-gray-600"}`} />
                  </button>
                </PopoverTrigger>

                <PopoverContent align="end" className={`w-64 ${darktheme
                  ? "bg-gray-800/98 border-gray-700"
                  : "bg-white/98 border-gray-200"
                  } backdrop-blur-xl shadow-2xl rounded-2xl`}>
                  <div className="space-y-2 p-2">
                    <Button
                      variant="outline"
                      className={`w-full justify-start gap-3 text-left rounded-xl transition-all hover:scale-105 ${darktheme
                        ? "border-gray-700 text-gray-200 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 bg-gray-800/50"
                        : "border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                        }`}
                      onClick={() => navigate("/profile")}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-semibold">{t("navbar.viewProfile")}</span>
                    </Button>
                    <Button
                      className="w-full rounded-xl font-bold shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                      onClick={handleLogout}
                    >
                      {t("navbar.logout")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                onClick={() => loginWithRedirect()}
                className={`px-6 py-2.5 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${darktheme
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                  } text-white relative overflow-hidden group`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Get Started
                </span>
                {/* Shine effect */}
                <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"></span>
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Right Section - Enhanced */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Live Badge Mobile */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${darktheme
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/40"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
              }`}>
              <div className="relative w-2 h-2 bg-green-500 rounded-full">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
              </div>
              <span className={`text-xs font-bold ${darktheme ? "text-green-400" : "text-green-700"
                }`}>
                {t("navbar.liveTracking")}
              </span>
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`relative p-2.5 rounded-2xl border-2 transition-all mobile-menu-container hover:scale-110 ${darktheme
                ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-600/50"
                : "bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-300 hover:border-purple-400"
                }`}
            >
              <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isMobileMenuOpen ? (
                  <X className={`w-6 h-6 ${darktheme ? "text-gray-300" : "text-gray-700"}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${darktheme ? "text-gray-300" : "text-gray-700"}`} />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Enhanced */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden mobile-menu-container border-t-2 transition-all duration-300 ${darktheme
          ? "bg-gradient-to-b from-gray-900/98 to-gray-800/98 border-gray-700"
          : "bg-gradient-to-b from-white/98 to-gray-50/98 border-gray-300"
          } backdrop-blur-2xl shadow-2xl`}>
          <div className="px-4 py-5 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Navigation Links - Enhanced */}
            <nav className="space-y-2">
              {[
                { path: "/", label: t("navbar.home") },
                ...(usere?.status === "driver" ? [{ path: "/Bus", label: t("navbar.busDetails") }] : []),
                { path: "/view/map", label: t("navbar.map") },
                { path: "/find/ticket", label: t("navbar.ticket") },
                { path: "/nearBy/search", label: t("navbar.nearBy") },
                { path: "/see-history", label: t("navbar.history") },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl font-semibold transition-all relative overflow-hidden group ${isActiveRoute(item.path)
                    ? darktheme
                      ? "bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-blue-300 scale-105 shadow-lg"
                      : "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-700 scale-105 shadow-lg"
                    : darktheme
                      ? "text-gray-300 hover:bg-gray-700/70 hover:scale-105"
                      : "text-gray-700 hover:bg-gray-200 hover:scale-105"
                    }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActiveRoute(item.path) && (
                    <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full ${darktheme
                      ? "bg-gradient-to-b from-blue-500 to-purple-500"
                      : "bg-gradient-to-b from-blue-600 to-purple-600"
                      }`}></span>
                  )}
                </button>
              ))}
            </nav>

            {/* Language Selector - Enhanced */}
            <div className={`p-5 rounded-2xl border-2 ${darktheme
              ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700"
              : "bg-gradient-to-br from-gray-50 to-white border-gray-300"
              } shadow-lg`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${darktheme ? "bg-blue-600/20" : "bg-blue-100"}`}>
                  <Globe className={`w-5 h-5 ${darktheme ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <span className={`text-sm font-bold ${darktheme ? "text-gray-200" : "text-gray-700"}`}>
                  Select Language
                </span>
              </div>
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all focus:scale-105 ${darktheme
                  ? "bg-gray-900/80 border-gray-700 text-gray-200 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-700 focus:border-purple-400"
                  }`}
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Authentication - Enhanced */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${darktheme
                  ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700"
                  : "bg-gradient-to-br from-gray-50 to-white border-gray-300"
                  } shadow-lg`}>
                  <Avatar className="w-14 h-14 ring-4 ring-blue-500/30 ring-offset-2">
                    <AvatarImage
                      src={user?.picture || usere?.picture || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`}
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className={`font-bold text-lg ${darktheme ? "text-gray-200" : "text-gray-800"}`}>
                      {user?.name}
                    </span>
                    <p className={`text-xs ${darktheme ? "text-gray-400" : "text-gray-600"}`}>
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-105 ${darktheme
                    ? "border-2 border-gray-700 text-gray-200 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 bg-gray-800/80"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                    }`}
                  onClick={() => {
                    loginWithRedirect();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-5 h-5 mr-2" />
                  {t("navbar.viewProfile")}
                </Button>
                <Button
                  className="w-full py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                  onClick={handleLogout}
                >
                  {t("navbar.logout")}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  loginWithRedirect();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:scale-105 relative overflow-hidden group ${darktheme
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                  } text-white`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Sign in to get started
                </span>
                {/* Shine effect */}
                <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"></span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>

  );
};

export default Navbar;