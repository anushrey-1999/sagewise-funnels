# Project Handover: `sagewise-funnel`

This document explains the project structure, how funnels and adwalls work, how to add new ones, and how user info is stored (API + DB). It’s written for a new developer onboarding into the codebase.

---

## Quick start (local)

- **Install**: `npm install`
- **Run dev** (uses `.env.dev`): `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

### Required environment

- **`DATABASE_URL`**: Postgres connection string used by Drizzle + API routes.
- The repo’s scripts expect env files:
  - **`.env.dev`** (for `npm run dev`, `db:*:dev`, etc.)
  - **`.env.prod`** (for `build:prod`, `db:*:prod`, etc.)

---

## Tech stack

- **Next.js (App Router)**: `next@16` with route handlers under `src/app/api/*`
- **React**: `react@19`
- **TypeScript**: `typescript@5`
- **Styling/UI**: Tailwind CSS v4 + shadcn-style components in `src/components/ui/*` (Radix primitives)
- **Validation**: Zod (`zod`)
- **DB/ORM**: Postgres + Drizzle ORM (`drizzle-orm`, `drizzle-kit`) + `pg`

---

## Current product behavior (important)

- **`/` does NOT currently show a funnel landing page.** It immediately redirects to a credit card adwall:
  - `src/app/page.tsx` redirects to `/creditcards-adwall-one`
  - that legacy route redirects to `/adwall/cc/one`
- Funnels are still fully implemented and accessible directly via:
  - **`/form?funnel=<funnelId>`**

If you want the homepage to be a “funnel entry” again, change `src/app/page.tsx` to render a page (or render `src/components/Home.tsx`) instead of redirecting.

---

## Project structure (what lives where)

### `src/app/*` (routes, App Router)

- **Funnel form UI**
  - `src/app/form/page.tsx`: server entry + metadata
  - `src/app/form/FormPageContent.tsx`: client page; reads `?funnel=` and renders the form
- **Adwalls**
  - `src/app/adwall/[funnel]/[type]/page.tsx`: dynamic adwall route; loads adwall config and renders template
  - `src/app/creditcards-adwall-one/page.tsx` (and two/three): legacy redirects to `/adwall/cc/<type>`
- **API**
  - `src/app/api/users/route.ts`: `GET` all users, `POST` create user

### `src/lib/*` (business logic + config)

- **Funnel configs**: `src/lib/funnel-configs/*.json`
- **Funnel config registry**: `src/lib/funnel-loader.ts` (imports JSON and maps funnelId → config)
- **Adwall configs**: `src/lib/adwall-configs/*.json`
- **Adwall config registry**: `src/lib/adwall-loader.ts` (maps routePrefix+type → config)
- **Post-submit redirect logic**: `src/lib/funnel-redirect.ts`
- **Tracking/query utilities**: `src/lib/url.ts`
- **DB**:
  - `src/lib/db/index.ts`: initializes Drizzle + pg Pool
  - `src/lib/db/schema.ts`: Drizzle schema (tables)

### `src/components/*`, `src/organisms/*`, `src/templates/*` (UI building blocks)

- **Form runtime**
  - `src/components/FormSection.tsx`: orchestrates submit; saves user; triggers loader + redirect
  - `src/components/MultiStepForm.tsx`: renders steps/fields; validation; auto-forward; step skipping
  - `src/components/DynamicFormField.tsx`: renders individual fields (radio/checkbox/input/etc)
- **Adwall runtime**
  - `src/templates/AdsWallTemplate.tsx`: interpolates personalization; renders cards; passes tracking IDs
  - `src/organisms/AdsWallCards.tsx`: card UI and outbound click behavior
  - `src/components/ImpressionOnView.tsx`: viewport-based impression firing
  - `src/lib/injectImpressionScript.ts`: safely injects raw vendor impression snippets

### `public/*`

Static assets used by funnels/adwalls (logos, card images, icons, etc.).

### `drizzle/*`

Database migrations output by Drizzle Kit.

---

## Funnels: how they work

### Concept

A “funnel” is a **JSON-defined multi-step form** (questions + UI content) that:

1. Loads by funnel id from the URL: **`/form?funnel=<funnelId>`**
2. Collects form answers using the config steps/fields
3. On the final step, saves user contact info to Postgres via `/api/users`
4. Redirects the user to an adwall route (dynamic), optionally based on an answer

### Source of truth

- **Type shape**: `src/types/form.ts` (`FormConfig`)
- **Configs**: `src/lib/funnel-configs/*.json`
- **Registry**: `src/lib/funnel-loader.ts`

### Runtime flow

1. `FormPageContent` reads `?funnel=` and loads config via `getFunnelConfig(funnelId)`.
2. `FormSection` renders `MultiStepForm`.
3. When the user submits the final step:
   - `FormSection` scans the full form data to extract:
     - `firstName`, `lastName`, `email`, `phone`
   - It **requires at least one of** `email` or `phone`; otherwise it errors.
   - It `POST`s to **`/api/users`** to create a user row.
   - It shows a loader, then redirects to the computed destination.

### Redirect routing rules (funnel → adwall)

Redirect computation happens in `src/lib/funnel-redirect.ts`:

- **Priority 1**: first matching `field.redirectOnAnswer.rules` (walking steps/fields in order)
- **Priority 2**: `config.finalStep.redirectTo`
- **Priority 3** (default): `/adwall/<routePrefix>/one`

**Route prefix rule**:

- If the funnel id starts with `cc-`, route prefix becomes **`cc`** (so `/adwall/cc/...`)
- Otherwise route prefix is the funnel id itself (so `/adwall/<funnelId>/...`)

The redirect logic also supports converting older hardcoded routes like `/creditcards-adwall-one` into `/adwall/cc/one`.

### Step skipping and auto-forward (form UX)

In `src/components/MultiStepForm.tsx`:

- **`skipIf`** on a step skips it if earlier answers match specified values.
- **`autoForward`** can be configured per field (defaults to auto-forward for radio/checkbox/select).
- **`redirectImmediately` + `redirectOnAnswer`** can redirect as soon as a specific field is answered (opt-in).

---

## How to create a new Funnel

### 1) Add a config JSON

- Create: `src/lib/funnel-configs/<new-funnel>.json`
- Follow `FormConfig` from `src/types/form.ts`.

Notes:

- Use **stable ids**: `config.id`, `step.id`, `field.id` are used as keys for stored form data.
- If you want the funnel to create a user successfully, include fields with ids:
  - `email` and/or `phone` (required: at least one must exist and be filled)
  - optional: `firstName`, `lastName`

### 2) Register it in the funnel loader

Update `src/lib/funnel-loader.ts`:

- `import newConfig from "./funnel-configs/<new-funnel>.json";`
- add mapping:
  - `"<new-funnel>": newConfig as FormConfig`

### 3) Decide where it redirects after submission

Pick one:

- **Single adwall**: set `finalStep.redirectTo` to `/adwall/<routePrefix>/one`
- **Branch to different adwalls**: add `redirectOnAnswer` to a field (typically a radio) to send users to:
  - `/adwall/<routePrefix>/one|two|three` etc.

### 4) Link to it

External traffic should enter via:

- **`/form?funnel=<new-funnel>`**

Optional tracking params supported/preserved across funnel → adwall:

- `s1` (affiliate id)
- `s2` or `sub5` (transaction id)

---

## Adwalls: how they work

### Concept

An “adwall” is a **JSON-defined list of offer cards** rendered at:

- **`/adwall/<routePrefix>/<type>`**

Examples:

- Credit cards: `/adwall/cc/one` (and `/two`, `/three`)
- Mortgage: `/adwall/mortgage/one`

### Source of truth

- **Type shape**: `src/types/adwall.ts` (`AdwallConfig`, `AdwallCard`)
- **Configs**: `src/lib/adwall-configs/*.json`
- **Registry**: `src/lib/adwall-loader.ts`
- **Page**: `src/app/adwall/[funnel]/[type]/page.tsx`
- **Template/UI**: `src/templates/AdsWallTemplate.tsx`, `src/organisms/AdsWallCards.tsx`

### Personalization on adwall

`AdsWallTemplate` reads URL query params:

- `name`
- `zip`
- `s1` (affiliate id)
- `s2` (transaction id)

Adwall `title` and `subtitle` support simple interpolation:

- **`{NAME}`** is replaced by `name` query param (uppercase placeholder)
- **`{zip}`** is replaced by `zip` query param (lowercase placeholder)

Example from `src/lib/adwall-configs/mortgage-one.json`:

- Title: `{NAME}, we found lender matches for you in {zip}.`

### Tracking behavior (IDs across funnel → adwall → offer click)

There are three “hops” to understand:

1) **Incoming traffic to the funnel**

- The funnel page accepts `s1`, `s2`, and `sub5`.
- If `s1`/`s2` are missing, the app generates random IDs.

2) **Funnel → Adwall redirect**

In `src/components/FormSection.tsx`, after the loader completes:

- It appends query params to the destination URL:
  - `s1` (affiliate id)
  - `s2` (transaction id)
  - `name` (firstName, if present in form data)
  - `zip` (zipCode, if present in form data)

3) **Adwall → Offer click**

In `src/organisms/AdsWallCards.tsx`, when a card CTA is clicked:

- It appends:
  - `s1=<affiliateId>`
  - `sub5=<transactionId>`

So: the adwall URL uses `s2`, but outbound offer clicks use `sub5` as the transaction id parameter (this matches common affiliate network expectations).

### `trackingParams` in adwall configs

Adwall configs can optionally define which params to look at:

- `trackingParams.affiliateIdParam` (default read is `s1`)
- `trackingParams.transactionIdParam` (default read is `s2`)

However, the current implementation prefers canonical `s1`/`s2` first, then falls back to the configured names for legacy links.

### Impression tracking (per-card scripts)

Each `AdwallCard` may include an `impressionScript` string (raw vendor snippet containing one or more `<script>` tags).

How it fires:

- `src/components/ImpressionOnView.tsx` wraps each card and uses `IntersectionObserver`.
- When the card becomes visible, it calls `injectImpressionScript(snippet)`.
- It dedupes firing per card using `dedupeKey` (so route transitions/remounts don’t double-fire).

How injection works (safe-ish execution order):

- `src/lib/injectImpressionScript.ts` parses `<script>` tags.
- Loads external scripts (by `src`) first (deduped per URL).
- Optionally waits for Everflow’s `EF.impression` global to exist.
- Then executes inline scripts.

---

## How to create a new Adwall (based on a funnel)

### 0) Decide the route prefix and adwall type

The adwall route is:

- **`/adwall/<routePrefix>/<type>`**

Route prefix rule:

- If your funnel id starts with `cc-`, the route prefix is **`cc`**
- Otherwise route prefix is the same as the funnel id

Adwall type is typically `"one"` (some flows also use `"two"` / `"three"` / custom like `"finbuzz"`).

### 1) Add an adwall config JSON

- Create: `src/lib/adwall-configs/<routePrefix>-<type>.json`
- Follow `AdwallConfig` from `src/types/adwall.ts`.

Minimal fields:

- `id`: usually `<routePrefix>-<type>` (or similar)
- `funnelId`: used for navbar fallback and “belongs to funnel” semantics
- `adwallType`: typically `one|two|three` (must match URL segment)
- `title`, `subtitle`, `updatedAt`
- `cards[]`

Notes:

- `buttonLink` should ideally be an **absolute** URL (the card click handler uses `new URL()` first).
- If you need impressions, add `impressionScript` to the card.
- If you want custom navbar copy/phone, set `config.navbar` (otherwise it falls back to the funnel’s `navbar`).

### 2) Register it in the adwall loader

Update `src/lib/adwall-loader.ts`:

- Import the JSON
- Add it to the `adwallConfigs` object with key:
  - `"<routePrefix>-<type>": config`

Examples of keys used today:

- `cc-one`, `cc-two`, `cc-three` (routePrefix `cc`, types `one|two|three`)
- `mortgage-one`, `mortgage-two`, `mortgage-three`
- `tubs-one`

### 3) Point the funnel to it

Choose one:

- Set funnel’s `finalStep.redirectTo` to the adwall route, e.g.:
  - `/adwall/mortgage/one`
- Or set `redirectOnAnswer` rules on a field to branch to different adwall types, e.g.:
  - `/adwall/cc/one`, `/adwall/cc/two`, `/adwall/cc/three`

### 4) Test locally

- Visit the adwall directly:
  - `/adwall/<routePrefix>/<type>`
- Then complete the funnel and verify the redirect:
  - `/form?funnel=<funnelId>`

---

## API + DB: storing user information

### What we store

The `users` table is defined in `src/lib/db/schema.ts`:

- `id`: UUID primary key (default random)
- `email`: varchar(255)
- `phone`: varchar(20)
- `firstName`, `lastName`: varchar(255)
- `createdAt`, `updatedAt`: timestamps (default now)

### DB connection + ORM

- **ORM**: Drizzle
- **Driver**: `pg` (node-postgres)
- Connection is created in `src/lib/db/index.ts` using:
  - `process.env.DATABASE_URL`
  - SSL enabled with `rejectUnauthorized: false` (common for hosted Postgres)

### API endpoints

Implemented as Next.js route handlers:

- `POST /api/users`
  - Body: `{ email?, phone?, firstName?, lastName? }`
  - Creates and returns the inserted row
- `GET /api/users`
  - Returns all rows

Where it’s called:

- `src/components/FormSection.tsx` calls `POST /api/users` on final submit.

### Drizzle migrations / DB tooling

Config:

- `drizzle.config.ts` points to:
  - schema: `./src/lib/db/schema.ts`
  - output: `./drizzle`
  - dialect: `postgresql`
  - credentials: `DATABASE_URL`

Scripts (see `package.json`):

- `npm run db:generate`
- `npm run db:migrate` (and `db:migrate:dev`, `db:migrate:prod`)
- `npm run db:studio` (and `db:studio:dev`, `db:studio:prod`)

---

## Common gotchas / notes for the next dev

- **`/` redirects to an adwall**: funnel landing is not currently used at root.
- **`src/lib/api.ts`** contains a `submitFormData()` helper pointing at `/api/submit-form`, but **that route does not exist** in this repo right now. The live form submission path is `/api/users` from `FormSection`.
- **Adwall key naming**: the loader keys are `<routePrefix>-<type>`, but credit cards use routePrefix `cc`, not `cc-one`/`cc-two` as a prefix. So:
  - URL `/adwall/cc/one` → loader key `cc-one`
- **Tracking mismatch is intentional**:
  - adwall URL uses `s2`
  - outbound offer click uses `sub5`
- **Impression snippets execute as raw JS**: treat adwall JSON as “code execution surface”. Only accept snippets from trusted sources.

---

## Handover checklist (what to give the next dev)

- **Env values**:
  - `.env.dev` / `.env.prod` contents (at minimum `DATABASE_URL`)
- **DB access**:
  - Postgres host/credentials, allowlisted IPs, whether SSL is required
- **Affiliate/tracking expectations**:
  - Meaning of `s1`, `s2`, `sub5`
  - Which networks/snippets are in use (e.g., Everflow impression snippets)
- **Deploy details**:
  - Hosting provider (Vercel/other), domains, any edge config
- **Product defaults**:
  - Confirm whether `/` should remain an adwall redirect or become a funnel entry

