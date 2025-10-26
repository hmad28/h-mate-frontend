"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  Briefcase,
  Target,
  Download,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Bot,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  generateMiniTest,
  analyzeMiniTest,
  generateRoadmap,
  getNextSteps,
  roadmapConsultation,
  saveRoadmap,
} from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Toast Notification Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-sm mx-auto sm:mx-0"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-xl border ${
          type === "success"
            ? "bg-green-500/90 border-green-400/30 text-white"
            : type === "error"
            ? "bg-red-500/90 border-red-400/30 text-white"
            : "bg-yellow-500/90 border-yellow-400/30 text-white"
        }`}
      >
        {type === "success" ? (
          <Sparkles className="w-5 h-5 flex-shrink-0" />
        ) : type === "error" ? (
          <X className="w-5 h-5 flex-shrink-0" />
        ) : (
          <Sparkles className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Step Indicator Component
const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-8 px-2">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                  idx <= currentStep
                    ? "bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 scale-110"
                    : "bg-slate-800/30 border-2 border-slate-700/50 text-slate-600"
                }`}
                whileHover={{ scale: idx <= currentStep ? 1.15 : 1 }}
              >
                {idx + 1}
              </motion.div>
              <span
                className={`text-xs sm:text-sm mt-2 font-medium hidden sm:block ${
                  idx <= currentStep ? "text-yellow-400" : "text-slate-600"
                }`}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition-all ${
                  idx < currentStep
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                    : "bg-slate-800/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Roadmap Timeline Component (Read-Only, Updated Design)
const RoadmapTimeline = ({ roadmap }) => {
  return (
    <div>
      {/* Header Info */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {roadmap.title}
            </h2>
            {roadmap.overview && (
              <p className="text-sm text-slate-400">{roadmap.overview}</p>
            )}
          </div>
          <span className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full text-sm font-semibold w-fit">
            {roadmap.estimatedTime || roadmap.totalDuration}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <h3 className="text-xl font-bold text-white mb-6">
        Tahapan Pembelajaran
      </h3>

      <div className="space-y-6">
        {roadmap.phases.map((phase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-12 pb-8 border-l-4 border-slate-700/50"
          >
            <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-700 text-slate-400 flex items-center justify-center">
              <span className="text-sm font-bold">{idx + 1}</span>
            </div>

            <div className="p-6 rounded-2xl border-2 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <h4 className="text-lg font-bold text-white">{phase.phase}</h4>
                <span className="text-sm font-medium text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full w-fit">
                  {phase.duration}
                </span>
              </div>

              <p className="text-slate-300 text-sm mb-4">{phase.description}</p>

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
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0" />
                            <span>{resource.name || resource}</span>
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
                        <span className="text-green-400 mt-0.5 flex-shrink-0">
                          ✓
                        </span>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Career Tips */}
      {roadmap.careerTips && roadmap.careerTips.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span> Tips Karir
          </h3>
          <ul className="space-y-2">
            {roadmap.careerTips.map((tip, idx) => (
              <li
                key={idx}
                className="text-sm text-slate-300 flex items-start gap-2"
              >
                <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function RoadmapPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState(null);
  const [hasGoal, setHasGoal] = useState(null);
  const [goalInput, setGoalInput] = useState("");
  const [professionInput, setProfessionInput] = useState("");
  const [intention, setIntention] = useState(null);
  const [switchTarget, setSwitchTarget] = useState("");

  const [miniTestQuestions, setMiniTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [miniTestAnswers, setMiniTestAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [roadmap, setRoadmap] = useState(null);
  const [nextStepsData, setNextStepsData] = useState(null);

  const [consultationMessages, setConsultationMessages] = useState([]);
  const [consultationInput, setConsultationInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const roadmapRef = useRef(null);

  const steps = ["Mulai", "Identifikasi", "Roadmap", "Rekomendasi"];

  const [currentRoadmapId, setCurrentRoadmapId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultationMessages]);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setCurrentStep(1);
  };

  const handlePelajarWithGoal = async () => {
    if (!goalInput.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap untukmu...");

    try {
      const response = await generateRoadmap({
        targetRole: goalInput,
        currentStatus: "pelajar",
        hasGoal: true,
      });

      setRoadmap(response.data);

      try {
        const saveResponse = await saveRoadmap(
          response.data.title,
          goalInput,
          "pelajar",
          response.data,
          response.data.estimatedTime || response.data.totalDuration
        );

        if (saveResponse.success) {
          setCurrentRoadmapId(saveResponse.data.id);
          showToast("Roadmap berhasil disimpan! 🎉");
        }
      } catch (saveError) {
        console.error("Error saving roadmap:", saveError);
        showToast("Roadmap dibuat tapi gagal disimpan", "warning");
      }

      setCurrentStep(2);
    } catch (error) {
      showToast("Gagal membuat roadmap. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startMiniTest = async () => {
    setIsLoading(true);
    setLoadingMessage("Mempersiapkan tes minat...");

    try {
      const response = await generateMiniTest(15);
      setMiniTestQuestions(response.data.questions);
      setHasGoal(false);
      showToast("Tes siap dimulai! 💪");
    } catch (error) {
      showToast("Gagal memuat tes. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMiniTestAnswer = () => {
    if (!selectedOption) return;

    const currentQ = miniTestQuestions[currentQuestionIndex];
    const answer = {
      question: currentQ.question,
      selectedOption: currentQ.options.find((o) => o.value === selectedOption),
    };

    const newAnswers = [...miniTestAnswers, answer];
    setMiniTestAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex === miniTestQuestions.length - 1) {
      analyzeMiniTestResults(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const analyzeMiniTestResults = async (answers) => {
    setIsLoading(true);
    setLoadingMessage("Menganalisis jawaban...");

    try {
      const response = await analyzeMiniTest(answers);
      setRecommendedJobs(response.data.recommendedJobs);
      showToast("Analisis selesai! Lihat rekomendasi 🎯");
    } catch (error) {
      showToast("Gagal menganalisis. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    setIsLoading(true);
    setLoadingMessage(`Membuat roadmap untuk ${job.title}...`);

    try {
      const response = await generateRoadmap({
        targetRole: job.title,
        currentStatus: "pelajar",
        hasGoal: false,
      });

      setRoadmap(response.data);

      try {
        const saveResponse = await saveRoadmap(
          response.data.title,
          job.title,
          "pelajar",
          response.data,
          response.data.estimatedTime || response.data.totalDuration
        );

        if (saveResponse.success) {
          setCurrentRoadmapId(saveResponse.data.id);
          showToast(`Roadmap ${job.title} disimpan! 🚀`);
        }
      } catch (saveError) {
        console.error("Error saving roadmap:", saveError);
      }

      setCurrentStep(2);
    } catch (error) {
      showToast("Gagal membuat roadmap. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfessionalUpgrade = async () => {
    if (!professionInput.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap peningkatan skill...");

    try {
      const response = await generateRoadmap({
        targetRole: `${professionInput} - Skill Enhancement`,
        currentStatus: "profesional",
        hasGoal: true,
      });

      setRoadmap(response.data);

      try {
        const saveResponse = await saveRoadmap(
          response.data.title,
          `${professionInput} - Skill Enhancement`,
          "profesional",
          response.data,
          response.data.estimatedTime || response.data.totalDuration
        );

        if (saveResponse.success) {
          setCurrentRoadmapId(saveResponse.data.id);
          showToast("Roadmap upgrade skill disimpan! 📈");
        }
      } catch (saveError) {
        console.error("Error saving roadmap:", saveError);
      }

      setCurrentStep(2);
    } catch (error) {
      showToast("Gagal membuat roadmap. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfessionalSwitch = async () => {
    if (!switchTarget.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap career switch...");

    try {
      const response = await generateRoadmap({
        targetRole: switchTarget,
        currentStatus: "profesional",
        hasGoal: true,
        existingSkills: [professionInput],
      });

      setRoadmap(response.data);

      try {
        const saveResponse = await saveRoadmap(
          response.data.title,
          switchTarget,
          "profesional",
          response.data,
          response.data.estimatedTime || response.data.totalDuration
        );

        if (saveResponse.success) {
          setCurrentRoadmapId(saveResponse.data.id);
          showToast("Roadmap career switch disimpan! 🔄");
        }
      } catch (saveError) {
        console.error("Error saving roadmap:", saveError);
      }

      setCurrentStep(2);
    } catch (error) {
      showToast("Gagal membuat roadmap. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToNextSteps = async () => {
    setIsLoading(true);
    setLoadingMessage("Menganalisis roadmap...");

    try {
      const response = await getNextSteps(roadmap, [], []);
      setNextStepsData(response.data);
      setCurrentStep(3);
      showToast("Rekomendasi siap! 📊");
    } catch (error) {
      showToast("Gagal membuat rekomendasi. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultationSend = async () => {
    if (!consultationInput.trim() || isLoading) return;

    const userMsg = consultationInput.trim();
    setConsultationInput("");

    setConsultationMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
    ]);

    setIsLoading(true);

    try {
      const context = {
        userType,
        roadmap: roadmap?.title,
      };

      const response = await roadmapConsultation(userMsg, context);

      setConsultationMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response },
      ]);
    } catch (error) {
      setConsultationMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Coba lagi ya!",
        },
      ]);
      showToast("Gagal mengirim pesan. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!roadmap) return;

    showToast("Mempersiapkan PDF...", "info");
    setIsLoading(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Helper function to add text with wrapping
      const addText = (text, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);

        lines.forEach((line) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += fontSize * 0.5;
        });
        yPos += 3;
      };

      // Title
      pdf.setFillColor(234, 179, 8);
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("🎯 Roadmap Karier", margin, 15);

      yPos = 35;
      pdf.setTextColor(0, 0, 0);

      // Info Section
      addText(`Judul: ${roadmap.title}`, 14, true);
      addText(
        `Status: ${userType === "pelajar" ? "Pelajar" : "Profesional"}`,
        11
      );
      addText(
        `Durasi Total: ${roadmap.estimatedTime || roadmap.totalDuration}`,
        11
      );
      addText(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 11);
      yPos += 5;

      // Phases
      addText("📚 Tahapan Pembelajaran", 16, true);
      yPos += 2;

      roadmap.phases.forEach((phase, idx) => {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = margin;
        }

        addText(`${idx + 1}. ${phase.phase} (${phase.duration})`, 13, true);
        addText(phase.description, 11);
        addText(`Skills: ${phase.skills.join(", ")}`, 10);
        yPos += 3;
      });

      // Next Steps
      if (nextStepsData) {
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = margin;
        }

        addText("🚀 Rekomendasi", 16, true);
        yPos += 2;

        if (nextStepsData.nextSteps) {
          nextStepsData.nextSteps.forEach((step) => {
            addText(`• ${step.step} (${step.estimatedTime})`, 11);
          });
          yPos += 3;
        }

        if (nextStepsData.recommendedCertifications?.length > 0) {
          addText("🏆 Sertifikasi Rekomendasi", 14, true);
          nextStepsData.recommendedCertifications.forEach((cert) => {
            addText(`• ${cert.name}: ${cert.reason}`, 10);
          });
          yPos += 3;
        }

        if (nextStepsData.motivationalMessage) {
          addText(`💪 ${nextStepsData.motivationalMessage}`, 11);
        }
      }

      // Footer
      const finalPage = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= finalPage; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("Generated by H-Mate AI", pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      }

      // Save PDF
      pdf.save(`Roadmap-${roadmap.title.replace(/\s+/g, "-")}.pdf`);
      showToast("PDF berhasil diunduh! 📄", "success");
    } catch (error) {
      console.error("PDF Export Error:", error);
      showToast("Gagal mengunduh PDF. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
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

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-10">
        <div className="container mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/">
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
                Roadmap Karier AI
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
              Temukan arah kariermu dengan panduan AI
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <StepIndicator steps={steps} currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {/* STEP 0: Choose User Type */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-12 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Mulai Perjalanan Kariermu! 🚀
                </h2>
                <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">
                  Pilih status kamu saat ini untuk mendapatkan roadmap yang
                  sesuai
                </p>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.button
                    onClick={() => handleUserTypeSelect("pelajar")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 sm:p-8 bg-yellow-500/10 border-2 border-yellow-500/30 text-white rounded-2xl hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all"
                  >
                    <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-yellow-400" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      Pelajar
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Siswa, mahasiswa, atau fresh graduate
                    </p>
                  </motion.button>

                  <motion.button
                    onClick={() => handleUserTypeSelect("profesional")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 sm:p-8 bg-yellow-500/10 border-2 border-yellow-500/30 text-white rounded-2xl hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all"
                  >
                    <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-yellow-400" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      Profesional
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Sudah bekerja dan ingin berkembang
                    </p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Pelajar - Has Goal? */}
          {currentStep === 1 && userType === "pelajar" && hasGoal === null && (
            <motion.div
              key="step-1-pelajar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8 md:p-12">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                  Apakah kamu sudah punya cita-cita atau target karier?
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Kalau sudah, tulis di sini:
                    </label>
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="Contoh: Frontend Developer, UI/UX Designer"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-2xl focus:outline-none focus:border-yellow-500/50 transition-all text-sm sm:text-base"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handlePelajarWithGoal()
                      }
                    />
                    <motion.button
                      onClick={handlePelajarWithGoal}
                      disabled={!goalInput.trim() || isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {loadingMessage}
                        </span>
                      ) : (
                        "Buat Roadmap"
                      )}
                    </motion.button>
                  </div>

                  <div className="text-center py-4">
                    <span className="text-slate-600">atau</span>
                  </div>

                  <motion.button
                    onClick={startMiniTest}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 border border-yellow-500/30 bg-slate-800/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {loadingMessage}
                      </span>
                    ) : (
                      "🎯 Belum tahu? Ikuti Tes Minat (15 pertanyaan)"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mini Test Questions */}
          {currentStep === 1 &&
            userType === "pelajar" &&
            hasGoal === false &&
            miniTestQuestions.length > 0 &&
            recommendedJobs.length === 0 && (
              <motion.div
                key="mini-test"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                  <div className="mb-6">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
                      <span>
                        Pertanyaan {currentQuestionIndex + 1} dari{" "}
                        {miniTestQuestions.length}
                      </span>
                      <span>
                        {Math.round(
                          ((currentQuestionIndex + 1) /
                            miniTestQuestions.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            ((currentQuestionIndex + 1) /
                              miniTestQuestions.length) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    {miniTestQuestions[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-3 mb-6">
                    {miniTestQuestions[currentQuestionIndex].options.map(
                      (option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setSelectedOption(option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-sm sm:text-base ${
                            selectedOption === option.value
                              ? "border-yellow-500/50 bg-yellow-500/10"
                              : "border-slate-700/50 bg-slate-800/30 hover:border-yellow-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedOption === option.value
                                  ? "border-yellow-400 bg-yellow-400"
                                  : "border-slate-600"
                              }`}
                            >
                              {selectedOption === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-slate-900 rounded-full"
                                />
                              )}
                            </div>
                            <span className="text-slate-200">
                              {option.text}
                            </span>
                          </div>
                        </motion.button>
                      )
                    )}
                  </div>

                  <motion.button
                    onClick={handleMiniTestAnswer}
                    disabled={!selectedOption}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {currentQuestionIndex === miniTestQuestions.length - 1
                      ? "Selesai"
                      : "Lanjut"}
                  </motion.button>
                </div>
              </motion.div>
            )}

          {/* Job Recommendations */}
          {currentStep === 1 && recommendedJobs.length > 0 && !selectedJob && (
            <motion.div
              key="job-recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">
                  Karier yang Cocok Untukmu! 🎯
                </h2>
                <p className="text-sm sm:text-base text-slate-400 text-center mb-6 sm:mb-8">
                  Berdasarkan jawabanmu, ini rekomendasi karier terbaik
                </p>

                <div className="space-y-4">
                  {recommendedJobs.map((job, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleJobSelect(job)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 sm:p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-yellow-500/50 hover:bg-slate-800/50 transition-all disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {job.title}
                        </h3>
                        <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                          {job.match_score}% Match
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-400">
                        {job.reason}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Profesional Path */}
          {currentStep === 1 &&
            userType === "profesional" &&
            intention === null && (
              <motion.div
                key="step-1-prof"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    Ceritakan tentang kariermu saat ini
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-2">
                        Profesi saat ini:
                      </label>
                      <input
                        type="text"
                        value={professionInput}
                        onChange={(e) => setProfessionInput(e.target.value)}
                        placeholder="Contoh: Marketing Manager, Backend Developer"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-2xl focus:outline-none focus:border-yellow-500/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    Apa yang ingin kamu lakukan?
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        setIntention("upgrade");
                        handleProfessionalUpgrade();
                      }}
                      disabled={!professionInput.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-6 bg-yellow-500/10 border-2 border-yellow-500/30 text-white rounded-2xl hover:bg-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-yellow-400" />
                      <h4 className="font-bold text-base sm:text-lg mb-2">
                        Tingkatkan Skill
                      </h4>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Upgrade di bidang yang sama
                      </p>
                    </motion.button>

                    <motion.button
                      onClick={() => setIntention("switch")}
                      disabled={!professionInput.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-6 bg-yellow-500/10 border-2 border-yellow-500/30 text-white rounded-2xl hover:bg-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-yellow-400" />
                      <h4 className="font-bold text-base sm:text-lg mb-2">
                        Switch Karier
                      </h4>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Pindah ke bidang baru
                      </p>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Switch Career Input */}
          {currentStep === 1 &&
            userType === "profesional" &&
            intention === "switch" && (
              <motion.div
                key="switch-career"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    Mau switch ke karier apa?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-400 mb-6">
                    Dari{" "}
                    <span className="font-semibold text-yellow-400">
                      {professionInput}
                    </span>{" "}
                    ke...
                  </p>

                  <input
                    type="text"
                    value={switchTarget}
                    onChange={(e) => setSwitchTarget(e.target.value)}
                    placeholder="Contoh: Data Scientist, Product Manager"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-2xl focus:outline-none focus:border-yellow-500/50 mb-4 text-sm sm:text-base"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleProfessionalSwitch()
                    }
                  />

                  <motion.button
                    onClick={handleProfessionalSwitch}
                    disabled={!switchTarget.trim() || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {loadingMessage}
                      </span>
                    ) : (
                      "Buat Roadmap Switch Career"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

          {/* STEP 2: Roadmap Display (Read-Only) */}
          {currentStep === 2 && roadmap && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8"
                ref={roadmapRef}
              >
                <RoadmapTimeline roadmap={roadmap} />

                <div className="mt-8 text-center">
                  <motion.button
                    onClick={proceedToNextSteps}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-bold hover:bg-yellow-500/30 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {loadingMessage}
                      </span>
                    ) : (
                      "Lihat Rekomendasi & Konsultasi"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Recommendations & Consultation */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
            >
              {/* Recommendations Section */}
              {nextStepsData && (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Rekomendasi Untukmu
                  </h2>

                  {/* Next Steps */}
                  {nextStepsData.nextSteps &&
                    nextStepsData.nextSteps.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-white mb-4 text-sm sm:text-base">
                          🎯 Langkah yang Disarankan:
                        </h3>
                        <div className="space-y-3">
                          {nextStepsData.nextSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border ${
                                step.priority === "high"
                                  ? "border-red-500/30 bg-red-500/10"
                                  : step.priority === "medium"
                                  ? "border-yellow-500/30 bg-yellow-500/10"
                                  : "border-slate-700/50 bg-slate-800/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">
                                  {step.priority === "high"
                                    ? "🔥"
                                    : step.priority === "medium"
                                    ? "⭐"
                                    : "💡"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white text-sm sm:text-base">
                                    {step.step}
                                  </p>
                                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    Estimasi: {step.estimatedTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Certifications */}
                  {nextStepsData.recommendedCertifications &&
                    nextStepsData.recommendedCertifications.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
                          🏆 Sertifikasi Rekomendasi
                        </h3>
                        <div className="space-y-3">
                          {nextStepsData.recommendedCertifications.map(
                            (cert, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl"
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                  <p className="font-medium text-white text-sm sm:text-base">
                                    {cert.name}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded w-fit ${
                                      cert.urgency === "high"
                                        ? "bg-red-500/20 border border-red-500/30 text-red-400"
                                        : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                                    }`}
                                  >
                                    {cert.urgency === "high"
                                      ? "Prioritas"
                                      : "Recommended"}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400">
                                  {cert.reason}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Motivational Message */}
                  {nextStepsData.motivationalMessage && (
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-2xl">
                      <p className="text-sm sm:text-base text-slate-300 italic">
                        💪 {nextStepsData.motivationalMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Consultation Section */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  Konsultasi AI
                </h2>
                <p className="text-sm sm:text-base text-slate-400 mb-6">
                  Punya pertanyaan tentang roadmap atau karier? Tanya di sini!
                </p>

                {/* Chat Messages */}
                <div className="space-y-4 mb-4 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                  {consultationMessages.length === 0 && (
                    <div className="text-center text-slate-600 py-8 text-sm">
                      Belum ada percakapan. Mulai tanya sesuatu! 💬
                    </div>
                  )}
                  {consultationMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 sm:gap-3 ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center ${
                          msg.role === "user"
                            ? "bg-yellow-500/20 border border-yellow-500/30"
                            : "bg-slate-800/50 border border-slate-700/50"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Bot className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[85%] sm:max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-yellow-500/10 border border-yellow-500/20 rounded-3xl rounded-tr-lg"
                            : "bg-slate-900/50 border border-slate-800/50 rounded-3xl rounded-tl-lg"
                        } px-4 py-3 backdrop-blur-sm`}
                      >
                        <div
                          className={`text-xs sm:text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "text-slate-100"
                              : "text-slate-300"
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong class='text-yellow-400'>$1</strong>"
                              )
                              .replace(/\n/g, "<br />")
                              .replace(/- (.*?)(<br \/>|$)/g, "• $1$2"),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 sm:gap-3">
                      <motion.div
                        className="w-8 h-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Bot className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                      <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl rounded-tl-lg px-4 py-3 backdrop-blur-sm">
                        <p className="text-xs sm:text-sm text-slate-400">
                          Sedang mengetik...
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={consultationInput}
                    onChange={(e) => setConsultationInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleConsultationSend()
                    }
                    placeholder="Tanya apa saja..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-2xl focus:outline-none focus:border-yellow-500/50 disabled:bg-slate-800/30 transition-colors text-sm sm:text-base"
                  />
                  <motion.button
                    onClick={handleConsultationSend}
                    disabled={!consultationInput.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-5 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Export PDF */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                  Simpan Roadmap Kamu
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6">
                  Unduh roadmap dan rekomendasi dalam format PDF
                </p>
                <motion.button
                  onClick={handleExportPDF}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl font-bold hover:bg-green-500/30 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isLoading ? "Memproses..." : "Download PDF"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
