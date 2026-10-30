# 08: Reviews and Reputation

**Goal:** Trustworthy, hard-to-game ratings and the metrics shown on agent profiles (rating, completion rate, response rate).

---

## Prompt 8.1: Reviews

```text
Implement the Reviews module:
- POST /api/v1/bookings/{id}/review {rating 1-5, comment (max 1000), tags[] e.g. "Punctual","Friendly","Great value"}
  Allowed only for the client of a Completed/Closed booking, once, within 14 days.
- POST /api/v1/reviews/{id}/reply (agent public reply, once, max 500 chars)
- GET /api/v1/agents/{id}/reviews?page=&sort=recent|highest|lowest
- POST /api/v1/reviews/{id}/report (flag for moderation)
- Reviews are tied to a real, paid booking (no unverified reviews). Show "Verified booking" label.
- Admin can hide a review (IsHidden) with a reason; hidden reviews are excluded from metrics.
- Profanity/PII filter hook; reviews cannot contain phone numbers or links.
Emit ReviewSubmitted to trigger reputation recomputation and an agent notification.
```

---

## Prompt 8.2: Reputation metrics

```text
Create a Reputation domain service plus a handler that updates AgentProfile cached metrics on events
(BookingClosed, BookingCancelled, ReviewSubmitted, ReviewHidden) with a nightly reconciliation job that
recomputes from source of truth.

Definitions (document in /docs/reputation.md):
- Rating: arithmetic mean of visible reviews (displayed) and Bayesian average (used for ranking).
- Completion rate = completed bookings / (completed + agent-cancelled + agent no-shows) over the last 90 days;
  exclude client-caused cancellations and declined requests. Show "New" until >= 5 bookings.
- Response rate = requests responded to within 12h / total requests, last 90 days.
- On-time rate = jobs started within 10 minutes of schedule / jobs started.
- Badges: "Top Rated" (>= 4.8 with >= 20 reviews and completion >= 95%), "Rising Talent" (new, >= 4.9 with >= 5 reviews),
  "Fast Responder" (response >= 95% and median < 30 min).
- Penalties: 2 no-shows in 30 days triggers a warning; 3 triggers temporary delisting pending admin review.
Write pure functions with table-driven unit tests for each metric and badge.
```

---

## Prompt 8.3: Anti-abuse

```text
Add safeguards: detect review bursts (> 5 reviews on one agent in 24h), same-device/IP reviewer clusters,
reviews from clients with reciprocal-only history, and sudden rating swings. Flag to an admin queue
(file 13); do not auto-delete. Provide a ReviewIntegrityScore on each review (admin only).
```

**Acceptance criteria**
- A user cannot review the same booking twice or review without a completed booking
- Hiding a review updates the agent's rating within seconds
- Metrics match source-of-truth recomputation (reconciliation test)
