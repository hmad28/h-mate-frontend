"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ArrowLeft, Bot, User, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  sendConsultation,
  saveConversation,
  loadConversations,
} from "@/lib/api";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { toast } from "sonner";

export default function KonsultasiPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user info and chat history on mount
  useEffect(() => {
    const initPage = async () => {
      await fetchCurrentUser();
      await loadChatHistory();
    };
    initPage();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await loadConversations(50);
      if (response.success && response.data.length > 0) {
        const formattedMessages = response.data.map((conv) => ({
          role: conv.role,
          content: conv.message,
        }));
        setMessages(formattedMessages);
      } else {
        // No history, show initial greeting
        setMessages([
          {
            role: "assistant",
            content:
              "Halo! Aku H-Mate AI Assistant. Aku siap bantu kamu eksplorasi karier impianmu. Mau tanya apa hari ini? 😊",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Show initial greeting on error
      setMessages([
        {
          role: "assistant",
          content:
            "Halo! Aku H-Mate AI Assistant. Aku siap bantu kamu eksplorasi karier impianmu. Mau tanya apa hari ini? 😊",
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Save user message to DB
      await saveConversation("user", userMessage);

      // Prepare history with user context
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system context about user at the beginning (if user info is available)
      const contextualHistory = currentUser
        ? [
            {
              role: "assistant",
              content: `[SYSTEM CONTEXT: User ini adalah ${currentUser.username}, umur ${currentUser.age} tahun. Panggil dia dengan username-nya dan sesuaikan saran karir dengan umurnya.]`,
            },
            ...history,
          ]
        : history;

      const response = await sendConsultation(userMessage, contextualHistory);

      const assistantMessage = response.data.response;

      // Save assistant response to DB
      await saveConversation("assistant", assistantMessage);

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Maaf, saat ini sedang terjadi kesalahan. Mohon coba lagi sesaat ya!",
        },
      ]);
      toast.error("Gagal menyimpan percakapan");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Memuat riwayat chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-10">
        <div className="container mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">
                Konsultasi Karier
              </h1>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tanya apa aja seputar kariermu
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                  className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-yellow-500/20 border border-yellow-500/30"
                      : "bg-slate-800/50 border border-slate-700/50"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Image
                      src="/images/h-logo.png"
                      alt="H-Mate Logo"
                      width={25}
                      height={25}
                    />
                  )}
                </motion.div>

                {/* Message Bubble */}
                <motion.div
                  className={`flex-1 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-yellow-500/10 border border-yellow-500/20 rounded-3xl rounded-tr-lg"
                      : "bg-slate-900/50 border border-slate-800/50 rounded-3xl rounded-tl-lg"
                  } px-5 py-4 backdrop-blur-sm`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {message.role === "user" ? (
                    <p className="text-slate-100 whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </p>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-yellow-400"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-3 last:mb-0 leading-relaxed text-slate-300 text-sm"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal ml-5 mb-3 space-y-2 text-slate-300"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc ml-5 mb-3 space-y-2 text-slate-300"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              className="leading-relaxed text-sm"
                              {...props}
                            />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code
                                className="bg-yellow-500/10 text-yellow-300 px-2 py-0.5 rounded-lg text-sm border border-yellow-500/20"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-slate-800/50 p-4 rounded-xl text-sm overflow-x-auto border border-slate-700/50 text-slate-300"
                                {...props}
                              />
                            ),
                          em: ({ node, ...props }) => (
                            <em className="italic text-slate-400" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-xl font-bold text-white mb-3 mt-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-lg font-bold text-white mb-2 mt-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-base font-bold text-white mb-2 mt-2"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <motion.div
                className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-800/50 border border-slate-700/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Bot className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl rounded-tl-lg px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm">Sedang berpikir...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 sticky bottom-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <motion.div
              className="flex-1 relative"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Tanya seputar karier, skill, atau edukasi..."
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:bg-slate-800/70 transition-all text-sm"
                disabled={isLoading}
              />
            </motion.div>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:bg-slate-800/30 disabled:border-slate-700/30 disabled:text-slate-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[56px]"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-600 mt-3"
          >
            Tekan Enter untuk mengirim
          </motion.p>
        </div>
      </div>
    </div>
  );
}
