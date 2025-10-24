import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Load last N conversations
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);

    // Reverse to get chronological order (oldest first)
    const orderedConversations = userConversations.reverse();

    return NextResponse.json({
      success: true,
      data: orderedConversations,
    });
  } catch (error) {
    console.error("Load conversations error:", error);
    return NextResponse.json(
      { error: "Gagal memuat percakapan" },
      { status: 500 }
    );
  }
}
