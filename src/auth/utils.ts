import { AuthUser } from "./types";

/**
 * Get user initials for avatar fallback
 */
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

/**
 * Get display name priority: name > summonerName > username
 */
export function getUserDisplayName(user: AuthUser): string {
  if (user?.username) return user.username;
  if (user?.name) return user.name;
  return user?.username || "Unknown User";
}

/**
 * Format rank for display (replace underscores with spaces)
 */
export function getFormattedRank(rank: string | null): string | null {
  if (!rank) return null;
  return rank.replace("_", " ");
}

/**
 * Check if user has completed profile setup
 */
export function isProfileComplete(user: AuthUser): boolean {
  return !!(user.username && user.summonerName && user.region && user.mainRole);
}

/**
 * Get user avatar URL with fallback
 */
export function getUserAvatarUrl(user: AuthUser): string | undefined {
  return user.avatar || user.image || undefined;
}
