// Server-side auth functions
export { 
  getCurrentUser, 
  isAuthenticated, 
  getCurrentSession 
} from './server'

// Auth utility functions
export {
  getUserInitials,
  getUserDisplayName,
  getFormattedRank,
  isProfileComplete,
  getUserAvatarUrl
} from './utils'

// Auth types
export type { AuthUser, UserDisplayHelpers } from './types' 