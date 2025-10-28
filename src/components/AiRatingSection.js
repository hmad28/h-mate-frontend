"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AiRatingSection({ summaryId, userId, profileId }) {
  const [isAccurate, setIsAccurate] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchedSummaryId, setFetchedSummaryId] = useState(summaryId || null);
  const [loading, setLoading] = useState(true);

  // Fetch summary ID jika tidak diberikan via props (untuk homepage)
  useEffect(() => {
    async function checkExistingRating(id) {
      try {
        const response = await fetch(
          `/api/ratings?summaryId=${id}&userId=${userId}&checkRating=true`
        );
        const data = await response.json();

        if (data.hasRated && data.data) {
          setIsAccurate(data.data.isAccurate);
          setFeedbackText(data.data.feedbackReason || "");
          setHasSubmitted(true);
        }
      } catch (error) {
        console.error("Error checking rating:", error);
      }
    }

    async function fetchSummaryAndRating() {
      // Kalau summaryId sudah ada dari props (dashboard), skip fetch
      if (summaryId) {
        setFetchedSummaryId(summaryId);
        await checkExistingRating(summaryId);
        setLoading(false);
        return;
      }

      // Kalau tidak ada, fetch dari API (homepage)
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/ratings?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.data && data.data.id) {
          const id = data.data.id;
          setFetchedSummaryId(id);
          await checkExistingRating(id);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryAndRating();
  }, [summaryId, userId]);

  async function handleSubmit() {
    if (isAccurate === null) {
      toast.error("Pilih apakah analisis AI akurat atau tidak");
      return;
    }

    if (!feedbackText.trim() || feedbackText.trim().length < 10) {
      toast.error("Tulis alasan feedback minimal 10 karakter");
      return;
    }

    if (!fetchedSummaryId) {
      toast.error("Summary tidak ditemukan. Selesaikan tes terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryId: fetchedSummaryId,
          userId: userId,
          isAccurate: isAccurate,
          feedbackReason: feedbackText.trim(),
          rating: isAccurate ? 5 : 2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim feedback");
      }

      const message = data.isUpdate
        ? "Feedback berhasil diperbarui! 🎉"
        : "Terima kasih atas feedback kamu! 🙏";

      toast.success(message);
      setHasSubmitted(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Gagal mengirim feedback");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setHasSubmitted(false);
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-8"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full"
          />
          <span className="text-slate-400">Memuat...</span>
        </div>
      </motion.div>
    );
  }

  // No summary found - Show CTA to take test
  if (!fetchedSummaryId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-8"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <AlertCircle className="w-12 h-12 text-yellow-400" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Belum Ada Hasil Tes
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Selesaikan tes career assessment terlebih dahulu untuk memberikan
              rating pada analisis AI
            </p>
            <a
              href="/assessment"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-400/50 transition-all"
            >
              Mulai Tes Sekarang
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // Success state (after submit, before edit)
  if (hasSubmitted && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Feedback Terkirim! ✨
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            Terima kasih sudah membantu kami meningkatkan akurasi AI
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isAccurate ? (
                <ThumbsUp className="w-5 h-5 text-green-400" />
              ) : (
                <ThumbsDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-slate-300 font-semibold">
                {isAccurate ? "Akurat" : "Tidak Akurat"}
              </span>
            </div>
            <p className="text-slate-400 text-sm italic">
              &quot;{feedbackText}&quot;
            </p>
          </div>

          <motion.button
            onClick={handleEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Feedback</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Form state (new submission or editing)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-8 shadow-xl"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {isEditing ? "Edit Feedback Kamu 📝" : "Bantu Kami Lebih Baik 🚀"}
        </h3>
        <p className="text-slate-400 text-sm">
          {isEditing
            ? "Perbarui rating dan feedback kamu"
            : "Apakah analisis AI ini akurat untukmu? Feedback kamu sangat membantu!"}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">
          Apakah analisis AI ini akurat?
        </p>
        <div className="grid grid-cols-2 gap-4">
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
            {isAccurate === true && (
              <motion.div
                layoutId="accuracy-indicator"
                className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-3">
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
            {isAccurate === false && (
              <motion.div
                layoutId="accuracy-indicator"
                className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-3">
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
                <span>{isEditing ? "Memperbarui..." : "Mengirim..."}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>
                  {isEditing ? "Perbarui Feedback" : "Kirim Feedback"}
                </span>
              </>
            )}
          </motion.button>

          {isEditing && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setIsEditing(false);
                setHasSubmitted(true);
              }}
              className="w-full mt-3 py-3 text-slate-400 hover:text-slate-300 transition"
            >
              Batal
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
