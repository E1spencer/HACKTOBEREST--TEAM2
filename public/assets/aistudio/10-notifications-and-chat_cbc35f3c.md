# 10: Notifications and Chat

**Goal:** Keep both sides informed and let them coordinate inside the platform (which also protects the business from off-platform leakage).

---

## Prompt 10.1: Notification system

```text
Implement the Notifications module, driven by domain events from other modules (via the outbox).

- Channels: in-app (DB + SignalR), email (SMTP/Azure Communication Services or SendGrid behind IEmailSender),
  push (Web Push via VAPID, behind IPushSender), SMS only for OTP and critical alerts (behind ISmsSender).
- Template engine: Scriban or Razor templates, localized (en first, i18n-ready), with plain-text + HTML variants.
- Catalogue of notifications (type -> recipient -> channels):
    BookingRequested -> agent (push, email, in-app)
    BookingAccepted/Declined -> client (push, email, in-app)
    PaymentHeld -> both; BookingReminder 24h/1h -> both; BookingStarted/Completed -> client
    CompletionConfirmed/PayoutSent -> agent; ReviewReceived -> agent; AgentVerified/Rejected -> agent
    DisputeOpened/Resolved -> both; NewMessage (if offline > 2 min) -> recipient
- User preferences per type/channel; mandatory transactional ones cannot be disabled.
- Delivery: Hangfire jobs with retries and dead-letter; dedupe key per (event, user, channel); quiet hours for non-urgent push.
- Endpoints: GET /api/v1/notifications?unread=, POST /notifications/{id}/read, POST /notifications/read-all,
  PUT /me/notification-preferences, POST /me/push-subscriptions.
- Never include sensitive details (full address, phone) in email/push bodies; link into the app.
Test: event -> notification row -> channel dispatch, preference suppression, duplicate event dedupe.
```

---

## Prompt 10.2: In-booking chat

```text
Implement the Messaging module with SignalR:
- One Conversation per Booking, created when the booking is Accepted; read-only after Closed + 7 days.
- Hub /hubs/chat: JoinConversation, SendMessage, MarkRead, Typing; authorization = only the two participants (and admins in read-only audit mode).
- REST fallbacks: GET /api/v1/conversations, GET /conversations/{id}/messages?before=&limit=, POST messages.
- Message rules: max 2000 chars, rate limit 20/min, text only in MVP (+ optional image up to 5 MB via same upload pipeline).
- Off-platform leakage guard: detect phone numbers, emails, and payment-evading phrases ("pay me directly", bank details);
  mask/flag them with a warning to the sender, and log to the admin moderation queue without blocking harmless text.
- Scale-out: SignalR with Azure SignalR Service (config switch); sticky-session-independent.
- Presence/typing indicators are ephemeral (not persisted). Unread counts computed from ReadAt.
Test: unauthorized join rejected, message persisted and delivered to both clients, leakage masking.
```

**Acceptance criteria**
- Booking state changes produce the right notifications on the right channels
- Users can mute non-critical notifications
- A third user cannot join someone else's conversation
