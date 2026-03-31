# Admin UI Workflow

## Purpose
This document explains how the Sagewise admin UI works end to end so it can be presented clearly to clients, stakeholders, or internal teams.

It covers:
- what the admin system manages
- how authentication and roles work
- how funnels, live adwalls, and demo adwalls are stored
- how draft, preview, publish, version history, rollback, and delete work
- how image uploads and runtime fallbacks work

## What The Admin UI Manages
The admin UI is the internal control panel for configuration-driven experiences.

Today it manages 3 main content types:
- `Funnels`: multi-step form experiences
- `Live adwalls`: production publisher-card landing pages
- `Demo adwalls`: editable demo versions of adwalls used for previews, sales demos, and safe testing

Conceptually:
- a funnel captures user input
- an adwall presents offer cards
- the admin UI lets non-developers update these experiences without editing code directly

## Admin UX Overview
The admin workflow is intentionally built around a draft-first publishing model.

Typical flow:
1. Sign into `/admin`
2. Open `Funnels` or `Adwalls`
3. Search for an existing config or create a new one
4. Edit in the form-based editor or JSON editor
5. Preview the runtime result
6. Save draft changes
7. Publish when ready
8. Review version history or roll back if needed

For adwalls specifically:
- the `Live` tab manages production adwalls
- the `Demo` tab manages demo adwalls
- both support create, edit, preview, publish, version history, and rollback

## Authentication And Access Control
Admin access is email/password based and backed by Postgres.

### How login works
- The login form posts to `/api/admin/auth/login`
- The server verifies the email/password against `admin_users`
- On success, the server creates a hashed session token in `admin_sessions`
- A secure HTTP-only cookie is set: `sw_admin_session`

### Session behavior
- Sessions last 14 days
- Protected pages read the current admin user from the cookie
- Protected API routes also validate the session before performing work

### Roles
Current role hierarchy:
- `viewer`
- `client_editor`
- `internal_admin`
- `superadmin`

Permissions are cumulative.

In practice:
- `viewer`: can access the admin UI and inspect configs
- `client_editor`: can edit drafts and publish
- `internal_admin`: can edit script fields, roll back, and delete configs
- `superadmin`: full access

Important detail:
- script-related fields are guarded more tightly than normal content fields
- only `internal_admin` and `superadmin` can fully edit script fields

## Core Data Model
The admin system stores configs in Postgres using a generic config model.

### Main tables

#### `admin_users`
Stores admin accounts.

Key fields:
- `id`
- `email`
- `password_hash`
- `role`
- timestamps

#### `admin_sessions`
Stores hashed login sessions.

Key fields:
- `user_id`
- `token_hash`
- `expires_at`

#### `admin_login_attempts`
Stores failed login attempts for rate limiting and protection.

Key fields:
- `email`
- `ip`
- `created_at`

#### `configs`
This is the main content table.

Key fields:
- `kind`
- `key`
- `draft`
- `published`
- `version`
- `published_at`
- `updated_by`

This table stores all editable configuration types in one place.

Currently supported `kind` values:
- `funnel`
- `adwall`
- `demo-adwall`

### How keys work
- Funnel key: `mortgage`
- Live adwall key: `mortgage/heloc`, `cc/one`, `cc/finbuzz`
- Demo adwall key: same key shape as live adwalls, but stored under `kind = "demo-adwall"`

#### `config_versions`
Stores version history snapshots for publish and rollback events.

Key fields:
- `config_id`
- `kind`
- `key`
- `version`
- `action`
- `data`
- `created_by`

Actions currently recorded:
- `publish`
- `rollback`

## Draft, Published, And Versioning Model
Every editable config has two main states:
- `draft`
- `published`

### Draft
Draft is the working copy.

When editors save changes:
- the updated config is written into `configs.draft`
- the published version does not change yet

### Published
Published is what the runtime serves to real users.

When editors publish:
- the current draft is copied into `configs.published`
- the config version number increments
- a snapshot is written into `config_versions`

### Version history
Version history is built from published and rollback events.

This means:
- simple draft saves do not create a version
- publishing creates a new version
- rollback creates a new version that contains old data

### Rollback behavior
Rollback does not erase history.

Instead, rollback means:
- choose an older version, for example `v3`
- the system copies `v3` into the current `draft`
- the system also copies `v3` into the current `published`
- the system creates a new latest version entry, for example `v8`, with action `rollback`

This is standard audit-friendly behavior because history remains intact.

## Funnel Workflow
Funnels are managed under `/admin/funnels`.

### Funnel list page
The funnels screen provides:
- a create/open input for a funnel key
- a list of saved funnel configs
- version and published timestamps

### Funnel editor
Funnel configs open in the shared editor shell.

The editor supports:
- draft vs published view
- JSON editing
- preview/live links
- save draft
- publish
- version history
- rollback
- delete, if the role allows it

## Adwall Workflow
Adwalls are managed under `/admin/adwalls`.

### Adwall list page
The adwall screen is split into 2 tabs:
- `Live`
- `Demo`

The page supports:
- search
- create new adwall from the `+` modal
- open an existing adwall editor
- preview links from the list

### Live adwalls
These are production adwalls stored under `kind = "adwall"`.

Runtime path:
- `/adwall/{routePrefix}/{type}`

Examples:
- `/adwall/cc/one`
- `/adwall/mortgage/heloc`

### Demo adwalls
These are editable demo adwalls stored under `kind = "demo-adwall"`.

