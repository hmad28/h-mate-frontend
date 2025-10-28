"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { toast } from "sonner";

export default function AiRatingSection({ userId }) {
  const [isAccurate, setIsAccurate] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isAccurate === null) {
      toast.error("Pilih apakah analisis AI akurat atau tidak");
      return;
    }

    if (!feedbackText.trim() || feedbackText.trim().length < 10) {
      toast.error("Tulis alasan feedback minimal 10 karakter");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          isAccurate: isAccurate,
          feedbackReason: feedbackText.trim(),
          rating: isAccurate ? 5 : 2,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal mengirim feedback");
      }

      toast.success("Feedback berhasil disimpan! 🎉");
      setIsAccurate(null);
      setFeedbackText("");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Gagal mengirim feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-8 shadow-xl"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Bantu Kami Lebih Baik 🚀
        </h3>
        <p className="text-slate-400 text-sm">
          Apakah analisis AI ini akurat untukmu? Feedback kamu sangat membantu!
        </p>
      </div>

      {/* Accuracy Buttons */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">
          Apakah analisis AI ini akurat?
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Accurate Button */}
          <motion.button
            onClick={() => setIsAccurate(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all ${
              isAccurate === true
                ? "bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20"
                : "bg-slate-800/30 border-slate-700/50 hover:border-green-500/30"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <ThumbsUp
                className={`w-8 h-8 ${
                  isAccurate === true ? "text-green-400" : "text-slate-500"
                }`}
              />
              <div>
                <p
                  className={`font-bold text-lg ${
                    isAccurate === true ? "text-green-400" : "text-slate-400"
                  }`}
                >
                  Akurat
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Sesuai dengan diri saya
                </p>
              </div>
            </div>
          </motion.button>

          {/* Not Accurate Button */}
          <motion.button
            onClick={() => setIsAccurate(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all ${
              isAccurate === false
                ? "bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/20"
                : "bg-slate-800/30 border-slate-700/50 hover:border-red-500/30"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <ThumbsDown
                className={`w-8 h-8 ${
                  isAccurate === false ? "text-red-400" : "text-slate-500"
                }`}
              />
              <div>
                <p
                  className={`font-bold text-lg ${
                    isAccurate === false ? "text-red-400" : "text-slate-400"
                  }`}
                >
                  Tidak Akurat
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Kurang sesuai dengan saya
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Feedback Text Area */}
      {isAccurate !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              {isAccurate
                ? "Apa yang membuat analisis ini akurat?"
                : "Apa yang kurang sesuai dari analisis ini?"}
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={
                isAccurate
                  ? "Contoh: Sangat menggambarkan kepribadian saya dan karir yang direkomendasikan sangat sesuai..."
                  : "Contoh: Personality traits tidak sesuai, saya lebih suka bekerja solo..."
              }
              rows={5}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">Minimal 10 karakter</p>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting || feedbackText.trim().length < 10}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSubmitting || feedbackText.trim().length < 10
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 hover:shadow-yellow-400/50"
            }`}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
                />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Kirim Feedback</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
