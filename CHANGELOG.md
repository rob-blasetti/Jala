# Changelog

All notable changes to this project will be documented in this file.

## [0.10.0] - 2026-02-27

### Added
- Supabase-backed data persistence for musicians, requests, responses, and matches.
- Stripe payment flow with dynamic AUD pricing, platform fee handling, and payment status updates.
- Stripe webhook endpoint for authoritative checkout completion updates.
- Dedicated routes/views for:
  - Home (`/`)
  - Browse musicians (`/browse`)
  - Categories (`/categories`)
  - Community (`/community`)
  - Explainer (`/explainer`)
  - Request flow (`/request`)
- Musician directory improvements:
  - searchable browse page
  - category filtering
  - categorized musician context from API data
- Expanded musician profile model:
  - city
  - country
  - music category
  - bio
  - compensation preference
- New top banner and improved hero actions.

### Changed
- Refactored app state and routing into custom hooks:
  - `useJalaData`
  - `useTabRouter`
- Reworked top navigation for clearer IA and centered/right-aligned layout behavior.
- Updated hero copy and CTA structure.
- Upgraded musician cards to richer profile layout and request interaction pattern.
- Community request flow now follows a Community Contact / Envoy model.

### Fixed
- Navigation route consistency and refresh behavior with Vercel rewrites.
- Payment return handling and request status transitions.
- Various visual alignment and spacing issues across nav, hero, and cards.
