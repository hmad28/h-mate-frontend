import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🚀 VisitorTracker mounted (API version)");
    trackVisitor();

    // Heartbeat setiap 30 detik
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

    let sessionId = sessionStorage.getItem("visitorSessionId");

    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("visitorSessionId", sessionId);
      console.log("🆔 New session ID:", sessionId);
    }

    return sessionId;
  }

  async function updateHeartbeat() {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      // Get current visitor data from API
      const response = await fetch("/api/visitors");
      const result = await response.json();

      if (result.success && result.data) {
        const existingVisitor = result.data.find(
          (v) => v.sessionId === sessionId
        );

        if (existingVisitor) {
          // Update heartbeat
          await fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...existingVisitor,
              lastSeen: new Date().toISOString(),
              isActive: true,
            }),
          });

          console.log("💓 Heartbeat updated for session:", sessionId);
        } else {
          console.log("⚠️ Session not found, re-tracking...");
          trackVisitor();
        }
      }
    } catch (error) {
      console.log("⚠️ Heartbeat error:", error.message);
    }
  }

  async function trackVisitor() {
    if (typeof window === "undefined") return;

    console.log("📍 Starting visitor tracking...");
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Check if already tracked
    try {
      const response = await fetch("/api/visitors");
      const result = await response.json();

      if (result.success && result.data) {
        const existing = result.data.find((v) => v.sessionId === sessionId);

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
      console.log("🔄 Checking for existing session...");
    }

    // IP geolocation providers
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
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visitor),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Visitor saved to API:", visitor);
      } else {
        console.error("❌ Failed to save visitor:", result.error);
      }
    } catch (error) {
      console.error("❌ Error saving visitor:", error);
    }
  }

  return null;
}
