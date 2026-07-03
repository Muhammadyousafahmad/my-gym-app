# Gym Management Frontend

## Overview
This is the **Next.js (React + TypeScript)** frontend for the Gym/Fitness Center Management System. It provides a modern, responsive UI for:
- Member / Trainer / Admin authentication (JWT)
- Dashboard with role‑specific metrics and charts
- Class scheduling, workout & diet plans
- Attendance tracking (QR scanner & manual)
- Payments integration (Stripe) and notifications (email/SMS)
- Profile management and admin controls

The UI follows a premium glass‑morphism design with smooth micro‑animations, custom Google Font *Inter*, and dark‑mode support.

## Prerequisites
- **Node.js** v22 (or later)
- **npm** (comes with Node) or **yarn** if preferred
- Backend API running (default `http://localhost:5000`)

## Project Structure (high‑level)
```
frontend/
├─ src/
│  ├─ app/            # Next.js App Router pages
│  │   ├─ layout.tsx   # Root layout with global CSS & fonts
│  │   ├─ page.tsx     # Redirect to /dashboard
│  │   ├─ dashboard/   # Dashboard pages per role
│  │   ├─ login/       # Login UI
│  │   ├─ signup/      # Signup UI
│  │   ├─ classes/     # Class schedule view
│  │   ├─ workout-plans/
│  │   ├─ diet-plans/
│  │   └─ …
│  ├─ components/     # Reusable UI components (Sidebar, Header, Cards…)
│  ├─ lib/            # API client (axios instance), Zustand store, utils
│  └─ globals.css     # Global CSS with custom variables and glassmorphism
├─ public/            # Static assets (favicon, images)
├─ .env.local         # Frontend environment variables
├─ next.config.ts
├─ package.json
└─ README.md          # <‑‑ you are reading this file
```

## Setup
1. **Install dependencies**
   ```bash
   cd frontend
   npm install   # or `yarn install`
   ```
2. **Create an `.env.local` file** (copy from `.env.example` if present). At minimum you need the API base URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   You can also add Stripe public key, Google Maps key, etc., if the UI consumes them.
3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be served at **http://localhost:3000**.

## Available Scripts
| Script        | Description                                          |
|---------------|------------------------------------------------------|
| `npm run dev` | Starts Next.js in development mode (hot‑reload).    |
| `npm run build`| Produces an optimized production build.             |
| `npm start`   | Runs the production build with `next start`.        |
| `npm lint`    | Runs ESLint checks (if configured).                  |

## Environment Variables
| Variable                | Description                                          |
|-------------------------|------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`   | Base URL for the backend API (required).            |
| `NEXT_PUBLIC_STRIPE_PK`| (Optional) Stripe publishable key for checkout UI.   |
| `NEXT_PUBLIC_MAP_KEY`  | (Optional) Google Maps API key for location services. |

All variables **must be prefixed with `NEXT_PUBLIC_`** to be exposed to the browser.

## Design Notes
- **Typography:** Uses Google Font *Inter* (imported in `layout.tsx`).
- **Colors & Themes:** Defined in `globals.css` with custom HSL variables; dark mode toggles automatically based on system preference.
- **Micro‑animations:** Implemented via Tailwind CSS transition utilities and Framer Motion for page transitions.
- **State Management:** Global auth state stored in a Zustand store (`src/lib/store.ts`).
- **API Layer:** Centralised Axios instance (`src/lib/api.ts`) with an interceptor that injects the JWT token from `localStorage`.

## Testing & QA
- Open the app at `http://localhost:3000` and log in using the seeded credentials (e.g., `admin@gym.com` / `password123`).
- Verify role‑based routing: admin sees admin dashboards, trainers see their class schedules, members see personal plans.
- Test QR scanner page: it uses the device camera (browser permission required).
- Check Stripe integration in the payments page (test mode).

## License
MIT © 2026 Your Name
