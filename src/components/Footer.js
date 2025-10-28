"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content - Stacked Vertically */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            {/* Made by Section */}
            <div className="space-y-2 text-xs">
              <motion.div
                className="flex items-center justify-center gap-2 text-slate-300 text-base"
                whileHover={{ scale: 1.02 }}
              >
                <span>by</span>
                <a
                  href="https://www.hammad.biz.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors"
                >
                  Hammad
                </a>
                <span>• untuk Indonesia Emas 2045</span>
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-base"
                >
                  🇮🇩
                </motion.span>
              </motion.div>

              {/* Indonesia Tag */}
              <motion.div
                className="flex items-center justify-center gap-2 text-slate-400 text-sm"
                whileHover={{ scale: 1.05 }}
              ></motion.div>
            </div>

            {/* Divider Line */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-slate-700" />
              <Sparkles className="w-3 h-3 text-yellow-400/60" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-slate-700" />
            </div>

            {/* Powered by & Copyright */}
            <div className="space-y-2">
              {/* <motion.p
                className="text-slate-500 text-sm font-medium"
                whileHover={{ scale: 1.02, color: "rgb(148 163 184)" }}
              >
                Powered by <span className="text-yellow-400/80">Gemini AI</span>
              </motion.p> */}

              <p className="text-slate-600 text-xs">
                © {currentYear} H-Mate. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
    </footer>
  );
}
