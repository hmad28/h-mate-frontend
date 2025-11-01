// File: /pages/api/visitors.js atau /app/api/visitors/route.js (tergantung Next.js versi)

// Temporary in-memory storage (untuk development/testing)
// Untuk production, ganti dengan database (MongoDB, PostgreSQL, dll)
let visitorsStore = [];

export default async function handler(req, res) {
  const { method } = req;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request
  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case "GET":
        // Get all visitors
        const sortedVisitors = visitorsStore.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return res.status(200).json({
          success: true,
          data: sortedVisitors,
          count: sortedVisitors.length,
        });

      case "POST":
        // Add new visitor or update existing
        const visitorData = req.body;

        if (!visitorData.sessionId) {
          return res.status(400).json({
            success: false,
            error: "Session ID is required",
          });
        }

        // Check if visitor already exists
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
          // Add new visitor
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

        return res.status(200).json({
          success: true,
          message: existingIndex !== -1 ? "Visitor updated" : "Visitor added",
          data: visitorData,
        });

      case "DELETE":
        // Clear all visitors
        const count = visitorsStore.length;
        visitorsStore = [];

        console.log("🗑️ All visitors cleared");

        return res.status(200).json({
          success: true,
          message: `Cleared ${count} visitors`,
        });

      default:
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`,
        });
    }
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Optional: Auto cleanup inactive visitors every 1 hour
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
