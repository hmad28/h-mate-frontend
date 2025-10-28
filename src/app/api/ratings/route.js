// frontend/src/app/api/ratings/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaryRatings } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto"; // ✅ Tambahkan ini

// Helper function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, isAccurate, feedbackReason, rating } = body;

    console.log("📥 Received payload:", { userId, isAccurate, rating });

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { error: "userId harus berformat UUID yang valid" },
        { status: 400 }
      );
    }

    if (isAccurate === null || isAccurate === undefined) {
      return NextResponse.json(
        { error: "isAccurate wajib diisi (true/false)" },
        { status: 400 }
      );
    }

    if (!feedbackReason || feedbackReason.trim().length < 10) {
      return NextResponse.json(
        { error: "Feedback minimal 10 karakter" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating harus antara 1-5" },
        { status: 400 }
      );
    }

    // ✅ Generate random UUID untuk summaryId
    const generatedSummaryId = crypto.randomUUID();

    // ✅ INSERT rating
    const [result] = await db
      .insert(summaryRatings)
      .values({
        summaryId: generatedSummaryId, // ✅ UUID random, bukan null
        userId,
        rating,
        isAccurate,
        feedbackReason: feedbackReason.trim(),
      })
      .returning();

    console.log("✅ Rating saved successfully:", result.id);

    return NextResponse.json(
      {
        success: true,
        message: "Rating berhasil disimpan",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error saving rating:", error);
    console.error("❌ Full error:", error.stack); // ✅ Lebih detail
    return NextResponse.json(
      { error: "Gagal menyimpan rating", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const summaryId = searchParams.get("summaryId");
    const checkRating = searchParams.get("checkRating");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { error: "userId harus berformat UUID yang valid" },
        { status: 400 }
      );
    }

    // 🔍 Route 1: Check existing rating
    if (summaryId && checkRating === "true") {
      if (!isValidUUID(summaryId)) {
        return NextResponse.json(
          { error: "summaryId harus berformat UUID yang valid" },
          { status: 400 }
        );
      }

      const existingRating = await db
        .select()
        .from(summaryRatings)
        .where(
          and(
            eq(summaryRatings.summaryId, summaryId),
            eq(summaryRatings.userId, userId)
          )
        )
        .limit(1);

      if (existingRating.length === 0) {
        return NextResponse.json(
          { data: null, hasRated: false },
          { status: 200 }
        );
      }

      console.log("✅ Existing rating found:", existingRating[0].id);

      return NextResponse.json(
        {
          data: existingRating[0],
          hasRated: true,
        },
        { status: 200 }
      );
    }

    // 🔍 Route 2: Get USER PROFILE by userId (bukan career summary!)
    console.log("🔍 Fetching profile for userId:", userId);

    const profiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .orderBy(desc(userProfiles.createdAt))
      .limit(1);

    console.log("📊 Profile query result:", profiles);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Profile tidak ditemukan. Silakan selesaikan tes terlebih dahulu.",
          data: null,
        },
        { status: 404 }
      );
    }

    const profile = profiles[0];
    console.log("✅ Profile fetched with ID:", profile.id);

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id, // Ini yang akan jadi summaryId/profileId
        userId: profile.userId,
        personality: profile.personality,
        careerPaths: profile.careerPaths,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
        recommendations: profile.recommendations,
        createdAt: profile.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in GET:", error);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      { error: "Gagal mengambil data", details: error.message },
      { status: 500 }
    );
  }
}
