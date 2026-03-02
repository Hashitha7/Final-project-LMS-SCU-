# Modernistic LMS (Frontend-only)

A **frontend-only (no backend)** Learning Management System demo built with **React + Vite + TypeScript + Tailwind + shadcn/ui**.

## What’s included

- Role-based portals: **Super Admin / Admin / Teacher / Student**
- JWT-like login (demo token) + route guards
- Student registration with **3-day trial** access
- Courses + course details (lessons/resources)
- Assignments: create, submit, grade, feedback
- Exams: MCQ + Essay, timer, and integrity controls (shuffle, fullscreen, tab-warning, no copy/paste)
- Payments: online (card) + offline (deposit slip upload) + finance review (approve/reject/refund)
- Notifications + SMS log (frontend demo)
- Zoom / MS Teams integrations settings (frontend demo)
- Reports module (dashboard-style)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Demo login

**Password for all seeded users:** `demo123`

Seeded users are defined in `src/data/seed.ts`:

- Super Admin: `super@Modernistic LMS.io`
- Admin: `admin@lincoln.edu`
- Teacher: `carter@lincoln.edu` or `stone@lincoln.edu`
- Student: `alex@lincoln.edu` (also mobile: `+1 555 100 200`)
- Student: `jessica@lincoln.edu` (also mobile: `+1 555 300 400`)

## Data storage

This project uses a tiny **localStorage-backed database** (see `src/lib/storage.ts`).
To reset the app data:

- Clear browser localStorage key: `eduflow-db-v1`
- Or open DevTools → Application → Local Storage → delete `eduflow-db-v1`

Auth token key: `eduflow-auth-token`.

