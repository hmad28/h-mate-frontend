import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/schema";
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

    const { currentMessage, history } = await request.json();

    console.log("🔍 Analyzing conversation for user:", user.username);

    // Prepare conversation context for AI analysis
    const conversationText = history
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");

    const fullContext = conversationText + `\nUser: ${currentMessage}`;

    // Call Gemini API to analyze conversation
    const analysisPrompt = `Analisis percakapan berikut dan extract insights tentang user:

${fullContext}

User info: ${user.username}, umur ${user.age} tahun.

Extract:
1. **interests**: Array of interests yang disebutkan (misal: ['coding', 'design', 'gaming'])
2. **skills**: Array of skills yang disebutkan (misal: ['communication', 'problem-solving'])
3. **workPreferences**: Object berisi preferensi kerja (misal: {lightWorkload: true, remote: true, teamwork: false})
4. **careerHints**: Array of career yang disebutkan atau di-hint (misal: ['Frontend Developer', 'UI/UX Designer'])
5. **personalityTraits**: Object traits yang terdeteksi (misal: {creative: true, analytical: false})

PENTING:
- Hanya extract kalau JELAS disebutkan atau strongly implied
- Jangan asumsi atau guess
- Return null untuk field yang tidak ada informasi
- Confidence minimal 70%

Output dalam JSON format:
{
  "hasInsights": true/false,
  "interests": [...] or null,
  "skills": [...] or null,
  "workPreferences": {...} or null,
  "careerHints": [...] or null,
  "personalityTraits": {...} or null,
  "confidence": 0-100
}`;

    // Call backend Gemini API (using your Express backend)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const geminiResponse = await fetch(`${API_URL}/api/konsultasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: analysisPrompt,
        history: [],
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error("Failed to analyze conversation");
    }

    const geminiData = await geminiResponse.json();
    let analysis;

    try {
      // Try to parse AI response as JSON
      const responseText = geminiData.data.response;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        console.log("❌ No valid JSON found in AI response");
        return NextResponse.json({
          updated: false,
          reason: "No valid analysis",
        });
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI analysis:", parseError);
      return NextResponse.json({ updated: false, reason: "Parse error" });
    }

    console.log("📊 Analysis result:", analysis);

    // Check if there are meaningful insights
    if (!analysis.hasInsights || analysis.confidence < 70) {
      console.log("ℹ️ No significant insights found");
      return NextResponse.json({
        updated: false,
        reason: "Low confidence or no insights",
      });
    }

    // Get existing profile
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // Merge insights with existing profile
    const updatedData = {};
    let hasChanges = false;

    if (analysis.interests && analysis.interests.length > 0) {
      const existingInterests = existingProfile?.interests || [];
      const mergedInterests = [
        ...new Set([...existingInterests, ...analysis.interests]),
      ];
      if (
        JSON.stringify(mergedInterests) !== JSON.stringify(existingInterests)
      ) {
        updatedData.interests = mergedInterests;
        hasChanges = true;
      }
    }

    if (analysis.skills && analysis.skills.length > 0) {
      const existingSkills = existingProfile?.skills || [];
      const mergedSkills = [
        ...new Set([...existingSkills, ...analysis.skills]),
      ];
      if (JSON.stringify(mergedSkills) !== JSON.stringify(existingSkills)) {
        updatedData.skills = mergedSkills;
        hasChanges = true;
      }
    }

    if (analysis.workPreferences) {
      const existingPrefs = existingProfile?.workPreferences || {};
      const mergedPrefs = { ...existingPrefs, ...analysis.workPreferences };
      if (JSON.stringify(mergedPrefs) !== JSON.stringify(existingPrefs)) {
        updatedData.workPreferences = mergedPrefs;
        hasChanges = true;
      }
    }

    if (analysis.personalityTraits) {
      const existingTraits = existingProfile?.personalityTraits || {};
      const mergedTraits = { ...existingTraits, ...analysis.personalityTraits };
      if (JSON.stringify(mergedTraits) !== JSON.stringify(existingTraits)) {
        updatedData.personalityTraits = mergedTraits;
        hasChanges = true;
      }
    }

    // Update career matches if career hints found
    if (analysis.careerHints && analysis.careerHints.length > 0) {
      const existingMatches = existingProfile?.careerMatches || [];
      const newMatches = analysis.careerHints.map((career) => ({
        title: career,
        match_percentage: 75, // From conversation, medium confidence
        reason: "Disebutkan dalam percakapan",
      }));

      const mergedMatches = [...existingMatches];
      newMatches.forEach((newMatch) => {
        const exists = mergedMatches.find((m) => m.title === newMatch.title);
        if (!exists) {
          mergedMatches.push(newMatch);
        }
      });

      if (mergedMatches.length !== existingMatches.length) {
        updatedData.careerMatches = mergedMatches;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      console.log("ℹ️ No changes to update");
      return NextResponse.json({ updated: false, reason: "No changes" });
    }

    // Update or create profile
    updatedData.lastAnalyzedAt = new Date();
    updatedData.updatedAt = new Date();

    if (existingProfile) {
      await db
        .update(userProfiles)
        .set(updatedData)
        .where(eq(userProfiles.userId, user.id));
      console.log("✅ Profile updated with conversation insights");
    } else {
      await db.insert(userProfiles).values({
        userId: user.id,
        ...updatedData,
        aiConfidenceScore: analysis.confidence,
      });
      console.log("✅ Profile created with conversation insights");
    }

    return NextResponse.json({
      updated: true,
      insights: updatedData,
    });
  } catch (error) {
    console.error("❌ Analyze conversation error:", error);
    return NextResponse.json(
      { updated: false, error: error.message },
      { status: 500 }
    );
  }
}
