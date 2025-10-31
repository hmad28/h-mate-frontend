import { useState, useEffect } from "react";
import {
  RefreshCw,
  Trash2,
  MapPin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function VisitorMapWidget() {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    today: 0,
    online: 0,
  });
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") return;

    console.log("🚀 VisitorMapWidget mounted");
    loadVisitors();

    const interval = setInterval(() => {
      console.log("🔄 Auto refresh...");
      loadVisitors();
    }, 5000);

    // Listen for storage changes from other tabs/components
    const handleStorageChange = () => {
      console.log("📡 Storage event detected");
      loadVisitors();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadVisitors = () => {
    try {
      const stored = localStorage.getItem("visitors");

      if (stored) {
        const visitorsData = JSON.parse(stored);

        // Sort by timestamp (newest first)
        visitorsData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        console.log("✅ Loaded visitors:", visitorsData.length);
        setVisitors(visitorsData);
        calculateStats(visitorsData);
      } else {
        console.log("⚠️ No visitors found");
        setVisitors([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error("❌ Error loading visitors:", error);
      showToast("Error loading data", "error");
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log("🔄 Manual refresh triggered");
    loadVisitors();
    showToast("Data refreshed!", "success");
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClear = () => {
    if (!window.confirm("Are you sure you want to clear all visitor data?"))
      return;

    try {
      console.log("🗑️ Clear data triggered");
      localStorage.removeItem("visitors");

      setVisitors([]);
      setStats({ total: 0, countries: 0, today: 0, online: 0 });
      showToast("All data cleared!", "success");

      // Notify other tabs/components
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      showToast("Error clearing data", "error");
    }
  };

  const handleCleanup = () => {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const stored = localStorage.getItem("visitors");

      if (!stored) {
        showToast("No data to cleanup", "error");
        return;
      }

      const allVisitors = JSON.parse(stored);
      const beforeCount = allVisitors.length;

      const activeVisitors = allVisitors.filter((v) => {
        const lastSeenTime = new Date(v.lastSeen || v.timestamp).getTime();
        return lastSeenTime > oneHourAgo;
      });

      localStorage.setItem("visitors", JSON.stringify(activeVisitors));

      const removedCount = beforeCount - activeVisitors.length;
      showToast(`Removed ${removedCount} inactive visitors`, "success");

      loadVisitors();
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("❌ Error cleaning up:", error);
      showToast("Error cleaning up data", "error");
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : "bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Visitor Analytics
                  <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-1 rounded-full">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    Live
                  </span>
                </h2>
                <p className="text-sm text-slate-400">
                  Real-time tracking • Auto-refresh every 5s
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleCleanup}
                className="p-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition"
                title="Remove inactive visitors (>1 hour)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  ></path>
                </svg>
              </button>
              <button
                onClick={handleClear}
                className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                title="Clear all data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/40">
          <div className="text-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {stats.total}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Visitors</div>
          </div>
          <div className="text-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.countries}
            </div>
            <div className="text-xs text-slate-400 mt-1">Countries</div>
          </div>
          <div className="text-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {stats.today}
            </div>
            <div className="text-xs text-slate-400 mt-1">Today</div>
          </div>
          <div className="text-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {stats.online}
            </div>
            <div className="text-xs text-slate-400 mt-1">Online Now</div>
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Visitors</h3>
            <span className="text-xs text-slate-500">
              {visitors.length > 0
                ? `Showing ${Math.min(visitors.length, 50)} of ${
                    visitors.length
                  }`
                : "No data"}
            </span>
          </div>

          {visitors.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-2">No visitors tracked yet</p>
              <p className="text-sm text-slate-500">
                Visitors will appear here automatically
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.slice(0, 50).map((visitor, idx) => {
                const active = isActive(visitor);
                return (
                  <div
                    key={visitor.sessionId || idx}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/30 hover:translate-x-1 transition-all"
                  >
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {getFlag(visitor.countryCode)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white flex items-center gap-2 mb-1">
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
                      <div className="text-xs text-slate-500 mt-1">
                        {visitor.provider} •{" "}
                        {active ? (
                          <span className="text-green-400 font-medium">
                            ● Online
                          </span>
                        ) : (
                          <span className="text-slate-500">○ Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Last refresh: {new Date().toLocaleTimeString()}</span>
            <span>Storage: localStorage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
