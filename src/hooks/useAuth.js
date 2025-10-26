// hooks/useAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes from other components
    const handleAuthChange = (event) => {
      if (event.detail?.action === "logout") {
        setUser(null);
      } else if (event.detail?.action === "login") {
        fetchUser();
      }
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);

      // Broadcast logout event to other components
      window.dispatchEvent(
        new CustomEvent("authChange", { detail: { action: "logout" } })
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchUser();
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    logout,
    refetch,
  };
}
