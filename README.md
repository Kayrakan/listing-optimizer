# AI Listing-Optimizer

*Rewrite and patch thousands of marketplace listings in **milliseconds**, pay only for what you change.*

---

## ✨ What it does
1. **Scans** the seller’s latest listings (Etsy, Amazon, …).
2. Runs the raw data through **GPT-4o-mini** (or a GPU batch) to generate sharper titles and keywords.
3. Lets the seller preview the suggestion in the extension and, with one click, **patch** the live listing.
4. Bills the seller _per successful patch_ using Stripe metered billing.

Free users get 10 optimisations; upgrading to **Pro** lifts the quota.

---

## 🏗 High-level architecture

```text
 Browser (Plasmo)           Cloudflare Edge               Laravel 11 (Forge)
 ─────────────────────────  ────────────────────────────  ──────────────────────────
 1. /scan ────────▶         Router Worker (Hono)          ↑ Stripe webhook
 2. poll /result            ├─ insert job, SCAN_Q.send    │ /api/usage  ◀─ PATCH
 3. /patch ──────▶          ├─ /result  → CockroachDB     │ quota / guest auth
                            Queues: SCAN_Q → GPT_Q → PATCH_Q
                            Each consumer writes status/result to Cockroach

 Persistent store: **CockroachDB Serverless (EU)**
 Auth: **Supabase** magic-link → RS256 JWT
 AI:   **OpenAI GPT-4o-mini** (swap to Fly GPU batch later)
```

---

## Master Blueprint (June 2025)

### Mission
Lightning-fast browser extension that rewrites marketplace listings with GPT,
charges users per successful patch, and scales to 100 000+ listings / hour.

---

### A. CLIENT LAYER — Browser Extension

**Stack**
- Plasmo (Manifest v3) · React 18 · TypeScript
- Tailwind CSS · Zustand (small global state)

**Auth & first-run**
- On first install → `POST /api/auth/guest` (no UI) – Laravel creates a `guest` row and returns a JWT.
- JWT stored in `chrome.storage.sync` and sent in the `Authorization` header.

**Main UX flow**
1. User presses **Scan N** → POST `https://edge.listingo.ai/scan`.
2. Extension polls `/result?jobId` until `status='ready'`.
3. Shows GPT title; if user clicks **Apply** → POST `/patch`.
4. Quota/plan badge fetched from `/api/quota`.
5. **Upgrade** button opens Stripe Hosted Checkout; on success Stripe redirects back to the extension and Laravel converts guest → pro.

---

### B. EDGE LAYER — Cloudflare Workers & Queues

**Router Worker** (Hono)
- Verifies Supabase JWT (Supabase JWK cached 15 min).
- `/scan` – insert job (`status='queued'`) and `SCAN_Q.send({jobId,userId,skuBatch})`.
- `/result` – select `result_json` and status by `jobId`.
- `/patch` – quota check, `PATCH_Q.send({jobId})`.

**Queues (auto‑scaled)**
- `SCAN_Q` → scan-consumer … fetch listings JSON and push each to `GPT_Q`.
- `GPT_Q` → gpt-consumer … call **OpenAI GPT-4o-mini**, write answer to DB, set `status='ready'`.
- `PATCH_Q` → patch-consumer … Etsy/Amazon PATCH, set `status='patched'`, POST `/api/usage` (HMAC) to Laravel.
- Dead-letter handled automatically (Cloudflare DLQ).

---

### C. CORE LAYER — Laravel + CockroachDB

Laravel 11 (Forge, 1 GB FRA droplet)
- Socialite drivers: Etsy, Amazon (OAuth)
- Stripe **Cashier** (metered) – `/api/usage ↔ recordUsage(1)`
- `/api/auth/guest` creates guest user and returns JWT
- `/api/quota` returns plan & `quota_remaining`

Database — CockroachDB Serverless (eu-central)
- Table `users(id, email, device_uuid, plan, quota_remaining, stripe_id)`
- Table `jobs(id, user_id, sku, status, result_json, created_at)`
- Row-level policy: `user_id = jwt.sub`

---

### D. SUPPORTING SERVICES & TOOLS
- Supabase Auth – magic-link → RS256 JWT
- OpenAI GPT-4o-mini (fetch SDK) — swap to Fly GPU batch later
- GitHub Actions
  - `extension-ci` – lint + build ZIP
  - `edge-ci` – wrangler publish
  - `api-ci` – deploy via Forge CLI
- Monitoring
  - Cloudflare Analytics + Logpush ➜ Grafana Cloud
  - Forge error & uptime alerts

---

### E. MONOREPO STRUCTURE

```
listing-optimizer/                 ← single GitHub repo (main branch)
│
├─ extension/                      # Plasmo browser add-on
│   ├─ src/ …     popup.tsx, side-panel.tsx
│   ├─ manifest.ts
│   ├─ tailwind.config.js
│   ├─ package.json
│   └─ .env            # VITE_EDGE_BASE, VITE_STRIPE_KEY
│
├─ edge-api/                       # Cloudflare Workers project
│   ├─ src/
│   │   ├─ router.ts      (Hono endpoints /scan /result /patch)
│   │   ├─ consumers/
│   │   │     scan.ts gpt.ts patch.ts
│   │   └─ utils/crypto.ts  openai.ts  jwt.ts
│   ├─ wrangler.toml
│   └─ .dev.vars          # local env for Miniflare
│
├─ api/                            # Laravel (Stripe + OAuth)
│   ├─ app/ routes/ database/
│   ├─ composer.json
│   ├─ Dockerfile          # for CI build only
│   └─ .env                # CR_DB_CONN  STRIPE_SECRET …
│
├─ shared/                         # Cross-package TS types & SQL schema
│   ├─ schema.ts        (drizzle for Cockroach)
│   └─ prompts.ts       (GPT prompt templates)
│
├─ infra/
│   ├─ forge-deploy.sh    # droplet deploy script
│   └─ grafana-dashboard.json
│
├─ scripts/
│   ├─ dev.sh            # run Miniflare + Laravel + Plasmo together
│   └─ seed-db.ts
│
└─ .github/workflows/
    ├─ extension-ci.yml   # lint + build ZIP
    ├─ edge-ci.yml        # wrangler publish on edge-api/**
    └─ api-ci.yml         # PHPUnit + Forge deploy on api/**
```

---

### Environment & constants
- Edge worker vars: `SUPABASE_URL`, `SUPABASE_JWK_CACHE_MIN=15`, `CR_DB_URL`, `OPENAI_API_KEY`, `HMAC_SECRET`
- Laravel `.env`: `CR_DB_URL`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_JWK_URL`, `JWT_PUBLIC_KEY`

### Key design rationale
- Edge handles all bursty, latency-critical AI and patch work (sub‑400 ms).
- Laravel handles money, OAuth and returns JWT/quotas — tiny droplet.
- CockroachDB is the single source of truth used by both stacks.
- Users start as **guest** (no form) yet can upgrade any time via Stripe.
- No paid Chrome‑Store flow — Stripe checkout is external, per Google policy.

END OF BLUEPRINT
