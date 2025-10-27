// api/profile/ai-summary/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import {
  userProfiles,
  testResults,
  roadmaps,
  conversations,
} from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [latestTests, userRoadmaps, recentConversations, profile] =
      await Promise.all([
        db
          .select()
          .from(testResults)
          .where(eq(testResults.userId, user.id))
          .orderBy(desc(testResults.createdAt))
          .limit(5),

        db
          .select()
          .from(roadmaps)
          .where(eq(roadmaps.userId, user.id))
          .orderBy(desc(roadmaps.createdAt))
          .limit(5),

        db
          .select()
          .from(conversations)
          .where(eq(conversations.userId, user.id))
          .orderBy(desc(conversations.createdAt))
          .limit(20),

        db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, user.id))
          .limit(1),
      ]);

    const userProfile = profile[0];

    // Prepare data for AI
    const analysisData = {
      user: {
        age: user.age,
        username: user.username,
        memberSince: user.createdAt,
      },
      tests: latestTests.map((t) => ({
        type: t.testType,
        date: t.createdAt,
        analysis: t.aiAnalysis,
      })),
      roadmaps: userRoadmaps.map((r) => ({
        title: r.title,
        target: r.targetRole,
        status: r.currentStatus,
        date: r.createdAt,
      })),
      consultations: recentConversations.length,
      existingProfile: userProfile
        ? {
            interests: userProfile.interests,
            skills: userProfile.skills,
            careerMatches: userProfile.careerMatches,
          }
        : null,
    };

    // Generate AI Summary
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Kamu adalah career coach AI untuk platform H-Mate. Analisis data user berikut dan buat kesimpulan komprehensif dalam Bahasa Indonesia.

DATA USER:
${JSON.stringify(analysisData, null, 2)}

INSTRUKSI:
Buat analisis mendalam yang personal dan motivational. Format response sebagai JSON dengan struktur:

{
  "overallSummary": "Ringkasan 2-3 kalimat tentang user, personality, dan arah kariernya",
  "personality": {
    "type": "Tipe kepribadian (misal: Creative Problem Solver, Analytical Thinker)",
    "traits": ["trait1", "trait2", "trait3"] // 3-5 traits utama
  },
  "careerAlignment": {
    "score": 85, // 0-100, seberapa aligned aktivitas user dengan career path
    "status": "Sangat Cocok/Cukup Cocok/Perlu Penyesuaian",
    "message": "Pesan motivational singkat"
  },
  "strengths": ["strength1", "strength2"], // 3-5 kekuatan user
  "areasToImprove": ["area1", "area2"], // 2-4 area yang bisa dikembangkan
  "topCareerMatches": [
    {"title": "Career Title", "score": 90, "reason": "Alasan singkat"}
  ], // Top 3 karir yang cocok
  "motivation": "Pesan motivational yang personal dan inspiring (2-3 kalimat)",
  "nextSteps": ["action1", "action2", "action3"], // 3-5 langkah konkret untuk user
  "activityLevel": "Sangat Aktif/Aktif/Perlu Lebih Aktif",
  "journeyStage": "Eksplorasi/Fokus/Eksekusi" // Tahap perjalanan karir user
}

PENTING:
- Gunakan bahasa yang hangat, personal, dan motivational
- Berikan insight spesifik berdasarkan data, bukan generic
- Fokus pada potensi dan progress user
- Jika data terbatas, berikan encouragement untuk eksplorasi lebih lanjut
- Response harus VALID JSON tanpa markdown atau text tambahan`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let aiSummary;
    try {
      // Remove markdown code blocks if any
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      aiSummary = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error("Invalid AI response format");
    }

    // Save or update profile
    const now = new Date();

    if (userProfile) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          aiSummary: aiSummary,
          summaryGeneratedAt: now,
          lastAnalyzedAt: now,
          updatedAt: now,
        })
        .where(eq(userProfiles.userId, user.id));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        userId: user.id,
        aiSummary: aiSummary,
        summaryGeneratedAt: now,
        lastAnalyzedAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: aiSummary,
    });
  } catch (error) {
    console.error("AI Summary Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing summary
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    if (!profile || !profile.aiSummary) {
      return NextResponse.json(
        { error: "No summary found. Please generate one first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile.aiSummary,
      generatedAt: profile.summaryGeneratedAt,
    });
  } catch (error) {
    console.error("Get AI Summary Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI summary" },
      { status: 500 }
    );
  }
}
