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

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    console.log("🚀 VisitorMapWidget mounted");
    loadVisitors();

    // Auto refresh every 3 seconds
    const interval = setInterval(() => {
      console.log("🔄 Auto refresh...");
      loadVisitors();
    }, 3000);

    // Listen for storage changes from other tabs/windows
    const handleStorage = (e) => {
      console.log("📡 Storage event:", e.key);
      if (e.key === "visitors") {
        loadVisitors();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Listen for custom events (same window)
    const handleCustomStorage = () => {
      console.log("📡 Custom storage event");
      loadVisitors();
    };
    window.addEventListener("visitorUpdate", handleCustomStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("visitorUpdate", handleCustomStorage);
    };
  }, []);

  const loadVisitors = () => {
    try {
      const stored = localStorage.getItem("visitors");
      console.log("📦 Raw localStorage data:", stored);

      if (stored) {
        const data = JSON.parse(stored);
        console.log("✅ Parsed visitors:", data.length, "items");
        setVisitors(data);
        calculateStats(data);
      } else {
        console.log("⚠️ No visitors in localStorage");
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
    console.log("🗑️ Clear data triggered");
    localStorage.removeItem("visitors");
    setVisitors([]);
    setStats({ total: 0, countries: 0, today: 0, online: 0 });
    showToast("All data cleared!", "success");
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
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
                  <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-1 rounded-full">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    Live
                  </span>
                </h2>
                <p className="text-sm text-slate-400">
                  Real-time tracking • Auto-refresh every 3s
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleClear}
                className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
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

        {/* Visitor List */}
        <div className="p-6 bg-slate-950/50 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Visitors</h3>
            <span className="text-xs text-slate-500">
              {visitors.length > 0
                ? `Showing ${Math.min(visitors.length, 20)} of ${
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
                Visit the homepage to start tracking visitors
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.slice(0, 20).map((visitor, idx) => {
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

        {/* Debug Info */}
        <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Last refresh: {new Date().toLocaleTimeString()}</span>
            <span>localStorage key: visitors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
