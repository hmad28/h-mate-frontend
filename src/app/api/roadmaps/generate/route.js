import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { targetRole, currentStatus, hasGoal } = await request.json();

    // Generate roadmap using Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Generate roadmap karir untuk: ${targetRole}
Status saat ini: ${currentStatus}
Punya goal: ${hasGoal}

Buat roadmap dalam format JSON dengan struktur:
{
  "title": "Roadmap ke ${targetRole}",
  "overview": "Deskripsi singkat",
  "estimatedTime": "Waktu total (e.g., '12-18 bulan')",
  "phases": [
    {
      "phase": "Nama fase",
      "duration": "Durasi fase",
      "description": "Deskripsi fase",
      "skills": ["skill1", "skill2"],
      "learningResources": [
        {"name": "Resource name", "type": "Course/Book/Video"}
      ],
      "milestones": ["milestone1", "milestone2"]
    }
  ],
  "careerTips": ["tip1", "tip2"]
}

Buat minimal 4-6 fase yang realistis untuk mencapai karir ${targetRole}.`,
        },
      ],
    });

    const roadmapData = JSON.parse(message.content[0].text);

    return NextResponse.json({
      success: true,
      data: roadmapData,
    });
  } catch (error) {
    console.error("❌ Generate roadmap error:", error);
    return NextResponse.json(
      { error: "Gagal generate roadmap" },
      { status: 500 }
    );
  }
}
