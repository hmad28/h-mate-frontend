"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Target,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Rocket,
  Award,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { generateQuestions, analyzeResults, saveTestResult } from "@/lib/api";
import { toast } from "sonner";

const analyzeTest = async (finalAnswers) => {
  setStep("analyzing");

  try {
    const response = await analyzeResults(finalAnswers);
    
    // Save test result to database
    try {
      const saveResponse = await saveTestResult(
        'minat_bakat',
        questions,
        finalAnswers,
        response.data
      );
      
      if (saveResponse.success) {
        console.log('✅ Test result saved successfully');
        toast.success('Hasil tes berhasil disimpan!');
      } else {
        console.error('❌ Failed to save test result:', saveResponse.error);
        toast.error('Gagal menyimpan hasil tes');
      }
    } catch (saveError) {
      console.error('❌ Error saving test result:', saveError);
      toast.error('Gagal menyimpan hasil tes');
    }
    
    setResult(response.data);
    setStep("result");
  } catch (error) {
    console.error("Error analyzing results:", error);
    toast.error("Gagal menganalisis hasil. Coba lagi ya!");
    setStep("start");
  }
};

// SISANYA TETAP SAMA, TIDAK DIUBAH

export default function TesMinatPage() {
  const [step, setStep] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleStartTest = async () => {
    setStep("loading");
    setError(null);

    try {
      // Get user age
      let userAge = null;
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          userAge = userData.user?.age;
        }
        console.log("👤 User age:", userAge);
      } catch (e) {
        console.log("⚠️ Could not fetch user age");
      }

      // Generate questions with retry
      let response;
      let currentRetry = 0;

      while (currentRetry <= MAX_RETRIES) {
        try {
          console.log(
            `🚀 Generating questions (attempt ${currentRetry + 1}/${
              MAX_RETRIES + 1
            })...`
          );

          response = await generateQuestions(30, userAge);

          // Validasi response
          if (
            !response?.data?.questions ||
            response.data.questions.length === 0
          ) {
            throw new Error("No questions generated");
          }

          console.log(`✅ Got ${response.data.questions.length} questions`);
          break;
        } catch (error) {
          console.error(
            `❌ Attempt ${currentRetry + 1} failed:`,
            error.message
          );
          currentRetry++;

          if (currentRetry > MAX_RETRIES) {
            throw error;
          }

          // Show retry notification
          toast.loading(`Mencoba lagi... (${currentRetry}/${MAX_RETRIES})`);

          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * currentRetry)
          );
        }
      }

      // Set questions
      setQuestions(response.data.questions);
      setRetryCount(0);
      setStep("test");

      toast.success(`✅ ${response.data.questions.length} pertanyaan siap!`);
    } catch (error) {
      console.error("❌ Failed to generate questions:", error);

      setError(
        error.message === "No questions generated"
          ? "AI tidak bisa generate pertanyaan. Silakan coba lagi."
          : "Terjadi kesalahan saat memuat pertanyaan. Silakan coba lagi."
      );

      setRetryCount(retryCount + 1);
      setStep("error");

      toast.error("Gagal generate pertanyaan");
    }
  };


  // CARI FUNGSI handleStartTest di src/app/tes-minat/page.js
  // GANTI DENGAN KODE INI:

  // const handleStartTest = async () => {
  //   setStep("loading");
  //   setError(null);

  //   try {
  //     // Get current user to send age
  //     let userAge = null;
  //     try {
  //       const userRes = await fetch("/api/auth/me");
  //       if (userRes.ok) {
  //         const userData = await userRes.json();
  //         userAge = userData.user?.age;
  //       }
  //       console.log("Age:", userAge);
  //     } catch (e) {
  //       console.log("Could not fetch user age, using default");
  //     }

  //     // Generate questions with user age
  //     const response = await generateQuestions(30, userAge);
  //     setQuestions(response.data.questions);
  //     setStep("test");
  //   } catch (error) {
  //     console.error("Error generating questions:", error);
  //     setError("Gagal generate pertanyaan. Silakan coba lagi ya!");
  //     setStep("error");
  //   }
  // };

  // SISANYA TIDAK DIUBAH

  const handleAnswer = () => {
    if (!selectedOption) return;

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer = {
      question: currentQuestion.question,
      selectedOption: currentQuestion.options.find(
        (opt) => opt.value === selectedOption
      ),
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex === questions.length - 1) {
      analyzeTest(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // STEP 2: CARI FUNGSI analyzeTest (sekitar baris 75-90)
  // GANTI SELURUH FUNGSI analyzeTest DENGAN KODE INI:

  const analyzeTest = async (finalAnswers) => {
    setStep("analyzing");

    try {
      // Call backend to analyze
      const response = await analyzeResults(finalAnswers);

      console.log("✅ Analysis response:", response);

      // Save test result to database
      try {
        console.log("💾 Saving test result to database...");

        const saveResponse = await saveTestResult(
          "minat_bakat",
          questions,
          finalAnswers,
          response.data
        );

        console.log("💾 Save response:", saveResponse);

        if (saveResponse.success) {
          console.log("✅ Test result saved successfully to DB");
          toast.success("Hasil tes berhasil disimpan! 🎉");
        } else {
          console.error("❌ Failed to save test result:", saveResponse.error);
          toast.error("Gagal menyimpan hasil tes");
        }
      } catch (saveError) {
        console.error("❌ Error saving test result:", saveError);
        toast.error("Terjadi kesalahan saat menyimpan hasil");
      }

      // Set result and move to result step
      setResult(response.data);
      setStep("result");
    } catch (error) {
      console.error("❌ Error analyzing results:", error);
      toast.error("Gagal menganalisis hasil. Coba lagi ya!");
      setStep("start");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers(answers.slice(0, -1));
      setSelectedOption(null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

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
              <h1 className="text-lg font-bold text-white">Tes Minat Bakat</h1>
              {step !== "start" && step !== "loading" && (
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
              )}
            </div>
            {step === "test" && (
              <p className="text-xs text-slate-400 mt-0.5">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {step === "test" && (
          <motion.div
            className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* START SCREEN */}
          {step === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 md:p-12">
                <motion.div
                  className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Target className="w-10 h-10 text-yellow-400" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Siap Temukan Karier Impianmu?
                </h2>

                <p className="text-slate-300 mb-8 leading-relaxed">
                  Tes ini akan memberikan 30 pertanyaan interaktif yang
                  di-generate oleh H-Mate AI. Jawab dengan jujur sesuai
                  kepribadian dan minatmu. Hasil tes akan memberikan rekomendasi
                  karier yang cocok untukmu! 🎯
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-yellow-400">
                    ⏱️ Estimasi waktu: 15-20 menit
                    <br />
                    📊 Hasil personalized dari H-Mate AI
                  </p>
                </div>

                <motion.button
                  onClick={handleStartTest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-bold text-lg hover:bg-yellow-500/30 transition-all"
                >
                  Mulai Tes Sekarang
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 md:p-12">
                {/* Error Icon */}
                <motion.div
                  className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </motion.div>

                {/* Error Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Oops! Ada Masalah
                </h2>

                <p className="text-red-400 mb-6 text-base">{error}</p>

                {/* Retry Info */}
                {retryCount > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-yellow-400">
                      💡 Sudah {retryCount} kali mencoba.
                      {retryCount >= 3 && " Mungkin ada masalah server."}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    onClick={handleStartTest}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-bold hover:bg-yellow-500/30 transition-all"
                  >
                    🔄 Coba Lagi
                  </motion.button>

                  <Link href="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-slate-700/50 bg-slate-800/30 text-slate-300 rounded-2xl font-bold hover:bg-slate-800/50 transition-all"
                    >
                      ← Kembali
                    </motion.button>
                  </Link>
                </div>

                {/* Tech Info (untuk debugging) */}
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-6 text-left">
                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg overflow-auto">
                      {JSON.stringify({ error: error, retryCount }, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </motion.div>
          )}

          {/* LOADING QUESTIONS */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Mempersiapkan Pertanyaan...
                </h2>
                <p className="text-slate-400">
                  H-Mate AI sedang membuat pertanyaan khusus untukmu
                </p>
              </div>
            </motion.div>
          )}

          {/* TEST QUESTIONS */}
          {step === "test" && currentQuestion && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-10">
                {/* Question */}
                <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSelectedOption(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedOption === option.value
                          ? "border-yellow-500/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
                          : "border-slate-700/50 bg-slate-800/30 hover:border-yellow-500/30 hover:bg-slate-800/50"
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
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              <div className="w-2 h-2 bg-slate-900 rounded-full" />
                            </motion.div>
                          )}
                        </div>
                        <span className="text-base text-slate-200">
                          {option.text}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-3">
                  <motion.button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-3 border border-slate-700/50 bg-slate-800/30 text-slate-300 rounded-2xl font-semibold hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </motion.button>

                  <motion.button
                    onClick={handleAnswer}
                    disabled={!selectedOption}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-semibold hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <span>
                      {currentQuestionIndex === questions.length - 1
                        ? "Selesai"
                        : "Selanjutnya"}
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Menganalisis Jawabanmu...
                </h2>
                <p className="text-slate-400">
                  AI sedang memproses hasil tes dan mencocokkan dengan karier
                  yang tepat
                </p>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 md:p-10">
                {/* Header Result */}
                <div className="text-center mb-8">
                  <motion.div
                    className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-yellow-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Hasil Tes Minat Bakatmu
                  </h2>
                  <p className="text-slate-400">
                    Ini dia rekomendasi karier yang cocok untukmu!
                  </p>
                </div>

                {/* Personality Type */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-base font-semibold text-yellow-400">
                      Tipe Kepribadian Kamu
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {result.personality_type}
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Recommended Careers */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">
                      Karier yang Cocok Untukmu
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    💡 Klik salah satu karier untuk generate roadmap perjalanan
                    kariermu
                  </p>
                  <div className="space-y-3">
                    {result.recommended_careers.map((career, index) => (
                      <motion.button
                        key={index}
                        onClick={async () => {
                          try {
                            setStep("generating-roadmap");

                            // Hit backend API untuk generate roadmap
                            const roadmapResponse = await fetch(
                              `${
                                process.env.NEXT_PUBLIC_API_URL ||
                                "http://localhost:5000"
                              }/api/roadmap/generate`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  targetRole: career.title,
                                  currentStatus: "pelajar",
                                  hasGoal: true,
                                  existingSkills: career.skills_needed || [],
                                }),
                              }
                            );

                            if (!roadmapResponse.ok) {
                              throw new Error("Gagal generate roadmap");
                            }

                            const roadmapData = await roadmapResponse.json();

                            if (!roadmapData.success) {
                              throw new Error(
                                roadmapData.message || "Gagal generate roadmap"
                              );
                            }

                            // Save roadmap ke database
                            const saveResponse = await fetch(
                              "/api/roadmaps/save",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  title: roadmapData.data.title,
                                  targetRole: career.title,
                                  currentStatus: "pelajar",
                                  roadmapData: roadmapData.data,
                                  estimatedTime: roadmapData.data.estimatedTime,
                                }),
                              }
                            );

                            if (!saveResponse.ok) {
                              throw new Error("Gagal save roadmap");
                            }

                            const savedRoadmap = await saveResponse.json();

                            // Redirect ke detail roadmap
                            window.location.href = `/roadmap/${savedRoadmap.data.id}`;
                          } catch (error) {
                            console.error("Error:", error);
                            alert(`Gagal membuat roadmap: ${error.message}`);
                            setStep("result");
                          }
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:border-yellow-500/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <h4 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">
                            {career.title}
                          </h4>
                          <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                            {career.match_percentage}% Match
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3 leading-relaxed group-hover:text-slate-300 transition">
                          {career.reason}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {career.skills_needed.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-700/30 text-slate-300 px-3 py-1 rounded-lg text-xs border border-slate-600/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-yellow-400/70 opacity-0 group-hover:opacity-100 transition">
                          🚀 Klik untuk generate roadmap →
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Kekuatanmu</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {result.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-center text-sm font-semibold"
                      >
                        {strength}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Development Areas */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">
                      Area yang Bisa Dikembangkan
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.development_areas.map((area, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-3 rounded-xl text-sm font-semibold"
                      >
                        {area}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Rocket className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">
                      Langkah Selanjutnya
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {result.next_steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 items-start bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl"
                      >
                        <span className="flex-shrink-0 w-7 h-7 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-slate-300 text-sm pt-0.5 leading-relaxed">
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/konsultasi" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl font-bold hover:bg-yellow-500/30 transition-all"
                    >
                      Konsultasi Lebih Lanjut
                    </motion.button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 border border-slate-700/50 bg-slate-800/30 text-slate-300 rounded-2xl font-bold hover:bg-slate-800/50 transition-all"
                    >
                      Kembali ke Beranda
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
