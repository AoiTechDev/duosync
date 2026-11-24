# DuoGG

Find your League of Legends duo partner. Link your Riot account, post to the feed, add friends and chat in real time.

Live: https://duogg.app

## Features

- **Sign in** with Google or Discord (NextAuth), followed by a short onboarding flow
- **Riot account linking** with summoner verification through the Riot API
- **Duo feed** where players post what they're looking for (role, rank), with virtualized lists and optional bump
- **Player profiles** with rank, roles and a linked Riot account
- **Friends** with friend requests and presence
- **Direct messages** between friends, using polling plus Ably for realtime delivery
- **Bug reports** sent by email (Resend)
- **Rate limiting** on API routes (Upstash Redis)

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, Radix UI, lucide-react |
| State / data fetching | TanStack Query, Zustand, Zod |
| Auth | NextAuth v4 with the Drizzle adapter |
| Database | PostgreSQL (Neon) with Drizzle ORM |
| Realtime | Ably |
| Rate limiting | Upstash Redis |
| Email | Resend |
| Hosting | Vercel |

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (the repo uses `bun.lock`), or Node.js 20+
- A PostgreSQL database (Neon works well)
- Accounts and keys for the services listed under [Environment variables](#environment-variables)

### Setup

```bash
bun install
cp .env.example .env   # then fill in the values (see below)
bun run db:migrate
bun run dev
```

Open http://localhost:3000.

### Environment variables

Create a `.env` file in the project root:

| Variable | Description |
| --- | --- |
| `NEXTAUTH_URL` | Base URL of the app, e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET`, `AUTH_SECRET` | Random secrets for session signing |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth credentials |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `AUTH_DRIZZLE_URL` | Connection string used by the auth adapter |
| `RIOT_API_KEY` | Riot Games API key for summoner verification |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis for rate limiting |
| `ABLY_API_KEY` | Ably key for realtime chat |
| `RESEND_API_KEY`, `BUG_REPORT_EMAIL` | Resend key and the address that receives bug reports |

Never commit `.env`; it is already gitignored.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the dev server with Turbopack |
| `bun run build` | Run pending migrations (production deploys only), then build |
| `bun run start` | Start the production server |
| `bun run lint` | Lint with ESLint |
| `bun run db:generate` | Generate a migration from schema changes |
| `bun run db:migrate` | Apply migrations |
| `bun run db:push` | Push the schema directly (development only) |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed base data |
| `bun run db:seed:feed` | Seed sample feed posts |
| `bun run db:seed:friends` | Seed sample friendships |
| `bun run db:seed:clean` | Remove seeded feed data |

## Project structure

```
src/
  app/          Routes: (dashboard) feed, friends, messages, players, profile;
                login, onboarding, legal pages, API routes
  features/     Feature modules: chat, friends, post-list, profile, report-bug...
  components/   Shared UI components
  db/           Drizzle schema and seed scripts
  auth/         NextAuth configuration
  lib/          Utilities and clients
  validators/   Zod schemas
drizzle/        SQL migrations
scripts/        Deploy helpers (migrate-on-deploy)
```

## Deployment

Deployed on Vercel. On production deploys, `scripts/migrate-on-deploy.mjs` runs pending Drizzle migrations before `next build` and fails the deploy if `DATABASE_URL` is missing or a migration fails. Preview and local builds skip migrations so unmerged migrations never reach a shared database.

## Disclaimer

DuoGG isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and League of Legends are trademarks or registered trademarks of Riot Games, Inc.
