# Jala

Jala is a lightweight community app that helps Feast committees connect with local musicians for gatherings.

## MVP Scope

- Musician sign-up (name, community, instrument/voice, contact, availability)
- Feast request intake (committee, date, music needs, notes)
- Musician-facing request board
- Committee review and acceptance flow
- Supabase-backed storage via Vercel serverless functions

## Tech Stack

- React + Vite
- Vercel serverless API routes (`/api/*`)
- Supabase (Postgres)
- `liquid-spirit-styleguide` UI primitives

## Install

```bash
npm install
npm install supabase --save-dev
npm install @supabase/supabase-js
```

## Run Locally

```bash
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Supabase Setup (MVP Database)

1. In Supabase, open SQL Editor.
2. Run `supabase/schema.sql`.
3. Copy project credentials into Vercel env vars.

## Required Environment Variables (Vercel)

Set these in **Project → Settings → Environment Variables**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Data Models

Schema file: `supabase/schema.sql`

Tables:
- `musicians`
- `requests`
- `responses`
- `matches`

## API Routes + Methods

- `GET|POST|PATCH|DELETE /api/musicians`
- `GET|POST|PATCH|DELETE /api/requests`
- `GET|POST|PATCH|DELETE /api/responses`
- `GET|POST|PATCH|DELETE /api/matches`

`PATCH`/`DELETE` require `id`.

## Notes

- API normalizes Supabase snake_case into the existing frontend camelCase fields.
- If Supabase env vars are missing, frontend falls back to sample data and shows a warning.
