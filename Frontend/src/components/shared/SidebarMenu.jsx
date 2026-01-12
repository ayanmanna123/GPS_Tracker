import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    Bell,
    Bookmark,
    CreditCard,
    ShieldCheck,
    Mail,
    Settings,
    ChevronRight
} from "lucide-react";
import { useSelector } from "react-redux";

const SidebarMenu = ({ isOpen, onClose }) => {
    const { darktheme } = useSelector((store) => store.auth);

    const menuItems = [
        { icon: <Calendar className="w-5 h-5" />, label: "Bus Schedules", color: "blue" },
        { icon: <Bell className="w-5 h-5" />, label: "Service Alerts", color: "amber" },
        { icon: <Bookmark className="w-5 h-5" />, label: "Saved Routes", color: "emerald" },
        { icon: <CreditCard className="w-5 h-5" />, label: "Fare & Tickets", color: "purple" },
        { icon: <ShieldCheck className="w-5 h-5" />, label: "Safety & Help", color: "rose" },
        { icon: <Mail className="w-5 h-5" />, label: "Contact Us", color: "sky" },
        { icon: <Settings className="w-5 h-5" />, label: "Settings", color: "slate" },
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    };

    const overlayVariants = {
        open: { opacity: 1 },
        closed: { opacity: 0 },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:z-40"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className={`fixed top-0 left-0 h-full w-80 z-[60] lg:z-50 shadow-2xl overflow-hidden ${darktheme
                                ? "bg-slate-900/90 border-r border-slate-700/50"
                                : "bg-white/90 border-r border-gray-200/50"
                            } backdrop-blur-xl`}
                    >
                        {/* Header section */}
                        <div className="p-6 flex items-center justify-between border-b border-gray-500/10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${darktheme ? "from-blue-600 to-purple-600" : "from-blue-500 to-purple-500"
                                    } text-white shadow-lg shadow-purple-500/20`}>
                                    <Settings className="w-5 h-5 animate-spin-slow" />
                                </div>
                                <h2 className={`text-xl font-extrabold ${darktheme ? "text-white" : "text-gray-800"}`}>
                                    Menu
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${darktheme ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"
                                    }`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Menu items content */}
                        <div className="p-4 space-y-2 mt-2">
                            {menuItems.map((item, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ x: 8 }}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${darktheme
                                            ? "hover:bg-slate-800/80 text-slate-300 hover:text-white"
                                            : "hover:bg-blue-50/80 text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl transition-all duration-300 ${darktheme
                                                ? "bg-slate-800 group-hover:bg-slate-700"
                                                : "bg-gray-100 group-hover:bg-blue-100"
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-semibold text-[15px]">{item.label}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ${darktheme ? "text-slate-500" : "text-blue-400"
                                        }`} />
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer / App branding */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-gray-500/10 bg-gradient-to-t from-transparent via-transparent">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-bold uppercase tracking-widest ${darktheme ? "text-slate-500" : "text-gray-400"}`}>
                                    Where is my bus
                                </span>
                            </div>
                            <p className={`text-[10px] ${darktheme ? "text-slate-600" : "text-gray-400"}`}>
                                Version 2.4.0 • Real-time Tracking System
                            </p>
                        </div>

                        {/* Decorative background glow */}
                        <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[100px] pointer-events-none opacity-20 ${darktheme ? "bg-blue-600" : "bg-purple-400"
                            }`} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SidebarMenu;
