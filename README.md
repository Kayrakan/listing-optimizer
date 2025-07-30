# AI Listing-Optimizer – Project Charter & Technical Blueprint
Revision 2 – July 2025 (current repo layout)

## 0 What we're building
A Chrome/Edge browser extension that bulk-rewrites marketplace listings with GPT-4o-mini, lets the seller review and one-click patch the live listing, and charges per successful patch. Target: ≤ 400 ms median turnaround and over 100,000 listings per hour, all by a two-person team.

## 1 Layer-by-layer architecture

| Layer | Runtime | Main responsibilities | Why this pick |
| --- | --- | --- | --- |
| Client | Plasmo (MV3) · React 18 · Tailwind · Zustand | Popup & side-panel UI, JWT storage, calls `/scan` `/result` `/patch`, opens lemonsqueezy Checkout | Rich UX, hot-reload, Manifest v3 scaffolding |
| Edge | Cloudflare Workers + Hono router · Cloudflare Queues | Verify JWT → enqueue SCAN_Q → GPT_Q → PATCH_Q, persist GPT answer, return status | POP-level latency, autoscale, DLQ |
| Core | Laravel 11 on Forge (PHP-FPM for now) | Guest-token issuance, OAuth2 redirects, lemonsqueezy metered billing, `/api/usage`, `/api/quota` | Cashier + Socialite = quickest path to compliant billing |
| Database | CockroachDB Serverless (eu-central) | `users` and `jobs` tables; RLS `user_id = jwt.sub` | Horizontal writes, Postgres driver for JS & PHP |
| Auth | Supabase magic-link → RS256 JWT | Zero password UX; JWT can be verified in both Worker & Laravel |
| AI | OpenAI GPT-4o-mini via fetch SDK | 200–300 ms result; can swap to Fly GPU batch later |
| Payments | lemonsqueezy Checkout + Customer Portal | Comply with Chrome Web Store “free only” policy |

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
                     └─ POST /api/usage (Laravel) ─▶ lemonsqueezy usage +1
