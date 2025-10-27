import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaryRatings } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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
    const summaryId = searchParams.get("summaryId");
    const userId = searchParams.get("userId");

    if (!summaryId || !userId) {
      return NextResponse.json(
        { error: "summaryId dan userId diperlukan" },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!isValidUUID(summaryId) || !isValidUUID(userId)) {
      return NextResponse.json(
        { error: "summaryId dan userId harus berformat UUID yang valid" },
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

    return NextResponse.json(
      {
        data: existingRating[0],
        hasRated: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Gagal mengambil rating" },
      { status: 500 }
    );
  }
}
