export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

export const normalizeUsername = (value: string) => value.trim().toLowerCase();

export const sanitizeUsernameInput = (value: string) => value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
