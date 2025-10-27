// api/profile/ai-summary/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  userProfiles,
  testResults,
  roadmaps,
  conversations,
} from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧠 Generating AI Summary for:", user.username);

    // Fetch ALL user data comprehensively
    const [latestTests, userRoadmaps, recentConversations, profile] =
      await Promise.all([
        db
          .select()
          .from(testResults)
          .where(eq(testResults.userId, user.id))
          .orderBy(desc(testResults.createdAt)),

        db
          .select()
          .from(roadmaps)
          .where(eq(roadmaps.userId, user.id))
          .orderBy(desc(roadmaps.createdAt)),

        db
          .select()
          .from(conversations)
          .where(eq(conversations.userId, user.id))
          .orderBy(desc(conversations.createdAt))
          .limit(50), // Ambil 50 pesan terakhir untuk context

        db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, user.id))
          .limit(1),
      ]);

    const userProfile = profile[0];

    // Build comprehensive data summary
    const dataString = `
=== INFORMASI USER ===
- Username: ${user.username}
- Umur: ${user.age} tahun
- Member sejak: ${new Date(user.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
- Lama bergabung: ${Math.floor(
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    )} hari

=== AKTIVITAS & ENGAGEMENT ===
- Total tes yang diikuti: ${latestTests.length}
- Total roadmap yang dibuat: ${userRoadmaps.length}
- Total percakapan konsultasi: ${recentConversations.length}
- Tingkat aktivitas: ${
      latestTests.length + userRoadmaps.length + recentConversations.length > 10
        ? "Sangat Aktif"
        : latestTests.length + userRoadmaps.length > 5
        ? "Aktif"
        : "Perlu Lebih Aktif"
    }

=== HASIL TES MINAT BAKAT ===
${
  latestTests.length > 0
    ? latestTests
        .map((test, i) => {
          const careers = test.aiAnalysis?.recommended_careers || [];
          const personality = test.aiAnalysis?.personality_insights || {};
          return `
${i + 1}. Tes ${test.testType} (${new Date(test.createdAt).toLocaleDateString(
            "id-ID"
          )})
   Karir yang direkomendasikan:
   ${
     careers
       .map(
         (c, idx) =>
           `   - ${c.title} (Match: ${c.match_percentage}%) - ${c.reason}`
       )
       .join("\n   ") || "   Tidak ada rekomendasi"
   }
   
   Personality Insights:
   ${
     Object.entries(personality)
       .map(([key, value]) => `   - ${key}: ${JSON.stringify(value)}`)
       .join("\n   ") || "   Tidak ada insight"
   }
`;
        })
        .join("\n")
    : "Belum pernah mengikuti tes minat bakat"
}

=== ROADMAP YANG DIBUAT ===
${
  userRoadmaps.length > 0
    ? userRoadmaps
        .map(
          (roadmap, i) => `
${i + 1}. ${roadmap.title}
   Target Role: ${roadmap.targetRole}
   Status: ${roadmap.currentStatus === "pelajar" ? "Pelajar" : "Profesional"}
   Estimasi Waktu: ${roadmap.estimatedTime || "Tidak ada estimasi"}
   Dibuat: ${new Date(roadmap.createdAt).toLocaleDateString("id-ID")}
   Total Fase: ${roadmap.roadmapData?.phases?.length || 0}
`
        )
        .join("\n")
    : "Belum membuat roadmap"
}

=== PROFILE YANG SUDAH DIANALISIS ===
${
  userProfile
    ? `
- Interests: ${userProfile.interests?.join(", ") || "Belum teridentifikasi"}
- Skills: ${userProfile.skills?.join(", ") || "Belum teridentifikasi"}
- Personality Traits: ${
        JSON.stringify(userProfile.personalityTraits) || "Belum teridentifikasi"
      }
- Work Preferences: ${
        JSON.stringify(userProfile.workPreferences) || "Belum teridentifikasi"
      }
- Career Matches dari profile: 
  ${
    userProfile.careerMatches
      ?.map((c) => `  - ${c.title} (${c.match_percentage || "N/A"}%)`)
      .join("\n  ") || "  Belum ada"
  }
- AI Confidence Score: ${userProfile.aiConfidenceScore || 0}%
`
    : "Profile belum dibuat (user baru)"
}

=== INSIGHT DARI KONSULTASI ===
${
  recentConversations.length > 0
    ? `
Total pesan: ${recentConversations.length}
Sample percakapan terakhir (untuk context):
${recentConversations
  .slice(0, 10)
  .map((msg, i) => {
    const content = msg.content || "";
    return `${i + 1}. [${msg.role}]: ${content.substring(0, 150)}${
      content.length > 150 ? "..." : ""
    }`;
  })
  .join("\n")}
