import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summaryRatings } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    const { summaryId, userId, isAccurate, feedbackReason, rating } = body;

    // Validation
    if (!summaryId || !userId) {
      return NextResponse.json(
        { error: "summaryId dan userId wajib diisi" },
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

    // Check if user already rated this summary
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

    if (existingRating.length > 0) {
      return NextResponse.json(
        { error: "Kamu sudah memberikan rating untuk summary ini" },
        { status: 409 }
      );
    }

    // Insert rating
    const [newRating] = await db
      .insert(summaryRatings)
      .values({
        summaryId,
        userId,
        rating,
        isAccurate,
        feedbackReason: feedbackReason.trim(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Rating berhasil disimpan",
        data: newRating,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan rating" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint untuk mengambil rating user tertentu
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
