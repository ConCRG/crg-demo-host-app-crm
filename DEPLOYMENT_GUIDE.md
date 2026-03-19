# CRG Platform Deployment Guide

Complete deployment guide for the CRG (Conversational Product Intelligence) platform, covering all three repositories and their service providers.

## Architecture Overview

The CRG platform consists of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│  crg-demo-host-app-crm                                      │
│  ├── CRM Frontend (Vercel)                                  │
│  │   └── crg-platform submodule (built during deploy)      │
│  │       ├── connector-core                                │
│  │       ├── connector-react                               │
│  │       └── sidecar-ui                                    │
│  └── CRM API (Cloudflare Workers)                          │
│      └── Hono backend with in-memory store                 │
└─────────────────────────────────────────────────────────────┘
                    │
                    ├──────────────────┐
                    │                  │
                    ▼                  ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  train-service (Fly.io)  │  │  graph-service (Fly.io)  │
│  - Knowledge extraction  │  │  - Neo4j sync            │
│  - Probe orchestration   │  │  - Graph RAG queries     │
│  - LLM analysis          │  │  - Assist API            │
└──────────────────────────┘  └──────────────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  Neo4j AuraDB    │
                              │  (Managed)       │
                              └──────────────────┘
```

---

## Prerequisites

### Required Accounts
- [Vercel](https://vercel.com) account (for CRM frontend)
- [Cloudflare](https://dash.cloudflare.com/) account (for CRM API)
- [Fly.io](https://fly.io) account (for train-service and graph-service)
- [Neo4j AuraDB](https://neo4j.com/cloud/aura/) account (for knowledge graph)
- [Anthropic API](https://console.anthropic.com/) key (for Claude)

### Required Tools
- Node.js >= 18.0.0
- Git
- `flyctl` CLI: `brew install flyctl` (macOS) or [install guide](https://fly.io/docs/flyctl/install/)
- `wrangler` CLI: `npm i -g wrangler` (for Cloudflare Workers)
- `vercel` CLI (optional): `npm i -g vercel`

---

## 1. Deploy crg-graph-service (Fly.io)

The graph service manages the Neo4j knowledge graph and provides the Graph RAG API for the Assist widget.

### Location
```bash
cd ~/Projects/altrium/crg-graph-service
```

### 1.1 Provision Neo4j AuraDB

1. Go to [Neo4j AuraDB](https://console.neo4j.io/)
2. Create a new **Free** instance
3. Note the connection details:
   - URI: `neo4j+s://xxxxxxxx.databases.neo4j.io`
   - Username: `neo4j`
   - Password: (generated password)
   - Database: `neo4j`

### 1.2 First-time setup

```bash
cd ~/Projects/altrium/crg-graph-service

# Login to Fly.io
fly auth login

# Launch the app (creates fly.toml if not exists)
fly launch --no-deploy
```

When prompted:
- **App name**: `crg-graph-service` (or your choice)
- **Region**: Choose closest to your users (e.g. `fra` for Europe, `iad` for US East)
- **Postgres/Redis**: Decline (not needed)

### 1.3 Set secrets

```bash
# Neo4j credentials
fly secrets set NEO4J_URI="neo4j+s://xxxxxxxx.databases.neo4j.io"
fly secrets set NEO4J_USER="neo4j"
fly secrets set NEO4J_PASSWORD="your-auradb-password"
fly secrets set NEO4J_DATABASE="neo4j"

# LLM provider (Claude)
fly secrets set LLM_PROVIDER="claude"
fly secrets set ANTHROPIC_API_KEY="sk-ant-..."

# Embeddings (Azure OpenAI, OpenAI, or Google)
fly secrets set EMBEDDING_PROVIDER="azure-openai"
fly secrets set AZURE_OPENAI_API_KEY="..."
fly secrets set AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"

# Or for OpenAI embeddings:
# fly secrets set EMBEDDING_PROVIDER="openai"
# fly secrets set OPENAI_API_KEY="sk-..."

# Or for Google embeddings:
# fly secrets set EMBEDDING_PROVIDER="google"
# fly secrets set GOOGLE_API_KEY="..."

# CORS origins (add your Vercel deployment URL)
fly secrets set CORS_ALLOW_ORIGINS="https://your-crm.vercel.app"
```

