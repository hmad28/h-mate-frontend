import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { username, password, age } = await request.json();

    // Validation
    if (!username || !password || !age) {
      return NextResponse.json(
        { error: "Username, password, dan umur harus diisi" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    if (age < 13 || age > 100) {
      return NextResponse.json(
        { error: "Umur harus antara 13-100 tahun" },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        age: parseInt(age),
      })
      .returning({ id: users.id, username: users.username, age: users.age });

    // Create session
    const session = await getSession();
    session.user = {
      id: newUser.id,
      username: newUser.username,
      age: newUser.age,
    };
    await session.save();

    return NextResponse.json(
      { message: "Registrasi berhasil!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
