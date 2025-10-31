"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    trackVisitor();
  }, []);

  // Get country flag emoji
  function getFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    var codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(function (char) {
        return 127397 + char.charCodeAt(0);
      });
    return String.fromCodePoint.apply(String, codePoints);
  }

  // Get location from browser geolocation API
  function getBrowserLocation() {
    return new Promise(function (resolve) {
      if (!navigator.geolocation) {
        console.log("Browser geolocation not supported");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          console.log("✅ Browser geolocation success");
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        function (error) {
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
      var response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      var data = await response.json();

      if (data.address) {
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
      console.error("Reverse geocode error:", error);
    }
    return null;
  }

  // Track visitor
  async function trackVisitor() {
    // Try GPS first
    var browserLoc = await getBrowserLocation();

    if (browserLoc) {
      console.log("✅ Using GPS location");

      var geoData = await reverseGeocode(browserLoc.lat, browserLoc.lon);

      var ipInfo = "Unknown";
      try {
        var ipResponse = await fetch("https://api.ipify.org?format=json");
        var ipData = await ipResponse.json();
        ipInfo = ipData.ip;
      } catch (e) {}

      var visitor = {
        ip: ipInfo,
        country: geoData ? geoData.country : "Unknown",
        countryCode: geoData ? geoData.countryCode : "XX",
        city: geoData ? geoData.city : "Unknown",
        region: geoData ? geoData.region : "Unknown",
        lat: browserLoc.lat,
        lon: browserLoc.lon,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        provider: "Browser GPS (±" + Math.round(browserLoc.accuracy) + "m)",
        page: window.location.pathname,
      };

      saveVisitor(visitor);
      return;
    }

    // Fallback to IP geolocation
    console.log("❌ GPS denied, using IP geolocation");

    var providers = [
      {
        name: "ipapi.co",
        url: "https://ipapi.co/json/",
        parse: function (data) {
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
        parse: function (data) {
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
        parse: function (data) {
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

    for (var i = 0; i < providers.length; i++) {
      try {
        var response = await fetch(providers[i].url);
        var rawData = await response.json();
        var parsed = providers[i].parse(rawData);

        if (parsed && parsed.lat && parsed.lon) {
          var visitor = {
            ip: parsed.ip,
            country: parsed.country,
            countryCode: parsed.countryCode,
            city: parsed.city,
            region: parsed.region,
            lat: parsed.lat,
            lon: parsed.lon,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            provider: providers[i].name + " (IP-based)",
            page: window.location.pathname,
          };

          saveVisitor(visitor);
          return;
        }
      } catch (error) {
        console.error("Provider error:", providers[i].name, error);
      }
    }

    console.error("❌ All tracking methods failed");
  }

  // Save visitor to localStorage
  function saveVisitor(visitor) {
    try {
      var stored = JSON.parse(localStorage.getItem("visitors") || "[]");

      // Prevent duplicate (same IP within 5 minutes)
      var fiveMinAgo = Date.now() - 5 * 60 * 1000;
      var isDuplicate = stored.some(function (v) {
        return (
          v.ip === visitor.ip && new Date(v.timestamp).getTime() > fiveMinAgo
        );
      });

      if (!isDuplicate) {
        stored.unshift(visitor);
        if (stored.length > 100) stored = stored.slice(0, 100);
        localStorage.setItem("visitors", JSON.stringify(stored));
        console.log("✅ Visitor tracked:", visitor);
      } else {
        console.log("⚠️ Duplicate visitor, skipped");
      }
    } catch (error) {
      console.error("Error saving visitor:", error);
    }
  }

  return null; // Invisible component
}
