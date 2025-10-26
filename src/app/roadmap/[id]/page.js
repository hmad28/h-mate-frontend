"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Target, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params.id;

  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoadmap();
  }, [roadmapId]);

  const loadRoadmap = async () => {
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`);

      if (!response.ok) {
        throw new Error("Roadmap tidak ditemukan");
      }

      const data = await response.json();
      setRoadmapData(data.data);
    } catch (err) {
      console.error("Error loading roadmap:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Memuat roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg">
              Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const roadmap = roadmapData.roadmap.roadmapData;
  const progress = roadmapData.progress;
  const completedPhases = progress?.completedPhases || [];

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
          className="absolute w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-10">
        <div className="container mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">
                {roadmapData.roadmap.title}
              </h1>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Target className="w-4 h-4 text-yellow-400" />
              </motion.div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: {roadmapData.roadmap.targetRole}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Roadmap Info */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {roadmap.title}
                </h2>
                <p className="text-slate-400 text-sm">{roadmap.overview}</p>
              </div>
              <span className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full text-sm font-semibold">
                {roadmap.estimatedTime || roadmapData.roadmap.estimatedTime}
              </span>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress Kamu</span>
                  <span className="font-semibold text-yellow-400">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progressPercentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Phases Timeline */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Tahapan Pembelajaran
            </h3>

            <div className="space-y-6">
              {roadmap.phases.map((phase, idx) => {
                const isCompleted = completedPhases.includes(idx);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative pl-12 pb-8 border-l-4 transition-all ${
                      isCompleted ? "border-green-500" : "border-slate-700/50"
                    }`}
                  >
                    <div
                      className={`absolute -left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white border-4 border-green-600"
                          : "bg-slate-900 border-4 border-slate-700 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>

                    <div
                      className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all ${
                        isCompleted
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-slate-800/30 border-slate-700/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-white">
                          {phase.phase}
                        </h4>
                        <span className="text-sm font-medium text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full">
                          {phase.duration}
                        </span>
                      </div>

                      <p className="text-slate-300 text-sm mb-4">
                        {phase.description}
                      </p>

                      {/* Skills */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 mb-2">
                          Skills:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.map((skill, skillIdx) => (
                            <span
                              key={skillIdx}
                              className="text-xs bg-slate-700/30 text-slate-300 px-3 py-1 rounded-lg border border-slate-600/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Learning Resources */}
                      {phase.learningResources &&
                        phase.learningResources.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-400 mb-2">
                              Resources:
                            </p>
                            <div className="space-y-2">
                              {phase.learningResources
                                .slice(0, 3)
                                .map((resource, resIdx) => (
                                  <div
                                    key={resIdx}
                                    className="text-xs text-slate-400 flex items-center gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                    <span>{resource.name}</span>
                                    {resource.type && (
                                      <span className="text-slate-600">
                                        ({resource.type})
                                      </span>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Milestones */}
                      {phase.milestones && phase.milestones.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-2">
                            Milestones:
                          </p>
                          <ul className="space-y-1">
                            {phase.milestones.map((milestone, mIdx) => (
                              <li
                                key={mIdx}
                                className="text-xs text-slate-400 flex items-start gap-2"
                              >
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Career Tips */}
          {roadmap.careerTips && roadmap.careerTips.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                💡 Tips Karir
              </h3>
              <ul className="space-y-2">
                {roadmap.careerTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 border border-slate-700/50 bg-slate-800/30 text-slate-300 rounded-xl font-bold hover:bg-slate-800/50 transition-all"
              >
                Kembali ke Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
