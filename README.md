# CRG Demo CRM

A demo CRM application used as the host application for [CRG (Conversational Product Intelligence)](https://github.com/your-org/crg).

## Overview

This monorepo contains:
- **crm/** - React + Vite frontend
- **crm-api/** - Hono backend (Cloudflare Workers compatible)

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and API in development mode
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- API: http://localhost:8787

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and API in dev mode |
| `npm run build` | Build both frontend and API for production |
| `npm run build:web` | Build frontend only |
| `npm run build:api` | Build API only |
| `npm test` | Run all tests (backend + frontend) |
| `npm run test:api` | Run backend tests only |
| `npm run test:web` | Run frontend tests only |
| `npm run lint` | Run linter on frontend |
| `npm run preview` | Preview production build locally |

## Architecture

```
apps/
├── crm/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/          # API client modules
│   │   ├── components/   # Reusable UI components
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Route pages
│   │   └── types/        # TypeScript types
│   └── vite.config.ts
│
└── crm-api/              # Hono backend
    ├── src/
    │   ├── db/           # In-memory data store
    │   ├── routes/       # API route handlers
    │   └── index.ts      # Main entry point
    └── wrangler.toml     # Cloudflare Workers config
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/contacts` | Contact management |
| `GET/POST /api/companies` | Company management |
| `GET/POST /api/deals` | Deal pipeline |
| `GET/POST /api/activities` | Activities & tasks |
| `GET/PUT /api/settings` | User settings |
| `GET /api/dashboard` | Dashboard stats |

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS
- TypeScript

**Backend:**
- Hono (lightweight, edge-ready framework)
- Cloudflare Workers compatible
- In-memory data store (for demo purposes)

## Testing

Tests use [Vitest](https://vitest.dev/) and run entirely in Node.js (no browser required).

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:api

# Run frontend tests only
npm run test:web

# Watch mode (per workspace)
npm run test:watch -w crm-api
npm run test:watch -w crm
```

**Backend tests** (115 tests) cover all API routes via Hono's `app.request()` and store unit tests.
**Frontend tests** (10 tests) cover the API client with mocked `fetch`.

## Development Notes

- The API uses an in-memory store - data resets when the server restarts
- Frontend proxies `/api/*` requests to the backend during development
- Both apps can be deployed to Cloudflare (Pages + Workers)

## License

MIT