### 1.4 Deploy

```bash
fly deploy
```

### 1.5 Verify

```bash
fly status
fly logs

# Test health endpoint
curl https://crg-graph-service.fly.dev/health
# Should return: {"status":"ok","service":"crg-graph-service"}
```

### 1.6 Useful commands

| Command | Description |
|---------|-------------|
| `fly deploy` | Deploy or update the app |
| `fly logs` | Stream logs |
| `fly status` | App status and machines |
| `fly ssh console` | SSH into a machine |
| `fly secrets list` | List secrets (values hidden) |
| `fly secrets set KEY=value` | Set a secret |
| `fly scale count 0` | Scale to 0 (autostop when idle) |

---

## 2. Deploy train-service (Fly.io)

The train service handles probe orchestration, knowledge extraction, and LLM-powered analysis.

### Location
```bash
cd ~/Projects/altrium/crg-platform/packages/train-service
```

### 2.1 First-time setup

```bash
cd ~/Projects/altrium/crg-platform/packages/train-service

# Login to Fly.io (if not already)
fly auth login

# Launch the app
fly launch --no-deploy
```

When prompted:
- **App name**: `crg-train-service` (or your choice)
- **Region**: Same as graph-service for low latency
- **Postgres/Redis**: Decline

### 2.2 Set secrets

```bash
fly secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

### 2.3 Deploy

```bash
fly deploy
```

### 2.4 Verify

```bash
fly status
fly logs

# Test health endpoint
curl https://crg-train-service.fly.dev/api/health
# Should return: {"status":"ok","service":"crg-trainee"}
```

---

## 3. Deploy crm-api (Cloudflare Workers)

The CRM API is a Hono backend that provides REST endpoints for contacts, companies, deals, activities, and settings.

### Location
```bash
cd ~/Projects/altrium/crg-demo-host-app-crm/crm-api
```

### 3.1 Login to Cloudflare

```bash
cd ~/Projects/altrium/crg-demo-host-app-crm/crm-api
wrangler login
```

This opens a browser to authenticate with your Cloudflare account.

### 3.2 Deploy

```bash
wrangler deploy
```

This deploys the API to Cloudflare Workers. The deployment URL will be shown in the output (e.g., `https://crm-api.your-subdomain.workers.dev`).

### 3.3 Verify

```bash
# Test a sample endpoint
curl https://crm-api.your-subdomain.workers.dev/api/dashboard
```

Should return dashboard statistics JSON.

### 3.4 Configure custom domain (optional)

If you want a custom domain for the API:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → Your worker → **Settings** → **Domains & Routes**
3. Add a custom domain (e.g., `api.your-domain.com`)

### 3.5 Update CRM frontend

After deploying, update the CRM frontend to use the production API URL.

In `crm/.env.production`, set:
```env
VITE_API_URL=https://crm-api.your-subdomain.workers.dev
```

Or configure this in Vercel environment variables (see section 4.2).

---

## 4. Deploy crg-demo-host-app-crm Frontend (Vercel)

The CRM React frontend with embedded CRG connector and sidecar UI.

### Location
```bash
cd ~/Projects/altrium/crg-demo-host-app-crm
```

### 3.1 Connect to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `oshadha-dev/crg-demo-host-app-crm`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build:web` (uses `vercel.json` config)
   - **Output Directory**: `crm/dist`
   - **Install Command**: `npm run vercel:install` (builds crg-platform submodule)

#### Option B: Via CLI

```bash
cd ~/Projects/altrium/crg-demo-host-app-crm
vercel login
vercel link
```

### 4.2 Configure environment variables

In the Vercel dashboard, go to **Project Settings** → **Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://crm-api.your-subdomain.workers.dev` | Production |
| `VITE_CRG_ENABLED` | `true` | Production |
| `VITE_CRG_SERVICE_URL` | `https://crg-train-service.fly.dev` | Production |
| `VITE_CRG_GRAPH_SERVICE_URL` | `https://crg-graph-service.fly.dev` | Production |
| `VITE_CRG_MODE` | `assist` | Production |

**Important:** After adding environment variables, you must redeploy for them to take effect.

### 4.3 Configure Git submodule authentication

