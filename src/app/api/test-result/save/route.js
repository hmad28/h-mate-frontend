import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testResults, userProfiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { testType, questions, answers, aiAnalysis } = await request.json();

    if (!testType || !questions || !answers || !aiAnalysis) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    console.log("💾 Saving test result for user:", user.id);
    console.log("📊 Test type:", testType);
    console.log("📝 Questions count:", questions.length);
    console.log("✅ Answers count:", answers.length);

    // Save test result
    const [newTestResult] = await db
      .insert(testResults)
      .values({
        userId: user.id,
        testType,
        questions,
        answers,
        aiAnalysis,
      })
      .returning();

    console.log("✅ Test result saved with ID:", newTestResult.id);

    // Update or create user profile based on test results
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // Extract career matches from AI analysis
    const careerMatches = aiAnalysis.recommended_careers || [];
    const personalityType = aiAnalysis.personality_type || null;
    const strengths = aiAnalysis.strengths || [];

    console.log("🎯 Career matches to save:", careerMatches.length);

    if (existingProfile.length > 0) {
      // Update existing profile
      console.log("🔄 Updating existing profile...");
      await db
        .update(userProfiles)
        .set({
          careerMatches: careerMatches,
          personalityTraits: { type: personalityType },
          skills: strengths,
          lastAnalyzedAt: new Date(),
          aiConfidenceScore: 85, // Default confidence from test
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, user.id));
      console.log("✅ Profile updated");
    } else {
      // Create new profile
      console.log("➕ Creating new profile...");
      await db.insert(userProfiles).values({
        userId: user.id,
        careerMatches: careerMatches,
        personalityTraits: { type: personalityType },
        skills: strengths,
        lastAnalyzedAt: new Date(),
        aiConfidenceScore: 85,
      });
      console.log("✅ Profile created");
    }

    return NextResponse.json({
      success: true,
      data: newTestResult,
    });
  } catch (error) {
    console.error("❌ Save test result error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil tes", details: error.message },
      { status: 500 }
    );
  }
}
