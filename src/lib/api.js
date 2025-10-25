// lib/api.js
// Centralized API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper dengan error handling
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

// ===== BACKEND EXPRESS APIs (ke backend/server.js) =====

export async function sendConsultation(message, history = []) {
  return apiCall("/api/konsultasi", { message, history });
}

export async function generateQuestions(questionCount = 20, userAge = null) {
  return apiCall("/api/generate-questions", { questionCount, userAge });
}

export async function analyzeResults(answers) {
  return apiCall("/api/analyze-results", { answers });
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "ERROR" };
  }
}

export async function generateMiniTest(questionCount = 15) {
  return apiCall("/api/roadmap/mini-test", { questionCount });
}

export async function analyzeMiniTest(answers) {
  return apiCall("/api/roadmap/analyze-mini-test", { answers });
}

export async function generateRoadmap(data) {
  return apiCall("/api/roadmap/generate", data);
}

export async function getNextSteps(roadmap, completedPhases, currentSkills) {
  return apiCall("/api/roadmap/next-steps", {
    roadmap,
    completedPhases,
    currentSkills,
  });
}

export async function roadmapConsultation(message, context) {
  return apiCall("/api/roadmap/consultation", { message, context });
}

// ===== NEXT.JS API ROUTES (ke frontend/src/app/api) =====

export async function saveConversation(role, message) {
  const response = await fetch("/api/conversations/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, message }),
  });
  return response.json();
}

export async function loadConversations(limit = 50) {
  const response = await fetch(`/api/conversations/load?limit=${limit}`);
  return response.json();
}

export async function saveTestResult(testType, questions, answers, aiAnalysis) {
  const response = await fetch("/api/test-results/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testType, questions, answers, aiAnalysis }),
  });
  return response.json();
}

export async function saveRoadmap(
  title,
  targetRole,
  currentStatus,
  roadmapData,
  estimatedTime
) {
  const response = await fetch("/api/roadmaps/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      targetRole,
      currentStatus,
      roadmapData,
      estimatedTime,
    }),
  });
  return response.json();
}

export async function updateRoadmapProgress(
  roadmapId,
  completedPhases,
  completedSkills,
  progressPercentage
) {
  const response = await fetch("/api/roadmaps/progress/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roadmapId,
      completedPhases,
      completedSkills,
      progressPercentage,
    }),
  });
  return response.json();
}
