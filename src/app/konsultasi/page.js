"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ArrowLeft, Bot, User } from "lucide-react";
import Link from "next/link";
import { sendConsultation } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function KonsultasiPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo! Aku KarirKu AI Assistant. Aku siap bantu kamu eksplorasi karier impianmu. Mau tanya apa hari ini? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll ke bawah setiap ada message baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Tambah user message ke state
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Kirim ke backend dengan history
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendConsultation(userMessage, history);

      // Tambah AI response ke state
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response.data.response,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Maaf, terjadi kesalahan. Coba lagi ya! Pastikan backend sudah running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Konsultasi Karier
            </h1>
            <p className="text-sm text-gray-500">
              Tanya apa aja seputar kariermu
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-blue-500"
                      : "bg-gradient-to-br from-purple-500 to-blue-500"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-2xl rounded-tr-md"
                      : "bg-white text-gray-800 rounded-2xl rounded-tl-md shadow-sm"
                  } px-4 py-3`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          // Bold text styling
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-purple-700"
                              {...props}
                            />
                          ),
                          // Paragraph styling
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-3 last:mb-0 leading-relaxed"
                              {...props}
                            />
                          ),
                          // Ordered list (1. 2. 3.)
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal ml-5 mb-3 space-y-1"
                              {...props}
                            />
                          ),
                          // Unordered list (bullets)
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc ml-5 mb-3 space-y-1"
                              {...props}
                            />
                          ),
                          // List items
                          li: ({ node, ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          // Code blocks (jika ada)
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code
                                className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-sm"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto"
                                {...props}
                              />
                            ),
                          // Emphasis (italic)
                          em: ({ node, ...props }) => (
                            <em className="italic text-gray-700" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md shadow-sm px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sedang berpikir...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya seputar karier, skill, atau edukasi..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
