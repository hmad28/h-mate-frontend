"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateQuestions, analyzeResults } from "@/lib/api";

export default function TesMinatPage() {
  const router = useRouter();
  const [step, setStep] = useState("start"); // 'start', 'loading', 'test', 'analyzing', 'result'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  // Generate questions saat tombol mulai ditekan
  const handleStartTest = async () => {
    setStep("loading");

    try {
      const response = await generateQuestions(10);
      setQuestions(response.data.questions);
      setStep("test");
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Gagal generate pertanyaan. Silakan coba lagi ya!");
      setStep("start");
    }
  };

  // Handle jawab pertanyaan
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

    // Cek apakah sudah selesai semua
    if (currentQuestionIndex === questions.length - 1) {
      // Analisis hasil
      analyzeTest(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Analisis hasil tes
  const analyzeTest = async (finalAnswers) => {
    setStep("analyzing");

    try {
      const response = await analyzeResults(finalAnswers);
      setResult(response.data);
      setStep("result");
    } catch (error) {
      console.error("Error analyzing results:", error);
      alert("Gagal menganalisis hasil. Coba lagi ya!");
      setStep("start");
    }
  };

  // Back to previous question
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
            <h1 className="text-xl font-bold text-gray-800">Tes Minat Bakat</h1>
            {step === "test" && (
              <p className="text-sm text-gray-500">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {step === "test" && (
          <motion.div
            className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* START SCREEN */}
          {step === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Siap Temukan Karier Impianmu?
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  Tes ini akan memberikan 10 pertanyaan interaktif yang
                  di-generate oleh AI. Jawab dengan jujur sesuai kepribadian dan
                  minatmu. Hasil tes akan memberikan rekomendasi karier yang
                  cocok untukmu! 🎯
                </p>

                <div className="bg-purple-50 rounded-xl p-4 mb-8">
                  <p className="text-sm text-purple-800">
                    ⏱️ Estimasi waktu: 5-7 menit
                    <br />
                    📊 Hasil personalized dari AI
                  </p>
                </div>

                <motion.button
                  onClick={handleStartTest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
                >
                  Mulai Tes Sekarang
                </motion.button>
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
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Mempersiapkan Pertanyaan...
                </h2>
                <p className="text-gray-600">
                  AI sedang membuat pertanyaan khusus untukmu
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
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                {/* Question */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-snug">
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
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        selectedOption === option.value
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === option.value
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOption === option.value && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-lg text-gray-700">
                          {option.text}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4">
                  <motion.button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Sebelumnya
                  </motion.button>

                  <motion.button
                    onClick={handleAnswer}
                    disabled={!selectedOption}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Selesai"
                      : "Selanjutnya"}
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
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Menganalisis Jawabanmu...
                </h2>
                <p className="text-gray-600">
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
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                {/* Header Result */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Hasil Tes Minat Bakatmu
                  </h2>
                  <p className="text-gray-600">
                    Ini dia rekomendasi karier yang cocok untukmu!
                  </p>
                </div>

                {/* Personality Type */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">
                    Tipe Kepribadian Kamu
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {result.personality_type}
                  </p>
                  <p className="text-gray-700">{result.description}</p>
                </div>

                {/* Recommended Careers */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    🎯 Karier yang Cocok Untukmu
                  </h3>
                  <div className="space-y-4">
                    {result.recommended_careers.map((career, index) => (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xl font-semibold text-gray-800">
                            {career.title}
                          </h4>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            {career.match_percentage}% Match
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{career.reason}</p>
                        <div className="flex flex-wrap gap-2">
                          {career.skills_needed.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    💪 Kekuatanmu
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {result.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="bg-green-50 text-green-800 px-4 py-3 rounded-xl text-center font-medium"
                      >
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Development Areas */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    🚀 Area yang Bisa Dikembangkan
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.development_areas.map((area, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl font-medium"
                      >
                        {area}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    ✨ Langkah Selanjutnya
                  </h3>
                  <ol className="space-y-3">
                    {result.next_steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex gap-3 items-start bg-gray-50 p-4 rounded-xl"
                      >
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/konsultasi" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Konsultasi Lebih Lanjut
                    </motion.button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
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
