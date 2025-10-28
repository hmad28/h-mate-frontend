// /lib/auth.js
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "auth_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session.user;
}

// ✅ FIX: Fetch fresh data from DB setiap kali dipanggil
export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session.user) {
      return null;
    }

    // ✅ Fetch fresh user data from database (termasuk age)
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        age: users.age, // ✅ Include age
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("❌ getCurrentUser error:", error);
    return null;
  }
}
