import { AuthUser } from "./types";

export function getUserInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(user: AuthUser): string {
  if (user?.username) return user.username;
  if (user?.name) return user.name;
  return user?.username || "Unknown User";
}

export function getFormattedRank(rank: string | null): string | null {
  if (!rank) return null;
  return rank.replace("_", " ");
}

export function isProfileComplete(user: AuthUser): boolean {
  return !!(user.username && user.mainRole);
}

export function getUserAvatarUrl(user: AuthUser): string | undefined {
  return user.avatar || user.image || undefined;
}
