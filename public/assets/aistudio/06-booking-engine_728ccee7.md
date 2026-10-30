# 06: Booking Engine

**Goal:** A correct, concurrency-safe booking lifecycle. This is the heart of the product; invest the most testing here.

---

## State machine (use this as the source of truth)

```
Requested --(agent accepts)--> Accepted --(client pays)--> Confirmed --(agent starts)--> InProgress
   |  \                          |                           |                               |
   |   (agent declines)->Declined|(client/agent cancels)     |(cancel w/ policy)             |(agent completes)
   |   (no response 12h)->Expired|-> Cancelled               |-> Cancelled                   v
   |                                                                                     Completed --(client confirms or 24h auto)--> Closed
   +--(client cancels)--> Cancelled                                  Any state after Confirmed --(dispute)--> Disputed --> Resolved
```

---

## Prompt 6.1: Booking aggregate and state machine

```text
Implement the Booking aggregate in Bookings.Domain as a strict state machine.
- Allowed transitions only as drawn above; illegal transitions return Result.Failure(Error "booking.invalid_transition").
- Methods: Request, Accept, Decline, Expire, MarkPaid, Start, Complete, ConfirmCompletion,
  Cancel(by, reason), OpenDispute.
- Every transition appends to BookingStatusHistory and raises a domain event
  (BookingRequested, BookingAccepted, BookingConfirmed, BookingStarted, BookingCompleted, BookingCancelled, ...).
- Price snapshot value object: rate, hours (or fixed), subtotal, platformFee (configurable %, default 10%),
  total. Calculated in a pure `PricingService` with unit tests (rounding rules, min hours, fixed price).
- Cancellation policy as a pure function: free if > 24h before start; 50% fee 2-24h; 100% if < 2h
  (policy values configurable). Returns refund amounts for client and compensation for agent.
Write exhaustive unit tests including a table-driven test of every state x action pair.
```

---

## Prompt 6.2: Booking application layer and API

```text
Implement commands/queries and endpoints:

Client:
- POST /api/v1/bookings {agentServiceId, start, durationHours, addressId or address, notes}  (Idempotency-Key required)
- GET /api/v1/bookings?status=&page= , GET /api/v1/bookings/{id}
- POST /api/v1/bookings/{id}/cancel {reason}
- POST /api/v1/bookings/{id}/confirm-completion
Agent:
- GET /api/v1/agents/me/bookings?status=
- POST /api/v1/bookings/{id}/accept | /decline {reason} | /start | /complete {notes}

Business rules:
- Slot validation: inside agent availability, not overlapping other Accepted/Confirmed/InProgress bookings
  (use a PostgreSQL exclusion constraint with tstzrange plus a row lock to prevent double-booking under concurrency).
- Agent must be Verified/listable, and the address must be within the agent's service radius.
- Client cannot have > 3 simultaneous Requested bookings (anti-spam).
- Requested bookings auto-expire after 12h via a Hangfire scheduled job (scheduled on creation, cancelled on response).
- Auto-close Completed bookings 24h after completion if the client has not disputed.
- Optimistic concurrency conflict returns 409 with code "booking.concurrency_conflict".
- Idempotent creation: same key returns the same booking.

Write an integration test that fires 20 parallel requests for the same slot and asserts exactly one succeeds.
```

---

## Prompt 6.3: Booking jobs and timeline

```text
- Reminder jobs: 24h and 1h before start (emit BookingReminderDue events).
- No-show handling: if the agent has not started within 30 minutes of the scheduled start,
  notify both parties; after 60 minutes allow the client to cancel with a full refund and flag the agent.
- GET /api/v1/bookings/{id}/timeline returns status history in human-readable form.
- Add a calendar export: GET /api/v1/bookings/{id}/ics and an agent iCal feed with a secret token.
```

**Acceptance criteria**
- No illegal transitions possible (property-based test with FsCheck/CsCheck)
- Concurrency test passes consistently (run 50 times)
- Every transition recorded in history with actor and reason
