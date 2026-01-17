import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const SupportChat = () => {
  const { darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: t("support.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((p) => [...p, { sender: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/support/ask`,
        { question: userText }
      );

      setTimeout(() => {
        setMessages((p) => [...p, { sender: "bot", text: res.data.answer }]);
        setIsTyping(false);
      }, 600);
    } catch {
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          { sender: "bot", text: t("support.errorMessage") },
        ]);
        setIsTyping(false);
      }, 600);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full 
        bg-gradient-to-br from-purple-500 to-pink-500
        flex items-center justify-center
        shadow-[0_0_35px_rgba(168,85,247,0.7)]
        hover:scale-110 transition-all z-50"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-[380px]
      rounded-[28px] overflow-hidden z-50
      shadow-[0_25px_70px_-20px_rgba(0,0,0,0.7)]
      transition-all duration-500
      ${isMinimized ? "h-16" : "h-[560px]"}
      ${
        darktheme
          ? "bg-gray-900/80 backdrop-blur-2xl border border-white/10"
          : "bg-white/80 backdrop-blur-2xl border border-black/10"
      }`}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between
        bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
        shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {t("support.title")}
            </h3>
            <p className="text-xs text-white/70">
              {t("support.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            className={`flex-1 px-4 py-6 space-y-4 overflow-y-auto
            ${
              darktheme
                ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-b from-indigo-50 via-white to-purple-50"
            }`}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 text-sm
                  ${
                    m.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-[18px] rounded-br-[6px]"
                      : darktheme
                      ? "bg-white/10 text-gray-100 rounded-[18px] rounded-bl-[6px]"
                      : "bg-white text-gray-800 rounded-[18px] rounded-bl-[6px]"
                  }
                  shadow-md`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-sm opacity-70">typing…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`px-4 py-3 flex gap-3 items-center
            ${
              darktheme
                ? "bg-gray-900/70 border-t border-white/10"
                : "bg-white/70 border-t border-black/10"
            } backdrop-blur-xl`}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t("support.inputPlaceholder")}
              className="flex-grow px-5 py-3 rounded-full text-sm
              bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <button
              onClick={sendMessage}
              className="w-12 h-12 rounded-full
              bg-gradient-to-br from-purple-500 to-pink-500
              flex items-center justify-center
              hover:scale-110 transition-all"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportChat;
