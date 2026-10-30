# 01: Architecture and Scaffold

**Goal:** A clean, testable solution skeleton with conventions locked in before any feature work.

---

## Prompt 1.1: Solution scaffold

```text
Create the solution structure for {{PROJECT_NAME}} as a modular monolith using Clean Architecture.

Requirements:
1. Solution folders:
   - src/Host/Marketplace.Api               (ASP.NET Core 8 Web API, composition root)
   - src/BuildingBlocks/Marketplace.SharedKernel   (Result<T>, Error, Entity, AggregateRoot, ValueObject, IDomainEvent, Money)
   - src/Modules/<Module>/ each with: Domain, Application, Infrastructure, Contracts (public API)
   - tests/ with UnitTests, IntegrationTests, ArchitectureTests per module
2. Modules: Identity, Agents, Catalog, Bookings, Payments, Reviews, Messaging, Notifications, AiMatching, Admin.
3. Architecture tests (NetArchTest) that enforce:
   - Domain depends on nothing but SharedKernel
   - Application depends only on Domain
   - Modules do not reference each other's Domain/Infrastructure, only Contracts
4. Central package management (Directory.Packages.props), Directory.Build.props with
   nullable enabled, TreatWarningsAsErrors, analyzers (Roslynator or StyleCop) and .editorconfig.
5. docker-compose.yml with PostgreSQL (PostGIS image), Azurite (blob), MailHog (SMTP), and Seq (logs).
6. A Makefile or scripts folder: build, test, run, migrate, format.

Output: the folder tree, all csproj files, Directory.* files, docker-compose.yml, and the
architecture test project. Explain each decision in at most 2 lines.
```

**Acceptance criteria**
- `dotnet build` and `dotnet test` succeed from the root
- Architecture tests fail if you deliberately add an illegal reference
- `docker compose up` starts all dependencies

---

## Prompt 1.2: Cross-cutting concerns

```text
Implement the cross-cutting infrastructure in Marketplace.Api and SharedKernel:

1. Result<T>/Error pattern for expected failures; exceptions only for unexpected ones.
2. Global exception handler middleware returning RFC 7807 ProblemDetails with a traceId
   and a stable machine-readable `code` extension (e.g. "booking.slot_unavailable").
3. MediatR pipeline behaviors: ValidationBehavior (FluentValidation), LoggingBehavior,
   TransactionBehavior (unit of work per command), and an IdempotencyBehavior for commands
   carrying an `Idempotency-Key` header.
4. API versioning (URL segment /api/v1), Swagger/OpenAPI with JWT security scheme.
5. Serilog structured logging with correlation id (X-Correlation-Id), Application Insights sink
   configurable by environment, request logging that excludes sensitive fields.
6. Options pattern with validation on startup for all configuration sections.
7. Health checks (/health/live, /health/ready) covering DB, blob, and background jobs.
8. Rate limiting (built-in .NET rate limiter): stricter policy for auth and AI endpoints.
9. CORS policy driven by config; response compression; security headers middleware.
10. Domain event dispatching after SaveChanges (outbox pattern table + Hangfire processor).

Include unit tests for the exception handler and the validation behavior.
```

**Acceptance criteria**
- A deliberately invalid request returns a ProblemDetails 400 with field errors
- Domain events are persisted to the outbox in the same transaction as the aggregate
- Rate limits return 429 with `Retry-After`

---

## Prompt 1.3: Architecture Decision Records

```text
Create /docs/adr with ADRs (context, decision, consequences) for:
ADR-001 Modular monolith over microservices
ADR-002 PostgreSQL + PostGIS
ADR-003 Money as integer minor units + ISO currency
ADR-004 Outbox pattern for domain events
ADR-005 LLM used for intent extraction only; ranking is deterministic
ADR-006 Payment hold-and-release model (escrow-like) via gateway abstraction
ADR-007 Soft-delete and audit trail strategy
Also generate /docs/architecture.md with a C4 level 1 and 2 diagram in Mermaid.
```
