# Developer Portfolio Evaluator

A full-stack MERN application that analyses any public GitHub profile and generates a detailed scorecard covering activity, code quality signals, project diversity, community impact, and hiring readiness.

## 🚀 Live Demo

- **Frontend**: https://portfolio-evaluator.vercel.app
- **Backend**: https://portfolio-evaluator-api.onrender.com

## Features

- 🔍 **GitHub Username Search** — Fetch live profile data from any public GitHub account
- 📊 **5-Category Scoring Engine** — Activity, Code Quality, Project Diversity, Community Impact, Hiring Readiness
- 📈 **Interactive Visualizations** — Radar chart, contribution heatmap, language distribution bar chart
- 🔗 **Shareable Report URLs** — Each report lives at `/report/:username`
- ⚡ **MongoDB Caching** — Reports cached for 24 hours to avoid rate limits
- 🆚 **Compare Mode** — Compare two GitHub profiles side-by-side

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Chart.js |
| HTTP | Axios |
| Backend | Node.js + Express |
| GitHub API | Octokit |
| Database | MongoDB Atlas + Mongoose |
| Auth (optional) | JWT + bcrypt |
| Deploy FE | Vercel |
| Deploy BE | Render |

## Setup Instructions

### Prerequisites
- Node.js v18+
- Git
- MongoDB Atlas account (free M0 cluster)
- GitHub Personal Access Token

### 1. Clone the repository

```bash
git clone https://github.com/your-username/portfolio-evaluator.git
cd portfolio-evaluator
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment variables

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/portfolio_eval
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
JWT_SECRET=your_random_secret_key_here
CLIENT_URL=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

### 5. Deploy

- **Frontend**: Push `client/` to GitHub → Import in Vercel → Set `VITE_API_URL` env var
- **Backend**: Push `server/` to GitHub → Create Web Service on Render → Set all `.env` vars

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/:username` | Fetch & score a GitHub profile |
| GET | `/api/profile/:username/cached` | Return cached report if fresh |
| GET | `/api/compare?u1=:u1&u2=:u2` | Compare two GitHub profiles |
| GET | `/api/health` | Server health check |

## Scoring Algorithm

| Category | Weight | Description |
|----------|--------|-------------|
| Activity | 25% | Commits last 90 days + streak consistency |
| Code Quality | 20% | README, license, topics, test folders |
| Diversity | 20% | Unique languages + project categories |
| Community | 20% | Stars, forks, followers (log scale) |
| Hiring Ready | 15% | Bio, website, email, pinned repos |

## Deployment Guide

### Frontend on Vercel

This repo includes `client/vercel.json` so React Router routes like `/report/:username` and `/compare` work after refresh.

1. Push this project to GitHub.
2. In Vercel, import the repo as a new project.
3. Set the **Root Directory** to `portfolio-evaluator/client`.
4. Let Vercel detect **Vite**.
5. Add this environment variable:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

6. Deploy.

### Backend on Render

This repo includes `render.yaml`, or you can configure the service manually.

1. In Render, create a new **Web Service** from the same GitHub repo.
2. Set the **Root Directory** to `portfolio-evaluator/server`.
3. Use:

```text
Build Command: npm install
Start Command: npm start
```

4. Add these environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
GITHUB_TOKEN=your_github_personal_access_token
JWT_SECRET=your_random_secret
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=10000
```

5. Deploy the backend.
6. Copy the Render backend URL into the Vercel `VITE_API_URL` variable and redeploy the frontend.
7. Update Render `CLIENT_URL` to your final Vercel URL if needed and redeploy the backend.

### Example Env Files

- `server/.env.example`
- `client/.env.example`
