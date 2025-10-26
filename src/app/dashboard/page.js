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
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchProfile();
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
      icon: MessageSquare,
      title: "Konsultasi AI",
      description: "Konsultasi karir dengan AI",
      href: "/konsultasi",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Map,
      title: "Roadmap",
      description: "Lihat roadmap pembelajaran",
      href: "/roadmap",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: ClipboardList,
      title: "Tes Minat",
      description: "Ikuti tes minat & bakat",
      href: "/tes-minat",
      color: "from-green-500 to-emerald-500",
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

        {/* Stats Card - REAL PROGRESS */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Progress Belajar</p>
                <p className="text-3xl font-bold text-white">
                  {profileData?.stats?.overallProgress || 0}%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {profileData?.stats?.totalRoadmaps > 0
                    ? `${profileData.stats.totalRoadmaps} roadmap aktif`
                    : "Mulai roadmap untuk tracking progress"}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </motion.div>
        </motion.div> */}

        {/* Saved Roadmaps - IF EXISTS */}
        {profileData?.roadmaps && profileData.roadmaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Roadmap Kamu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.roadmaps.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={item.roadmap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                  {item.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{item.progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${item.progress.progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

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

            {profileData.roadmaps.length > 4 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                +{profileData.roadmaps.length - 4} roadmap lainnya
              </p>
            )}
          </motion.div>
        )}

        {/* Career Summary Card - IF EXISTS */}
        {profileData?.profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Career Match Kamu
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </h2>
                  <p className="text-slate-300 text-sm mb-4">
                    {profileData.profile.personalityTraits?.type ||
                      "Personality type kamu"}
                  </p>

                  {profileData.profile.careerMatches &&
                    profileData.profile.careerMatches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 mb-2">
                          Top Career Matches:
                        </p>
                        {profileData.profile.careerMatches
                          .slice(0, 3)
                          .map((career, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
                            >
                              <span className="text-sm text-white font-medium">
                                {career.title}
                              </span>
                              <span className="text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">
                                {career.match_percentage}% Match
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                  <p className="text-xs text-slate-500 mt-4">
                    💡 AI Confidence:{" "}
                    {profileData.profile.aiConfidenceScore || 0}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Latest Test Result Card - IF EXISTS */}
        {profileData?.latestTests && profileData.latestTests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-green-400" />
                Hasil Rekomendasi Karir Terakhir
              </h2>

              {(() => {
                const latestTest = profileData.latestTests[0];
                const careers =
                  latestTest.aiAnalysis?.recommended_careers || [];

                if (careers.length === 0) return null;

                return (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-3">
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

                    {careers.slice(0, 5).map((career, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 hover:border-green-500/30 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-semibold text-white">
                              {career.title}
                            </span>
                            <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-1 rounded-full">
                              {career.match_percentage}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {career.reason}
                          </p>
                        </div>
                      </div>
                    ))}

                    {careers.length > 5 && (
                      <p className="text-xs text-slate-500 text-center mt-2">
                        +{careers.length - 5} karir lainnya
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

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
        {profileData?.latestTests && profileData.latestTests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Aktivitas Terakhir
            </h2>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl">
              <div className="space-y-4">
                {profileData.latestTests.map((test, idx) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {test.testType === "minat_bakat"
                            ? "Tes Minat Bakat"
                            : "Mini Test"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(test.createdAt).toLocaleDateString(
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
                    <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">
                      Selesai
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
      </div>
    </div>
  );
}
