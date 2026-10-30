# 12: Agent Portal

**Goal:** Give agents a simple, mobile-friendly workspace to run their business on the platform.

---

## Prompt 12.1: Onboarding wizard

```text
Build /apps/web routes under /agent with an onboarding wizard (resume-able, progress saved per step):
1. Account & phone OTP verification
2. Profile (photo with crop, bio with character counter and guidance, languages, experience)
3. Services & pricing (category picker, hourly/fixed, price guidance showing the market average from an API)
4. Service area (map with radius circle) & address geocoding
5. Weekly availability grid + time off
6. Identity documents upload (drag/drop, camera capture on mobile, upload progress, preview)
7. Review & submit; show profile completeness meter and "what happens next".
Provide clear status pages for Pending, Rejected (with reason + resubmit) and Verified.
```

---

## Prompt 12.2: Operations dashboard

```text
Build:
- Dashboard: today's jobs, pending requests (with countdown to expiry), earnings this week/month, rating trend,
  completion/response rates, profile completeness nudges.
- Requests inbox: accept/decline with reason presets; show client first name, service, time, approximate area (exact address
  revealed only after payment is Held), price breakdown, and the expected agent payout after fees.
- Jobs: Start job (optional geolocation check-in), Complete job (notes + optional photos), cancellation with policy warning.
- Calendar view (week/day) with bookings + availability + time off, drag to set time off.
- Earnings: balance (pending/available), transactions, payout request, bank account management, statements download.
- Reviews: list, reply, performance tips.
- Service management: add/edit/pause services and prices.
- Real-time: new request toast + sound/vibration, push notification opt-in prompt.
- Support: help center links, report a client, raise a dispute.
Add Playwright tests for onboarding and for accepting + completing a booking.
```

**Acceptance criteria**
- A new agent can go from signup to submitted-for-review in under 10 minutes
- Exact client address is hidden until payment is held
- Dashboard usable on a low-end Android device on a slow network (test with Lighthouse throttling)
