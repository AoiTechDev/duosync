import type { GameMode } from "@/db/schema";

export const GAME_MODES: { id: GameMode; label: string; short: string }[] = [
  { id: "RANKED_SOLO", label: "Ranked Solo/Duo", short: "Solo/Duo" },
  { id: "RANKED_FLEX", label: "Ranked Flex", short: "Flex" },
  { id: "NORMAL", label: "Normal Draft", short: "Normal" },
  { id: "ARAM", label: "ARAM", short: "ARAM" },
];

export const findGameMode = (id?: string | null) => GAME_MODES.find((m) => m.id === id);
