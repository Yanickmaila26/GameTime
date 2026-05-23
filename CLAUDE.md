# CLAUDE.md

Guidance for AI assistants working with this repository.

## Project Overview

GameTime is a full-stack web app for managing the **Torneo de Invierno Latacunga 2026** basketball tournament.
It uses **Laravel 12 + Inertia.js + React 18** — one unified codebase with server-rendered React pages via Inertia.

---

## Architecture

### Stack
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18 via Inertia.js (NOT a separate SPA — Inertia renders React pages server-side)
- **Auth**: Laravel session + Spatie Roles (`admin`, `directiva`)
- **Styles**: Tailwind CSS v4
- **Build**: Vite 6 (via `laravel-vite-plugin`)
- **DB**: MySQL — database `game_time`

### Key directories
```
app/Http/Controllers/
  Admin/               ← Admin controllers (CRUD, match live, playoffs)
  AuthController.php   ← Login/logout (session-based)
  PublicController.php ← Public landing page data
app/Models/            ← Eloquent models
resources/js/
  Pages/Admin/         ← Admin React pages (Inertia)
  Pages/Auth/          ← Login page (Inertia)
  Pages/Public/        ← Public landing page (Inertia)
  Components/          ← Shared components (AdminLayout, ThreeBasketball, etc.)
  lib/swal.js          ← SweetAlert2 helpers
routes/web.php         ← All routes (web + auth + admin)
public/                ← Static assets (logos, team images)
database/
  migrations/          ← 18 migrations
  schema.sql           ← Reference schema
```

> [!IMPORTANT]
> The `src/` directory at the root is **LEGACY** — it was a broken SPA that called `localhost:3001` (which never existed).
> It is excluded via `.gitignore`. **Do NOT use or modify anything in `src/`**.
> All frontend work goes in `resources/js/`.

---

## Commands

### Full dev environment (recommended)
```bash
composer run dev
```
This runs concurrently: `php artisan serve`, `php artisan queue:listen`, `php artisan pail`, `npm run dev`

### Individual commands
```bash
php artisan serve          # Laravel dev server (http://localhost:8000)
npm run dev                # Vite HMR for frontend assets
php artisan migrate        # Run migrations
php artisan migrate:fresh  # Reset and re-run all migrations
php artisan test           # Run PHPUnit tests
```

---

## Database

Import `database/schema.sql` for the base structure. Run migrations for the latest schema.

**Default credentials** (from schema seed):
- Admin: `admin@gametime.ec` / `Admin2026!`
- Directiva: `directiva@gametime.ec` / `Admin2026!`

**Core tables**: `users`, `teams`, `players`, `referees`, `championships`, `championship_teams`, `matches`, `match_players`, `match_events`, `multimedia`

**Match lifecycle**: `scheduled` → `live` → `finished`
- During live: use `saveBatch()` endpoint to send all quarter events in one transaction
- Forfeit (W.O.): auto-sets score 20-0 for the non-forfeiting team

---

## Auth & Roles

Using **Laravel session** + **Spatie laravel-permission** middleware `role:admin,directiva`.

| Role | Access |
|------|--------|
| `admin` | Full panel including championships |
| `directiva` | Teams, referees, matches, multimedia (no championships) |

---

## Frontend conventions

- All pages are in `resources/js/Pages/` and rendered via `Inertia::render()`
- `AdminLayout` wraps all admin pages — includes sidebar, mobile header, flash toast handler
- SweetAlert2 helpers are in `resources/js/lib/swal.js`
- Form submissions use Inertia's `useForm` hook (NOT axios/fetch)
- All UI text is in **Spanish**
- Logo: `/logo_game_time.png` (already in `public/`)

---

## Known issues / bugs fixed (May 2026)

| Bug | Fix applied |
|-----|-------------|
| `PublicController` key `rebounders` was showing foul data | Renamed to `foulers` |
| `MatchController::start()` description was confusing | Updated description text |
| `src/` SPA called non-existent `localhost:3001` | Archived and excluded from git |
