"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Trash2, MapPin } from "lucide-react";

export default function VisitorMapWidget() {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    today: 0,
    online: 0,
  });

  useEffect(() => {
    loadVisitors();

    // Auto refresh every 5 seconds
    const interval = setInterval(loadVisitors, 5000);

    // Listen for storage changes
    const handleStorage = (e) => {
      if (e.key === "visitors" || e.storageArea === localStorage) {
        loadVisitors();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const loadVisitors = () => {
    try {
      const stored = localStorage.getItem("visitors");
      if (stored) {
        const data = JSON.parse(stored);
        setVisitors(data);
        calculateStats(data);
        console.log("✅ Loaded", data.length, "visitors");
      }
    } catch (error) {
      console.error("Error loading visitors:", error);
    }
  };

  const calculateStats = (data) => {
    const countries = new Set(data.map((v) => v.country)).size;
    const today = new Date().toDateString();
    const todayCount = data.filter(
      (v) => new Date(v.timestamp).toDateString() === today
    ).length;
    const twoMinAgo = Date.now() - 2 * 60 * 1000;
    const online = data.filter(
      (v) => new Date(v.lastSeen || v.timestamp).getTime() > twoMinAgo
    ).length;

    setStats({
      total: data.length,
      countries,
      today: todayCount,
      online,
    });
  };

  const getFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return seconds + "s ago";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    return Math.floor(seconds / 86400) + "d ago";
  };

  const isActive = (visitor) => {
    const twoMinAgo = Date.now() - 2 * 60 * 1000;
    return (
      new Date(visitor.lastSeen || visitor.timestamp).getTime() > twoMinAgo
    );
  };

  const clearData = () => {
    if (confirm("Clear all visitor data?")) {
      localStorage.removeItem("visitors");
      setVisitors([]);
      setStats({ total: 0, countries: 0, today: 0, online: 0 });
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Visitor Analytics
                <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-1 rounded-full animate-pulse">
                  Live
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Real-time visitor tracking
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadVisitors}
              className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={clearData}
              className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-slate-900/40">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.countries}</div>
          <div className="text-xs text-slate-400">Countries</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.today}</div>
          <div className="text-xs text-slate-400">Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {stats.online}
          </div>
          <div className="text-xs text-slate-400">Online</div>
        </div>
      </div>

      {/* Visitor List */}
      <div className="p-6 bg-slate-950/50 max-h-[600px] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4">Recent Visitors</h3>
        {visitors.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No visitors yet. Visit homepage to track!
          </div>
        ) : (
          <div className="space-y-3">
            {visitors.slice(0, 20).map((visitor, idx) => {
              const active = isActive(visitor);
              return (
                <div
                  key={visitor.sessionId || idx}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/30 transition"
                >
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-2xl">
                    {getFlag(visitor.countryCode)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {active && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                      <span className="truncate">
                        {visitor.city || "Unknown"}, {visitor.country}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 truncate">
                      IP: {visitor.ip} •{" "}
                      {timeAgo(visitor.lastSeen || visitor.timestamp)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {visitor.provider} •{" "}
                      {active ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        <span className="text-slate-400">Offline</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