The deployment uses a git submodule (`crg-platform`). Vercel needs access to it.

#### If crg-platform is public:
No additional configuration needed.

#### If crg-platform is private:

1. Create a GitHub Personal Access Token (PAT) with `repo` scope
2. In Vercel project settings → **Environment Variables**, add:
   - `GH_TOKEN` = your PAT
3. The `scripts/configure-submodule-auth.cjs` script will use this during build

### 4.4 Deploy

#### Automatic (recommended):
Push to `main` branch:
```bash
git push origin main
```
Vercel automatically deploys on push.

#### Manual:
```bash
vercel --prod
```

### 4.5 Verify

1. Open your Vercel deployment URL
2. Check that the CRG Trainee sidecar appears (toggle button on the right)
3. Verify the connection status shows "Connected"

### 4.6 Update CORS in graph-service

After deploying, update the graph-service CORS to include your Vercel URL:

```bash
cd ~/Projects/altrium/crg-graph-service
fly secrets set CORS_ALLOW_ORIGINS="https://your-crm.vercel.app,https://your-crm-git-branch.vercel.app"
```

Include both production and preview URLs if needed.

---

## 5. Deployment Workflow

### Making changes to the CRM frontend

```bash
cd ~/Projects/altrium/crg-demo-host-app-crm/crm
# Make changes to React components, pages, etc.
git add .
git commit -m "Update CRM frontend"
git push origin main
# Vercel deploys automatically
```

### Making changes to crg-platform (connector, sidecar-ui)

```bash
cd ~/Projects/altrium/crg-platform
# Make changes to connector-core, connector-react, or sidecar-ui
git add .
git commit -m "Update sidecar UI"
git push origin main

# Update the submodule reference in the host repo
cd ~/Projects/altrium/crg-demo-host-app-crm
git submodule update --remote crg-platform
git add crg-platform
git commit -m "Update crg-platform submodule"
git push origin main
# Vercel deploys with the new submodule commit
```

### Making changes to train-service

```bash
cd ~/Projects/altrium/crg-platform/packages/train-service
# Make changes
git add .
git commit -m "Update train-service"
git push origin main

# Deploy to Fly.io
fly deploy
```

### Making changes to graph-service

```bash
cd ~/Projects/altrium/crg-graph-service
# Make changes
git add .
git commit -m "Update graph-service"
git push origin master

# Deploy to Fly.io
fly deploy
```

---

### Making changes to crm-api

```bash
cd ~/Projects/altrium/crg-demo-host-app-crm/crm-api
# Make changes to routes, store, etc.
git add .
git commit -m "Update CRM API"
git push origin main

# Deploy to Cloudflare Workers
wrangler deploy
```

---

## 6. Environment Variables Reference

### crg-demo-host-app-crm (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CRG_ENABLED` | Enable CRG integration | `true` |
| `VITE_CRG_SERVICE_URL` | Train service URL | `https://crg-train-service.fly.dev` |
| `VITE_CRG_GRAPH_SERVICE_URL` | Graph service URL | `https://crg-graph-service.fly.dev` |
| `VITE_CRG_MODE` | CRG mode (assist or trainee) | `assist` |
| `GH_TOKEN` | GitHub PAT for private submodules | `ghp_...` (if crg-platform is private) |

### train-service (Fly.io)

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-...` |
| `PORT` | Server port (set in fly.toml) | `8080` |

### graph-service (Fly.io)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEO4J_URI` | Neo4j connection URI | `neo4j+s://xxx.databases.neo4j.io` |
| `NEO4J_USER` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | `your-password` |
| `NEO4J_DATABASE` | Neo4j database name | `neo4j` |
| `LLM_PROVIDER` | LLM provider | `claude` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-...` |
| `EMBEDDING_PROVIDER` | Embedding provider | `azure-openai` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key | `...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | `https://resource.openai.azure.com` |
| `USE_EMBEDDINGS` | Enable embeddings | `true` |
| `CORS_ALLOW_ORIGINS` | Allowed origins (comma-separated) | `https://your-crm.vercel.app` |
| `PORT` | Server port (set in fly.toml) | `8080` |
| `LOG_LEVEL` | Log level | `info` |

---

### crm-api (Cloudflare Workers)

