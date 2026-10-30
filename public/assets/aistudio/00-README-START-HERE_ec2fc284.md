# Marketplace MVP: Prompt Library

A build-ordered set of prompts for delivering a **Client ↔ Agent services marketplace** (tutoring, errands, laundry, cleaning, etc.) with an **AI service-matching assistant**.

Written from the perspective of a senior engineer (20+ yrs, Microsoft stack). Opinionated defaults are stated up front. Change them in this file and the rest stays consistent.

---

## 1. How to use these files

1. Start every new AI session by pasting the **Master Context Block** (section 3) first.
2. Then paste **one prompt at a time** from the numbered files, in order.
3. After each prompt: run the code, run the tests, commit. Only then move on.
4. Each prompt has **Acceptance Criteria**. Do not proceed until they pass.
5. If the AI drifts from the architecture, paste the "Guardrails" (section 4) again.

## 2. File index (build order)

| # | File | Outcome |
|---|------|---------|
| 01 | `01-architecture-and-scaffold.md` | Solution structure, conventions, cross-cutting concerns |
| 02 | `02-data-model-and-database.md` | Schema, EF Core mappings, migrations, seed data |
| 03 | `03-auth-and-user-management.md` | Registration, login, roles, JWT, profiles |
| 04 | `04-agent-onboarding-and-profiles.md` | Agent profiles, services offered, availability, verification |
| 05 | `05-catalog-search-and-discovery.md` | Categories, agent search, filters, ranking |
| 06 | `06-booking-engine.md` | Booking lifecycle state machine, pricing, conflicts |
| 07 | `07-ai-service-matching.md` | AI assistant: natural language → ranked agents |
| 08 | `08-reviews-and-reputation.md` | Ratings, completion rate, reputation score |
| 09 | `09-payments-and-payouts.md` | Payment hold/release, commission, payouts |
| 10 | `10-notifications-and-chat.md` | Email/push/in-app notifications, real-time chat |
| 11 | `11-client-web-app.md` | Client-facing frontend |
| 12 | `12-agent-portal.md` | Agent-facing frontend |
| 13 | `13-admin-and-trust-safety.md` | Admin dashboard, disputes, moderation |
| 14 | `14-testing-and-quality.md` | Unit/integration/E2E/AI evaluation |
| 15 | `15-devops-and-deployment.md` | CI/CD, Azure infra, observability |
| 16 | `16-security-and-privacy.md` | Threat model, hardening, data protection |
| 17 | `17-launch-and-roadmap.md` | Launch checklist, analytics, post-MVP roadmap |

## 3. Master Context Block (paste at the start of every session)

```text
You are a senior software engineer (20+ years, Microsoft ecosystem) helping me build
the MVP of {{PROJECT_NAME}}, a two-sided marketplace.

PRODUCT
- Clients book services from Agents (home tutoring, errands, laundry, cleaning, and more).
- Clients can browse agent profiles: photo, rating, completion rate, price per hour,
  services offered, reviews, verification status.
- An AI assistant lets a client describe what they need in plain language; the AI
  identifies the service, extracts details (when, where, budget), and returns a ranked
  shortlist of matching agents. The client chooses; the AI never books or pays on its own.

TECH STACK (defaults)
- Backend: ASP.NET Core 8 Web API (C# 12), modular monolith, Clean Architecture, CQRS-lite
  with MediatR, FluentValidation, EF Core 8, PostgreSQL 16 (PostGIS for geo queries).
- Auth: ASP.NET Core Identity + JWT access tokens + rotating refresh tokens.
- Background jobs: Hangfire. Real-time: SignalR. Files: Azure Blob Storage.
- Frontend: Next.js 14 (App Router), TypeScript strict, Tailwind CSS, TanStack Query,
  React Hook Form + Zod. Mobile-first, installable PWA.
- AI: provider-agnostic `ILlmClient` abstraction (Azure OpenAI or Anthropic API), tool/function calling,
  structured JSON outputs.
- Payments: provider-agnostic `IPaymentGateway` (adapter for a regional gateway such as
  Paystack or Flutterwave, or Stripe).
- Hosting: Azure (App Service or Container Apps, Azure Database for PostgreSQL, Blob,
  Key Vault, Application Insights). CI/CD: GitHub Actions.

NON-NEGOTIABLES
- MVP scope only. Do not add features I did not ask for.
- Every endpoint: authenticated unless explicitly public, validated, authorized,
  documented (OpenAPI), and covered by at least one test.
- No secrets in code. Config via environment/Key Vault.
- Small, reviewable commits. Explain design decisions briefly, then show code.
- If requirements are ambiguous, state your assumption and proceed; do not stall.
```

## 4. Guardrails (paste when the AI drifts)

```text
Reminder of constraints: stay within the agreed architecture (modular monolith, Clean
Architecture layers, no cross-module database access, only via module public APIs).
No new libraries without justification. Keep controllers thin. Business rules live in the
Domain/Application layers. All money is stored as integer minor units plus currency code.
All timestamps are UTC (DateTimeOffset). Return RFC 7807 ProblemDetails for errors.
Show only the files that changed, with their full paths.
```

## 5. MVP scope

**In scope**
- Client and agent accounts; agent verification (ID + phone/email)
- Service categories; agents list services with hourly or fixed price
- Agent search/filter/sort and public profiles
- Booking request → accept → pay → perform → complete → review
- AI-powered "describe what you need" matching
- Payments with hold-and-release; platform commission
- In-app chat per booking; email + push notifications
- Admin dashboard: verify agents, handle disputes, view metrics

**Out of scope (post-MVP)**
- Native mobile apps, subscriptions/recurring bookings, multi-currency, agent teams/companies,
  in-app video calls, loyalty/referrals, auto-booking by AI, advanced fraud ML

## 6. Suggested phases (solo or small team)

| Phase | Weeks | Files |
|-------|-------|-------|
| A. Foundation | 1–2 | 01, 02, 03 |
| B. Supply side | 3–4 | 04, 05, 12 (partial) |
| C. Core transaction | 5–7 | 06, 09, 08, 10 |
| D. Intelligence | 8 | 07 |
| E. Experience + Ops | 9–10 | 11, 12, 13 |
| F. Hardening + Launch | 11–12 | 14, 15, 16, 17 |

## 7. Definition of Done (every prompt)

- Compiles with zero warnings (treat warnings as errors)
- Tests added and passing; coverage for new business logic ≥ 80%
- OpenAPI updated; README/ADR updated if a decision was made
- Linting/formatting clean; no TODOs without a ticket reference
- Manually verified through Swagger or the UI
