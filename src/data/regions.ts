export const REGION_OPTIONS = [
  { value: "EUW1", code: "EUW", label: "Europe West" },
  { value: "EUN1", code: "EUNE", label: "Europe Nordic & East" },
  { value: "NA1", code: "NA", label: "North America" },
  { value: "KR", code: "KR", label: "Korea" },
  { value: "BR1", code: "BR", label: "Brazil" },
  { value: "LA1", code: "LAN", label: "Latin America N." },
  { value: "LA2", code: "LAS", label: "Latin America S." },
] as const;

export const findRegion = (value?: string | null) => REGION_OPTIONS.find((r) => r.value === value);
