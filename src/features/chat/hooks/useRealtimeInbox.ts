import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChatMessage } from "../api";
import { inboxChannel } from "../channels";

const IDLE_MS = 2 * 60 * 1000;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

/** `active` turns false after two quiet minutes; call `ping` on typing, sending or receiving. Returning to the tab counts too. */
export function useActivity() {
  const [active, setActive] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const arm = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), IDLE_MS);
  }, []);

  const ping = useCallback(() => {
    setActive(true);
    arm();
  }, [arm]);

  useEffect(() => {
    arm();
    const onVisible = () => document.visibilityState === "visible" && ping();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [arm, ping]);

  return { active, ping };
}

/**
 * Holds an Ably connection to the user's inbox channel only while `enabled`. Every connection
 * counts against the plan's concurrent limit, so callers enable it just for an open, visible,
 * recently active chat. Returns whether the connection is currently live.
 */
export function useRealtimeInbox(meId: string, enabled: boolean, onMessage: (message: ChatMessage) => void) {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let close: (() => void) | undefined;

    import("ably").then(({ Realtime }) => {
      if (cancelled) return;
      const client = new Realtime({ authUrl: "/api/realtime/token", authMethod: "POST", closeOnUnload: true });
      client.connection.on((change) => setConnected(change.current === "connected"));
      client.channels.get(inboxChannel(meId)).subscribe("message", (msg) => onMessageRef.current(msg.data));
      close = () => client.close();
    });

    return () => {
      cancelled = true;
      close?.();
      setConnected(false);
    };
  }, [enabled, meId]);

  return connected;
}
