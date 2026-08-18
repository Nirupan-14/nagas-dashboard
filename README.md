# NAGAS Resort — Admin Dashboard (UI-only demo)

A separate Next.js app providing the resort's management UI. It runs **without a database** — all dashboard data is realistic sample data generated in-memory, and auth uses a built-in demo account.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The dashboard runs on port **3001** so it can run side-by-side with the public resort site (port 3000).

## Demo login

- Email: `admin@nagasresort.com`
- Password: `nagas123`

Use the "Use demo credentials" button on the login screen, or the "Open reset link (demo)" button on the forgot-password screen to preview the reset flow.

## Environment

Copy `.env.example` to `.env.local`:

- `ADMIN_SESSION_SECRET` — a long random string used to sign session cookies
- `APP_URL` — base URL used to build reset links
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the demo account shown in the UI

## Pages

| Route | Description |
| --- | --- |
| `/login` | Sign in |
| `/forgot-password` | Request a password reset |
| `/reset-password` | Set a new password |
| `/` | Overview — stats, revenue chart, booking status, recent bookings, today's activity |
| `/bookings` | Booking list with search, filters, pagination |
| `/payments` | Payment list with totals, search, filters |
| `/activities` | Activity timeline |

## Connecting a real database later

The UI fetches everything from `/api/admin/*` and `/api/auth/*`. To go live, replace the mock controllers in `src/lib/controllers/` (and `src/lib/mock/dashboard.ts`) with real MongoDB queries — the API response shapes are already defined in `src/lib/index.ts`, so no UI changes are needed.
