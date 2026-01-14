import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
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
  Mail,
  Coffee,
  Code,
  Lightbulb,
  Star,
  Rocket,
  Monitor,
  Smartphone,
  Database,
  CloudLightning,
} from "lucide-react";
import { useSelector } from "react-redux";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const { darktheme } = useSelector((store) => store.auth);
  const heroRef = useRef(null);
  const starsRef = useRef(null);
  const controls = useAnimation();

  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description:
        "Track buses and vehicles with precise GPS coordinates updated in real-time on interactive maps.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description:
        "Access accurate bus timings, route information, and estimated arrival times for better journey planning.",
      color: "green",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Built with security in mind, ensuring your data and location information remain protected at all times.",
      color: "purple",
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description:
        "Lightning-fast updates and seamless navigation provide you with instant information when you need it.",
      color: "yellow",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "500+", label: "Tracked Buses", icon: Bus },
    { value: "50+", label: "Routes Covered", icon: Navigation },
    { value: "99.9%", label: "Uptime", icon: Shield },
  ];

  const technologies = [
    { name: "React", icon: Code, description: "Dynamic user interfaces" },
    { name: "Node.js", icon: Database, description: "Powerful backend services" },
    { name: "MongoDB", icon: Database, description: "Flexible data storage" },
    { name: "Google Maps", icon: MapPin, description: "Interactive mapping" },
    { name: "Redux", icon: Zap, description: "State management" },
    { name: "Socket.io", icon: CloudLightning, description: "Real-time communication" },
  ];

  const team = {
    creator: {
      name: "Ayan Manna",
      role: "Full-Stack Developer & Creator",
      description: "Passionate developer dedicated to transforming public transportation through innovative technology solutions.",
      github: "https://github.com/ayanmanna123",
      email: "ayanmanna@example.com",
      avatar: "https://github.com/ayanmanna123.png",
      skills: ["React", "Node.js", "MongoDB", "GPS Integration", "Real-time Systems"],
    },
    values: [
      {
        name: "Innovation",
        role: "Core Principle",
        description: "Continuously pushing boundaries with cutting-edge technology solutions",
        icon: Lightbulb,
      },
      {
        name: "Reliability",
        role: "Foundation",
        description: "Building robust systems that users can depend on every day",
        icon: Shield,
      },
      {
        name: "User-Centric",
        role: "Design Philosophy", 
        description: "Every feature designed with user experience and accessibility in mind",
        icon: Heart,
      },
    ],
  };

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 0, opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const floatAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  // GSAP Animations
  useEffect(() => {
    // Floating stars animation only
    gsap.to(starsRef.current?.children || [], {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      rotation: "random(-180, 180)",
      scale: "random(0.8, 1.2)",
      duration: "random(3, 5)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Confetti effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B'],
    });
  };

  const AnimatedSection = ({ children, className = "" }) => {
    return (
      <motion.div
        className={className}
        initial="visible"
        animate="visible"
        variants={containerVariants}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <>
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
          className={`absolute top-20 left-10 w-96 h-96 ${darktheme ? "bg-blue-500/5" : "bg-blue-300/20"} rounded-full blur-3xl`}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${darktheme ? "bg-purple-500/5" : "bg-purple-300/20"} rounded-full blur-3xl`}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <div
          className={`absolute top-1/2 left-1/2 w-96 h-96 ${darktheme ? "bg-pink-500/5" : "bg-pink-300/20"} rounded-full blur-3xl`}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              scale: [1, 1.3, 1],
              x: [-50, 50, -50],
              y: [-30, 30, -30],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Floating Stars */}
        <div ref={starsRef} className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${darktheme ? "bg-yellow-400" : "bg-yellow-500"} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={floatAnimation}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <AnimatedSection className="text-center mb-16">
          <motion.div
            ref={heroRef}
            className="inline-flex items-center gap-3 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className={`p-4 rounded-2xl ${darktheme ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 40px rgba(139, 92, 246, 0.8)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Navigation
                className={`w-10 h-10 ${darktheme ? "text-blue-400" : "text-white"}`}
              />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles
                className={`w-6 h-6 ${darktheme ? "text-yellow-400" : "text-yellow-500"}`}
              />
            </motion.div>
          </motion.div>

          <motion.h1
            className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${
              darktheme
                ? "from-blue-400 via-purple-400 to-pink-400"
                : "from-blue-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
            variants={itemVariants}
          >
            About GPS Tracker
          </motion.h1>

          <motion.p
            className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 ${
              darktheme ? "text-gray-400" : "text-gray-600"
            }`}
            variants={itemVariants}
          >
            Revolutionizing public transportation with real-time GPS tracking,
            smart route planning, and seamless journey management for a better
            commuting experience across India.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4 flex-wrap"
            variants={itemVariants}
          >
            <motion.button
              onClick={triggerConfetti}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                darktheme
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Celebrate Innovation!
              </span>
            </motion.button>
          </motion.div>
        </AnimatedSection>

        {/* Creator Section */}
        <AnimatedSection
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm parallax-element ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className={`relative p-2 rounded-2xl ${darktheme ? "bg-blue-500/20" : "bg-blue-100"}`}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(59, 130, 246, 0.6)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img
                  src={team.creator.avatar}
                  alt={team.creator.name}
                  className="w-32 h-32 rounded-xl object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${team.creator.name}&background=3b82f6&color=ffffff&size=128`;
                  }}
                />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.h2
              className={`text-4xl font-bold mb-4 ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
              variants={itemVariants}
            >
              Meet the Creator
            </motion.h2>

            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-2">{team.creator.name}</h3>
              <p className="text-lg font-semibold">{team.creator.role}</p>
            </motion.div>

            <motion.p
              className={`text-lg leading-relaxed mt-4 max-w-2xl mx-auto ${
                darktheme ? "text-gray-300" : "text-gray-700"
              }`}
              variants={itemVariants}
            >
              {team.creator.description}
            </motion.p>

            <motion.div
              className="flex justify-center gap-4 mt-6"
              variants={itemVariants}
            >
              <motion.a
                href={team.creator.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darktheme
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a
                href={`mailto:${team.creator.email}`}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darktheme
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                }`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-6 h-6" />
              </motion.a>
            </motion.div>

            <motion.div
              className="mt-6"
              variants={itemVariants}
            >
              <p className={`text-sm ${darktheme ? "text-gray-400" : "text-gray-600"} mb-3`}>
                Tech Stack Expertise:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {team.creator.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      darktheme
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
        {/* Mission Section */}
        <AnimatedSection
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm parallax-element ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <motion.div
            className="flex items-center gap-4 mb-6"
            variants={itemVariants}
          >
            <motion.div
              className={`p-3 rounded-2xl ${darktheme ? "bg-purple-500/20" : "bg-purple-100"}`}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Target
                className={`w-8 h-8 ${darktheme ? "text-purple-400" : "text-purple-600"}`}
              />
            </motion.div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Our Mission
            </h2>
          </motion.div>
          <motion.p
            className={`text-lg leading-relaxed ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
            variants={itemVariants}
          >
            We're dedicated to transforming urban mobility by providing
            accurate, real-time tracking solutions that make public
            transportation more accessible, reliable, and efficient. Our
            platform empowers commuters with the information they need to plan
            their journeys confidently, reducing wait times and improving
            overall travel experiences across cities in India and beyond.
          </motion.p>
        </AnimatedSection>

        {/* Stats Section */}
        <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                className={`rounded-2xl shadow-xl p-6 text-center border backdrop-blur-sm transition-all duration-300 parallax-element ${
                  darktheme
                    ? "bg-gray-800/80 border-gray-700/50"
                    : "bg-white/90 border-white/50"
                }`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: darktheme 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
              >
                <motion.div
                  className="flex justify-center mb-3"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </motion.div>
                <motion.div
                  className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                    darktheme
                      ? "from-blue-400 to-purple-400"
                      : "from-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: idx * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 20 
                  }}
                >
                  {stat.value}
                </motion.div>
                <div
                  className={`text-sm font-semibold ${
                    darktheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </AnimatedSection>

        {/* Features Grid */}
        <AnimatedSection className="mb-12">
          <motion.h2
            className={`text-3xl font-bold text-center mb-10 ${
              darktheme ? "text-white" : "text-gray-900"
            }`}
            variants={itemVariants}
          >
            What We Offer
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const colors = {
                blue: darktheme ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
                green: darktheme ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600",
                purple: darktheme ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600",
                yellow: darktheme ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600",
              };
              
              return (
                <motion.div
                  key={idx}
                  className={`rounded-2xl shadow-xl p-8 border backdrop-blur-sm transition-all duration-300 parallax-element ${
                    darktheme
                      ? "bg-gray-800/80 border-gray-700/50 hover:border-blue-500/50"
                      : "bg-white/90 border-white/50 hover:border-blue-500/50"
                  }`}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -5,
                    rotateX: 5,
                    rotateY: 5,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`p-3 rounded-xl ${colors[feature.color]} flex-shrink-0`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-7 h-7" />
                    </motion.div>
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
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Core Values */}
        <AnimatedSection
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm parallax-element ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <motion.div
            className="flex items-center gap-4 mb-8"
            variants={itemVariants}
          >
            <motion.div
              className={`p-3 rounded-2xl ${darktheme ? "bg-pink-500/20" : "bg-pink-100"}`}
              whileHover={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Award
                className={`w-8 h-8 ${darktheme ? "text-pink-400" : "text-pink-600"}`}
              />
            </motion.div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Our Core Values
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  className={`p-6 rounded-xl border transition-all duration-300 parallax-element ${
                    darktheme
                      ? "bg-gray-900/50 border-gray-700 hover:border-pink-500/50"
                      : "bg-gray-50 border-gray-200 hover:border-pink-500/50"
                  }`}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    rotateY: 10 
                  }}
                >
                  <motion.div
                    className="flex justify-center mb-4"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ 
                      duration: 2 + idx * 0.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Icon
                      className={`w-10 h-10 ${
                        darktheme ? "text-pink-400" : "text-pink-600"
                      }`}
                    />
                  </motion.div>
                  <h3
                    className={`text-lg font-bold mb-2 text-center ${
                      darktheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {value.name}
                  </h3>
                  <p
                    className={`text-sm font-semibold mb-3 text-center ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {value.role}
                  </p>
                  <p
                    className={`text-sm text-center ${
                      darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Technology Stack */}
        <AnimatedSection
          className={`rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border backdrop-blur-sm parallax-element ${
            darktheme
              ? "bg-gray-800/80 border-gray-700/50"
              : "bg-white/90 border-white/50"
          }`}
        >
          <motion.div
            className="flex items-center gap-4 mb-6"
            variants={itemVariants}
          >
            <motion.div
              className={`p-3 rounded-2xl ${darktheme ? "bg-green-500/20" : "bg-green-100"}`}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Globe
                className={`w-8 h-8 ${darktheme ? "text-green-400" : "text-green-600"}`}
              />
            </motion.div>
            <h2
              className={`text-3xl font-bold ${
                darktheme ? "text-white" : "text-gray-900"
              }`}
            >
              Built with Modern Technology
            </h2>
          </motion.div>
          
          <motion.p
            className={`text-lg leading-relaxed mb-6 ${
              darktheme ? "text-gray-300" : "text-gray-700"
            }`}
            variants={itemVariants}
          >
            Our platform leverages cutting-edge technologies to deliver
            exceptional performance, scalability, and reliability for millions of users:
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {technologies.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={idx}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    darktheme ? "bg-gray-900/50 hover:bg-gray-800/70" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    x: 10,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 4 + idx, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    <Icon
                      className={`w-6 h-6 ${darktheme ? "text-green-400" : "text-green-600"}`}
                    />
                  </motion.div>
                  <div>
                    <span
                      className={`font-semibold ${
                        darktheme ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {tech.name}
                    </span>
                    <p
                      className={`text-xs ${
                        darktheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {tech.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            {[
              "Cross-platform responsive design",
              "Secure JWT authentication",
              "Real-time WebSocket connections",
              "Advanced caching strategies",
              "Microservices architecture",
              "Comprehensive API documentation",
            ].map((tech, idx) => (
              <motion.div
                key={idx}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  darktheme ? "bg-gray-900/50" : "bg-gray-50"
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${darktheme ? "bg-green-400" : "bg-green-600"}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: idx * 0.2 
                  }}
                />
                <span
                  className={`font-medium ${
                    darktheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {tech}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

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
    </>
  );
};

export default AboutUs;
