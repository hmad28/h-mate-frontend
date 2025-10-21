"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Globe, Zap } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-yellow-400/20 bg-slate-950/80 backdrop-blur-xl">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto">
          {/* Top Section - Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/images/Mate.png"
                alt="H-Mate Logo"
                width={150}
                height={100}
                className="inline-block"
              />
            </div>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Platform AI untuk membimbing perjalanan karir Anda menuju masa
              depan yang cerah
            </p>
          </motion.div>

          {/* Middle Section - Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Feature 1 */}
            <div className="text-center p-4 rounded-lg bg-slate-900/50 backdrop-blur-sm border border-yellow-400/10 hover:border-yellow-400/30 transition-all group">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-slate-300 font-medium text-sm mb-1">
                AI-Powered
              </h4>
              <p className="text-slate-500 text-xs">
                Teknologi kecerdasan buatan terdepan
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-4 rounded-lg bg-slate-900/50 backdrop-blur-sm border border-yellow-400/10 hover:border-yellow-400/30 transition-all group">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-slate-300 font-medium text-sm mb-1">
                Gratis & Terbuka
              </h4>
              <p className="text-slate-500 text-xs">
                Untuk semua pelajar Indonesia
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-4 rounded-lg bg-slate-900/50 backdrop-blur-sm border border-yellow-400/10 hover:border-yellow-400/30 transition-all group">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-slate-300 font-medium text-sm mb-1">
                Untuk Indonesia
              </h4>
              <p className="text-slate-500 text-xs">
                Mendukung Indonesia Emas 2045
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent mb-8" />

          {/* Bottom Section - Credits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center space-y-3"
          >
            {/* Made by */}
            <motion.p
              className="text-slate-400 text-sm flex items-center justify-center gap-2 flex-wrap"
              whileHover={{ scale: 1.02 }}
            >
              Dibuat oleh <span className="text-yellow-400 font-semibold">Hammad</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                untuk Indonesia Emas 2045
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🇮🇩
                </motion.span>
              </span>
            </motion.p>

            {/* Powered by */}
            <motion.div
              className="flex items-center justify-center gap-2 text-slate-800 text-xs"
              whileHover={{ scale: 1.02 }}
            >
              {/* <Sparkles className="w-3 h-3 text-yellow-400" /> */}
              <span>Powered by Gemini AI</span>
              <span className="text-yellow-400 font-medium"></span>
            </motion.div>

            {/* Copyright */}
            <p className="text-slate-600 text-xs">
              © {currentYear} H-Mate. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
    </footer>
  );
}