Runtime path:
- `/adwall/demo/{routePrefix}/{type}`

Examples:
- `/adwall/demo/mortgage/heloc`

The demo workflow now mirrors live adwalls:
- create
- edit
- preview
- publish
- version history
- rollback

### Live vs demo storage
Both use the same editor and the same adwall schema.

The only difference is the `kind`:
- live: `adwall`
- demo: `demo-adwall`

This keeps production and demo content safely separated in the database.

## Adwall Editor Experience
The adwall editor uses a shared shell component with adwall-specific form sections.

### Main editor capabilities
- top-level header with back button
- preview link
- live link
- draft/published mode switch
- form mode
- advanced JSON mode
- versions mode

### Adwall form layout
The adwall form is split into:
- `Basic`
- `Publishers`

#### Basic
Top-level config fields such as:
- id
- funnel id
- adwall type
- updated date
- page title and subtitle
- SEO metadata
- navbar content
- tracking params
- disclaimers

#### Publishers
Per-card content such as:
- heading
- description
- features
- CTA link
- CTA text
- logo
- logo text
- credit card image
- badge text
- advertiser name
- phone number
- bottom callout HTML
- impression script

### Current adwall UI defaults
- badge icon is no longer user-editable in admin
- badge icon defaults to `card`
- `logoText` is shown in admin
- `logoSubtext` is still supported by data/schema, but hidden from the admin form because current JSON usage primarily relies on `logoText`

## Tracking Parameters
The admin system supports tracking parameter management for adwalls.

### Adwall-level tracking params
Each adwall can define:
- `affiliateIdParam`
- `transactionIdParam`
- `sub3`

### Runtime behavior
At runtime:
- `affiliateIdParam` is read from the page URL and mapped to CTA param `sub4`
- `transactionIdParam` is read from the page URL and mapped to CTA param `sub5`
- fixed `sub3` can be configured at the adwall level and applied to every card CTA in that adwall

### Why this matters
This lets the admin UI control tracking behavior without requiring code changes for each partner or campaign.

## Impression Pixels
Each adwall card can carry its own `impressionScript`.

### How impression firing works
- impression scripts are stored as raw snippets on a per-card basis
- cards are wrapped in an `ImpressionOnView` component
- an `IntersectionObserver` fires the impression only when the card enters the viewport
- external vendor libraries are loaded first
- inline impression code is executed afterward

### Current behavior
- impression scripts are deduplicated per card per page view
- the system waits for vendor globals like `EF.impression` before firing inline code

This is important because it keeps measurement accurate while avoiding duplicate loads.

## Image Uploads
Adwall image uploads are handled through Vercel Blob.

### What can be uploaded
Allowed types:
- JPEG
- PNG
- WEBP
- AVIF
- SVG

### Guardrails
- max size: 10 MB
- upload path must start with `adwall/`
- the upload route requires an authenticated admin with edit access

### Why uploads are tied to adwall paths
This keeps uploaded assets organized and prevents arbitrary path writes.

## Runtime Fallback Model
One of the strongest architectural features of the system is its fallback behavior.

### For live adwalls
Runtime lookup order:
1. database `published` config
2. bundled JSON config from the repo

### For demo adwalls
Runtime lookup order:
1. database `published` config with `kind = "demo-adwall"`
2. bundled demo JSON config from the repo

### Why this is useful
It means:
- production pages do not break if the database is unavailable temporarily
- legacy JSON-based experiences remain functional
- the admin system can gradually replace hardcoded JSON management over time

## Preview Behavior
Preview links use the runtime routes with `?preview=1`.

That tells the page to:
- check whether an authenticated admin is present
- if so, render the draft instead of the published version

This allows editors to verify a config before publishing it publicly.

## Delete Behavior
Delete is reserved for higher-permission users.

When delete is used:
- the config row is removed from `configs`
- related version history is removed through cascading deletes

This is intentionally destructive and therefore limited to stronger roles.

## What Happens When A Client Uses The Admin UI
From a client-facing presentation perspective, the simplest explanation is:

1. The client signs into a secure admin area
2. They choose whether to manage forms or offer pages
3. They edit content in a structured interface instead of touching code
4. They can preview changes safely before publishing
5. Publishing promotes the approved draft to the live experience
6. Every publish is versioned, and older versions can be restored when needed

For adwalls specifically:
- production and demo environments are separated
- tracking and partner scripts remain configurable
- offer-card content, logos, badges, legal copy, and CTA behavior can all be managed centrally

## Current Strengths Of The System
- configuration-driven, not hardcoded
- draft/publish workflow is easy to understand
- version history is built in
- rollback exists for recovery
- live and demo adwalls are separated cleanly
- runtime has safe JSON fallback behavior
- auth, role checks, and script restrictions are already in place
- image uploads are controlled and scoped

## Important Implementation Notes
- Rollback creates a new version containing old content; it does not erase history
- Bundled JSON configs still work and remain compatible with the admin-backed system
- Demo adwalls now have near parity with live adwalls in the admin experience
- Some legacy fields remain supported in the schema even if hidden in the form UI

## Suggested Client-Facing Summary
If presenting this to a client, the shortest plain-English summary is:

The Sagewise admin UI is a controlled publishing system for funnels and adwalls. Editors can update content in a form-based interface, preview changes before release, publish approved versions to production, and restore older versions if needed. The system stores content in Postgres, keeps historical versions for safety, supports both production and demo environments, and still falls back to bundled JSON configs if needed for resilience.

