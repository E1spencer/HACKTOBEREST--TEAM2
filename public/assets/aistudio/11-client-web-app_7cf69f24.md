# 11: Client Web App

**Goal:** A fast, mobile-first Next.js app where clients discover agents, use the AI assistant, book, pay, chat, and review.

---

## Prompt 11.1: Frontend foundation

```text
Create the Next.js 14 (App Router, TypeScript strict) frontend in /apps/web.
- Tailwind + a small design-system layer (Button, Input, Select, Card, Badge, Modal, Toast, Skeleton, Avatar, RatingStars, EmptyState)
  using shadcn/ui primitives; light/dark themes; accessible (WCAG 2.1 AA) with visible focus and aria labels.
- Typed API client generated from the backend OpenAPI (openapi-typescript + a thin fetch wrapper) with automatic token
  refresh, ProblemDetails -> typed errors, and request correlation id.
- Auth: httpOnly secure cookies via Next route handlers acting as a BFF (no tokens in localStorage), middleware guarding
  protected routes, role-based redirects.
- State: TanStack Query for server state; Zustand only for small UI state. Forms: React Hook Form + Zod.
- PWA: manifest, service worker (offline shell + cached static assets), install prompt, Web Push subscription.
- i18n-ready (next-intl) and currency/date formatting helpers (Intl, user time zone).
- Env handling, error boundaries, 404/500 pages, Sentry/App Insights browser SDK, Lighthouse CI budget (perf >= 90 on mobile).
Output the folder structure first, then code.
```

---

## Prompt 11.2: Discovery and AI assistant UI

```text
Build these screens:
1. Home: hero with ONE prominent "What do you need help with?" input (AI assistant), popular categories grid,
   how-it-works, top-rated agents carousel.
2. AI assistant panel/page:
   - Chat-like input with example prompts; streaming status ("Understanding your request..." -> "Finding agents...")
     using the SSE endpoint.
   - Shows "interpreted request" chips (service, time, budget, area) that the user can edit and re-run.
   - Clarifying question rendered as quick-reply buttons.
   - Results as AgentCards with a "Why this match" list; buttons: View profile, Book. Clear label: "AI-suggested, you choose."
   - Handles degraded mode and errors gracefully; thumbs up/down feedback per result set.
3. Browse/search page: category filter, filters drawer (price, rating, distance, verified, availability, language),
   sort, infinite scroll, map/list toggle (MapLibre or Azure Maps), URL-synced filter state, skeletons.
4. Agent profile page: photo, badges, rating + distribution, completion/response rate, price per hour, services,
   availability calendar, reviews with pagination, "Book now" sticky bar on mobile, JSON-LD for SEO, OG tags.
Use server components for SEO pages (home, category, profile) and client components for interactive parts.
```

---

## Prompt 11.3: Booking, payment and post-booking UI

```text
Build:
- Booking wizard: service -> date/time (slots from API) -> address (saved or new with map pin) -> notes -> price breakdown
  (rate x hours, fee, total, cancellation policy summary) -> submit; prefilled when coming from the AI flow.
- Booking status page with a live timeline (SignalR), pay button when Accepted (redirect to gateway, then return page that polls),
  cancel flow with policy preview, confirm completion, open dispute form.
- My Bookings (tabs: Upcoming, Past, Cancelled), booking detail, receipt download.
- Chat UI per booking (message list, typing, unread badges, image attach, off-platform warning banner).
- Review form (stars, tags, comment) and edit window.
- Account: profile, saved addresses, notification preferences, data export/delete.
- Notification bell dropdown + full notifications page.
Handle loading, empty, and error states for every screen. Add Playwright tests for the golden path:
search -> book -> (agent accepts via API helper) -> pay (fake gateway) -> complete -> review.
```

**Acceptance criteria**
- Lighthouse mobile performance ≥ 90 and accessibility ≥ 95 on home and profile
- Whole booking flow completes on a 360px-wide viewport
- No tokens visible in browser storage