```

## 2 Repository structure

```text
listing-optimizer/
├── Makefile
├── README.md
├── edge-api
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── shared
│   │   ├── schema.ts
│   │   └── supabase.ts
│   ├── src
│   │   ├── consumers
│   │   │   ├── gpt.ts
│   │   │   ├── patch.ts
│   │   │   └── scan.ts
│   │   ├── router.ts
│   │   └── utils
│   │       ├── crypto.ts
│   │       ├── jwt.ts
│   │       └── openai.ts
│   └── wrangler.toml
├── infra
│   ├── forge-deploy.sh
│   └── grafana-dashboard.json
├── listingo-app
│   ├── Dockerfile
│   ├── README.md
│   ├── app
│   │   ├── Http
│   │   │   ├── Controllers
│   │   │   │   ├── Controller.php
│   │   │   │   ├── QuotaController.php
│   │   │   │   ├── LemonSqueezyWebhookController.php
│   │   │   │   └── TopUpController.php
│   │   │   └── Middleware
│   │   │       └── VerifySupabaseJwt.php
│   │   ├── Models
│   │   │   └── User.php
│   │   └── Providers
│   │       └── AppServiceProvider.php
│   ├── artisan
│   ├── bootstrap
│   │   ├── app.php
│   │   ├── cache
│   │   └── providers.php
│   ├── composer.json
│   ├── composer.lock
│   ├── config
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── cache.php
│   │   ├── database.php
│   │   ├── filesystems.php
│   │   ├── lemonsqueezy.php
│   │   ├── logging.php
│   │   ├── mail.php
│   │   ├── queue.php
│   │   ├── sanctum.php
│   │   ├── services.php
│   │   ├── session.php
│   │   └── supabase.php
│   ├── database
│   │   ├── factories
│   │   │   └── UserFactory.php
│   │   ├── migrations
│   │   │   ├── 0001_01_01_000000_create_users_table.php
│   │   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   │   ├── 2025_06_30_002641_create_personal_access_tokens_table.php
│   │   │   ├── 2025_07_04_183734_create_listing_jobs_table.php
│   │   │   ├── 2025_07_15_145825_add_credits_and_stripe_to_users.php
│   │   │   └── 2025_07_28_224353_rename_stripe_to_lemonsqueezy_in_users_table.php
│   │   └── seeders
│   │       └── DatabaseSeeder.php
│   ├── package.json
│   ├── phpunit.xml
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.php
│   │   └── robots.txt
│   ├── resources
│   │   ├── css
│   │   │   └── app.css
│   │   ├── js
│   │   │   ├── app.js
│   │   │   └── bootstrap.js
│   │   └── views
│   │       ├── supabase-complete.blade.php
│   │       └── welcome.blade.php
│   ├── routes
│   │   ├── api.php
│   │   ├── console.php
│   │   └── web.php
│   ├── tests
│   │   ├── Feature
│   │   │   └── ExampleTest.php
│   │   ├── TestCase.php
│   │   └── Unit
│   │       └── ExampleTest.php
│   └── vite.config.js
├── listingo-ext
│   ├── QuotaBadge.tsx
│   ├── README.md
│   ├── assets
│   │   └── icon.png
│   ├── background
│   │   ├── background
│   │   │   └── demo-oauth.ts
│   │   └── worker.ts
│   ├── components
│   │   ├── ConnectedSources.tsx
│   │   ├── DemoTab.tsx
│   │   ├── SignInOverlay.tsx
│   │   └── UpgradeOverlay.tsx
│   ├── content.tsx
│   ├── core
│   │   ├── edge.ts
│   │   ├── supabase.ts
│   │   ├── topup.ts
│   │   ├── types.ts
│   │   └── useQuotaPoll.ts
│   ├── env.d.ts
│   ├── hooks
│   │   ├── useInitAuth.ts
│   │   ├── usePoll.ts
│   │   └── useLemonSqueezyCheckout.ts
│   ├── options.tsx
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── popup.tsx
│   ├── postcss.config.js
│   ├── state
│   │   ├── authSlice.ts
│   │   ├── demoSlice.ts
│   │   ├── index.ts
│   │   ├── jobsSlice.ts
│   │   ├── quotaSlice.ts
│   │   └── sourcesSlice.ts
│   ├── style.css
│   ├── tailwind.config.js
│   └── tsconfig.json
├── package-lock.json
├── package.json
├── scripts
│   ├── dev.sh
│   └── seed-db.ts
└── shared
    ├── package.json
    ├── prompts.ts
    ├── schema.ts
    └── types.ts

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

| Context | Variables                                                                           |
| --- |-------------------------------------------------------------------------------------|
| Edge Worker | SUPABASE_URL SUPABASE_JWK_CACHE_MIN CR_DB_URL OPENAI_API_KEY HMAC_SECRET            |
| Laravel .env | CR_DB_URL LEMONSQUEEZY_SECRET LEMONSQUEEZY_WEBHOOK_SECRET SUPABASE_JWK_URL JWT_PUBLIC_KEY |

## 4 Operational checklist

| Area | Default | Scale-out path |
| --- | --- | --- |
| Droplet CPU | 1 GB / 1 vCPU · PHP-FPM | Enable Octane (Swoole) when `/api/usage` hits >100 RPS |
| Queues | Cloudflare free tier (100k msgs/day) | Paid Queue + GPU batch on Fly Machines |
| Database | Cockroach Serverless (5 GB free) | Upgrade to paid; multi-region gateway when US traffic grows |
| Monitoring | Grafana Cloud (Logpush) | Add Datadog if >10 containers later |

## 5 Timeline snapshot

| Week | Deliverable                                          |
| --- |------------------------------------------------------|
| 1 | Guest JWT + Scan/Result demo                         |
| 3 | Lemonsqueezy upgrade flips quota, CI pipelines green |
| 4 | Optional GPU batch, Grafana live                     |
| 6 | Chrome Web Store beta with real billing              |

## 6 Why this configuration is “best value”

Edge owns speed → sub-400 ms listing loop, autoscale queues.

Workspaces & Makefile → clone → `npm i` → `make dev`; new dev productive in minutes.

Cockroach → one source of truth for both JS and PHP.

Guest-token pattern → zero signup friction; LemonSqueezy handles verified identity.
