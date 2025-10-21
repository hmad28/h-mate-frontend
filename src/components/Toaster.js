"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(250, 204, 21, 0.2)",
          color: "#f1f5f9",
          backdropFilter: "blur(12px)",
        },
        className: "sonner-toast",
      }}
    />
  );
}
