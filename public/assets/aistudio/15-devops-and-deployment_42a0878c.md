# 15: DevOps and Deployment (Azure)

**Goal:** Repeatable infrastructure, safe deployments, and visibility into production.

---

## Prompt 15.1: Infrastructure as code

```text
Create /infra with Bicep (or Terraform) modules for environments dev, staging, prod:
- Resource group per environment, naming/tagging convention
- Azure Container Apps (or App Service) for API and Next.js web; managed identity for each
- Azure Database for PostgreSQL Flexible Server (PostGIS, pg_trgm enabled), private networking, automated backups (PITR 14 days),
  separate admin and app roles with least privilege
- Storage Account (public container for avatars via CDN, private container for documents), lifecycle rules
- Key Vault for secrets with RBAC and managed identity access; no secrets in pipelines
- Azure SignalR Service (Standard), Azure Front Door/CDN + WAF, Azure Communication Services (email) or SendGrid
- Application Insights + Log Analytics, alerts (see 15.3)
- Optional Azure Cache for Redis (sessions, rate limiting, AI conversation state)
Parameter files per environment; `what-if` step in CI; cost estimate per environment in the README.
```

---

## Prompt 15.2: CI/CD pipelines (GitHub Actions)

```text
Create workflows:
1. pr.yml: restore, build, unit + integration tests (Testcontainers), architecture tests, lint, CodeQL, gitleaks, OpenAPI diff,
   frontend typecheck/lint/unit tests, Playwright smoke against a preview environment.
2. main.yml: build and push container images (tagged with git SHA) to ACR, deploy to staging, run DB migrations as a separate job
   (idempotent SQL script, with approval for prod), run smoke + E2E tests, then promote to prod with manual approval.
3. Deployment strategy: blue/green or revision-based traffic shifting (Container Apps revisions), automatic rollback on failed health checks.
4. Database migration policy: expand/contract (backward compatible) so rollbacks are safe; never auto-apply destructive migrations.
5. nightly.yml: AI evaluation, dependency scan, load test on staging.
Use OIDC federation to Azure (no long-lived credentials). Provide environment protection rules.
```

---

## Prompt 15.3: Observability and operations

```text
Implement:
- OpenTelemetry traces/metrics/logs exported to Application Insights; custom metrics: bookings_created, payments_held, payout_failures,
  ai_match_latency, ai_cost_usd, search_zero_results, hangfire_failures.
- Dashboards: API health, booking funnel, payments, AI, jobs.
- Alerts: 5xx rate > 2% (5 min), p95 latency breach, failed webhooks, payout failure, queue depth, DB CPU/storage > 80%, AI cost over budget,
  health check failure. Route to email/Teams/Slack with severity.
- Runbooks in /docs/runbooks: payment mismatch, stuck bookings, webhook backlog, DB failover, restore from backup, AI provider outage.
- Backup/restore drill documented and tested; RPO <= 15 min, RTO <= 1 h.
- Feature flags (Microsoft.FeatureManagement) for AI matching, chat images, payouts automation; kill switches for AI and payments.
- Hangfire dashboard (admin-only), with retry policies and dead-letter review.
```

**Acceptance criteria**
- A merge to main reaches staging automatically and prod with one approval
- Rolling back to the previous revision takes < 5 minutes
- A staged backup restore has been performed successfully
