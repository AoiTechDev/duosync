import { RankMin as DbRank } from "@/db/schema";
import { Role as DbRole } from "@/db/schema";

export interface RoleOption {
  id: DbRole;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface RankOption {
  id: DbRank;
  name: string;
  icon: string;
  description: string;
  color: string;
}
export interface PlaystyleTag {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface CommunicationPreference {
  id: string;
  name: string;
  description: string;
}

// Role Preferences Data
export const ROLES: RoleOption[] = [
  {
    id: "TOP",
    name: "Top Lane",
    icon: "/lane-icons/top-icon.png",
    description: "Tanky bruisers and split pushers",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "JUNGLE",
    name: "Jungle",
    icon: "/lane-icons/jungle-icon.png",
    description: "Map control and objective focus",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "MID",
    name: "Mid Lane",
    icon: "/lane-icons/mid-icon.png",
    description: "High damage carries and roamers",
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "ADC",
    name: "ADC",
    icon: "/lane-icons/adc-icon.png",
    description: "Ranged damage dealers",
    color: "from-red-500 to-pink-500",
  },
  {
    id: "SUPPORT",
    name: "Support",
    icon: "/lane-icons/supp-icon.png",
    description: "Team enablers and protectors",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "FILL",
    name: "Fill",
    icon: "/lane-icons/top-icon.png", // You might want to create a fill-specific icon
    description: "Flexible with any role",
    color: "from-gray-500 to-slate-500",
  },
];

// Playstyle Tags Data
export const PLAYSTYLE_TAGS: PlaystyleTag[] = [
  // Behavioral
  {
    id: "aggressive",
    name: "Aggressive",
    category: "behavioral",
    description: "Likes to take fights and make plays",
  },
  {
    id: "passive",
    name: "Passive",
    category: "behavioral",
    description: "Prefers safe and calculated plays",
  },
  {
    id: "balanced",
    name: "Balanced",
    category: "behavioral",
    description: "Adapts playstyle to game state",
  },

  // Leadership
  {
    id: "shot-caller",
    name: "Shot Caller",
    category: "leadership",
    description: "Likes to make team decisions",
  },
  {
    id: "follower",
    name: "Follower",
    category: "leadership",
    description: "Prefers to follow team calls",
  },
  {
    id: "team-player",
    name: "Team Player",
    category: "leadership",
    description: "Collaborative decision making",
  },

  // Focus Areas
  {
    id: "carry-focused",
    name: "Carry Focused",
    category: "focus",
    description: "Aims to be the primary damage dealer",
  },
  {
    id: "supportive",
    name: "Supportive",
    category: "focus",
    description: "Enables teammates to succeed",
  },
  {
    id: "objective-oriented",
    name: "Objective Oriented",
    category: "focus",
    description: "Prioritizes dragons, baron, towers",
  },

  // Gameplay Timing
  {
    id: "early-game",
    name: "Early Game",
    category: "timing",
    description: "Strong in lane and early fights",
  },
  {
    id: "late-game",
    name: "Late Game",
    category: "timing",
    description: "Scales well into team fights",
  },
  {
    id: "roam-heavy",
    name: "Roam Heavy",
    category: "timing",
    description: "Likes to help other lanes",
  },
];

// Goals & Motivation Data
export const GOALS: Goal[] = [
  {
    id: "ranked-climbing",
    name: "Ranked Climbing",
    description: "Serious improvement and rank progression",
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "casual-fun",
    name: "Casual Fun",
    description: "Relaxed gameplay and enjoyment",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "learning",
    name: "Learning & Improvement",
    description: "Focus on getting better at the game",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "competitive",
    name: "Competitive Play",
    description: "Tournament prep and serious competition",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "champion-mastery",
    name: "Champion Mastery",
    description: "Learning new champions and expanding pool",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "missions",
    name: "Mission Completion",
    description: "Battle pass, challenges, and achievements",
    color: "from-orange-500 to-red-500",
  },
];

// Communication Preferences Data
export const COMMUNICATION_PREFERENCES: CommunicationPreference[] = [
  {
    id: "voice-discord",
    name: "Discord Voice",
    description: "Preferred voice chat platform",
  },
  {
    id: "voice-ingame",
    name: "In-game Voice",
    description: "Use League's built-in voice chat",
  },
  {
    id: "text-only",
    name: "Text Only",
    description: "Prefer text communication",
  },
  {
    id: "minimal-chat",
    name: "Minimal Chat",
    description: "Strategic calls only, no casual talk",
  },
  {
    id: "talkative",
    name: "Talkative",
    description: "Enjoy casual conversation during games",
  },
  {
    id: "quiet-responsive",
    name: "Quiet but Responsive",
    description: "Listen well, speak when needed",
  },
];

// Category definitions for organizing the UI
export const PLAYSTYLE_CATEGORIES = {
  behavioral: {
    name: "Behavioral Style",
    description: "How you approach the game",
  },
  leadership: {
    name: "Leadership Style",
    description: "Your role in team decision making",
  },
  focus: {
    name: "Focus Areas",
    description: "What you prioritize in games",
  },
  timing: {
    name: "Game Phase Preference",
    description: "When you perform best",
  },
};

// Validation rules
export const PREFERENCES_VALIDATION = {
  mainRole: { required: true, message: "Please select a primary role" },
  goals: { minItems: 1, message: "Please select at least one goal" },
  communication: {
    minItems: 1,
    message: "Please select at least one communication preference",
  },
  experience: {
    required: true,
    message: "Please select your experience level",
  },
  playstyleTags: {
    minItems: 3,
    maxItems: 8,
    message: "Please select 3-8 playstyle tags",
  },
  socialPreferences: {
    minItems: 1,
    message: "Please select at least one social preference",
  },
};

export const RANKS: RankOption[] = [
  {
    id: "IRON",
    name: "Iron",
    icon: "/ranks/IRON.png",
    description: "The lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "BRONZE",
    name: "Bronze",
    icon: "/ranks/BRONZE.png",
    description: "The second lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "SILVER",
    name: "Silver",
    icon: "/ranks/SILVER.png",
    description: "The third lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "GOLD",
    name: "Gold",
    icon: "/ranks/GOLD.png",
    description: "The fourth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "PLATINUM",
    name: "Platinum",
    icon: "/ranks/PLATINUM.png",
    description: "The fifth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "EMERALD",
    name: "Emerald",
    icon: "/ranks/EMERALD.png",
    description: "The sixth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "DIAMOND",
    name: "Diamond",
    icon: "/ranks/DIAMOND.png",
    description: "The seventh lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "MASTER",
    name: "Master",
    icon: "/ranks/MASTER.png",
    description: "The eighth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "GRANDMASTER",
    name: "Grandmaster",
    icon: "/ranks/GRANDMASTER.png",
    description: "The ninth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
  {
    id: "CHALLENGER",
    name: "Challenger",
    icon: "/ranks/CHALLANGER.png",
    description: "The tenth lowest rank",
    color: "from-gray-500 to-slate-500",
  },
];

