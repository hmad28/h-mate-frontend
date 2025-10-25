import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roadmaps, roadmapProgress } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { title, targetRole, currentStatus, roadmapData, estimatedTime } =
      await request.json();

    if (!title || !targetRole || !currentStatus || !roadmapData) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    console.log("💾 Saving roadmap for user:", user.username);

    // Save roadmap
    const [newRoadmap] = await db
      .insert(roadmaps)
      .values({
        userId: user.id,
        title,
        targetRole,
        currentStatus,
        roadmapData,
        estimatedTime,
      })
      .returning();

    console.log("✅ Roadmap saved with ID:", newRoadmap.id);

    // Initialize roadmap progress
    await db.insert(roadmapProgress).values({
      roadmapId: newRoadmap.id,
      userId: user.id,
      completedPhases: [],
      completedSkills: [],
      progressPercentage: 0,
    });

    console.log("✅ Progress initialized");

    return NextResponse.json({
      success: true,
      data: newRoadmap,
    });
  } catch (error) {
    console.error("❌ Save roadmap error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan roadmap", details: error.message },
      { status: 500 }
    );
  }
}
