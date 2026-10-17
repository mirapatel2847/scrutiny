# Scrutiny

> AI-powered document scrutiny and gap-analysis tool.

Scrutiny ingests your project artefacts (specs, PRDs, architecture docs, ADRs,
meeting notes) and surfaces hidden gaps, contradictions, workflow risks, and
data concerns as prioritised, actionable findings.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Folder Map](#folder-map)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API](#api)

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 (see `.nvmrc`) |
| npm | ≥ 10 |
| MongoDB | ≥ 7 |

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd scrutiny

# 2. Use correct Node version (if you have nvm)
nvm use

# 3. Install all workspace dependencies
npm install

# 4. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit each .env file with your values

# 5. Seed the database
npm run seed --workspace=server

# 6. Start development servers (client + server)
npm run dev
```

The API will be available at <http://localhost:3000> and the React app at
<http://localhost:5173>.

## Folder Map

```
scrutiny/
├── client/                    # React + Vite frontend
│   ├── public/                # Static assets
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level page components
│       ├── hooks/             # Custom React hooks
│       ├── services/          # API client functions
│       ├── utils/             # Pure utility helpers
│       └── styles/            # Global CSS / design tokens
├── server/                    # Node.js + Express backend
│   ├── prompts/               # LLM prompt templates
│   ├── scripts/               # One-off scripts (seed, migrate …)
│   │   └── seed.js
│   ├── taxonomy/              # Controlled vocabularies / category trees
│   ├── tests/
│   │   ├── fixtures/          # Reusable test data
│   │   └── unit/             # Unit tests
│   └── src/
│       ├── app.js             # Express app factory
│       ├── index.js           # Entry point (connects DB, starts server)
│       ├── config/            # Environment & feature configuration
│       ├── models/            # Mongoose models
│       │   ├── Project.js
│       │   ├── SourceFile.js
│       │   ├── Section.js
│       │   ├── Claim.js
│       │   ├── Finding.js
│       │   └── Feedback.js
│       ├── routes/            # Express routers
│       ├── controllers/       # Route handler functions
│       ├── services/          # Business logic
│       ├── parsers/           # File-type parsers
│       ├── detectors/         # Gap / contradiction / workflow / data detectors
│       ├── jobs/              # Background job workers
│       ├── middleware/        # Express middleware (auth, error, upload …)
│       └── utils/             # Shared utility helpers
├── shared/
│   └── schemas/               # Zod / JSON schemas shared by client & server
├── evals/                     # LLM evaluation harness and datasets
├── docs/
│   ├── architecture.md        # System architecture (this document's sibling)
│   └── decisions/             # Architecture Decision Records (ADRs)
├── uploads/                   # Temporary upload staging (git-ignored)
├── .editorconfig
├── .eslintconfig.js
├── .gitattributes
├── .gitignore
├── .nvmrc
├── .prettierrc
├── CHANGELOG.md
├── LICENSE
├── README.md
└── package.json               # Root workspace config
```

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/scrutiny` |
| `OPENAI_API_KEY` | OpenAI API key for LLM calls | — |
| `JWT_SECRET` | Secret for signing JWTs | — |

### Client (`client/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the API | `http://localhost:3000` |
| `VITE_APP_NAME` | Application display name | `Scrutiny` |

## Available Scripts

Run from the **repo root** unless noted.

| Command | Description |
|---|---|
| `npm run dev` | Start client + server in development mode (concurrently) |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Format all files with Prettier |
| `npm run test` | Run all workspace test suites |
| `npm run seed --workspace=server` | Seed the database with sample data |

## API

### Health

```
GET /health
```

Returns server health status.

**Response `200`**
```json
{
  "status": "ok",
  "timestamp": "2026-10-17T08:38:00.000Z"
}
```
