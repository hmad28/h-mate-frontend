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
  CheckCircle2,
  Circle,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  generateMiniTest,
  analyzeMiniTest,
  generateRoadmap,
  getNextSteps,
  roadmapConsultation,
} from "@/lib/api";

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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
          type === "success"
            ? "bg-green-500/95 text-white"
            : type === "error"
            ? "bg-red-500/95 text-white"
            : "bg-blue-500/95 text-white"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
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
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  idx <= currentStep
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white scale-110"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-xs sm:text-sm mt-2 font-medium hidden sm:block ${
                  idx <= currentStep ? "text-purple-600" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition-all ${
                  idx < currentStep
                    ? "bg-gradient-to-r from-purple-500 to-blue-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Roadmap Timeline Component
const RoadmapTimeline = ({ roadmap, completedPhases, onPhaseToggle }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {roadmap.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Estimasi: {roadmap.estimatedTime || roadmap.totalDuration}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {roadmap.phases.map((phase, idx) => {
          const isCompleted = completedPhases.includes(idx);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative pl-8 sm:pl-12 pb-6 sm:pb-8 border-l-4 transition-all ${
                isCompleted ? "border-green-500" : "border-gray-300"
              }`}
            >
              <button
                onClick={() => onPhaseToggle(idx)}
                className={`absolute -left-3 sm:-left-4 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-white border-4 border-gray-300"
                }`}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <div
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    {phase.phase}
                  </h3>
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full w-fit">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  {phase.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {phase.skills.map((skill, skillIdx) => (
                    <span
                      key={skillIdx}
                      className="text-xs sm:text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
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
  const [completedPhases, setCompletedPhases] = useState([]);
  const [nextStepsData, setNextStepsData] = useState(null);

  const [consultationMessages, setConsultationMessages] = useState([]);
  const [consultationInput, setConsultationInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);

  const steps = ["Mulai", "Identifikasi", "Roadmap", "Progress", "Konsultasi"];

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Auto scroll chat
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
      setCurrentStep(2);
      showToast("Roadmap berhasil dibuat! 🎉");
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
      const response = await generateMiniTest(7);
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
      setCurrentStep(2);
      showToast(`Roadmap ${job.title} siap! 🚀`);
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
      setCurrentStep(2);
      showToast("Roadmap upgrade skill siap! 📈");
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
      setCurrentStep(2);
      showToast("Roadmap career switch siap! 🔄");
    } catch (error) {
      showToast("Gagal membuat roadmap. Coba lagi!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseToggle = (phaseIndex) => {
    setCompletedPhases((prev) =>
      prev.includes(phaseIndex)
        ? prev.filter((i) => i !== phaseIndex)
        : [...prev, phaseIndex]
    );
  };

  const proceedToProgress = () => {
    setCurrentStep(3);
  };

  const handleGetNextSteps = async () => {
    setIsLoading(true);
    setLoadingMessage("Menganalisis progress...");

    try {
      // Get skills dari completed phases
      const completedSkills = completedPhases.flatMap(
        (idx) => roadmap.phases[idx].skills
      );

      const response = await getNextSteps(
        roadmap,
        completedPhases,
        completedSkills
      );
      setNextStepsData(response.data);
      setCurrentStep(4);
      showToast("Analisis progress selesai! 📊");
    } catch (error) {
      showToast("Gagal menganalisis progress. Coba lagi!", "error");
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
        completedPhases: completedPhases.length,
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

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Roadmap Karier - ${roadmap?.title || "KarirKu AI"}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto;
              line-height: 1.6;
              color: #333;
            }
            h1 { 
              color: #6b21a8; 
              border-bottom: 4px solid #6b21a8; 
              padding-bottom: 15px; 
              margin-bottom: 30px;
              font-size: 32px;
            }
            h2 { 
              color: #1e40af; 
              margin-top: 40px; 
              margin-bottom: 20px;
              font-size: 24px;
            }
            h3 {
              color: #374151;
              font-size: 18px;
              margin-top: 15px;
              margin-bottom: 10px;
            }
            .info-section {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .info-section p {
              margin: 8px 0;
              font-size: 14px;
            }
            .info-section strong {
              color: #6b21a8;
            }
            .phase { 
              margin: 25px 0; 
              padding: 20px; 
              border-left: 5px solid #6b21a8; 
              background: #fafafa;
              page-break-inside: avoid;
            }
            .phase h3 {
              color: #6b21a8;
              margin-top: 0;
            }
            .skills { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 10px; 
              margin-top: 15px; 
            }
            .skill { 
              background: #e0e7ff; 
              padding: 6px 14px; 
              border-radius: 20px; 
              font-size: 13px;
              color: #4c1d95;
              font-weight: 500;
            }
            .next-steps {
              background: #fef3c7;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .next-steps ul {
              margin-left: 20px;
              margin-top: 10px;
            }
            .next-steps li {
              margin: 8px 0;
              font-size: 14px;
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            @media print {
              body { padding: 20px; }
              .phase { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>🎯 Roadmap Karier: ${roadmap?.title || ""}</h1>
          
          <div class="info-section">
            <p><strong>Status:</strong> ${
              userType === "pelajar" ? "Pelajar" : "Profesional"
            }</p>
            <p><strong>Total Durasi:</strong> ${
              roadmap?.estimatedTime || roadmap?.totalDuration || ""
            }</p>
            <p><strong>Tanggal Generate:</strong> ${new Date().toLocaleDateString(
              "id-ID",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}</p>
          </div>
          
          <h2>📚 Tahapan Pembelajaran</h2>
          ${
            roadmap?.phases
              .map(
                (phase, idx) => `
            <div class="phase">
              <h3>${phase.phase} (${phase.duration})</h3>
              <p style="margin: 10px 0; color: #4b5563;">${
                phase.description
              }</p>
              <div class="skills">
                ${phase.skills
                  .map((skill) => `<span class="skill">${skill}</span>`)
                  .join("")}
              </div>
            </div>
          `
              )
              .join("") || ""
          }
          
          ${
            nextStepsData
              ? `
            <h2>🚀 Langkah Selanjutnya</h2>
            <div class="next-steps">
              <p><strong>Progress Saat Ini:</strong> ${
                nextStepsData.progressPercentage
              }%</p>
              <p><strong>Fase Saat Ini:</strong> ${
                nextStepsData.currentPhase
              }</p>
              <p style="margin-top: 15px; margin-bottom: 5px;"><strong>To-Do List:</strong></p>
              <ul>
                ${nextStepsData.nextSteps
                  .map(
                    (step) =>
                      `<li><strong>${step.step}</strong> (${step.estimatedTime})</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p><strong>Generated by KarirKu AI</strong></p>
            <p>Platform AI untuk Bimbingan Karier • Indonesia Emas 2045 🇮🇩</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

    showToast("PDF siap diunduh! Silakan print/save as PDF 📄");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Roadmap Karier AI
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Temukan arah kariermu dengan panduan AI
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
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
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-12 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Mulai Perjalanan Kariermu! 🚀
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Pilih status kamu saat ini untuk mendapatkan roadmap yang
                  sesuai
                </p>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.button
                    onClick={() => handleUserTypeSelect("pelajar")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 sm:p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      Pelajar
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      Siswa, mahasiswa, atau fresh graduate
                    </p>
                  </motion.button>

                  <motion.button
                    onClick={() => handleUserTypeSelect("profesional")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 sm:p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      Profesional
                    </h3>
                    <p className="text-purple-100 text-xs sm:text-sm">
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
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
                  Apakah kamu sudah punya cita-cita atau target karier?
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalau sudah, tulis di sini:
                    </label>
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="Contoh: Frontend Developer, UI/UX Designer"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handlePelajarWithGoal()
                      }
                    />
                    <motion.button
                      onClick={handlePelajarWithGoal}
                      disabled={!goalInput.trim() || isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    <span className="text-gray-400">atau</span>
                  </div>

                  <motion.button
                    onClick={startMiniTest}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {loadingMessage}
                      </span>
                    ) : (
                      "🎯 Belum tahu? Ikuti Tes Minat (7 pertanyaan)"
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
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                  <div className="mb-6">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
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

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
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
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm sm:text-base ${
                            selectedOption === option.value
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          {option.text}
                        </motion.button>
                      )
                    )}
                  </div>

                  <motion.button
                    onClick={handleMiniTestAnswer}
                    disabled={!selectedOption}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                  Karier yang Cocok Untukmu! 🎯
                </h2>
                <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
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
                      className="w-full text-left p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                          {job.title}
                        </h3>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                          {job.match_score}% Match
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600">
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
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                    Ceritakan tentang kariermu saat ini
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Profesi saat ini:
                      </label>
                      <input
                        type="text"
                        value={professionInput}
                        onChange={(e) => setProfessionInput(e.target.value)}
                        placeholder="Contoh: Marketing Manager, Backend Developer"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
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
                      className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" />
                      <h4 className="font-bold text-base sm:text-lg mb-2">
                        Tingkatkan Skill
                      </h4>
                      <p className="text-blue-100 text-xs sm:text-sm">
                        Upgrade di bidang yang sama
                      </p>
                    </motion.button>

                    <motion.button
                      onClick={() => setIntention("switch")}
                      disabled={!professionInput.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" />
                      <h4 className="font-bold text-base sm:text-lg mb-2">
                        Switch Karier
                      </h4>
                      <p className="text-purple-100 text-xs sm:text-sm">
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
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                    Mau switch ke karier apa?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Dari{" "}
                    <span className="font-semibold text-purple-600">
                      {professionInput}
                    </span>{" "}
                    ke...
                  </p>

                  <input
                    type="text"
                    value={switchTarget}
                    onChange={(e) => setSwitchTarget(e.target.value)}
                    placeholder="Contoh: Data Scientist, Product Manager"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 mb-4 text-sm sm:text-base"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleProfessionalSwitch()
                    }
                  />

                  <motion.button
                    onClick={handleProfessionalSwitch}
                    disabled={!switchTarget.trim() || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

          {/* STEP 2: Roadmap Display */}
          {currentStep === 2 && roadmap && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <RoadmapTimeline
                  roadmap={roadmap}
                  completedPhases={completedPhases}
                  onPhaseToggle={handlePhaseToggle}
                />

                <div className="mt-8 text-center">
                  <motion.button
                    onClick={proceedToProgress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    Lanjut: Cek Progress Saya
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Progress Check - FIXED VERSION */}
          {currentStep === 3 && roadmap && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                  Bagian mana yang sudah kamu pelajari?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                  Klik phase yang sudah kamu selesaikan
                </p>

                {/* Phase Selection */}
                <div className="space-y-3">
                  {roadmap.phases.map((phase, idx) => {
                    const isCompleted = completedPhases.includes(idx);
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handlePhaseToggle(idx)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isCompleted
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                            {phase.phase}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {phase.duration}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {phase.skills.slice(0, 3).map((skill, skillIdx) => (
                              <span
                                key={skillIdx}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {phase.skills.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{phase.skills.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {completedPhases.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ {completedPhases.length} phase sudah selesai
                    </p>
                  </div>
                )}

                <motion.button
                  onClick={handleGetNextSteps}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingMessage}
                    </span>
                  ) : (
                    "Analisis & Berikan Next Steps"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Next Steps & Consultation */}
          {currentStep === 4 && nextStepsData && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
            >
              {/* Next Steps */}
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  🎯 Langkah Selanjutnya
                </h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                    <span>Progress Kamu</span>
                    <span className="font-semibold">
                      {nextStepsData.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${nextStepsData.progressPercentage}%`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Saat ini kamu di:{" "}
                  <span className="font-semibold text-purple-600">
                    {nextStepsData.currentPhase}
                  </span>
                </p>

                {/* Next Steps List */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Yang Perlu Dilakukan:
                  </h3>
                  <div className="space-y-3">
                    {nextStepsData.nextSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 ${
                          step.priority === "high"
                            ? "border-red-200 bg-red-50"
                            : step.priority === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-gray-200 bg-gray-50"
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
                            <p className="font-medium text-gray-800 text-sm sm:text-base">
                              {step.step}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Estimasi: {step.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Certifications */}
                {nextStepsData.recommendedCertifications &&
                  nextStepsData.recommendedCertifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        🏆 Sertifikasi Rekomendasi
                      </h3>
                      <div className="space-y-3">
                        {nextStepsData.recommendedCertifications.map(
                          (cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                <p className="font-medium text-gray-800 text-sm sm:text-base">
                                  {cert.name}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded w-fit ${
                                    cert.urgency === "high"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {cert.urgency === "high"
                                    ? "Prioritas"
                                    : "Recommended"}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">
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
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                    <p className="text-sm sm:text-base text-gray-700 italic">
                      💪 {nextStepsData.motivationalMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Consultation Section - FIXED MARKDOWN */}
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  Konsultasi
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Ada pertanyaan tentang roadmap atau langkah selanjutnya? Tanya
                  di sini!
                </p>

                {/* Chat Messages */}
                <div className="space-y-4 mb-4 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                  {consultationMessages.length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-sm">
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
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-purple-500 text-white"
                        }`}
                      >
                        {msg.role === "user" ? "K" : "AI"}
                      </div>
                      <div
                        className={`flex-1 max-w-[85%] sm:max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white rounded-2xl rounded-tr-md"
                            : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-md"
                        } px-3 sm:px-4 py-2 sm:py-3`}
                      >
                        <div
                          className={`text-xs sm:text-sm leading-relaxed ${
                            msg.role === "user" ? "text-white" : "text-gray-800"
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br />")
                              .replace(/- (.*?)(<br \/>|$)/g, "• $1$2"),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-3 sm:px-4 py-2 sm:py-3">
                        <p className="text-xs sm:text-sm text-gray-600">
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
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 disabled:bg-gray-100 transition-colors text-sm sm:text-base"
                  />
                  <motion.button
                    onClick={handleConsultationSend}
                    disabled={!consultationInput.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Export PDF */}
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Simpan Roadmap Kamu
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Unduh semua informasi roadmap, rekomendasi, dan konsultasi
                  dalam satu file PDF
                </p>
                <motion.button
                  onClick={handleExportPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download PDF
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
