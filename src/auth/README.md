# 🔐 Auth Module

This folder contains all authentication-related functionality organized in a clean, modular structure.

## 📁 Structure

```
src/auth/
├── index.ts          # Main exports (use this for imports)
├── server.ts         # Server-side auth functions
├── utils.ts          # Auth utility functions
├── types.ts          # Auth-related TypeScript types
└── README.md         # This documentation
```

## 📦 Usage

### Import from the main module
```typescript
// ✅ Clean imports from the main auth module
import { 
  getCurrentUser, 
  getUserDisplayName, 
  getUserInitials,
  type AuthUser 
} from '@/auth'

// ❌ Don't import directly from submodules
import { getCurrentUser } from '@/auth/server' // Avoid this
```

### Server Components
```typescript
import { getCurrentUser, isAuthenticated } from '@/auth'

export default async function MyPage() {
  const user = await getCurrentUser()
  const isAuth = await isAuthenticated()
  
  if (!isAuth) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome {getUserDisplayName(user)}</div>
}
```

### Utilities
```typescript
import { getUserInitials, getFormattedRank } from '@/auth'

// Get user initials for avatar fallback
const initials = getUserInitials(user.name, user.username)

// Format rank for display
const rank = getFormattedRank(user.soloRank) // "GOLD IV" instead of "GOLD_IV"
```

## 🎯 Benefits

- **Single source of truth** for auth logic
- **Clean imports** from `@/auth`
- **Type safety** with `AuthUser` interface
- **Reusable utilities** across components
- **Server-side optimized** functions
- **Well documented** with JSDoc comments 