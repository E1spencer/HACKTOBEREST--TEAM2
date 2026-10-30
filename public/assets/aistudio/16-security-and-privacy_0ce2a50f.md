# 16: Security and Privacy

**Goal:** Protect users' money, identities, and home addresses. Safety matters even more here because agents visit people's homes.

---

## Prompt 16.1: Threat model

```text
Produce /docs/threat-model.md using STRIDE for: auth, booking, payments/webhooks, file uploads, chat, AI matching, admin.
For each threat list: asset, attacker, vector, impact, mitigation, owner, status.
Specifically cover: account takeover, IDOR on bookings/documents, double-spend/refund abuse, webhook forgery, SSRF via image/URL handling,
stored XSS in reviews/chat, prompt injection and data exfiltration via the LLM, scraping of agent profiles, fake agents/fake reviews,
off-platform payment evasion, insider abuse by admins, and PII leakage through logs.
Rank by risk and generate a prioritized remediation backlog.
```

---

## Prompt 16.2: Hardening implementation

```text
Implement and verify:
- OWASP ASVS L2 checklist for the API; OWASP Top 10 mapping documented.
- Input validation everywhere; output encoding; strict CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- CSRF protection for cookie-based BFF (SameSite=Lax/Strict + anti-forgery token for state-changing routes).
- IDOR prevention: all resource access through authorization handlers; tests that iterate every ID-bearing endpoint with another user's token.
- File uploads: allowlist types, magic-byte sniffing, size limits, AV scan hook (Defender for Storage), re-encode images, randomized blob names.
- Secrets in Key Vault; rotate JWT signing keys (JWKS with key id) and webhook secrets; short-lived SAS tokens.
- Admin MFA, IP allowlisting option, session timeouts, step-up auth for refunds/payout freezes.
- Rate limiting + bot protection (Front Door WAF rules, Turnstile/reCAPTCHA on register/login/forgot-password/AI).
- Field-level encryption (ASP.NET Data Protection or Key Vault keys) for ID document metadata and phone numbers at rest.
- Dependency pinning and SBOM generation (CycloneDX).
- Pen-test checklist and a ZAP baseline scan in CI against staging.
```

---

## Prompt 16.3: Privacy and compliance

```text
Create the privacy engineering deliverables, aligned to applicable data protection law (e.g. NDPR/NDPA in Nigeria, GDPR if serving EU users):
- Data inventory and data flow map (what PII, where stored, who accesses, retention period).
- Lawful basis per processing activity; consent capture + versioned Terms/Privacy acceptance stored with timestamp/IP.
- Data subject rights: access/export, correction, deletion (with legal-hold exceptions), objection to AI processing (opt-out of AI matching -> use standard search).
- Retention policy jobs: delete expired verification documents, redact old chat logs and AI logs, anonymize deleted accounts.
- AI-specific: disclose AI usage; no personal data sent to LLM beyond minimal need; vendor DPA and zero-retention settings documented.
- Breach response plan with notification timelines and roles.
- Draft (for lawyer review): Terms of Service, Privacy Policy, Agent Agreement (independent contractor status, conduct, fees), Cancellation & Refund Policy, Community Guidelines.
State clearly where legal counsel must review.
```

**Acceptance criteria**
- ZAP baseline shows no high findings; all IDOR tests pass
- Verification documents are inaccessible without an admin-issued short-lived link
- A user data export and a deletion complete end-to-end in staging
