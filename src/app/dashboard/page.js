"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  User,
  MessageSquare,
  Map,
  ClipboardList,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Award,
  RefreshCw,
  Brain,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AiRatingSection from "@/components/AiRatingSection"; // sesuaikan path

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchProfile();
    fetchAiSummary();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    try {
      const res = await fetch("/api/profile/ai-summary");
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.data);
      }
    } catch (error) {
      console.log("No AI summary yet");
    }
  };

  const generateAiSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/profile/ai-summary", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.data);
        toast.success("AI Summary berhasil di-generate! ✨");
      } else {
        toast.error("Gagal generate AI summary");
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(
        new CustomEvent("authChange", { detail: { action: "logout" } })
      );
      toast.success("Logout berhasil! 👋");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: ClipboardList,
      title: "Tes Minat",
      description: "Ikuti tes minat & bakat",
      href: "/tes-minat",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Map,
      title: "Roadmap",
      description: "Lihat roadmap pembelajaran",
      href: "/roadmap",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageSquare,
      title: "Konsultasi AI",
      description: "Konsultasi karir dengan AI",
      href: "/konsultasi",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Halo, <span className="text-yellow-400">{user?.username}</span>!
              👋
            </h1>
            <p className="text-slate-400">
              Selamat datang kembali di dashboard kamu
            </p>
          </div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-2 py-1 md:px-6 md:py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-white transition backdrop-blur-sm"
          >
            <LogOut className="w-3 h-3 md:w-5 md:h-5" />
            <span className="text-xs md:text-base">Logout</span>
          </motion.button>
        </motion.div>

        {/* AI SUMMARY CARD - FEATURED */}
        {aiSummary ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 overflow-hidden shadow-2xl">
              {/* Animated Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-blue-500/20 opacity-50 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Brain className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        AI Career Insights
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </h2>
                      <p className="text-xs text-slate-400">
                        Diperbarui{" "}
                        {new Date(
                          aiSummary.summaryGeneratedAt || Date.now()
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    onClick={generateAiSummary}
                    disabled={summaryLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        summaryLoading ? "animate-spin" : ""
                      }`}
                    />
                    <span className="text-sm hidden sm:inline">Refresh</span>
                  </motion.button>
                </div>

                {/* Overall Summary */}
                <div className="mb-6 p-5 bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                  <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                    {aiSummary.overallSummary}
                  </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Personality */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Personality
                      </h3>
                    </div>
                    <p className="text-purple-400 font-bold text-base sm:text-lg mb-2">
                      {aiSummary.personality.type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aiSummary.personality.traits
                        .slice(0, 3)
                        .map((trait, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                    </div>
                  </motion.div>

                  {/* Career Alignment */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Career Fit
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-green-400 font-bold text-2xl sm:text-3xl">
                        {aiSummary.careerAlignment.score}
                      </span>
                      <span className="text-slate-400 text-sm">/100</span>
                    </div>
                    <p className="text-green-400 text-sm font-medium">
                      {aiSummary.careerAlignment.status}
                    </p>
                  </motion.div>

                  {/* Activity Level */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Journey
                      </h3>
                    </div>
                    <p className="text-blue-400 font-bold text-base sm:text-lg mb-2">
                      {aiSummary.activityLevel}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Stage:{" "}
                      <span className="text-blue-300">
                        {aiSummary.journeyStage}
                      </span>
                    </p>
                  </motion.div>
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Kekuatan Kamu
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {aiSummary.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-300"
                        >
                          <span className="text-yellow-400 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <h3 className="font-semibold text-white text-sm">
                        Area Pengembangan
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {aiSummary.areasToImprove.map((area, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-300"
                        >
                          <span className="text-orange-400 mt-0.5">→</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Top Career Matches */}
                {aiSummary.topCareerMatches &&
                  aiSummary.topCareerMatches.length > 0 && (
                    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-white text-sm">
                          Top Career Matches
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {aiSummary.topCareerMatches.map((career, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm">
                                {career.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {career.reason}
                              </p>
                            </div>
                            <span className="text-yellow-400 font-bold text-lg ml-4 flex-shrink-0">
                              {career.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Rocket className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white text-sm">
                      Langkah Selanjutnya
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {aiSummary.nextSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-200"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Motivation Message */}
                <div className="text-center p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-slate-200 italic text-base sm:text-lg leading-relaxed">
                    💪 {aiSummary.motivation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Generate AI Summary CTA
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-br from-yellow-500/10 to-purple-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 text-center">
              <Brain className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Dapatkan AI Career Insights
              </h3>
              <p className="text-slate-400 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                Biarkan AI menganalisis perjalanan kariermu dan memberikan
                insight personal berdasarkan aktivitas, tes, dan roadmap yang
                kamu buat
              </p>
              <motion.button
                onClick={generateAiSummary}
                disabled={summaryLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 rounded-xl font-bold shadow-lg hover:shadow-yellow-400/50 transition disabled:opacity-50"
              >
                {summaryLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Insights</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Saved Roadmaps - IF EXISTS */}
        {profileData?.roadmaps && profileData.roadmaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="my-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Roadmap Kamu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.roadmaps.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={item.roadmap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl hover:border-purple-500/30 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {item.roadmap.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Target: {item.roadmap.targetRole}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.roadmap.currentStatus === "pelajar"
                          ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                          : "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                      }`}
                    >
                      {item.roadmap.currentStatus === "pelajar"
                        ? "Pelajar"
                        : "Profesional"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.roadmap.estimatedTime || "No estimate"}</span>
                    <span>
                      {new Date(item.roadmap.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <Link href={`/roadmap/${item.roadmap.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-500/30 transition"
                    >
                      Lihat Detail
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Career Recommendations Card - IF EXISTS */}
        {profileData?.latestTests &&
          profileData.latestTests.length > 0 &&
          (() => {
            const latestTest = profileData.latestTests[0];
            const careers = latestTest.aiAnalysis?.recommended_careers || [];

            if (careers.length === 0) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6 shadow-xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        Rekomendasi Karir Untukmu
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Dari tes minat bakat -{" "}
                        {new Date(latestTest.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {careers.slice(0, 5).map((career, idx) => (
                      <motion.button
                        key={idx}
                        onClick={async () => {
                          try {
                            toast.loading(
                              `Membuat roadmap untuk ${career.title}...`
                            );

                            const roadmapResponse = await fetch(
                              `${
                                process.env.NEXT_PUBLIC_API_URL ||
                                "http://localhost:3000"
                              }/api/roadmap/generate`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  targetRole: career.title,
                                  currentStatus:
                                    user?.age <= 23 ? "pelajar" : "profesional",
                                  hasGoal: true,
                                }),
                              }
                            );

                            if (!roadmapResponse.ok) {
                              throw new Error("Gagal generate roadmap");
                            }

                            const roadmapData = await roadmapResponse.json();

                            const saveResponse = await fetch(
                              "/api/roadmaps/save",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  title: roadmapData.data.title,
                                  targetRole: career.title,
                                  currentStatus:
                                    user?.age <= 23 ? "pelajar" : "profesional",
                                  roadmapData: roadmapData.data,
                                  estimatedTime:
                                    roadmapData.data.estimatedTime ||
                                    roadmapData.data.totalDuration,
                                }),
                              }
                            );

                            if (!saveResponse.ok) {
                              throw new Error("Gagal save roadmap");
                            }

                            const savedRoadmap = await saveResponse.json();

                            toast.dismiss();
                            toast.success("Roadmap berhasil dibuat! 🎉");
                            router.push(`/roadmap/${savedRoadmap.data.id}`);
                          } catch (error) {
                            toast.dismiss();
                            toast.error("Gagal membuat roadmap. Coba lagi!");
                            console.error("Error:", error);
                          }
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 hover:border-yellow-500/50 hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-base font-semibold text-white group-hover:text-yellow-400 transition truncate">
                              {career.title}
                            </span>
                            <span className="text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full flex-shrink-0">
                              {career.match_percentage}% Match
                            </span>
                          </div>
                          <motion.div
                            className="text-slate-600 group-hover:text-yellow-400 transition flex-shrink-0 ml-2"
                            whileHover={{ x: 5 }}
                          >
                            →
                          </motion.div>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition line-clamp-2">
                          {career.reason}
                        </p>
                        <p className="text-xs text-yellow-400/70 mt-2 opacity-0 group-hover:opacity-100 transition">
                          Klik untuk generate roadmap →
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  {profileData.profile?.aiConfidenceScore && (
                    <p className="text-xs text-slate-500 mt-4 text-center">
                      💡 AI Confidence: {profileData.profile.aiConfidenceScore}%
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })()}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Link
                  href={action.href}
                  className="block h-full bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 hover:border-yellow-400/50 transition shadow-xl group"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${action.color} rounded-lg mb-4 group-hover:scale-110 transition`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition">
                    {action.title}
                  </h3>
                  <p className="text-slate-400">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - IF EXISTS */}
        {profileData?.recentActivities &&
          profileData.recentActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Aktivitas Terakhir
              </h2>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl">
                <div className="space-y-4">
                  {profileData.recentActivities.map((activity) => {
                    const isTest = activity.type === "test";
                    const isRoadmap = activity.type === "roadmap";

                    const Icon = isTest ? ClipboardList : Map;
                    const bgColor = isTest
                      ? "bg-green-500/20 border-green-500/30"
                      : "bg-purple-500/20 border-purple-500/30";
                    const iconColor = isTest
                      ? "text-green-400"
                      : "text-purple-400";

                    return (
                      <div
                        key={`${activity.type}-${activity.id}`}
                        className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${bgColor} border rounded-lg flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {isTest
                                ? activity.testType === "minat_bakat"
                                  ? "Tes Minat Bakat"
                                  : "Mini Test"
                                : activity.title || "Roadmap Karir"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(activity.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {user?.username}
              </h3>
              <p className="text-slate-400">
                {user?.age} tahun • Member sejak{" "}
                {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                  "id-ID",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Rating Section */}
        {aiSummary && user && profileData?.profile?.id && (
          <AiRatingSection
            userId={user.id}
            profileId={profileData.profile.id}
          />
        )}
      </div>
    </div>
  );
}
