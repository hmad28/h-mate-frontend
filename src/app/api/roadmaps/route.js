import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roadmaps, roadmapProgress } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Get user roadmaps with progress
    const userRoadmaps = await db
      .select({
        roadmap: roadmaps,
        progress: roadmapProgress,
      })
      .from(roadmaps)
      .leftJoin(roadmapProgress, eq(roadmaps.id, roadmapProgress.roadmapId))
      .where(eq(roadmaps.userId, user.id))
      .orderBy(desc(roadmaps.createdAt));

    return NextResponse.json({
      success: true,
      data: userRoadmaps,
    });
  } catch (error) {
    console.error("❌ Get roadmaps error:", error);
    return NextResponse.json(
      { error: "Gagal memuat roadmaps" },
      { status: 500 }
    );
  }
}