| Variable | Description | Example |
|----------|-------------|---------|
| None currently | API uses in-memory store | - |

Future: D1 database binding for persistent storage.

---

## 7. Troubleshooting

### Vercel build fails

**Error: "Failed to fetch git submodules"**
- Ensure `GH_TOKEN` is set if crg-platform is private
- Check that the submodule URL in `.gitmodules` is correct
- Verify the submodule commit exists in the remote repo

**Error: "Cannot find package 'tsup'"**
- This was fixed in `scripts/build-crg-with-npm.cjs` by setting `NODE_PATH`
- Ensure you're using the latest version of the build script

**Build succeeds but UI changes not visible**
- Check that the submodule reference is updated: `git ls-tree HEAD crg-platform`
- Update submodule: `git submodule update --remote crg-platform`
- Commit and push the submodule update

### Fly.io deployment fails

**Error: "Connection refused" or "Neo4j unreachable"**
- Verify `NEO4J_URI` is correct (use `neo4j+s://` for AuraDB)
- Check Neo4j AuraDB firewall rules (should allow all IPs or Fly.io IPs)
- Test connection: `fly ssh console` then try connecting to Neo4j

**Error: "Missing ANTHROPIC_API_KEY"**
- Set the secret: `fly secrets set ANTHROPIC_API_KEY="sk-ant-..."`
- Verify: `fly secrets list`

**Cold starts are slow**
- Set `min_machines_running = 1` in `fly.toml` to keep one machine always running
- Redeploy: `fly deploy`

### CORS errors in browser

**Error: "Access to fetch blocked by CORS policy"**
- Add your Vercel URL to `CORS_ALLOW_ORIGINS` in graph-service
- Include all preview URLs if needed: `https://app.vercel.app,https://app-git-branch.vercel.app`
- Redeploy: `fly deploy` (or just update secrets, which auto-restarts)

### CRG sidecar not appearing

1. Check browser console for errors
2. Verify `VITE_CRG_ENABLED=true` in Vercel env vars
3. Verify `VITE_CRG_SERVICE_URL` and `VITE_CRG_GRAPH_SERVICE_URL` are set
4. Check that train-service and graph-service are running: `fly status`
5. Test service health endpoints:
   - `https://crg-train-service.fly.dev/api/health`
   - `https://crg-graph-service.fly.dev/health`

---

### CRM API issues

**Error: "Worker not found" or 404**
- Verify deployment succeeded: `wrangler deployments list`
- Check the worker URL in Cloudflare dashboard
- Ensure `VITE_API_URL` in Vercel matches the worker URL

**CORS errors from frontend**
- The API uses `cors()` middleware from Hono with default settings
- Check browser console for the exact CORS error
- Update CORS config in `crm-api/src/index.ts` if needed

**Data resets on every request**
- Cloudflare Workers use in-memory storage which resets between invocations
- For persistent data, migrate to D1 database (see `wrangler.toml` comments)

---

## 8. Monitoring & Logs

### Vercel
- **Dashboard**: https://vercel.com/dashboard
- **Logs**: Project → Deployments → Click deployment → Runtime Logs
- **Build logs**: Project → Deployments → Click deployment → Build Logs

### Fly.io
```bash
# Real-time logs
fly logs -a crg-graph-service
fly logs -a crg-train-service

# App status
fly status -a crg-graph-service
fly status -a crg-train-service

# Machine metrics
fly dashboard -a crg-graph-service
```

### Neo4j AuraDB
- **Console**: https://console.neo4j.io/
- **Query browser**: Open your instance → Query tab
- **Metrics**: Instance → Metrics tab

---

### Cloudflare Workers
```bash
# View deployments
wrangler deployments list

# Tail logs in real-time
wrangler tail

# View worker details
wrangler whoami
```

**Dashboard**: https://dash.cloudflare.com/ → Workers & Pages → Your worker

---

## 9. Scaling & Performance

### Fly.io auto-scaling

Both services are configured with `auto_stop_machines = 'stop'` and `min_machines_running = 0`, which means:
- Machines stop after idle timeout (saves costs)
- First request after idle takes 2-5 seconds (cold start)

To keep services always running:

```bash
# Edit fly.toml
min_machines_running = 1

# Redeploy
fly deploy
```

