// frontend/src/app/api/ratings/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaryRatings, careerSummaries } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

// Helper function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { summaryId, userId, isAccurate, feedbackReason, rating } = body;

    console.log("📥 Received payload:", {
      summaryId,
      userId,
      isAccurate,
      rating,
    });

    // Validation
    if (!summaryId || !userId) {
      return NextResponse.json(
        { error: "summaryId dan userId wajib diisi" },
        { status: 400 }
      );
    }

    // ✅ VALIDATE UUID FORMAT
    if (!isValidUUID(summaryId)) {
      return NextResponse.json(
        { error: "summaryId harus berformat UUID yang valid" },
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

    // 🔄 Check if user already rated this summary
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

    let result;
    let isUpdate = false;

    if (existingRating.length > 0) {
      // ✏️ UPDATE existing rating
      [result] = await db
        .update(summaryRatings)
        .set({
          rating,
          isAccurate,
          feedbackReason: feedbackReason.trim(),
          createdAt: new Date(), // Update timestamp
        })
        .where(eq(summaryRatings.id, existingRating[0].id))
        .returning();

      isUpdate = true;
      console.log("✅ Rating updated successfully:", result.id);
    } else {
      // ➕ INSERT new rating
      [result] = await db
        .insert(summaryRatings)
        .values({
          summaryId,
          userId,
          rating,
          isAccurate,
          feedbackReason: feedbackReason.trim(),
        })
        .returning();

      console.log("✅ Rating saved successfully:", result.id);
    }

    return NextResponse.json(
      {
        success: true,
        message: isUpdate
          ? "Rating berhasil diperbarui"
          : "Rating berhasil disimpan",
        data: result,
        isUpdate,
      },
      { status: isUpdate ? 200 : 201 }
    );
  } catch (error) {
    console.error("❌ Error saving rating:", error);
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
    const checkRating = searchParams.get("checkRating"); // Flag untuk check existing rating

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { error: "userId harus berformat UUID yang valid" },
        { status: 400 }
      );
    }

    // 🔍 Route 1: Check existing rating (untuk dashboard edit feature)
    // URL: /api/ratings?userId=xxx&summaryId=yyy&checkRating=true
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

    // 🔍 Route 2: Get summary by userId (untuk homepage)
    // URL: /api/ratings?userId=xxx
    console.log("🔍 Fetching summary for userId:", userId);

    const [summary] = await db
      .select({
        id: careerSummaries.id,
        userId: careerSummaries.userId,
        personality: careerSummaries.personality,
        careerPaths: careerSummaries.careerPaths,
        strengths: careerSummaries.strengths,
        weaknesses: careerSummaries.weaknesses,
        recommendations: careerSummaries.recommendations,
        createdAt: careerSummaries.createdAt,
      })
      .from(careerSummaries)
      .where(eq(careerSummaries.userId, userId))
      .orderBy(desc(careerSummaries.createdAt)) // Latest summary
      .limit(1);

    console.log("📦 Summary result:", summary);

    if (!summary) {
      console.log("❌ No summary found for user:", userId);
      return NextResponse.json(
        {
          success: false,
          error: "Summary tidak ditemukan",
          data: null,
        },
        { status: 404 }
      );
    }

    console.log("✅ Summary fetched with ID:", summary.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("❌ Error in GET:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data", details: error.message },
      { status: 500 }
    );
  }
}
