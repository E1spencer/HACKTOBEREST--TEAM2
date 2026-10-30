# 13: Admin and Trust and Safety

**Goal:** Give operators the tools to keep the marketplace safe, resolve problems, and understand the business.

---

## Prompt 13.1: Admin dashboard

```text
Create /apps/web routes under /admin (AdminOnly, MFA required for admin accounts via TOTP).
Sections:
- Overview KPIs: GMV, bookings by status, take rate, active agents/clients, new signups, conversion funnel
  (search -> profile view -> booking request -> paid -> completed), AI match funnel, avg rating, dispute rate.
- Verification queue: view documents via short-lived SAS links, approve/reject with reason templates, SLA timer.
- Users: search/filter, view profile, suspend/reinstate (with reason + audit), impersonate-view (read-only, logged).
- Bookings: search, timeline, force-cancel, refund override (requires reason, creates audit entry).
- Disputes: queue, evidence (messages, timeline, photos), decision actions (full refund, partial, release to agent), templates, SLA.
- Moderation queue: reported reviews, flagged messages (off-platform leakage), suspicious reviews (file 08), reported users.
- Catalog management: categories, keywords/synonyms, price bounds, enable/disable.
- Config: platform fee %, cancellation policy, thresholds (feature flags via a simple table with caching).
- AI insights: unmatched requests, confidence distribution, fallback rate, cost.
- Audit log viewer (immutable, filterable).
Backend: /api/v1/admin/* endpoints with AdminOnly policy, every mutating action writes AuditLog (who, what, before/after, reason, IP).
```

---

## Prompt 13.2: Dispute workflow

```text
Implement the Dispute aggregate and flow:
- Client or agent can open a dispute within 48h of completion (or any time before for no-shows) with category, description, evidence uploads.
- Payment release is frozen; both parties are notified and may add evidence for 48h.
- Admin resolves: ClientRefundFull | ClientRefundPartial(amount) | ReleaseToAgent | Split; the resolution drives Payment/Ledger
  operations (file 09) and agent reputation adjustments (file 08).
- Appeals: one appeal per party, reviewed by a different admin.
- Escalation SLA: auto-reminders to admins at 24h/48h; metrics for time-to-resolution.
Unit-test all resolution outcomes against ledger balance invariants.
```

---

## Prompt 13.3: Safety features

```text
Add: emergency "Report a safety concern" button during active jobs (notifies admin immediately),
in-app SOS contact for agents going to a client's home (share trip details with a trusted contact via link, opt-in),
user blocking (a blocked user cannot request/accept with the other), agent suspension rules (3 verified complaints),
and a safety-tips page shown on first booking for each role. Keep a legal-hold flag preventing deletion of data tied to a safety case.
```

**Acceptance criteria**
- Every admin mutation appears in the audit log
- Dispute resolution never leaves the ledger unbalanced
- Admin without MFA cannot access admin APIs
