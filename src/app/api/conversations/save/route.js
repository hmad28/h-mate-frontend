import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
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

    const { role, message } = await request.json();

    if (!role || !message) {
      return NextResponse.json(
        { error: "Role dan message harus diisi" },
        { status: 400 }
      );
    }

    // Save conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        role,
        message,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newConversation,
    });
  } catch (error) {
    console.error("Save conversation error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan percakapan" },
      { status: 500 }
    );
  }
}
