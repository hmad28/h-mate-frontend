import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  Sparkles,
  Map,
  Target,
  Rocket,
  Brain,
} from "lucide-react";

export default function RoadmapLoadingScreen({ targetRole, userType }) {
  const [aiLogs, setAiLogs] = useState([]);
  const [currentFact, setCurrentFact] = useState(0);

  const funFacts = [
    "💡 Rata-rata seseorang butuh 6-12 bulan untuk menguasai skill baru",
    "🚀 80% kesuksesan karier berasal dari continuous learning",
    "🎯 Fokus pada 1-2 skill utama lebih efektif daripada belajar semuanya",
    "⭐ Networking dapat membuka 70% peluang karier tersembunyi",
    "📚 Praktik langsung 10x lebih efektif daripada hanya teori",
  ];

  const logs = [
    { time: 0, text: "🔌 Connecting to H-Mate Career AI...", type: "info" },
    { time: 800, text: "✓ Connection established", type: "success" },
    { time: 1600, text: "🧠 Loading career analysis model...", type: "info" },
    { time: 2800, text: "✓ AI model ready", type: "success" },
    { time: 3500, text: `📊 Analyzing target: ${targetRole}`, type: "info" },
    {
      time: 4800,
      text: `  └─ User type: ${
        userType === "pelajar" ? "Student/Graduate" : "Professional"
      }`,
      type: "detail",
    },
    {
      time: 5900,
      text: "  └─ Scanning industry trends & requirements...",
      type: "detail",
    },
    { time: 7200, text: "✓ Target analysis complete", type: "success" },
    {
      time: 8500,
      text: "🎯 Building personalized learning path...",
      type: "info",
    },
    {
      time: 10200,
      text: "  └─ Phase 1: Foundation skills",
      type: "detail",
    },
    {
      time: 12800,
      text: "  └─ Phase 2: Core competencies",
      type: "detail",
    },
    {
      time: 16500,
      text: "  └─ Phase 3: Advanced specialization",
      type: "detail",
    },
    {
      time: 21000,
      text: "  └─ Phase 4: Professional mastery",
      type: "detail",
    },
    {
      time: 26500,
      text: "🔍 Gathering learning resources...",
      type: "info",
    },
    {
      time: 32000,
      text: "  └─ Curating courses & tutorials...",
      type: "detail",
    },
    {
      time: 38000,
      text: "  └─ Finding relevant certifications...",
      type: "detail",
    },
    { time: 43000, text: "✓ Resources compiled", type: "success" },
    {
      time: 47500,
      text: "📈 Calculating timeline & milestones...",
      type: "info",
    },
    { time: 50000, text: "✓ Roadmap optimization complete", type: "success" },
    { time: 54000, text: "🎨 Finalizing your career roadmap...", type: "info" },
    {
      time: 57000,
      text: "🎉 Success! Your personalized roadmap is ready",
      type: "success",
    },
  ];

  useEffect(() => {
    logs.forEach((log) => {
      setTimeout(() => {
        setAiLogs((prev) => [...prev, log]);
      }, log.time);
    });

    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 4000);

    return () => clearInterval(factInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-8">
        {/* Header with Animated Icon */}
        <div className="flex items-start gap-6 mb-6">
          {/* Animated Roadmap Icon */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-orange-600/30 rounded-2xl border-4 border-yellow-500/50 shadow-xl shadow-yellow-500/20 flex items-center justify-center"
            >
              <Map className="w-12 h-12 text-yellow-400" />
            </motion.div>

            {/* Orbiting particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear",
                }}
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: `${30 + i * 10}px center`,
                }}
              />
            ))}
          </div>

          {/* Title & Status */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">
                H-Mate AI Crafting Your Roadmap...
              </h2>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Membuat roadmap personal untuk{" "}
              <span className="text-yellow-400 font-semibold">
                {targetRole}
              </span>
            </p>

            {/* Status Indicators */}
            <div className="flex gap-2">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-green-400 font-medium">
                  AI Active
                </span>
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5,
                }}
                className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2"
              >
                <Brain className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">
                  Analyzing
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Terminal-style logs */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
          {/* Terminal Header */}
          <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-2">
              H-Mate Career Engine v3.0
            </span>
          </div>

          {/* Logs */}
          <div
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
            className="p-4 font-mono text-sm max-h-96 overflow-y-auto scroll-smooth"
          >
            {aiLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`mb-2 flex items-start gap-2 ${
                  log.type === "success"
                    ? "text-green-400"
                    : log.type === "detail"
                    ? "text-slate-500"
                    : "text-slate-300"
                }`}
              >
                <span className="text-slate-600 text-xs flex-shrink-0">
                  [
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                  ]
                </span>
                <span className="flex-1">{log.text}</span>
                {log.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                )}
              </motion.div>
            ))}

            {/* Blinking cursor */}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-yellow-400 ml-1"
            />
          </div>
        </div>

        {/* Fun Fact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          >
            <p className="text-sm text-yellow-400 text-center">
              {funFacts[currentFact]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-slate-500 text-center mt-4">
          ⏱️ Estimasi: 30-60 detik • AI sedang menganalisis puluhan ribu data
          karier
        </p>
      </div>
    </motion.div>
  );
}