`
    : "Belum pernah konsultasi"
}
`;

    // Generate AI Summary using Express backend
    const prompt = `Kamu adalah career coach AI untuk platform H-Mate. Analisis SEMUA data user berikut secara KOMPREHENSIF dan buat kesimpulan mendalam dalam Bahasa Indonesia.

${dataString}

INSTRUKSI ANALISIS:
1. Gunakan SEMUA data yang tersedia (tes, roadmap, konsultasi, profile)
2. Identifikasi pattern dan konsistensi dari berbagai sumber data
3. Buat analisis yang personal, spesifik, dan actionable
4. Jika data terbatas, berikan insight berdasarkan apa yang ada dan encourage user untuk lebih aktif

OUTPUT HARUS JSON MURNI (tanpa markdown, tanpa backticks):
{
  "overallSummary": "Ringkasan komprehensif 3-4 kalimat tentang user: siapa mereka, apa yang sudah dilakukan, arah karier, dan potensi yang terlihat",
  "personality": {
    "type": "Tipe kepribadian yang terlihat dari semua data (contoh: Creative Problem Solver, Analytical Strategist, People-Oriented Builder)",
    "traits": ["trait1 yang konsisten terlihat", "trait2", "trait3", "trait4", "trait5"]
  },
  "careerAlignment": {
    "score": 75,
    "status": "Sangat Cocok/Cukup Cocok/Perlu Eksplorasi/Masih Mencari Arah",
    "message": "Pesan singkat tentang seberapa aligned aktivitas user dengan career path yang dipilih"
  },
  "strengths": ["kekuatan konkret dari data", "strength2", "strength3", "strength4"],
  "areasToImprove": ["area yang perlu dikembangkan", "area2", "area3"],
  "topCareerMatches": [
    {"title": "Career 1 paling cocok dari SEMUA data", "score": 92, "reason": "Alasan spesifik kenapa cocok"},
    {"title": "Career 2", "score": 88, "reason": "Alasan"},
    {"title": "Career 3", "score": 85, "reason": "Alasan"}
  ],
  "motivation": "Pesan motivational yang PERSONAL berdasarkan journey user sejauh ini (3-4 kalimat, harus inspiring dan relatable)",
  "nextSteps": [
    "Langkah konkret 1 berdasarkan data (misal: 'Fokus menyelesaikan roadmap Frontend Developer yang sudah kamu mulai')",
    "Langkah 2",
    "Langkah 3",
    "Langkah 4",
    "Langkah 5"
  ],
  "activityLevel": "Sangat Aktif (10+ aktivitas)/Aktif (5-10 aktivitas)/Perlu Lebih Aktif (<5 aktivitas)",
  "journeyStage": "Eksplorasi (baru mulai)/Fokus (sudah ada arah)/Eksekusi (aktif mengerjakan roadmap)"
}

PENTING:
- Analisis harus SPESIFIK berdasarkan data user, BUKAN generic
- Sebutkan detail konkret (nama karir, roadmap, hasil tes) dalam analisis
- Berikan insight yang actionable dan memotivasi
- Jika user sangat aktif, apresiasi dan dorong mereka terus
- Jika user baru/kurang aktif, motivasi mereka untuk mulai eksplorasi
- Response HARUS pure JSON, tidak boleh ada text lain sama sekali`;

    // Call Express backend Gemini API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    console.log("📡 Calling backend API with comprehensive data...");
    const geminiResponse = await fetch(`${API_URL}/api/konsultasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        history: [],
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error("Failed to generate AI summary from backend");
    }

    const geminiData = await geminiResponse.json();
    let aiSummary;

    try {
      const responseText = geminiData.data.response;
      console.log(
        "📝 Raw AI response:",
        responseText.substring(0, 200) + "..."
      );

      // Extract JSON from response (remove markdown if any)
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to find JSON object in the response
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        aiSummary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }

      console.log("✅ Successfully parsed AI summary");
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("Response was:", geminiData.data.response);
      throw new Error("Invalid AI response format");
    }

    // Save to database
    const now = new Date();

    if (userProfile) {
      await db
        .update(userProfiles)
        .set({
          aiSummary: aiSummary,
          summaryGeneratedAt: now,
          lastAnalyzedAt: now,
          updatedAt: now,
        })
        .where(eq(userProfiles.userId, user.id));
      console.log("✅ AI Summary updated in database");
    } else {
      await db.insert(userProfiles).values({
        userId: user.id,
        aiSummary: aiSummary,
        summaryGeneratedAt: now,
        lastAnalyzedAt: now,
        updatedAt: now,
      });
      console.log("✅ AI Summary created in database");
    }

    return NextResponse.json({
      success: true,
      data: aiSummary,
    });
  } catch (error) {
    console.error("❌ AI Summary Generation Error:", error);
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
    console.error("❌ Get AI Summary Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI summary" },
      { status: 500 }
    );
  }
}
