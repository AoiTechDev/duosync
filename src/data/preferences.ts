export interface RoleOption {
  id: string;
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
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CommunicationPreference {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Role Preferences Data
export const ROLES: RoleOption[] = [
  {
    id: "top",
    name: "Top Lane",
    icon: "🛡️",
    description: "Tanky bruisers and split pushers",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "jungle",
    name: "Jungle",
    icon: "🌲",
    description: "Map control and objective focus",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "mid",
    name: "Mid Lane",
    icon: "⚡",
    description: "High damage carries and roamers",
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "adc",
    name: "ADC",
    icon: "🏹",
    description: "Ranged damage dealers",
    color: "from-red-500 to-pink-500",
  },
  {
    id: "support",
    name: "Support",
    icon: "💙",
    description: "Team enablers and protectors",
    color: "from-cyan-500 to-blue-500",
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
    icon: "⚔️",
  },
  {
    id: "passive",
    name: "Passive",
    category: "behavioral",
    description: "Prefers safe and calculated plays",
    icon: "🛡️",
  },
  {
    id: "balanced",
    name: "Balanced",
    category: "behavioral",
    description: "Adapts playstyle to game state",
    icon: "⚖️",
  },

  // Leadership
  {
    id: "shot-caller",
    name: "Shot Caller",
    category: "leadership",
    description: "Likes to make team decisions",
    icon: "📢",
  },
  {
    id: "follower",
    name: "Follower",
    category: "leadership",
    description: "Prefers to follow team calls",
    icon: "👥",
  },
  {
    id: "team-player",
    name: "Team Player",
    category: "leadership",
    description: "Collaborative decision making",
    icon: "🤝",
  },

  // Focus Areas
  {
    id: "carry-focused",
    name: "Carry Focused",
    category: "focus",
    description: "Aims to be the primary damage dealer",
    icon: "💪",
  },
  {
    id: "supportive",
    name: "Supportive",
    category: "focus",
    description: "Enables teammates to succeed",
    icon: "🫱🏻‍🫲🏾",
  },
  {
    id: "objective-oriented",
    name: "Objective Oriented",
    category: "focus",
    description: "Prioritizes dragons, baron, towers",
    icon: "🎯",
  },

  // Gameplay Timing
  {
    id: "early-game",
    name: "Early Game",
    category: "timing",
    description: "Strong in lane and early fights",
    icon: "🌅",
  },
  {
    id: "late-game",
    name: "Late Game",
    category: "timing",
    description: "Scales well into team fights",
    icon: "🌙",
  },
  {
    id: "roam-heavy",
    name: "Roam Heavy",
    category: "timing",
    description: "Likes to help other lanes",
    icon: "🏃‍♂️",
  },
];

// Goals & Motivation Data
export const GOALS: Goal[] = [
  {
    id: "ranked-climbing",
    name: "Ranked Climbing",
    description: "Serious improvement and rank progression",
    icon: "🏆",
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "casual-fun",
    name: "Casual Fun",
    description: "Relaxed gameplay and enjoyment",
    icon: "😄",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "learning",
    name: "Learning & Improvement",
    description: "Focus on getting better at the game",
    icon: "📚",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "competitive",
    name: "Competitive Play",
    description: "Tournament prep and serious competition",
    icon: "🥇",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "champion-mastery",
    name: "Champion Mastery",
    description: "Learning new champions and expanding pool",
    icon: "✨",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "missions",
    name: "Mission Completion",
    description: "Battle pass, challenges, and achievements",
    icon: "🎮",
    color: "from-orange-500 to-red-500",
  },
];

// Communication Preferences Data
export const COMMUNICATION_PREFERENCES: CommunicationPreference[] = [
  {
    id: "voice-discord",
    name: "Discord Voice",
    description: "Preferred voice chat platform",
    icon: "🎤",
  },
  {
    id: "voice-ingame",
    name: "In-game Voice",
    description: "Use League's built-in voice chat",
    icon: "🎧",
  },
  {
    id: "text-only",
    name: "Text Only",
    description: "Prefer text communication",
    icon: "💬",
  },
  {
    id: "minimal-chat",
    name: "Minimal Chat",
    description: "Strategic calls only, no casual talk",
    icon: "🔇",
  },
  {
    id: "talkative",
    name: "Talkative",
    description: "Enjoy casual conversation during games",
    icon: "🗣️",
  },
  {
    id: "quiet-responsive",
    name: "Quiet but Responsive",
    description: "Listen well, speak when needed",
    icon: "👂",
  },
];

// Category definitions for organizing the UI
export const PLAYSTYLE_CATEGORIES = {
  behavioral: {
    name: "Behavioral Style",
    description: "How you approach the game",
    icon: "🎭",
  },
  leadership: {
    name: "Leadership Style",
    description: "Your role in team decision making",
    icon: "👑",
  },
  focus: {
    name: "Focus Areas",
    description: "What you prioritize in games",
    icon: "🎯",
  },
  timing: {
    name: "Game Phase Preference",
    description: "When you perform best",
    icon: "⏰",
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
