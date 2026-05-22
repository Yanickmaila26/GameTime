# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameTime is a full-stack PWA for managing a basketball tournament (Torneo de Invierno Pifo 2026). It has a public-facing scoreboard/standings SPA and a JWT-protected admin panel for match administration.

## Commands

### Frontend (root directory)
```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend (api/ directory)
```bash
cd api
npm run dev        # Start Express with nodemon (hot reload) on port 3001
npm start          # Start Express without hot reload
```

### Database
Import `database/schema.sql` into MySQL to create the `game_time` database. Default admin credentials seeded in schema: `admin@gametime.com` / `Admin2026!`

## Architecture

### Two-tier frontend
1. **Public SPA** — `/` route: live scores, standings, leaders, team info (no auth required)
2. **Admin Panel** — `/admin/*` routes: match lifecycle management, teams, referees, championships (JWT-protected via `ProtectedRoute`)

### Key data flow
- `src/main.jsx` wraps the app in `BrowserRouter` → `AuthProvider` and registers the PWA service worker
- `src/context/AuthContext.jsx` manages global auth state; stores JWT in `localStorage` and auto-verifies via `GET /api/auth/me` on load
- `src/api/client.js` is an Axios instance (baseURL: `http://localhost:3001/api`) with a request interceptor that attaches the JWT as `Authorization: Bearer <token>`
- The frontend currently uses mock data from `src/data/mockData.js` with simulated live updates via `setInterval`; admin pages hit the real API

### Backend structure
```
api/
├── server.js              # Express setup, CORS (localhost:5173/5174), route mounting
├── config/db.js           # MySQL connection pool (mysql2/promise, pool size 10)
├── middleware/auth.js      # JWT verification middleware + role guard
├── controllers/           # Business logic per domain
└── routes/                # Express routers mounted at /api/<domain>
```

**API base**: `http://localhost:3001/api`  
**CORS origins**: `localhost:5173`, `localhost:5174`, `127.0.0.1:5173`

### Backend environment variables (`api/.env`)
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=game_time
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
```

### Database (`game_time` MySQL)
Core tables: `users`, `teams`, `players`, `referees`, `championships`, `championship_teams`, `matches`, `match_players`, `match_events`. See `database/schema.sql` for full schema.

Match lifecycle: `scheduled` → `in_progress` → `finished`. Match scoring, fouls, quarter progression, and player ejections each have dedicated API endpoints under `/api/matches/:id/*`.

### Auth roles
- `admin` — full access
- `directiva` — limited admin access (role-checked in `api/middleware/auth.js`)

## Styling
Tailwind CSS 4 with a custom dark theme. Custom color tokens in `tailwind.config.js`:
- `basketball` — orange accent
- `electric` — blue accent  
- `darkbg` — dark backgrounds

UI is mobile-first with a fixed bottom nav (`BottomNav.jsx`) and a max-width container. All UI text is in Spanish.
