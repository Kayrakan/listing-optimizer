# AI Listing-Optimizer – Project Charter & Technical Blueprint
Revision 2 – July 2025 (current repo layout)

## 0 What we're building
A Chrome/Edge browser extension that bulk-rewrites marketplace listings with GPT-4o-mini, lets the seller review and one-click patch the live listing, and charges per successful patch. Target: ≤ 400 ms median turnaround and over 100,000 listings per hour, all by a two-person team.

## 1 Layer-by-layer architecture

| Layer | Runtime | Main responsibilities | Why this pick |
| --- | --- | --- | --- |
| Client | Plasmo (MV3) · React 18 · Tailwind · Zustand | Popup & side-panel UI, JWT storage, calls `/scan` `/result` `/patch`, opens Stripe Checkout | Rich UX, hot-reload, Manifest v3 scaffolding |
| Edge | Cloudflare Workers + Hono router · Cloudflare Queues | Verify JWT → enqueue SCAN_Q → GPT_Q → PATCH_Q, persist GPT answer, return status | POP-level latency, autoscale, DLQ |
| Core | Laravel 11 on Forge (PHP-FPM for now) | Guest-token issuance, OAuth2 redirects, Stripe Cashier metered billing, `/api/usage`, `/api/quota` | Cashier + Socialite = quickest path to compliant billing |
| Database | CockroachDB Serverless (eu-central) | `users` and `jobs` tables; RLS `user_id = jwt.sub` | Horizontal writes, Postgres driver for JS & PHP |
| Auth | Supabase magic-link → RS256 JWT | Zero password UX; JWT can be verified in both Worker & Laravel |
| AI | OpenAI GPT-4o-mini via fetch SDK | 200–300 ms result; can swap to Fly GPU batch later |
| Payments | Stripe Checkout + Customer Portal | Comply with Chrome Web Store “free only” policy |

## Request flow (one optimisation)

```pgsql
(extension) /scan  ─▶  Edge Router (Hono)
                          ├─ insert job row
                          └─ SCAN_Q.send
SCAN consumer ─▶ GPT_Q
GPT consumer  ─▶ save result_json, status='ready'
(extension polls /result)  ◀─────┛
(extension) /patch ─▶ PATCH_Q
PATCH consumer ─▶ Etsy PATCH ─▶ status='patched'
                     └─ POST /api/usage (Laravel) ─▶ Stripe usage +1
```

## 2 Repository structure

```text
listing-optimizer/
├── package.json           # root workspaces & helper scripts
├── Makefile               # make dev · make lint · make build · make seed
│
├─ listingo-ext/           # Plasmo browser extension (@lo/listingo-ext)
│   ├─ popup.tsx · content.tsx · options.tsx
│   ├─ tailwind.config.js
│   └─ package.json
│
├─ edge-api/               # Cloudflare Workers project (@lo/edge-api)
│   ├─ src/router.ts       # /scan /result /patch
│   ├─ src/consumers/      # scan.ts · gpt.ts · patch.ts
│   ├─ src/utils/          # crypto.ts · openai.ts · jwt.ts
│   ├─ wrangler.toml
│   └─ pnpm-lock.yaml
│
├─ listingo-app/           # Laravel backend (Stripe, OAuth)
│   ├─ app/ routes/ database/
│   ├─ composer.json
│   ├─ package.json        # vite + tailwind for frontend
│   └─ README.md
│
├─ shared/                 # code shared by extension and workers
│   ├─ schema.ts           # drizzle schema
│   ├─ prompts.ts          # GPT template strings
│   └─ types.ts            # JobRow, JwtClaims, …
│
├─ scripts/                # dev & helper tooling
│   ├─ dev.sh              # spin Miniflare + Laravel + Plasmo
│   └─ seed-db.ts          # fill CockroachDB with dummy data
│
├─ infra/                  # operational artefacts
│   ├─ forge-deploy.sh
│   └─ grafana-dashboard.json
│
└─ .github/workflows/
    ├─ extension-ci.yml
    ├─ edge-ci.yml
    └─ api-ci.yml
```

### Root `package.json`

```json
{
  "private": true,
  "workspaces": [
    "listingo-ext",
    "edge-api",
    "shared"
  ],
  "scripts": {
    /* ---------- LOCAL DEV ONE-LINER ---------- */
    "dev": "npm-run-all -p dev:ext dev:edge dev:api",

    /* ---------- INDIVIDUAL DEV TASKS ---------- */
    "dev:ext":  "npm --workspace @lo/listingo-ext run dev",    // Plasmo HMR on :9999
    "dev:edge": "npm --workspace @lo/edge-api   run dev",      // Miniflare on :8787
    "dev:api":  "cd listingo-app && php artisan serve --host=0.0.0.0 --port=8000",

    /* ---------- QUALITY & BUILD ---------- */
    "lint":     "npm-run-all lint:*",
    "lint:ts":  "eslint \"**/*.{ts,tsx}\"",
    "build":    "npm-run-all build:*"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5",
    "typescript": "^5.5.0",
    "eslint": "^8.57.0"
  }
}
```

### Top-level Makefile

```makefile
dev:          ## start edge, extension, Laravel
./scripts/dev.sh

lint:         ## run ESLint + PHP Pint
npm run lint
cd listingo-app && ./vendor/bin/pint

build: build-edge build-ext

build-edge:
npm --workspace @lo/edge-api run build

build-ext:
npm --workspace @lo/listingo-ext run build

seed:
pnpm ts-node scripts/seed-db.ts
```

## 3 Environment variable map

| Context | Variables |
| --- | --- |
| Edge Worker | SUPABASE_URL SUPABASE_JWK_CACHE_MIN CR_DB_URL OPENAI_API_KEY HMAC_SECRET |
| Laravel .env | CR_DB_URL STRIPE_SECRET STRIPE_WEBHOOK_SECRET SUPABASE_JWK_URL JWT_PUBLIC_KEY |

## 4 Operational checklist

| Area | Default | Scale-out path |
| --- | --- | --- |
| Droplet CPU | 1 GB / 1 vCPU · PHP-FPM | Enable Octane (Swoole) when `/api/usage` hits >100 RPS |
| Queues | Cloudflare free tier (100k msgs/day) | Paid Queue + GPU batch on Fly Machines |
| Database | Cockroach Serverless (5 GB free) | Upgrade to paid; multi-region gateway when US traffic grows |
| Monitoring | Grafana Cloud (Logpush) | Add Datadog if >10 containers later |

## 5 Timeline snapshot

| Week | Deliverable |
| --- | --- |
| 1 | Guest JWT + Scan/Result demo |
| 3 | Stripe upgrade flips quota, CI pipelines green |
| 4 | Optional GPU batch, Grafana live |
| 6 | Chrome Web Store beta with real billing |

## 6 Why this configuration is “best value”

Edge owns speed → sub-400 ms listing loop, autoscale queues.

Laravel owns money → Stripe Cashier + Socialite in one composer line.

Workspaces & Makefile → clone → `npm i` → `make dev`; new dev productive in minutes.

Cockroach → one source of truth for both JS and PHP.

Guest-token pattern → zero signup friction; Stripe handles verified identity.
