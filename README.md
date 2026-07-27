<div align="center">

# 🎯 PlacementOS

### The personal productivity operating system for placement preparation.

_Answer one question every day: **"What should I study next to maximize my placement chances?"**_

Built with **React 19 · TypeScript · Vite · TailwindCSS · shadcn/ui** on the frontend and
**Node.js · Express · Mongoose · MongoDB Atlas · JWT** on the backend.

</div>

---

## ✨ Overview

PlacementOS is not a todo app. It is a full study operating system that helps a student
prepare for campus / off-campus placements by managing study time, tasks, projects,
interview prep, company tracking, notes, resources and productivity analytics — all in one
premium, dark-mode-first SaaS interface.

## 🧱 Tech Stack

| Layer          | Technology                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion          |
| Data / State   | TanStack Query, React Hook Form, Zod                                       |
| Charts / UI    | Recharts, Lucide Icons, TipTap Editor                                      |
| Backend        | Node.js, Express, TypeScript                                               |
| Database       | MongoDB Atlas, Mongoose                                                    |
| Auth           | JWT (access + refresh), HTTP-only cookies, Role-Based Access Control       |
| Email          | Resend                                                                      |
| Scheduler      | node-cron                                                                   |
| Hosting        | Vercel (client) · Render (server) · MongoDB Atlas (db) — all free tier     |

## 📁 Monorepo Structure

```
PlacementOS/
├── client/          # React 19 + Vite frontend
│   └── src/
│       ├── components/   layouts/  pages/  hooks/
│       ├── services/     contexts/ utils/  types/
│       ├── assets/       styles/   constants/
├── server/          # Express + Mongoose API
│   └── src/
│       ├── controllers/  routes/     models/     middlewares/
│       ├── services/     utils/      config/     cron/       validators/
```

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- A MongoDB Atlas connection string (free M0 cluster)
- A Resend API key (optional, for emails)

### Backend
```bash
cd server
cp .env.example .env      # fill in the values
npm install
npm run dev               # http://localhost:5000
```

### Frontend
```bash
cd client
cp .env.example .env      # set VITE_API_URL
npm install
npm run dev               # http://localhost:5173
```

## 🗺️ Modules

| Module | Highlights |
| ------ | ---------- |
| **Dashboard** | Greeting, streak, today's study/goal, placement-readiness ring, upcoming deadlines, recent items, daily quote |
| **Today / Planners** | Quick-add, overdue, weekly 7-day board, monthly calendar + goals |
| **Tasks** | Priority/difficulty/category/tags/subtasks/links, recurring rules; List · Kanban (DnD) · Calendar · Timeline |
| **Pomodoro** | 25/5 · 45/10 · 60/10 · 90/20 + custom, fullscreen focus, auto session logging with mood & productivity |
| **Trackers** | Java · DSA (easy/med/hard) · Aptitude — progress, revisions, weak areas, notes, bookmarks |
| **Projects** | Kanban (todo/in-progress/testing/done), milestones, tasks, tech stack, repo/live links |
| **Notes** | TipTap editor (code, tables, checklists, images), folders, `[[backlinks]]`, pin/favorite/archive/trash, autosave |
| **Resources / Bookmarks** | 19 types, filters, bulk actions, JSON import/export, favorites & pins |
| **Interview** | Company tracker (rounds, OA pattern, Q banks), Interview Journal & Mock Interviews |
| **Analytics** | GitHub-style heatmap, Recharts statistics, achievements, placement readiness |
| **Account** | Profile, appearance (7 accents), study/pomodoro defaults, email prefs, data export, security |

## 🔌 API Overview

`/api/auth` · `/api/users` · `/api/tasks` · `/api/sessions` · `/api/topics` · `/api/projects` ·
`/api/notes` · `/api/resources` · `/api/companies` · `/api/journal` · `/api/analytics` · `/api/cron`

All routes are JWT-protected (access token in an HTTP-only cookie, refreshed automatically),
validated with Zod, and scoped to the authenticated user.

## ☁️ Deployment (all free tier)

### Database — MongoDB Atlas
1. Create a free **M0** cluster and a database user.
2. Allow network access from anywhere (`0.0.0.0/0`) for Render.
3. Copy the connection string → `MONGODB_URI`.

### Backend — Render
1. New → **Blueprint**, point it at this repo (uses [`render.yaml`](render.yaml), root dir `server`).
2. Set the `sync: false` env vars in the dashboard: `MONGODB_URI`, `CLIENT_URL` (your Vercel URL),
   `RESEND_API_KEY`. Secrets are auto-generated.
3. Deploy → note the URL, e.g. `https://placementos-api.onrender.com`.

> **Reminders:** Render's free tier sleeps, so in-process cron may pause. Use a free scheduler
> (e.g. [cron-job.org](https://cron-job.org)) to `POST` `/api/cron/morning-digest` and
> `/api/cron/night-summary` with header `x-cron-secret: <CRON_SECRET>`.

### Frontend — Vercel
1. New Project → import this repo, set **Root Directory** to `client` (uses [`vercel.json`](client/vercel.json)).
2. Add env var `VITE_API_URL = https://<your-render-url>/api`.
3. Deploy.

## 🧪 Scripts

```bash
# server
npm run dev        # watch mode
npm run typecheck  # tsc --noEmit
npm run build      # compile to dist/

# client
npm run dev        # vite dev server
npm run typecheck  # tsc --noEmit
npm run build      # type-check + production build
```

## 📜 License

MIT © PlacementOS
