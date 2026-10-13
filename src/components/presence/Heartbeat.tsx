"use client";
import { useEffect } from "react";
import { HEARTBEAT_MS } from "@/lib/post-lifecycle";

export function Heartbeat() {
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/presence", { method: "POST", keepalive: true }).catch(() => {});
      }
    };
    beat();
    const id = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  return null;
}
