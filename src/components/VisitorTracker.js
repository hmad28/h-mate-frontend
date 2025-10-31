import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
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
    // Use in-memory session ID (akan hilang saat refresh, tapi itu normal behavior)
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

      // Get existing visitor data
      const result = await window.storage.get("visitors:" + sessionId);

      if (result) {
        const visitor = JSON.parse(result.value);
        visitor.lastSeen = new Date().toISOString();
        visitor.isActive = true;

        await window.storage.set(
          "visitors:" + sessionId,
          JSON.stringify(visitor)
        );
        window.dispatchEvent(new Event("visitorUpdate"));
        console.log("💓 Heartbeat updated for session:", sessionId);
      } else {
        console.log("⚠️ Session not found, re-tracking...");
        trackVisitor();
      }
    } catch (error) {
      console.log("⚠️ Heartbeat error (might be new session):", error.message);
      trackVisitor();
    }
  }

  async function reverseGeocode(lat, lon) {
    try {
      console.log("🌍 Reverse geocoding:", lat, lon);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      if (data.address) {
        console.log("✅ Reverse geocode success:", data.address);
        return {
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county,
          country: data.address.country,
          countryCode: data.address.country_code
            ? data.address.country_code.toUpperCase()
            : null,
          region: data.address.state || data.address.region,
        };
      }
    } catch (error) {
      console.error("❌ Reverse geocode error:", error);
    }
    return null;
  }

  async function trackVisitor() {
    console.log("📍 Starting visitor tracking...");
    const sessionId = getSessionId();

    // Check if already tracked recently
    try {
      const result = await window.storage.get("visitors:" + sessionId);
      if (result) {
        const existing = JSON.parse(result.value);
        const timeSince =
          Date.now() -
          new Date(existing.lastSeen || existing.timestamp).getTime();
        if (timeSince < 5 * 60 * 1000) {
          updateHeartbeat();
          console.log("⚠️ Existing fresh session, heartbeat updated");
          return;
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
      // Save visitor with their session ID as key
      await window.storage.set(
        "visitors:" + visitor.sessionId,
        JSON.stringify(visitor)
      );

      // Trigger update event
      window.dispatchEvent(new Event("visitorUpdate"));

      console.log("✅ Visitor saved:", visitor);
    } catch (error) {
      console.error("❌ Error saving visitor:", error);
    }
  }

  return null;
}
