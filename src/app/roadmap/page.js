"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import {
  generateMiniTest,
  analyzeMiniTest,
  generateRoadmap,
  getNextSteps,
  roadmapConsultation,
} from "@/lib/api";
import StepIndicator from "./components/StepIndicator";
import RoadmapTimeline from "./components/RoadmapTimeline";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RoadmapPage() {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState(null);
  const [hasGoal, setHasGoal] = useState(null);
  const [goalInput, setGoalInput] = useState("");
  const [professionInput, setProfessionInput] = useState("");
  const [intention, setIntention] = useState(null);
  const [switchTarget, setSwitchTarget] = useState("");

  // Mini test
  const [miniTestQuestions, setMiniTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [miniTestAnswers, setMiniTestAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Roadmap
  const [roadmap, setRoadmap] = useState(null);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [progressInput, setProgressInput] = useState("");
  const [nextStepsData, setNextStepsData] = useState(null);

  // Consultation
  const [consultationMessages, setConsultationMessages] = useState([]);
  const [consultationInput, setConsultationInput] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Conversation log for PDF
  const [conversationLog, setConversationLog] = useState([]);

  const steps = ["Mulai", "Identifikasi", "Roadmap", "Progress", "Konsultasi"];

  // Add to conversation log
  const addToLog = (entry) => {
    setConversationLog((prev) => [
      ...prev,
      { ...entry, timestamp: new Date() },
    ]);
  };

  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    setUserType(type);
    addToLog({ type: "user_type", value: type });
    setCurrentStep(1);
  };

  // Handle pelajar with goal
  const handlePelajarWithGoal = async () => {
    if (!goalInput.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap untukmu...");
    addToLog({ type: "goal", value: goalInput });

    try {
      const response = await generateRoadmap({
        targetRole: goalInput,
        currentStatus: "pelajar",
        hasGoal: true,
      });

      setRoadmap(response.data);
      addToLog({ type: "roadmap_generated", value: response.data.title });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("Gagal generate roadmap. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Start mini test
  const startMiniTest = async () => {
    setIsLoading(true);
    setLoadingMessage("Mempersiapkan tes minat...");

    try {
      const response = await generateMiniTest(7);
      setMiniTestQuestions(response.data.questions);
      addToLog({ type: "mini_test_started", value: "7 pertanyaan" });
      setHasGoal(false);
    } catch (error) {
      console.error("Error generating mini test:", error);
      alert("Gagal generate tes. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Answer mini test question
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

  // Analyze mini test
  const analyzeMiniTestResults = async (answers) => {
    setIsLoading(true);
    setLoadingMessage("Menganalisis jawaban...");

    try {
      const response = await analyzeMiniTest(answers);
      setRecommendedJobs(response.data.recommendedJobs);
      addToLog({ type: "mini_test_completed", value: response.data.summary });
    } catch (error) {
      console.error("Error analyzing mini test:", error);
      alert("Gagal analisis. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Select job from recommendations
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
      addToLog({ type: "job_selected", value: job.title });
      addToLog({ type: "roadmap_generated", value: response.data.title });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("Gagal generate roadmap. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profesional with upgrade
  const handleProfessionalUpgrade = async () => {
    if (!professionInput.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap peningkatan skill...");
    addToLog({ type: "profession", value: professionInput });
    addToLog({ type: "intention", value: "upgrade skill" });

    try {
      const response = await generateRoadmap({
        targetRole: `${professionInput} - Skill Enhancement`,
        currentStatus: "profesional",
        hasGoal: true,
      });

      setRoadmap(response.data);
      addToLog({ type: "roadmap_generated", value: response.data.title });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal generate roadmap. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profesional switch career
  const handleProfessionalSwitch = async () => {
    if (!switchTarget.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Membuat roadmap career switch...");
    addToLog({ type: "switch_target", value: switchTarget });

    try {
      const response = await generateRoadmap({
        targetRole: switchTarget,
        currentStatus: "profesional",
        hasGoal: true,
        existingSkills: [professionInput],
      });

      setRoadmap(response.data);
      addToLog({ type: "roadmap_generated", value: response.data.title });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal generate roadmap. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle phase completion
  const handlePhaseToggle = (phaseIndex) => {
    setCompletedPhases((prev) =>
      prev.includes(phaseIndex)
        ? prev.filter((i) => i !== phaseIndex)
        : [...prev, phaseIndex]
    );
  };

  // Proceed to progress check
  const proceedToProgress = () => {
    setCurrentStep(3);
  };

  // Get next steps
  const handleGetNextSteps = async () => {
    setIsLoading(true);
    setLoadingMessage("Menganalisis progress...");

    try {
      const skills = progressInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const response = await getNextSteps(roadmap, completedPhases, skills);

      setNextStepsData(response.data);
      addToLog({
        type: "progress_checked",
        value: `${completedPhases.length} phases completed`,
      });
      setCurrentStep(4);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal generate next steps. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Send consultation message
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

      addToLog({
        type: "consultation",
        question: userMsg,
        answer: response.data.response,
      });
    } catch (error) {
      console.error("Error:", error);
      setConsultationMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Coba lagi ya!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Roadmap Karier Kamu", 105, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by KarirKu AI", 105, yPos, { align: "center" });
    yPos += 15;

    // User Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Profile:", 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Status: ${userType === "pelajar" ? "Pelajar" : "Profesional"}`,
      20,
      yPos
    );
    yPos += 5;

    if (roadmap) {
      doc.text(`Target: ${roadmap.title}`, 20, yPos);
      yPos += 10;
    }

    // Roadmap Summary
    if (roadmap && roadmap.phases) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Roadmap:", 20, yPos);
      yPos += 7;

      roadmap.phases.forEach((phase) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${phase.phase} (${phase.duration})`, 20, yPos);
        yPos += 5;

        doc.setFont("helvetica", "normal");
        doc.text(`Skills: ${phase.skills.join(", ")}`, 25, yPos);
        yPos += 7;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Save
    doc.save("karirku-roadmap.pdf");

    addToLog({ type: "pdf_exported", value: "Success" });
    alert("PDF berhasil diunduh!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
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
            <h1 className="text-xl font-bold text-gray-800">
              Roadmap Karier AI
            </h1>
            <p className="text-sm text-gray-500">
              Temukan arah kariermu dengan panduan AI
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
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
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Mulai Perjalanan Kariermu! 🚀
                </h2>
                <p className="text-gray-600 mb-8">
                  Pilih status kamu saat ini untuk mendapatkan roadmap yang
                  sesuai
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.button
                    onClick={() => handleUserTypeSelect("pelajar")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Pelajar</h3>
                    <p className="text-blue-100 text-sm">
                      Siswa, mahasiswa, atau fresh graduate
                    </p>
                  </motion.button>

                  <motion.button
                    onClick={() => handleUserTypeSelect("profesional")}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Briefcase className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Profesional</h3>
                    <p className="text-purple-100 text-sm">
                      Sudah bekerja dan ingin berkembang
                    </p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Identification - Pelajar */}
          {currentStep === 1 && userType === "pelajar" && hasGoal === null && (
            <motion.div
              key="step-1-pelajar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
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
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
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

                  {/* Question */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {miniTestQuestions[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {miniTestQuestions[currentQuestionIndex].options.map(
                      (option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setSelectedOption(option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
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

                  {/* Next Button */}
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
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Karier yang Cocok Untukmu! 🎯
                </h2>
                <p className="text-gray-600 text-center mb-8">
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
                      className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {job.title}
                        </h3>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {job.match_score}% Match
                        </span>
                      </div>
                      <p className="text-gray-600">{job.reason}</p>
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
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Ceritakan tentang kariermu saat ini
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profesi saat ini:
                      </label>
                      <input
                        type="text"
                        value={professionInput}
                        onChange={(e) => setProfessionInput(e.target.value)}
                        placeholder="Contoh: Marketing Manager, Backend Developer"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Apa yang ingin kamu lakukan?
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Target className="w-12 h-12 mx-auto mb-3" />
                      <h4 className="font-bold text-lg mb-2">
                        Tingkatkan Skill
                      </h4>
                      <p className="text-blue-100 text-sm">
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
                      <Briefcase className="w-12 h-12 mx-auto mb-3" />
                      <h4 className="font-bold text-lg mb-2">Switch Karier</h4>
                      <p className="text-purple-100 text-sm">
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
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Mau switch ke karier apa?
                  </h2>
                  <p className="text-gray-600 mb-6">
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 mb-4"
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
              <div className="bg-white rounded-3xl shadow-xl p-8">
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
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Lanjut: Cek Progress Saya
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Progress Check */}
          {currentStep === 3 && roadmap && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Bagian mana yang sudah kamu pelajari?
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Klik phase yang sudah selesai di atas, atau tulis skill yang
                  sudah dikuasai
                </p>

                {/* Show completed phases */}
                {completedPhases.length > 0 && (
                  <div className="mb-6 p-4 bg-green-50 rounded-xl">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✓ Phase yang sudah selesai:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {completedPhases.map((idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                        >
                          {roadmap.phases[idx].phase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill yang sudah dikuasai (pisahkan dengan koma):
                  </label>
                  <textarea
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="Contoh: HTML, CSS, JavaScript, React"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan jika belum ada progress
                  </p>
                </div>

                <motion.button
                  onClick={handleGetNextSteps}
                  disabled={isLoading}
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
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Next Steps */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎯 Langkah Selanjutnya
                </h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
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

                <p className="text-gray-600 mb-6">
                  Saat ini kamu di:{" "}
                  <span className="font-semibold text-purple-600">
                    {nextStepsData.currentPhase}
                  </span>
                </p>

                {/* Next Steps List */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
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
                          <span className="text-2xl">
                            {step.priority === "high"
                              ? "🔥"
                              : step.priority === "medium"
                              ? "⭐"
                              : "💡"}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {step.step}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
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
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        🏆 Sertifikasi Rekomendasi
                      </h3>
                      <div className="space-y-3">
                        {nextStepsData.recommendedCertifications.map(
                          (cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-800">
                                  {cert.name}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
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
                              <p className="text-sm text-gray-600">
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
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                    <p className="text-gray-700 italic">
                      💪 {nextStepsData.motivationalMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Consultation Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Konsultasi
                </h2>
                <p className="text-gray-600 mb-6">
                  Ada pertanyaan tentang roadmap atau langkah selanjutnya? Tanya
                  di sini!
                </p>

                {/* Chat Messages */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {consultationMessages.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      Belum ada percakapan. Mulai tanya sesuatu! 💬
                    </div>
                  )}
                  {consultationMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-purple-500 text-white"
                        }`}
                      >
                        {msg.role === "user" ? "K" : "AI"}
                      </div>
                      <div
                        className={`flex-1 max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white rounded-2xl rounded-tr-md"
                            : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-md"
                        } px-4 py-3`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                        <p className="text-gray-600">Sedang mengetik...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={consultationInput}
                    onChange={(e) => setConsultationInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleConsultationSend()
                    }
                    placeholder="Tanya apa saja..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 disabled:bg-gray-100 transition-colors"
                  />
                  <motion.button
                    onClick={handleConsultationSend}
                    disabled={!consultationInput.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Export PDF */}
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Simpan Roadmap Kamu
                </h3>
                <p className="text-gray-600 mb-6">
                  Unduh semua informasi roadmap, rekomendasi, dan konsultasi
                  dalam satu file PDF
                </p>
                <motion.button
                  onClick={handleExportPDF}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
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
