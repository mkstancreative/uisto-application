# UISTO Careers — Recruitment Portal

Public careers site and staff recruitment dashboard for the University of Innovation,
Science and Technology, built on the **MAIN JOB APPLICATION** API (career-portal backend).

## Getting started

```bash
npm install
cp .env.example .env   # then adjust
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API server root (no `/api/v1`). Leave empty in development to use the Vite proxy. Required for production builds unless the app is served from the same origin as the API. |
| `VITE_PROXY_TARGET` | Development only — where `/api` and `/uploads` are proxied. Defaults to `http://localhost:5000`. On macOS port 5000 is used by AirPlay Receiver, so run the API on another port or disable it. |

The first HR manager account is created on the server (`node scripts/createStaffUser.js … --role hrm`);
there is no public registration.

## What's in the app

**Public (no account)**
- `/` landing page with the latest vacancies
- `/careers`, `/careers/:jobId` — open vacancies
- `/careers/:jobId/apply` — multi-step application (NIN lookup, qualifications, experience, 3 referees, documents)
- `/track` — application status by application ID + email
- `/referee/:token` — referee reference form (emailed magic link)
- `/origin-data/:token` — State of Origin / LGA form (emailed magic link)
- `/reset-password?token=…` — password reset from the emailed link

**Staff (`/admin`)** — roles: `hrm` (everything incl. staff accounts), `registrar` (reads + writes),
`hoc` and `viewer` (read-only)
- Dashboard, Applications, AI Shortlisting (by job + history), Vacancies
- Job setup: Positions, Requirements, Subcadres
- Staff Users (HR manager only), My Account (profile, password, sessions)
- `/change-password` is forced on first sign-in or after a password reset by HR

## Architecture

- `src/api/session.js` — token storage and refresh. The access token stays in memory; the refresh
  token is persisted. Refresh tokens rotate, so refreshes are de-duplicated and serialised across tabs.
- `src/api/api.js` — axios instance: attaches the Bearer token, refreshes once on `401` and retries,
  and rejects with a normalised `ApiError`.
- `src/api/services/*` — one function per endpoint; `src/hooks/*` — React Query hooks on top.
- `src/context/AuthProvider.jsx` — session state (`useAuth()`), restored on reload.
- `src/utils/roles.js` — `canWrite` / `canManageStaff` gates for the UI (the API enforces the same rules).
- `src/utils/pagination.js` — the API uses three pagination shapes; `toTableMeta` normalises them.
