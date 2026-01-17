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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "../page/theme-toggle";

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
  const [scrolled, setScrolled] = useState(false);
  
  const LONG_LANGS = ["kn", "ta", "ml", "as", "sd"];
  const isLongLang = LONG_LANGS.includes(selectedLang);


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
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-xl" : "shadow-lg"
      } ${
        darktheme
          ? "bg-gray-900/95 border-b border-gray-800"
          : "bg-white/95 border-b border-gray-200"
      } backdrop-blur-lg`}
    >
      <header className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className={`flex items-center gap-3 flex-shrink-0 ${isLongLang ? 'mr-4' : 'mr-8'}`}>
      <a href="/">
              <div
                className={`relative group cursor-pointer ${
                  scrolled ? "scale-95" : ""
                } transition-transform`}
              >
                <div
                  className={`w-8 h-8 rounded-lg sm:w-12 sm:h-12 sm:rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    darktheme
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-purple-500"
                  }`}
                >
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6  text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles
                    className={`w-4 h-4 ${
                      darktheme ? "text-yellow-400" : "text-yellow-500"
                    } animate-pulse`}
                  />
                </div>
              </div>
            </a>

            <div className="hidden md:block">
              <a href="/">
                <h1
                  className={`${isLongLang ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r ${
                    darktheme
                      ? "from-blue-400 to-purple-400"
                      : "from-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  {t("navbar.appName")}
                </h1>
              </a>
              <p
                className={`text-xs ${
                  darktheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("navbar.tagline")}
              </p>
            </div>

            <div className="block md:hidden">
              <h1
                className={`text-lg font-bold bg-gradient-to-r ${
                  darktheme
                    ? "from-blue-400 to-purple-400"
                    : "from-blue-600 to-purple-600"
                } bg-clip-text text-transparent`}
              >
                {t("navbar.appName")}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-3 flex-1">
            {/* Navigation Links */}
            <nav className={`flex items-center gap-2 min-w-0 flex-1 justify-center ${isLongLang ? 'gap-0.5' : ''}`}>
              {[...(usere?.status === "admin"
                ? [{ path: "/admin/dashboard", label: "Admin Panel" }]
                : []),
                { path: "/", label: t("navbar.home") },
                { path: "/about", label: "About" },
                ...(usere?.status === "driver"
                  ? [{ path: "/Bus", label: t("navbar.busDetails") }]
                  : []),
                { path: "/view/map", label: t("navbar.map") },
                { path: "/track-multiple", label: "Track Buses" },
                { path: "/find/ticket", label: t("navbar.ticket") },
                { path: "/nearBy/search", label: t("navbar.nearBy") },
                { path: "/see-history", label: t("navbar.history") },
                ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    isLongLang ? "text-xs px-0.5 py-0" : "px-4 py-2"
                  } ${
                    isActiveRoute(item.path)
                      ? darktheme
                        ? "text-white bg-blue-600/20"
                        : "text-blue-700 bg-blue-100"
                      : darktheme
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                  {isActiveRoute(item.path) && (
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                        darktheme ? "bg-blue-500" : "bg-blue-600"
                      }`}
                    ></span>
                  )}
                </button>
              ))}
            </nav>

            {/* Live Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full border flex-shrink-0 ${
                darktheme
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`font-semibold ${isLongLang ? 'text-xs' : 'text-sm'} ${
                  darktheme ? "text-green-400" : "text-green-700"
                }`}
              >
                {t("navbar.liveTracking")}
              </span>
            </div>

            {/* Language Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`flex items-center gap-2 rounded-lg border transition-all ${isLongLang ? "px-0.5 py-0 text-xs" : "px-3 py-2"} ${
                    darktheme
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-200"
                      : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {LANGUAGES[selectedLang].flag}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className={`w-56 max-h-80 overflow-y-auto ${
                  darktheme
                    ? "bg-gray-800/95 border-gray-700"
                    : "bg-white/95 border-gray-200"
                } backdrop-blur-lg`}
              >
                <div className="space-y-1">
                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        selectedLang === code
                          ? darktheme
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                          : darktheme
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{flag}</span>
                      <span className="text-sm font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                      darktheme
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-blue-500/30">
                      <AvatarImage
                        src={
                          user?.picture ||
                          usere?.picture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`
                        }
                        alt={user?.name}
                      />
                      <AvatarFallback
                        className={`${
                          darktheme ? "bg-blue-600" : "bg-blue-500"
                        } text-white font-semibold`}
                      >
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                      <span
                        className={`font-medium hidden xl:block truncate ${isLongLang ? 'text-xs' : ''} ${
                          darktheme ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {user?.name}
                      </span>
                    <ChevronDown
                      className={`w-4 h-4 ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className={`w-56 ${
                    darktheme
                      ? "bg-gray-800/95 border-gray-700"
                      : "bg-white/95 border-gray-200"
                  } backdrop-blur-lg`}
                >
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className={`w-full justify-start ${
                        darktheme
                          ? "border-gray-700 text-gray-200 hover:bg-gray-700 bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => navigate("/profile")}
                    >
                      {t("navbar.viewProfile")}
                    </Button>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                className={`rounded-xl font-semibold shadow-lg transition-all ${
                  isLongLang ? "text-xs" : "text-base"
                } ${isLongLang ? "px-0.5 py-0" : "px-6 py-2"} ${
                  darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } text-white`}
              >
                {t("navbar.login")}
              </Button>
            )}
          </div>

          {/* Tablet Navigation */}
          <div className="hidden lg:flex xl:hidden items-center gap-3 flex-1">
            <nav className={`flex items-center gap-2 min-w-0 flex-1 justify-center ${isLongLang ? 'gap-0.5' : ''}`}>
              {[...(usere?.status === "admin"
                ? [{ path: "/admin/dashboard", label: "Admin Panel" }]
                : []),
                { path: "/", label: t("navbar.home") },
                 { path: "/about", label: "About" },
                ...(usere?.status === "driver"
                  ? [{ path: "/Bus", label: t("navbar.busDetails") }]
                  : []),
                { path: "/view/map", label: t("navbar.map") },
                { path: "/track-multiple", label: "Track Buses" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    isLongLang ? "text-xs px-0.5 py-0" : "px-4 py-2"
                  } ${
                    isActiveRoute(item.path)
                      ? darktheme
                        ? "text-white bg-blue-600/20"
                        : "text-blue-700 bg-blue-100"
                      : darktheme
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                  {isActiveRoute(item.path) && (
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                        darktheme ? "bg-blue-500" : "bg-blue-600"
                      }`}
                    ></span>
                  )}
                </button>
              ))}
            </nav>

            {/* More Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-2 text-sm rounded-lg border">
                  More <ChevronDown className="inline w-4 h-4 ml-1" />
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-fit">
                <div className="space-y-2 flex flex-col">
                  <nav className="flex flex-col items-center gap-2">
                    {[
                      { path: "/find/ticket", label: t("navbar.ticket") },
                      { path: "/nearBy/search", label: t("navbar.nearBy") },
                      { path: "/see-history", label: t("navbar.history") },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isActiveRoute(item.path)
                            ? darktheme
                              ? "text-white bg-blue-600/20"
                              : "text-blue-700 bg-blue-100"
                            : darktheme
                            ? "text-gray-300 hover:text-white hover:bg-gray-800"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {item.label}
                        {isActiveRoute(item.path) && (
                          <span
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                              darktheme ? "bg-blue-500" : "bg-blue-600"
                            }`}
                          ></span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`flex items-center gap-2 rounded-lg border transition-all ${isLongLang ? "px-0.5 py-0 text-xs" : "px-3 py-2"} ${
                    darktheme
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-200"
                      : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {LANGUAGES[selectedLang].flag}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className={`w-56 max-h-80 overflow-y-auto ${
                  darktheme
                    ? "bg-gray-800/95 border-gray-700"
                    : "bg-white/95 border-gray-200"
                } backdrop-blur-lg`}
              >
                <div className="space-y-1">
                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        selectedLang === code
                          ? darktheme
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                          : darktheme
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{flag}</span>
                      <span className="text-sm font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <ThemeToggle />
            {/* Authentication */}
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                      darktheme
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-blue-500/30">
                      <AvatarImage
                        src={
                          user?.picture ||
                          usere?.picture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`
                        }
                        alt={user?.name}
                      />
                      <AvatarFallback
                        className={`${
                          darktheme ? "bg-blue-600" : "bg-blue-500"
                        } text-white font-semibold`}
                      >
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`font-medium hidden xl:block ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {user?.name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className={`w-56 ${
                    darktheme
                      ? "bg-gray-800/95 border-gray-700"
                      : "bg-white/95 border-gray-200"
                  } backdrop-blur-lg`}
                >
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className={`w-full justify-start ${
                        darktheme
                          ? "border-gray-700 text-gray-200 hover:bg-gray-700 bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => navigate("/profile")}
                    >
                      {t("navbar.viewProfile")}
                    </Button>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                className={`px-6 py-2 rounded-xl font-semibold shadow-lg transition-all ${
                  darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } text-white`}
              >
                {t("navbar.login")}
              </Button>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3">
            {/* Live Badge Mobile */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                darktheme
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs font-semibold ${
                  darktheme ? "text-green-400" : "text-green-700"
                }`}
              >
                {t("navbar.liveTracking")}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all mobile-menu-container ${
                darktheme
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isMobileMenuOpen ? (
                <X
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              ) : (
                <Menu
                  className={`w-5 h-5 sm:w-6 sm:h-6  ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden mobile-menu-container border-t ${
            darktheme
              ? "bg-gray-900/98 border-gray-800"
              : "bg-white/98 border-gray-200"
          } backdrop-blur-lg`}
        >
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="space-y-2">
              {[...(usere?.status === "admin"
                ? [{ path: "/admin/dashboard", label: "Admin Panel" }]
                : []),
                { path: "/", label: t("navbar.home") },
                { path: "/about", label: "About" },
                ...(usere?.status === "driver"
                  ? [{ path: "/Bus", label: t("navbar.busDetails") }]
                  : []),
                { path: "/view/map", label: t("navbar.map") },
                { path: "/find/ticket", label: t("navbar.ticket") },
                { path: "/nearBy/search", label: t("navbar.nearBy") },
                { path: "/see-history", label: t("navbar.history") },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                    isActiveRoute(item.path)
                      ? darktheme
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-blue-100 text-blue-700"
                      : darktheme
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Language Selector */}
            <div
              className={`p-4 rounded-xl border ${
                darktheme
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe
                  className={`w-4 h-4 ${
                    darktheme ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Language
                </span>
              </div>
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                  darktheme
                    ? "bg-gray-900 border-gray-700 text-gray-200"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Mobile */}
            <div
              className={`p-4 rounded-xl border ${
                darktheme
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <ThemeToggle />
            </div>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    darktheme
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Avatar className="w-12 h-12 ring-2 ring-blue-500/30">
                    <AvatarImage
                      src={
                        user?.picture ||
                        usere?.picture ||
                        `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`
                      }
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`font-medium ${
                      darktheme ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {user?.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className={`w-full ${
                    darktheme
                      ? "border-gray-700 text-gray-200 hover:bg-gray-800 bg-gray-900"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t("navbar.viewProfile")}
                </Button>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                className={`w-full py-3 rounded-xl font-semibold shadow-lg ${
                  darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } text-white`}
              >
                {t("navbar.login")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
