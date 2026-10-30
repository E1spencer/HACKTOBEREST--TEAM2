# 09: Payments and Payouts

**Goal:** Keep money flowing through the platform safely: client pays after the agent accepts, funds are held until the job is confirmed, then released to the agent minus commission.

> Money bugs are the most expensive bugs. Treat this module with the highest rigor.

---

## Prompt 9.1: Gateway abstraction

```text
Create IPaymentGateway with adapters (start with ONE real provider plus a FakeGateway):
- InitializeCharge(bookingId, amountMinor, currency, customerEmail, callbackUrl, metadata) -> checkoutUrl + reference
- VerifyCharge(reference) -> status
- Refund(reference, amountMinor)
- Transfer(recipientCode, amountMinor, reference)  // payouts
- CreateRecipient(bankAccountDetails)
- Webhook verification (HMAC signature check, timestamp tolerance, replay protection by event id)
All calls: idempotency keys, Polly retries only for safe operations, timeouts, structured logging without card data.
We NEVER store card numbers or CVV; only provider references.
```

---

## Prompt 9.2: Payment flow

```text
Implement:
- POST /api/v1/bookings/{id}/pay  (allowed only in Accepted) -> returns checkoutUrl
- POST /api/v1/webhooks/payments  (anonymous, signature verified, idempotent by event id):
    charge.success -> Payment.Held, Booking -> Confirmed
    charge.failed  -> Payment.Failed, notify client
- GET /api/v1/payments/{bookingId}/status (client polls after redirect; also verifies with the gateway)
- Payment hold timeout: if not paid within 2h of acceptance the booking returns to Cancelled(unpaid) and the slot is freed.
- On ConfirmCompletion/auto-close: Payment -> Released; create LedgerEntries:
    client_escrow DR amount; agent_payable CR amount - fee; platform_revenue CR fee
- On cancellation: compute refund per the policy (file 06), call Refund, write ledger entries.
- On dispute: freeze release until the admin resolves (full/partial refund or release).
Reconciliation job (daily): compare Payment table vs gateway transactions; flag mismatches to admin.
Test with FakeGateway: success, failure, duplicate webhook, out-of-order webhook, refund, partial refund.
```

---

## Prompt 9.3: Agent wallet and payouts

```text
- Agent wallet balance = sum of released ledger credits - payouts (derived from the ledger, never a mutable column).
- POST /api/v1/agents/me/bank-account (validate, create gateway recipient; store only the recipient code and masked account number)
- GET /api/v1/agents/me/earnings (summary, by period, per booking, pending vs available)
- POST /api/v1/agents/me/payouts {amountMinor}: minimum threshold, only from available balance, idempotent.
  Also an auto-payout schedule (weekly) via Hangfire.
- Payout holds: first payout delayed 48h after the first completed job; admin can freeze an agent's payouts.
- Generate monthly statements (PDF via QuestPDF) for agents and receipts for clients.
```

**Acceptance criteria**
- Ledger always balances (invariant test: sum of debits = sum of credits)
- Replayed webhooks never double-charge or double-release
- No endpoint returns or logs full card or bank numbers
- Money math covered with property tests (no rounding drift; fee + payout = total)
