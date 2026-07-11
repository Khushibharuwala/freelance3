# Expense Tracker (Ledger)

A full-stack personal finance app for tracking income and expenses with JWT auth, interactive charts, and an animated landing page.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (requires MONGODB_URI + JWT_SECRET)
- `pnpm --filter @workspace/expense-tracker run dev` — run the React frontend (dev mode)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod schemas from OpenAPI spec

## Required Environment Secrets

Set these in Replit Secrets (or on Render as Environment Variables):

- `MONGODB_URI` — MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/expense_tracker`)
- `JWT_SECRET` — Any long random secret string used to sign JWTs

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Backend: Express 5, Mongoose (MongoDB), bcryptjs, jsonwebtoken
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Recharts, Wouter router
- API codegen: Orval (OpenAPI → React Query hooks + Zod schemas)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validation schemas
- `artifacts/api-server/src/models/` — Mongoose models (User, Transaction)
- `artifacts/api-server/src/routes/` — Express routes (auth, transactions, dashboard)
- `artifacts/api-server/src/lib/` — Auth (JWT), DB connection, logger
- `artifacts/expense-tracker/src/` — React frontend

## Architecture decisions

- MongoDB via Mongoose (not the pre-configured PostgreSQL) — matches the MERN stack requirement
- JWT tokens stored in `localStorage` under `expense_tracker_token`
- All protected API routes use `requireAuth` middleware in `lib/auth.ts`
- Dashboard aggregations use MongoDB `$aggregate` pipelines with `$group` and `$match`
- OpenAPI-first: spec gates codegen which gates the frontend hooks

## Product

- Home page with animated hero (Framer Motion)
- JWT register/login — no OAuth dependency
- Dashboard: balance summary cards, pie chart by category, monthly bar chart, recent transactions
- Transactions: full CRUD with type/category/date filters
- Profile page

## User preferences

- Green (#16a34a emerald) + orange (#f97316) color theme
- No emojis in UI
- Deploy to Render.com

## Gotchas

- API server fails to start without `MONGODB_URI` — set it in Replit Secrets first
- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen`
- Do not use the pre-configured Drizzle/PostgreSQL `lib/db` — this app uses Mongoose directly

## GitHub & Render Deployment

See the deployment guide in this README below.

---

## Step-by-Step: GitHub + Render Deployment

### 1. Push to GitHub (without Replit as contributor)

In Replit, open the **Shell** tab and run these commands:

```bash
# Configure your own identity (replace with your info)
git config user.name "Your Name"
git config user.email "you@example.com"

# Initialize and commit
git init
git add .
git commit -m "Initial commit: Expense Tracker"

# Create a repo on GitHub (github.com → New repository)
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

> Tip: Use a GitHub Personal Access Token (PAT) as the password when prompted.
> Generate one at: github.com → Settings → Developer settings → Personal access tokens

### 2. Deploy to Render.com

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Use these settings:
   - **Root Directory:** (leave blank)
   - **Build Command:** `pnpm install && pnpm --filter @workspace/expense-tracker run build && pnpm --filter @workspace/api-server run build`
   - **Start Command:** `node artifacts/api-server/dist/index.mjs`
   - **Node Version:** 20 or 22

4. Under **Environment Variables** on Render, add:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production

5. Click **Deploy** — Render will build and serve the app.
