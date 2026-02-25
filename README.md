# Jala

Jala is a lightweight community app that helps Feast committees connect with local musicians for gatherings.

## MVP Scope

- Musician sign-up (name, community, instrument/voice, contact, availability)
- Feast request intake (committee, date, music needs, notes)
- Musician-facing request board
- Committee review and acceptance flow
- Google Sheets-backed storage via Vercel serverless functions

## Tech Stack

- React + Vite
- Vercel serverless API routes (`/api/*`)
- Google Sheets as storage
- `liquid-spirit-styleguide` UI primitives

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Google Sheets Setup (MVP Database)

Create one Google Sheet with these tab names and exact headers in row 1:

### `musicians`
`id | name | community | instrument | contact | available | performances | createdAt`

### `requests`
`id | committee | community | date | needs | notes | status | createdAt | updatedAt`

### `responses`
`id | requestId | musicianId | message | status | createdAt`

### `matches`
`id | requestId | musicianId | updatedAt`

## Required Environment Variables (Vercel)

Set these in **Project → Settings → Environment Variables**:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (include escaped newlines: `\n`)
- `GOOGLE_SHEETS_ID`

Also share the sheet with the service account email (Editor permission).

## API Endpoints (CRUD)

- `GET|POST|PATCH|DELETE /api/musicians`
- `GET|POST|PATCH|DELETE /api/requests`
- `GET|POST|PATCH|DELETE /api/responses`
- `GET|POST|PATCH|DELETE /api/matches`

`PATCH`/`DELETE` require `id`.

## Notes

- If sheet env vars are missing, frontend falls back to sample data and shows a warning.
- You can keep this as lightweight MVP storage, then move to Supabase/Postgres later with minimal UI changes.
