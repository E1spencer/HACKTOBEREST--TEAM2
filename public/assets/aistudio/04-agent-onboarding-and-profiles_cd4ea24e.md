# 04: Agent Onboarding and Profiles

**Goal:** Agents can build trustworthy profiles, list services, set availability, and get verified.

---

## Prompt 4.1: Agent profile management

```text
Implement the Agents module endpoints:

- GET/PUT /api/v1/agents/me/profile (bio max 800 chars, years of experience, languages, service
  radius km, base location with address geocoding via an IGeocoder abstraction, availability toggle)
- POST /api/v1/agents/me/photo (reuse image pipeline)
- GET /api/v1/agents/{id} (PUBLIC profile) returning: photo, display name, bio, verification badge,
  rating, review count, completion rate, response rate, member since, jobs completed, languages,
  services with prices, top 5 recent reviews, and next available slots. NEVER return phone, email, or exact address.
- A profile completeness score (0-100) with a checklist of missing items, returned from /agents/me/profile

Domain rules:
- An agent cannot be listed in search until: profile ≥ 70% complete, at least one active service,
  verification Pending or Verified, and availability rules set.
- Cached metrics fields are only written by the Reputation job/handlers (see file 08), never by the API.
```

---

## Prompt 4.2: Services offered by an agent

```text
Implement /api/v1/agents/me/services CRUD for AgentService:
- Choose a leaf category, title, description, pricing type (Hourly or Fixed), price in minor units,
  min hours, optional "what's included" bullet list.
- Limits: max 10 active services per agent; price within configurable sane bounds per category
  (e.g. cleaning 1,000-50,000 per hour in local currency) to prevent typos and spam.
- Changing a price does NOT affect existing bookings (price is snapshotted at booking).
- Validation: profanity filter hook, no phone numbers or links in title/description (basic regex)
  to prevent off-platform leakage.
```

---

## Prompt 4.3: Availability

```text
Implement availability:
- Weekly recurring rules (AgentAvailabilityRule) and one-off time off (AgentTimeOff).
- POST/PUT/DELETE /api/v1/agents/me/availability; GET /api/v1/agents/{id}/availability?from=&to=
  returning free slots in 30-minute granularity in the agent's time zone (store agent time zone IANA id).
- Slot calculation = weekly rules - time off - confirmed/in-progress bookings - buffer (configurable travel buffer, default 30 min).
- Write a pure, heavily unit-tested domain service `AvailabilityCalculator` (DST edge cases, overnight shifts, overlapping rules).
```

---

## Prompt 4.4: Verification workflow

```text
Implement agent verification:
- POST /api/v1/agents/me/documents (government ID, selfie, optional certificates such as teaching credentials).
  Files go to a PRIVATE blob container; access only via short-lived SAS URLs issued to admins.
- State machine: Unverified -> Pending -> Verified | Rejected (with reason; agent may resubmit).
- Emit AgentVerificationSubmitted / AgentVerified / AgentRejected events (notifications in file 10).
- Admin endpoints (file 13 consumes these): GET /api/v1/admin/verifications?status=pending,
  POST /api/v1/admin/verifications/{id}/approve|reject.
- Pluggable IIdentityVerificationProvider interface (manual review for MVP; stub for a KYC vendor later).
- Badges: "ID Verified", "Background Checked" (future), "Top Rated" (derived, see file 08).
```

**Acceptance criteria**
- Unverified or incomplete agents never appear in public search
- Availability calculator passes DST and overlap tests
- Public profile response contains no PII (asserted in a test)
