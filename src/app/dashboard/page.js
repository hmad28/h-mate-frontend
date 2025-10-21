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
  Calendar,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
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

  const stats = [
    {
      icon: TrendingUp,
      label: "Progress",
      value: "0%",
      color: "text-blue-400",
    },
    {
      icon: Calendar,
      label: "Hari Aktif",
      value: "1",
      color: "text-green-400",
    },
    { icon: Award, label: "Pencapaian", value: "0", color: "text-yellow-400" },
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
          className="flex items-center justify-between mb-12"
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
            className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-white transition backdrop-blur-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Akses Cepat</h2>
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

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-8 shadow-xl"
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
                Member sejak{" "}
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
