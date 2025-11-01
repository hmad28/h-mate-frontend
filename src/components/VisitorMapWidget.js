import { useState, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🚀 VisitorMapWidget mounted");
    loadVisitors();

    const interval = setInterval(() => {
      console.log("🔄 Auto refresh...");
      loadVisitors();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadVisitors = async () => {
    try {
      setIsLoading(true);
      const result = await window.storage.get("visitors", true);

      if (result && result.value) {
        const visitorsData = JSON.parse(result.value);

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
      setVisitors([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
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

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all visitor data?"))
      return;

    try {
      console.log("🗑️ Clear data triggered");
      await window.storage.delete("visitors", true);

      setVisitors([]);
      setStats({ total: 0, countries: 0, today: 0, online: 0 });
      showToast("All data cleared!", "success");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      showToast("Error clearing data", "error");
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await window.storage.get("visitors", true);

      if (!result || !result.value) {
        showToast("No data to cleanup", "error");
        return;
      }

      const allVisitors = JSON.parse(result.value);
      const beforeCount = allVisitors.length;

      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const activeVisitors = allVisitors.filter((v) => {
        const lastSeenTime = new Date(v.lastSeen || v.timestamp).getTime();
        return lastSeenTime > oneHourAgo;
      });

      await window.storage.set(
        "visitors",
        JSON.stringify(activeVisitors),
        true
      );

      const removedCount = beforeCount - activeVisitors.length;
      showToast(`Removed ${removedCount} inactive visitors`, "success");

      loadVisitors();
    } catch (error) {
      console.error("❌ Error cleaning up:", error);
      showToast("Error cleaning up data", "error");
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : "bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              {toast.type === "success" ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
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
                <svg
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
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

          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading visitors...</p>
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
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
            <span>Storage: window.storage (shared)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
