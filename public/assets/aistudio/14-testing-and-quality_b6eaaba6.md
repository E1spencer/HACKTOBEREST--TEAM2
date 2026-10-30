# 14: Testing and Quality

**Goal:** Confidence to ship weekly. Test pyramid with extra depth on money, bookings, and AI.

---

## Prompt 14.1: Test strategy

```text
Write /docs/testing-strategy.md and implement the scaffolding:
- Unit tests (xUnit, FluentAssertions, NSubstitute): domain, pricing, availability, reputation, state machine. Target >= 80% on Domain/Application.
- Property-based tests (CsCheck or FsCheck): booking transitions, money rounding, ledger balance, slot overlap.
- Integration tests (WebApplicationFactory + Testcontainers PostgreSQL/PostGIS + Azurite): every endpoint happy path, authz failures,
  validation failures, concurrency. Use Respawn to reset DB between tests; builders/object mothers for test data.
- Contract tests: OpenAPI snapshot test fails on unintentional breaking API change (Verify or oasdiff in CI).
- Architecture tests (from file 01) in CI.
- E2E (Playwright): critical journeys on Chromium + mobile WebKit emulation.
- AI evaluation suite (file 07) nightly.
- Load tests (k6): search (200 rps), booking creation (30 rps with slot contention), SignalR 2,000 concurrent connections.
  Document SLOs: API p95 < 300 ms (excluding AI), AI match p95 < 6 s, error rate < 0.5%.
- Mutation testing (Stryker.NET) on Pricing and Reputation weekly.
Provide a coverage report published in CI and a PR template with a test checklist.
```

---

## Prompt 14.2: Critical scenario matrix

```text
Generate a table-driven checklist and automated tests for these scenarios:
1. Two clients book the same slot simultaneously -> exactly one wins.
2. Agent accepts after expiry job ran -> rejected cleanly.
3. Payment webhook arrives before the client's redirect return; duplicate; out of order.
4. Client cancels at each cancellation-policy boundary (24h, 2h) -> correct refund.
5. Agent no-show flow -> client full refund, agent penalty.
6. Dispute opened during auto-close window -> release blocked.
7. Review attempt by non-participant / twice / after window -> rejected.
8. Refresh token reuse -> family revoked.
9. AI prompt injection -> ignored; LLM outage -> degraded search.
10. User deletion with active booking -> blocked; after completion -> anonymized.
11. Time-zone/DST boundary booking (agent and client in different zones).
12. Search with zero results is logged and the UI shows helpful suggestions.
Each scenario: test name, setup, action, expected result, and the layer where it is tested.
```

---

## Prompt 14.3: Quality gates

```text
Configure quality gates in CI: build with warnings-as-errors, formatting (dotnet format, ESLint, Prettier),
SAST (CodeQL), dependency scan (Dependabot + `dotnet list package --vulnerable`, npm audit),
secret scanning (gitleaks), container scan (Trivy), license check, and a PR size warning.
Branch protection: required checks, 1 review, linear history. Conventional Commits + automated changelog.
```
