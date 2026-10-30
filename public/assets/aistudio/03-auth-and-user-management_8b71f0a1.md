# 03: Authentication and User Management

**Goal:** Secure sign-up/sign-in for clients, agents, and admins, with role-based and resource-based authorization.

---

## Prompt 3.1: Identity module

```text
Implement the Identity module with ASP.NET Core Identity (custom User entity mapped to our schema).

Endpoints (/api/v1/auth):
- POST /register/client {email, password, displayName, phone}
- POST /register/agent  {email, password, displayName, phone, categories[]}
- POST /login           -> {accessToken (15 min), refreshToken (14 days, rotating), expiresIn}
- POST /refresh, POST /logout (revokes refresh token family), POST /logout-all
- POST /verify-email, POST /resend-verification
- POST /forgot-password, POST /reset-password
- POST /verify-phone/request, POST /verify-phone/confirm (OTP via pluggable ISmsSender; console sender in dev)

Rules:
- Password policy: min 10 chars, breached-password check hook (HIBP k-anonymity interface, stubbed)
- Lockout after 5 failures (15 min), generic error messages to prevent user enumeration
- Refresh token rotation with reuse detection (reuse revokes the whole family)
- Store refresh tokens hashed (SHA-256), never plaintext
- JWT claims: sub, role, agent_id (if agent), email_verified, phone_verified
- Agents cannot accept bookings until email and phone are verified
- Emit domain events: UserRegistered, EmailVerified, PhoneVerified

Include FluentValidation validators, handlers, endpoints, and integration tests with Testcontainers
for registration, login, refresh rotation/reuse, and lockout.
```

---

## Prompt 3.2: Authorization

```text
Add authorization:
1. Policies: ClientOnly, AgentOnly, AdminOnly, VerifiedAgentOnly.
2. Resource-based handlers: "CanViewBooking" (client or agent on the booking, or admin),
   "CanManageAgentProfile" (owner or admin), "CanReviewBooking" (client of a completed booking, once).
3. A current-user service (ICurrentUser) abstracted from HttpContext for the Application layer.
4. Admin seeding via secure one-time CLI (no default password in code).
5. Tests proving a client cannot read another client's booking, and an agent cannot edit another agent's profile.
```

---

## Prompt 3.3: User profile and account endpoints

```text
Implement:
- GET/PUT /api/v1/me (display name, phone, avatar, notification preferences, saved addresses)
- POST /api/v1/me/avatar (image upload: validate MIME/magic bytes, max 2 MB, resize to 512x512 and
  256x256 WebP via ImageSharp, strip EXIF, store in Blob, return CDN URL)
- Saved addresses CRUD (label, line1, line2, city, lat/lng, instructions) max 10 per user
- DELETE /api/v1/me (account deletion: soft delete, anonymize PII after 30 days via Hangfire job,
  block if there are active bookings)
- GET /api/v1/me/export (data export JSON for privacy compliance)
```

**Acceptance criteria**
- Full auth flow works from Swagger; refresh reuse revokes the family
- All auth endpoints rate limited; no endpoint leaks whether an email exists
- Avatar upload rejects a renamed .exe
