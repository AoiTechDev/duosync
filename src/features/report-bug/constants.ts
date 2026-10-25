export const BUG_MESSAGE_MIN = 10;
export const BUG_MESSAGE_MAX = 1000;

export const BUG_CATEGORIES = [
  { id: "BUG", label: "Something broke" },
  { id: "VISUAL", label: "Looks wrong" },
  { id: "ACCOUNT", label: "Account / Riot" },
  { id: "OTHER", label: "Other" },
] as const;

export type BugCategory = (typeof BUG_CATEGORIES)[number]["id"];
