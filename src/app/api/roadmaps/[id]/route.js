import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roadmaps, roadmapProgress } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const roadmapId = params.id;

    // Get roadmap with progress
    const [roadmapData] = await db
      .select({
        roadmap: roadmaps,
        progress: roadmapProgress,
      })
      .from(roadmaps)
      .leftJoin(roadmapProgress, eq(roadmaps.id, roadmapProgress.roadmapId))
      .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, user.id)))
      .limit(1);

    if (!roadmapData) {
      return NextResponse.json(
        { error: "Roadmap tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roadmapData,
    });
  } catch (error) {
    console.error("❌ Get roadmap error:", error);
    return NextResponse.json(
      { error: "Gagal memuat roadmap" },
      { status: 500 }
    );
  }
}
