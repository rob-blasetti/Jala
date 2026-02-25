# Jala

Jala is a lightweight community app that helps Feast committees connect with local musicians for gatherings.

## MVP Scope

- Musician sign-up (name, community, instrument/voice, contact, availability)
- Feast request intake (committee, date, music needs, notes)
- Musician-facing request board
- Committee review and acceptance flow
- Local persistence via browser storage (so entered data survives refresh)

## Tech Stack

- React + Vite
- `liquid-spirit-styleguide` UI primitives

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Current MVP Improvements

- Added inline form validation for signup/request forms
- Added success feedback banners after key actions
- Added community-aware musician suggestions for requests
- Added request filtering by community on musician request view
- Added persisted local state for musicians, requests, and accepted matches
- Added musician contact visibility in committee review after acceptance
