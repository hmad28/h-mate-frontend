"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    console.log("🚀 VisitorTracker mounted");
    trackVisitor();

    // Heartbeat setiap 30 detik untuk update "last seen"
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat();
    }, 30000);

    // Update saat tab menjadi visible
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

  // Get country flag emoji
  function getFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // Get location from browser geolocation API
  function getBrowserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("❌ Browser geolocation not supported");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Browser geolocation success:", position.coords);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.log("❌ Browser geolocation denied:", error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  // Reverse geocode
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

  // Generate unique session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem("visitorSessionId");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("visitorSessionId", sessionId);
      console.log("🆔 New session ID:", sessionId);
    } else {
      console.log("🆔 Existing session ID:", sessionId);
    }
    return sessionId;
  }

  // Update heartbeat untuk visitor yang sudah ada
  function updateHeartbeat() {
    try {
      const sessionId = getSessionId();
      const stored = JSON.parse(localStorage.getItem("visitors") || "[]");

      const visitorIndex = stored.findIndex((v) => v.sessionId === sessionId);

      if (visitorIndex !== -1) {
        stored[visitorIndex].lastSeen = new Date().toISOString();
        stored[visitorIndex].isActive = true;
        localStorage.setItem("visitors", JSON.stringify(stored));

        // Trigger storage event untuk tab lain
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "visitors",
            newValue: JSON.stringify(stored),
          })
        );
        console.log("💓 Heartbeat updated for session:", sessionId);
      } else {
        console.log("⚠️ Session not found in storage, re-tracking...");
        trackVisitor();
      }
    } catch (error) {
      console.error("❌ Error updating heartbeat:", error);
    }
  }

  // Track visitor
  async function trackVisitor() {
    console.log("📍 Starting visitor tracking...");
    const sessionId = getSessionId();

    // Cek apakah session ini sudah ada DAN masih fresh (< 5 menit)
    const stored = JSON.parse(localStorage.getItem("visitors") || "[]");
    const existingVisitor = stored.find((v) => v.sessionId === sessionId);

    if (existingVisitor) {
      const timeSinceLastSeen =
        Date.now() -
        new Date(
          existingVisitor.lastSeen || existingVisitor.timestamp
        ).getTime();
      if (timeSinceLastSeen < 5 * 60 * 1000) {
        // Update last seen untuk visitor yang sudah ada
        updateHeartbeat();
        console.log("⚠️ Existing fresh session, heartbeat updated");
        return;
      } else {
        console.log("🔄 Existing stale session, re-tracking...");
      }
    }

    // Try GPS first
    const browserLoc = await getBrowserLocation();

    if (browserLoc) {
      console.log("✅ Using GPS location");

      const geoData = await reverseGeocode(browserLoc.lat, browserLoc.lon);

      let ipInfo = "Unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipInfo = ipData.ip;
        console.log("📡 IP:", ipInfo);
      } catch (e) {
        console.error("❌ IP fetch failed:", e);
      }

      const visitor = {
        sessionId: sessionId,
        ip: ipInfo,
        country: geoData ? geoData.country : "Unknown",
        countryCode: geoData ? geoData.countryCode : "XX",
        city: geoData ? geoData.city : "Unknown",
        region: geoData ? geoData.region : "Unknown",
        lat: browserLoc.lat,
        lon: browserLoc.lon,
        timestamp: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isActive: true,
        userAgent: navigator.userAgent,
        provider: "Browser GPS (±" + Math.round(browserLoc.accuracy) + "m)",
        page: window.location.pathname,
      };

      saveVisitor(visitor);
      return;
    }

    // Fallback to IP geolocation
    console.log("🔄 GPS not available, using IP geolocation");

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
      {
        name: "ipwhois.app",
        url: "https://ipwhois.app/json/",
        parse: (data) => {
          if (!data.success) return null;
          return {
            ip: data.ip,
            country: data.country,
            countryCode: data.country_code,
            city: data.city,
            region: data.region,
            lat: data.latitude,
            lon: data.longitude,
          };
        },
      },
    ];

    for (let i = 0; i < providers.length; i++) {
      try {
        console.log("🔍 Trying provider:", providers[i].name);
        const response = await fetch(providers[i].url);
        const rawData = await response.json();
        const parsed = providers[i].parse(rawData);

        if (parsed && parsed.lat && parsed.lon) {
          console.log("✅ Provider success:", providers[i].name, parsed);

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
            provider: providers[i].name + " (IP-based)",
            page: window.location.pathname,
          };

          saveVisitor(visitor);
          return;
        }
      } catch (error) {
        console.error("❌ Provider error:", providers[i].name, error);
      }
    }

    console.error("❌ All tracking methods failed");
  }

  // Save visitor to localStorage
  function saveVisitor(visitor) {
    try {
      const stored = JSON.parse(localStorage.getItem("visitors") || "[]");

      // Remove old entry dengan sessionId yang sama
      const filtered = stored.filter((v) => v.sessionId !== visitor.sessionId);

      // Tambah visitor baru di awal
      filtered.unshift(visitor);

      // Keep last 100 visitors
      if (filtered.length > 100) {
        filtered.splice(100);
      }

      localStorage.setItem("visitors", JSON.stringify(filtered));

      // Trigger storage event untuk tab lain
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "visitors",
          newValue: JSON.stringify(filtered),
        })
      );

      console.log("✅ Visitor saved:", visitor);
    } catch (error) {
      console.error("❌ Error saving visitor:", error);
    }
  }

  return null; // Invisible component
}
