import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") return;

    console.log("🚀 VisitorTracker mounted");
    trackVisitor();

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateHeartbeat();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function getSessionId() {
    if (typeof window === "undefined") return null;

    // Use in-memory session ID
    if (!window.visitorSessionId) {
      window.visitorSessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      console.log("🆔 New session ID:", window.visitorSessionId);
    }
    return window.visitorSessionId;
  }

  async function updateHeartbeat() {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      // Get all visitors from localStorage
      const stored = localStorage.getItem("visitors");
      if (!stored) {
        console.log("⚠️ No visitors data, re-tracking...");
        trackVisitor();
        return;
      }

      const visitors = JSON.parse(stored);
      const visitorIndex = visitors.findIndex((v) => v.sessionId === sessionId);

      if (visitorIndex !== -1) {
        // Update existing visitor's lastSeen
        visitors[visitorIndex].lastSeen = new Date().toISOString();
        visitors[visitorIndex].isActive = true;

        localStorage.setItem("visitors", JSON.stringify(visitors));
        window.dispatchEvent(new Event("storage"));
        console.log("💓 Heartbeat updated for session:", sessionId);
      } else {
        console.log("⚠️ Session not found, re-tracking...");
        trackVisitor();
      }
    } catch (error) {
      console.log("⚠️ Heartbeat error:", error.message);
      trackVisitor();
    }
  }

  async function trackVisitor() {
    if (typeof window === "undefined") return;

    console.log("📍 Starting visitor tracking...");
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Check if already tracked recently
    try {
      const stored = localStorage.getItem("visitors");
      if (stored) {
        const visitors = JSON.parse(stored);
        const existing = visitors.find((v) => v.sessionId === sessionId);

        if (existing) {
          const timeSince =
            Date.now() -
            new Date(existing.lastSeen || existing.timestamp).getTime();
          if (timeSince < 5 * 60 * 1000) {
            updateHeartbeat();
            console.log("⚠️ Existing fresh session, heartbeat updated");
            return;
          }
        }
      }
    } catch (error) {
      console.log("🔄 No existing session found, tracking new visitor");
    }

    // Try IP geolocation providers
    const providers = [
      {
        name: "ipapi.co",
        url: "https://ipapi.co/json/",
        parse: (data) => {
          if (data.error) return null;
          return {
            ip: data.ip,
            country: data.country_name,
            countryCode: data.country_code,
            city: data.city,
            region: data.region,
            lat: data.latitude,
            lon: data.longitude,
          };
        },
      },
      {
        name: "ip-api.com",
        url: "http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,query",
        parse: (data) => {
          if (data.status !== "success") return null;
          return {
            ip: data.query,
            country: data.country,
            countryCode: data.countryCode,
            city: data.city,
            region: data.regionName,
            lat: data.lat,
            lon: data.lon,
          };
        },
      },
    ];

    for (let provider of providers) {
      try {
        console.log("🔍 Trying provider:", provider.name);
        const response = await fetch(provider.url);
        const rawData = await response.json();
        const parsed = provider.parse(rawData);

        if (parsed && parsed.lat && parsed.lon) {
          console.log("✅ Provider success:", provider.name, parsed);

          const visitor = {
            sessionId: sessionId,
            ip: parsed.ip,
            country: parsed.country,
            countryCode: parsed.countryCode,
            city: parsed.city,
            region: parsed.region,
            lat: parsed.lat,
            lon: parsed.lon,
            timestamp: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isActive: true,
            userAgent: navigator.userAgent,
            provider: provider.name + " (IP-based)",
            page: window.location.pathname,
          };

          await saveVisitor(visitor);
          return;
        }
      } catch (error) {
        console.error("❌ Provider error:", provider.name, error);
      }
    }

    console.error("❌ All tracking methods failed");
  }

  async function saveVisitor(visitor) {
    try {
      // Get existing visitors from localStorage
      const stored = localStorage.getItem("visitors");
      const visitors = stored ? JSON.parse(stored) : [];

      // Add new visitor at the beginning
      visitors.unshift(visitor);

      // Keep only last 100 visitors
      if (visitors.length > 100) {
        visitors.splice(100);
      }

      // Save back to localStorage
      localStorage.setItem("visitors", JSON.stringify(visitors));

      // Trigger storage event for other tabs/components
      window.dispatchEvent(new Event("storage"));

      console.log("✅ Visitor saved:", visitor);
    } catch (error) {
      console.error("❌ Error saving visitor:", error);
    }
  }

  return null;
}
