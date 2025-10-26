"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  MessageSquare,
  Target,
  Map,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, isLoggedIn, logout } = useAuth();

  const navigation = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Konsultasi", href: "/konsultasi", icon: MessageSquare },
    { name: "Tes Minat", href: "/tes-minat", icon: Target },
    { name: "Roadmap", href: "/roadmap", icon: Map },
  ];

  const isActive = (href) => pathname === href;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil! 👋");
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  return (
    <>
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
        />
      </div>

      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-yellow-400/20 shadow-lg shadow-yellow-400/5">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                {/* Logo Icon */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-yellow-400/30">
                  <Image
                    src="/images/h-logo.png"
                    alt="H-Mate Logo"
                    width={32}
                    height={40}
                    className="absolute inset-0 m-auto bg-slate-900 rounded-lg"
                  />
                </div>
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-yellow-400 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  <Image
                    src="/images/Mate-aja.png"
                    alt="H-Mate Tagline"
                    width={80}
                    height={20}
                    className="inline-block -mt-1"
                  />
                </span>
                <span className="text-[10px] sm:text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent hidden sm:block">
                  Your Digital Mentor
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {false && (
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        active
                          ? "text-yellow-400"
                          : "text-slate-300 hover:text-yellow-400 hover:bg-yellow-400/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}

                      {/* Active indicator with glow */}
                      {active && (
                        <>
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 bg-yellow-400/5 rounded-lg"
                            layoutId="activeTabBg"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {loading ? (
                // Loading State
                <div className="flex items-center gap-2 px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                </div>
              ) : isLoggedIn ? (
                // Logged In State - Dashboard & Logout
                <>
                  <Link href="/dashboard" className="hidden sm:block">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 text-yellow-400 font-medium rounded-lg hover:bg-yellow-400/10 transition-all border border-yellow-400/20 hover:border-yellow-400/40"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </motion.button>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <LogOut className="w-4 h-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">
                      Logout
                    </span>
                  </motion.button>
                </>
              ) : (
                // Logged Out State - Login & Register
                <>
                  <Link href="/login" className="hidden sm:block">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 text-yellow-400 font-medium rounded-lg hover:bg-yellow-400/10 transition-all border border-yellow-400/20 hover:border-yellow-400/40"
                    >
                      <LogIn className="w-4 h-4" />
                      Masuk
                    </motion.button>
                  </Link>

                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 rounded-lg font-medium shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <UserPlus className="w-4 h-4 relative z-10" />
                      <span className="hidden sm:inline relative z-10">
                        Daftar
                      </span>
                      <span className="sm:hidden relative z-10">Sign Up</span>
                    </motion.button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors border border-yellow-400/20"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu with Glassmorphism */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-yellow-400/20 bg-slate-900/90 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          active
                            ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-lg shadow-yellow-400/10"
                            : "text-slate-300 hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-yellow-400/20 space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                    </div>
                  ) : isLoggedIn ? (
                    // Logged In - Dashboard & Logout
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-yellow-400 font-medium rounded-lg border-2 border-yellow-400/30 hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all mb-2">
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </button>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <LogOut className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Logout</span>
                      </button>
                    </>
                  ) : (
                    // Logged Out - Login & Register
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-yellow-400 font-medium rounded-lg border-2 border-yellow-400/30 hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all">
                          <LogIn className="w-5 h-5" />
                          Masuk
                        </button>
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <button className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 font-medium rounded-lg shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <UserPlus className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Daftar Sekarang</span>
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Overlay when mobile menu open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