### Vercel

Vercel automatically scales based on traffic. No configuration needed.

### Neo4j AuraDB

Free tier limits:
- 200k nodes + relationships
- 50 concurrent connections

For production, upgrade to a paid tier if you exceed these limits.

---

### Cloudflare Workers

Cloudflare Workers automatically scale to handle traffic. Free tier includes:
- 100,000 requests/day
- 10 ms CPU time per request

For production, upgrade to the Paid plan ($5/month) for:
- 10 million requests/month included
- Additional requests at $0.50/million

---

## 10. Cost Estimates (as of March 2026)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (CRM Frontend) | Hobby | Free (100 GB bandwidth/month) |
| Cloudflare Workers (CRM API) | Free | Free (100k requests/day) |
| Fly.io (graph-service) | Machines | ~$5-10/month (1 GB RAM, auto-stop) |
| Fly.io (train-service) | Machines | ~$3-5/month (512 MB RAM, auto-stop) |
| Neo4j AuraDB | Free | Free (up to 200k nodes) |
| Anthropic API | Pay-as-you-go | Variable (depends on usage) |

**Total estimated cost**: ~$8-15/month + LLM API usage (can be $0 with free tiers)

---

## 11. Security Best Practices

### Secrets management
- Never commit `.env` files or secrets to git
- Use Vercel environment variables for frontend env vars
- Use Fly.io secrets for backend env vars
- Rotate API keys regularly

### CORS configuration
- Only allow specific origins in `CORS_ALLOW_ORIGINS`
- Don't use `*` in production

### Neo4j
- Use strong passwords
- Enable AuraDB IP allowlist if possible
- Regularly backup your database (AuraDB has automatic backups)

### API authentication
- The `/api/admin/clear-neo4j` endpoint has no auth by default
- Add authentication before exposing to the internet (API key, JWT, etc.)

---

## 12. Backup & Recovery

### Neo4j backups
- AuraDB automatically backs up daily
- Manual export: Use Neo4j Browser → Database → Export

### Code backups
- All code is in GitHub (automatic backup)
- Tag releases: `git tag v1.0.0 && git push --tags`

### Rollback procedure

**Vercel:**
```bash
# Via dashboard: Deployments → Previous deployment → Promote to Production
# Or via CLI:
vercel rollback
```

**Fly.io:**
```bash
# List releases
fly releases -a crg-graph-service

# Rollback to previous
fly releases rollback -a crg-graph-service
```

---

**Cloudflare Workers:**
```bash
# View previous deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

---

## 13. Quick Reference: Full Deployment Checklist

- [ ] **Neo4j AuraDB** — Create instance, note credentials
- [ ] **graph-service** — `fly launch`, set secrets, `fly deploy`
- [ ] **train-service** — `fly launch`, set secrets, `fly deploy`
- [ ] **crm-api** — `wrangler login`, `wrangler deploy`, note worker URL
- [ ] **Vercel** — Import repo, set env vars (including API URL), deploy
- [ ] **Update CORS** — Add Vercel URL to graph-service CORS
- [ ] **Test** — Open CRM, verify API works and sidecar appears
- [ ] **Monitor** — Check logs for errors

---

## 14. Support & Documentation

- **CRG Platform**: See `crg-platform/` README
- **Graph Service**: See `crg-graph-service/KG_GRAPH_RAG_ARCHITECTURE.md`
- **Fly.io Docs**: https://fly.io/docs/
- **Vercel Docs**: https://vercel.com/docs
- **Neo4j Docs**: https://neo4j.com/docs/

---

## Appendix: Local Development URLs

| Service | URL |
|---------|-----|
| CRM Frontend | http://localhost:5173 |
| CRM API | http://localhost:8787 |
| Train Service | http://localhost:3001 |
| Graph Service | http://localhost:3002 |
| Neo4j Browser | http://localhost:7474 (if running locally) |

## Appendix: Service Dependencies

```
CRM Frontend (Vercel)
  ├─→ CRM API (Cloudflare Workers) — /api/* endpoints
  ├─→ Train Service (Fly.io) — CRG probe and knowledge extraction
  └─→ Graph Service (Fly.io) — CRG assist queries
           └─→ Neo4j AuraDB — Knowledge graph storage
```
