"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Target, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  // Variants untuk animasi stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-4 pt-20 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini AI</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          KarirKu
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-600 text-center mb-4 max-w-2xl mx-auto"
        >
          Kenali dirimu, temukan karier impianmu
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-gray-500 text-center mb-12 max-w-xl mx-auto"
        >
          Platform AI yang membantu generasi muda Indonesia menemukan arah
          karier yang tepat di era digital
        </motion.p>

        {/* CTA Cards */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* Card 1: Konsultasi */}
          <Link href="/konsultasi">
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  Konsultasi Karier
                </h3>

                <p className="text-gray-600 mb-4">
                  Tanya jawab langsung dengan AI tentang pilihan karier, skill
                  yang dibutuhkan, dan tips membangun portfolio
                </p>

                <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Mulai Konsultasi
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Tes Minat */}
          <Link href="/tes-minat">
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                  <Target className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  Tes Minat Bakat
                </h3>

                <p className="text-gray-600 mb-4">
                  Jawab pertanyaan interaktif dan dapatkan rekomendasi karier
                  yang cocok dengan kepribadian dan minatmu
                </p>

                <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                  Mulai Tes
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { label: "AI-Powered", value: "100%" },
            { label: "Gratis", value: "∞" },
            { label: "Personalized", value: "✨" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Dibuat untuk Indonesia Emas 2045 🇮🇩 | Powered by Gemini AI</p>
      </footer>
    </div>
  );
}
