// File: src/app/api/visitors/route.js
// Next.js 13+ App Router API Route

import { NextResponse } from "next/server";

// In-memory storage (untuk development)
// Untuk production, ganti dengan database (MongoDB, Supabase, dll)
let visitorsStore = [];

// GET - Ambil semua visitors
export async function GET(request) {
  try {
    // Sort by timestamp (newest first)
    const sortedVisitors = [...visitorsStore].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedVisitors,
      count: sortedVisitors.length,
    });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Tambah atau update visitor
export async function POST(request) {
  try {
    const visitorData = await request.json();

    if (!visitorData.sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Cek apakah visitor sudah ada
    const existingIndex = visitorsStore.findIndex(
      (v) => v.sessionId === visitorData.sessionId
    );

    if (existingIndex !== -1) {
      // Update existing visitor
      visitorsStore[existingIndex] = {
        ...visitorsStore[existingIndex],
        ...visitorData,
        lastSeen: new Date().toISOString(),
      };
      console.log("✅ Visitor updated:", visitorData.sessionId);
    } else {
      // Tambah visitor baru
      visitorsStore.unshift({
        ...visitorData,
        timestamp: visitorData.timestamp || new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
      console.log("✅ New visitor added:", visitorData.sessionId);
    }

    // Keep only last 100 visitors
    if (visitorsStore.length > 100) {
      visitorsStore = visitorsStore.slice(0, 100);
    }

    return NextResponse.json({
      success: true,
      message: existingIndex !== -1 ? "Visitor updated" : "Visitor added",
      data: visitorData,
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Hapus semua visitors
export async function DELETE(request) {
  try {
    const count = visitorsStore.length;
    visitorsStore = [];

    console.log("🗑️ All visitors cleared");

    return NextResponse.json({
      success: true,
      message: `Cleared ${count} visitors`,
    });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Auto cleanup inactive visitors setiap 1 jam
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const beforeCount = visitorsStore.length;

    visitorsStore = visitorsStore.filter((v) => {
      const lastSeenTime = new Date(v.lastSeen || v.timestamp).getTime();
      return lastSeenTime > oneHourAgo;
    });

    const removedCount = beforeCount - visitorsStore.length;
    if (removedCount > 0) {
      console.log(`🧹 Auto cleanup: Removed ${removedCount} inactive visitors`);
    }
  }, 60 * 60 * 1000); // Every 1 hour
}
