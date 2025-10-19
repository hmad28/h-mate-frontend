// lib/api.js
// Centralized API calls ke backend Express

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper dengan error handling
 * @param {string} endpoint - API endpoint (misal: '/api/konsultasi')
 * @param {object} data - Data yang akan dikirim
 * @returns {Promise} Response dari API
 */
async function apiCall(endpoint, data) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Terjadi kesalahan");
    }

    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Kirim pesan konsultasi karier
 * @param {string} message - Pesan dari user
 * @param {array} history - Riwayat chat (opsional)
 */
export async function sendConsultation(message, history = []) {
  return apiCall("/api/konsultasi", { message, history });
}

/**
 * Generate pertanyaan tes minat bakat
 * @param {number} questionCount - Jumlah pertanyaan (default: 10)
 */
export async function generateQuestions(questionCount = 10) {
  return apiCall("/api/generate-questions", { questionCount });
}

/**
 * Analisis hasil tes
 * @param {array} answers - Array jawaban user
 */
export async function analyzeResults(answers) {
  return apiCall("/api/analyze-results", { answers });
}

/**
 * Health check backend
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "ERROR" };
  }
}

// ===== ROADMAP APIs =====

/**
 * Generate mini test untuk career interest
 */
export async function generateMiniTest(questionCount = 7) {
  return apiCall("/api/roadmap/mini-test", { questionCount });
}

/**
 * Analyze mini test results
 */
export async function analyzeMiniTest(answers) {
  return apiCall("/api/roadmap/analyze-mini-test", { answers });
}

/**
 * Generate career roadmap
 */
export async function generateRoadmap(data) {
  return apiCall("/api/roadmap/generate", data);
}

/**
 * Get next steps based on current progress
 */
export async function getNextSteps(roadmap, completedPhases, currentSkills) {
  return apiCall("/api/roadmap/next-steps", {
    roadmap,
    completedPhases,
    currentSkills,
  });
}

/**
 * Consultation chat untuk roadmap
 */
export async function roadmapConsultation(message, context) {
  return apiCall("/api/roadmap/consultation", { message, context });
}
