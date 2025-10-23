import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  userProfiles,
  testResults,
  roadmaps,
  roadmapProgress,
} from "@/lib/schema";
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

    // Get user profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // Get latest test results
    const latestTests = await db
      .select()
      .from(testResults)
      .where(eq(testResults.userId, user.id))
      .orderBy(desc(testResults.createdAt))
      .limit(3);

    // Get active roadmaps with progress
    const userRoadmaps = await db
      .select({
        roadmap: roadmaps,
        progress: roadmapProgress,
      })
      .from(roadmaps)
      .leftJoin(roadmapProgress, eq(roadmaps.id, roadmapProgress.roadmapId))
      .where(eq(roadmaps.userId, user.id))
      .orderBy(desc(roadmaps.createdAt))
      .limit(5);

    // Calculate overall progress
    let overallProgress = 0;
    if (userRoadmaps.length > 0) {
      const avgProgress = userRoadmaps.reduce((sum, item) => {
        return sum + (item.progress?.progressPercentage || 0);
      }, 0);
      overallProgress = Math.round(avgProgress / userRoadmaps.length);
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: profile || null,
        latestTests,
        roadmaps: userRoadmaps,
        overallProgress,
        stats: {
          totalTests: latestTests.length,
          totalRoadmaps: userRoadmaps.length,
          overallProgress,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Gagal memuat profile" },
      { status: 500 }
    );
  }
}
