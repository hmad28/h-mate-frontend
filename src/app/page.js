"use client";

import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, Globe, Zap } from "lucide-react";
import {
  MessageSquare,
  ArrowRight,
  ClipboardList,
  Map,
  Sparkles,
  User,
  LogIn,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import AiRatingSection from "@/components/AiRatingSection";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import VisitorTracker from "@/components/VisitorTracker";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.6,
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

  const { user, loading, isLoggedIn } = useAuth();

  // Di dalam component
  const [profileId, setProfileId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      setLoadingProfile(true);

      fetch(`/api/ratings?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setProfileId(data.data.id); // ✅ Ini profileId yang valid
            console.log("✅ Profile ID loaded:", data.data.id);
          } else {
            console.log("⚠️ No profile found:", data.error);
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching profile:", err);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, [isLoggedIn, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      
      <VisitorTracker />
      
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-5 pt-12 pb-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Top Badge */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <a
            href="https://www.hammad.biz.id/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30 text-yellow-400 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-yellow-500/10"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(234, 179, 8, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span>by Hammad</span>
            </motion.div>
          </a>
        </motion.div>

        {/* Main Heading */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div className="flex justify-center mb-4" style={{ y }}>
            <Image
              src="/images/Mate.png"
              alt="H-Mate Logo"
              width={350}
              height={120}
              className="inline-block"
            />
          </motion.div>
          <motion.div
            className="h-1.5 w-32 mx-auto bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-2xl md:text-3xl text-slate-200 text-center mb-4 max-w-3xl mx-auto font-bold"
        >
          Kenali dirimu, wujudkan karier impianmu
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="md:text-lg text-slate-400 text-center mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Platform AI terdepan yang membantu generasi muda Indonesia menemukan
          dan meraih karier ideal di era digital
        </motion.p>

        {/* Auth CTA Banner / Rating Section - Conditional */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-12">
          {loading ? (
            // Loading State
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                <span className="text-slate-400">Memuat...</span>
              </div>
            </div>
          ) : isLoggedIn ? (
            // ✅ Langsung show rating kalo login
            <AiRatingSection userId={user?.id} />
          ) : (
            // Logged Out - Show Auth CTA
            <motion.div
              className="relative bg-gradient-to-br from-yellow-500/15 via-slate-900/50 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6 md:p-8 overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 opacity-50 blur-xl" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                      Best Experience
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Buat akun untuk pengalaman terbaik
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base">
                    Simpan progres, akses hasil tes kapan saja, dan dapatkan
                    rekomendasi personal
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <motion.a
                    href="/register"
                    className="group relative bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 transition-all"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 40px rgba(234, 179, 8, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-5 h-5" />
                    <span>Daftar Gratis</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>

                  <motion.a
                    href="/login"
                    className="bg-slate-800/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
                    whileHover={{
                      scale: 1.05,
                      borderColor: "rgba(234, 179, 8, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8 sm:mb-12 px-4"
        >
          {[
            {
              icon: Zap,
              label: "Teknologi kecerdasan buatan terdepan",
              value: "AI-Powered",
            },
            {
              icon: Heart,
              label: "Terbuka untuk semua pelajar Indonesia",
              value: "Gratis",
            },
            { icon: Shield, label: "Privasi Terlindungi", value: "100% Save" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
              whileHover={{ y: -5, borderColor: "rgba(234, 179, 8, 0.3)" }}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating CTA hint */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="mt-10 flex justify-center"
        >
          <div className="text-slate-500 text-sm">
            ↓ Pilih layanan untuk memulai
          </div>
        </motion.div>

        {/* Service Cards */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12"
        >
          {/* Card 1: Tes Minat */}
          <motion.a
            href="/tes-minat"
            className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 overflow-hidden cursor-pointer"
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: -10, scale: 1.1 }}
              >
                <ClipboardList className="w-8 h-8 text-yellow-400" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                Tes Minat Bakat
              </h3>

              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Jawab pertanyaan interaktif dan dapatkan rekomendasi karier yang
                cocok dengan kepribadian dan minatmu
              </p>

              <div className="flex items-center text-yellow-400 font-semibold">
                <span>Mulai Tes</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.a>

          {/* Card 2: Roadmap */}
          <motion.a
            href="/roadmap"
            className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 overflow-hidden cursor-pointer"
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Map className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <span className="text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-full font-bold uppercase">
                  New
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                Roadmap Karier
              </h3>

              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Dapatkan panduan lengkap step-by-step untuk mencapai karier
                impianmu dengan AI
              </p>

              <div className="flex items-center text-yellow-400 font-semibold">
                <span>Mulai Roadmap</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.a>

          {/* Card 3: Konsultasi */}
          <motion.a
            href="/konsultasi"
            className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 overflow-hidden cursor-pointer"
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: -10, scale: 1.1 }}
              >
                <MessageSquare className="w-8 h-8 text-yellow-400" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                Konsultasi Karier
              </h3>

              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Tanya jawab langsung dengan AI tentang pilihan karier, skill
                yang dibutuhkan, dan tips membangun portfolio
              </p>

              <div className="flex items-center text-yellow-400 font-semibold">
                <span>Mulai Konsultasi</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.a>
        </motion.div>

        {/* Bottom Note */}
        <motion.div variants={itemVariants} className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Atau{" "}
            <span className="text-yellow-400 hover:text-yellow-300 underline font-semibold">
              mulai tanpa akun
            </span>{" "}
            untuk mencoba layanan kami
          </p>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
}
