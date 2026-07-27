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

Dashboard · Today · Tasks · Weekly / Monthly Planner · Pomodoro · Java / DSA / Aptitude
Trackers · Projects · Interview Journal · Mock Interviews · Company Tracker · Resources ·
Notes · Bookmarks · Calendar · Heatmap · Statistics · Achievements · Profile · Settings.

## 📜 License

MIT © PlacementOS
