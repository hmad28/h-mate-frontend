"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Target, Sparkles, ArrowRight, Zap, ClipboardList, Map, Heart, Globe } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
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

      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-5 pt-16 pb-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Badge */}
        <Link href="https://www.hammad.biz.id/">
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span>by Hammad</span>
            </motion.div>
          </motion.div>
        </Link>

        {/* Heading */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <motion.h1
            className="text-6xl md:text-7xl font-black mb-3 tracking-tight"
            style={{ y }}
          >
            {/* <span className="text-white">H</span>
            <span className="text-yellow-400">-</span>
            <span className="text-white">Mate</span> */}
            <Image
              src="/images/Mate.png"
              alt="H-Mate Logo"
              width={300}
              height={100}
              className="inline-block ml-2 -mt-4"
            />
          </motion.h1>
          <motion.div
            className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-300 text-center mb-3 max-w-2xl mx-auto font-medium"
        >
          Kenali dirimu, temukan karier impianmu
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-center mb-12 max-w-xl mx-auto leading-relaxed"
        >
          Platform AI yang membantu generasi muda Indonesia menemukan arah
          karier yang tepat di era digital
        </motion.p>

        {/* Floating CTA hint */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="mt-12 flex justify-center"
        >
          <div className="text-slate-500 text-sm">
            ↓ Pilih layanan untuk memulai
          </div>
        </motion.div>

        {/* CTA Cards */}
        <motion.div
          variants={itemVariants}
          className="space-y-4 mt-10 flex flex-col md:flex-row max-w-md md:max-w-5xl md:gap-4 mx-auto"
        >
          {/* Card 1: Tes Minat */}
          <Link href="/tes-minat">
            <motion.div
              className="group relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              {/* Animated border on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                initial={false}
                whileHover={{
                  boxShadow: "0 0 0 1px rgba(234, 179, 8, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <ClipboardList className="w-6 h-6 text-yellow-400" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    Tes Minat Bakat
                  </h3>

                  <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                    Jawab pertanyaan interaktif dan dapatkan rekomendasi karier
                    yang cocok dengan kepribadian dan minatmu
                  </p>

                  <div className="flex items-center text-yellow-400 text-sm font-semibold">
                    Mulai Tes
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Roadmap NEW! */}
          <Link href="/roadmap">
            <motion.div
              className="group relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 overflow-hidden cursor-pointer"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              {/* Animated border on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                initial={false}
                whileHover={{
                  boxShadow: "0 0 0 1px rgba(234, 179, 8, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Map className="w-6 h-6 text-yellow-400" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    Roadmap Karier
                    <span className="ml-2 text-xs bg-slate-900/50 border text-yellow-400 px-2 py-1 rounded-full">
                      NEW
                    </span>
                  </h3>

                  <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                    Dapatkan panduan lengkap step-by-step untuk mencapai karier
                    impianmu dengan AI
                  </p>

                  <div className="flex items-center text-yellow-400 text-sm font-semibold">
                    Mulai Roadmap
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Konsultasi */}
          <Link href="/konsultasi">
            <motion.div
              className="group relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              {/* Animated border on hover */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                initial={false}
                whileHover={{
                  boxShadow: "0 0 0 1px rgba(234, 179, 8, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative z-10 flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <MessageSquare className="w-6 h-6 text-yellow-400" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    Konsultasi Karier
                  </h3>

                  <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                    Tanya jawab langsung dengan AI tentang pilihan karier, skill
                    yang dibutuhkan, dan tips membangun portfolio
                  </p>

                  <div className="flex items-center text-yellow-400 text-sm font-semibold">
                    Mulai Konsultasi
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
}
