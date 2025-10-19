// src/app/roadmap/components/RoadmapTimeline.jsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Award, BookOpen, Target } from "lucide-react";

export default function RoadmapTimeline({
  roadmap,
  completedPhases,
  onPhaseToggle,
}) {
  if (!roadmap || !roadmap.phases) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {roadmap.title}
        </h2>
        <p className="text-gray-600">{roadmap.overview}</p>
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mt-4">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">
            Estimasi: {roadmap.estimatedTime}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {roadmap.phases.map((phase, index) => {
          const isCompleted = completedPhases.includes(index);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16 pb-12 last:pb-0"
            >
              {/* Phase Circle */}
              <button
                onClick={() => onPhaseToggle && onPhaseToggle(index)}
                className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white border-2 border-gray-300 text-gray-400 hover:border-purple-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>

              {/* Phase Content */}
              <div
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                  isCompleted
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-200 hover:border-purple-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {phase.phase}
                    </h3>
                    <p className="text-sm text-gray-600">{phase.duration}</p>
                  </div>
                  {isCompleted && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Selesai
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{phase.description}</p>

                {/* Skills */}
                {phase.skills && phase.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Skills yang Dipelajari:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {phase.certifications && phase.certifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Sertifikasi Rekomendasi:
                    </h4>
                    <div className="space-y-2">
                      {phase.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {cert.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {cert.provider}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              cert.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : cert.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cert.priority === "high"
                              ? "Prioritas Tinggi"
                              : cert.priority === "medium"
                              ? "Prioritas Sedang"
                              : "Opsional"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {phase.milestones && phase.milestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Target Pencapaian:
                    </h4>
                    <ul className="space-y-1">
                      {phase.milestones.map((milestone, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-purple-500 mt-1">•</span>
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

      {/* Career Tips */}
      {roadmap.careerTips && roadmap.careerTips.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            💡 Tips Karier
          </h3>
          <ul className="space-y-2">
            {roadmap.careerTips.map((tip, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-purple-500 font-bold">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
