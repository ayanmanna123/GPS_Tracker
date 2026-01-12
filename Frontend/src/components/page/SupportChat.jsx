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
import { useApiCall } from "../../hooks/useApiCall";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // API hook for asking support bot
  const { loading: askingBot, execute: askBot } = useApiCall({
    apiFunction: (question) =>
      axios.post(`${import.meta.env.VITE_BASE_URL}/support/ask`, { question }),
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: (data) => {
      const botMsg = { sender: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: t("support.errorMessage") },
      ]);
    },
  });

  const sendMessage = async () => {
    if (!input.trim() || askingBot) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const question = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/support/ask`,
        { question: input },
      );
      setTimeout(() => {
        const botMsg = { sender: "bot", text: res.data.answer };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 500);
    } catch (err) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: t("support.errorMessage"),
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 ${
          darktheme
            ? "bg-gradient-to-br from-blue-600 to-purple-600"
            : "bg-gradient-to-br from-blue-500 to-purple-500"
        }`}
        style={{
          animation: "bounce 2s infinite",
        }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <style jsx>{`
          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-[400px] shadow-2xl rounded-3xl border overflow-hidden z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } ${
        darktheme
          ? "bg-gray-800/95 border-gray-700/50 backdrop-blur-lg"
          : "bg-white/95 border-gray-200/50 backdrop-blur-lg"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 flex items-center justify-between ${
          darktheme
            ? "bg-gradient-to-r from-blue-600 to-purple-600"
            : "bg-gradient-to-r from-blue-500 to-purple-500"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-white">{t("support.title")}</h3>
            <p className="text-xs text-white/80">{t("support.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            className={`h-[440px] overflow-y-auto p-4 ${
              darktheme
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
            }`}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-4 flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[85%] ${
                    m.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      m.sender === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-500"
                        : darktheme
                          ? "bg-gradient-to-br from-gray-700 to-gray-600"
                          : "bg-gradient-to-br from-gray-200 to-gray-300"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot
                        className={`w-4 h-4 ${
                          darktheme ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg transition-all ${
                      m.sender === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-br-sm"
                        : darktheme
                          ? "bg-gray-700/90 text-gray-200 border border-gray-600 rounded-bl-sm backdrop-blur-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm backdrop-blur-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>
                    <span
                      className={`text-xs mt-1 block ${
                        m.sender === "user"
                          ? "text-white/70"
                          : darktheme
                            ? "text-gray-500"
                            : "text-gray-400"
                      }`}
                    >
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 mb-4 animate-fade-in">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darktheme
                      ? "bg-gradient-to-br from-gray-700 to-gray-600"
                      : "bg-gradient-to-br from-gray-200 to-gray-300"
                  }`}
                >
                  <Bot
                    className={`w-4 h-4 ${
                      darktheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl rounded-bl-sm ${
                    darktheme
                      ? "bg-gray-700/90 border border-gray-600"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        darktheme ? "bg-gray-400" : "bg-gray-600"
                      }`}
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        darktheme ? "bg-gray-400" : "bg-gray-600"
                      }`}
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        darktheme ? "bg-gray-400" : "bg-gray-600"
                      }`}
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`flex border-t p-4 gap-2 ${
              darktheme
                ? "bg-gray-800/95 border-gray-700"
                : "bg-white/95 border-gray-200"
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("support.inputPlaceholder")}
              className={`flex-grow px-4 py-3 rounded-xl border-2 focus:ring-4 focus:outline-none transition-all duration-300 ${
                darktheme
                  ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-5 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                input.trim()
                  ? darktheme
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-105"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105"
                  : darktheme
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SupportChat;
