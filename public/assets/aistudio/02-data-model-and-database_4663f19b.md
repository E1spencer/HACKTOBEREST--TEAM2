# 02: Data Model and Database

**Goal:** A normalized, migration-driven schema supporting profiles, services, bookings, payments, reviews, chat, and AI sessions.

---

## Prompt 2.1: Domain model and ERD

```text
Design the domain model and produce a Mermaid ERD plus C# entity classes (Domain layer, private
setters, factory methods, invariants enforced in the entity) for these aggregates:

Identity
- User (Id, Email, PhoneNumber, DisplayName, Role[Client|Agent|Admin], Status, CreatedAt, LastLoginAt)
- RefreshToken, ExternalLogin (optional)

Agents
- AgentProfile (UserId, Bio, ProfilePhotoUrl, YearsExperience, Languages, ServiceRadiusKm,
  BaseLocation [geography point], City, VerificationStatus[Unverified|Pending|Verified|Rejected],
  IsAvailableForWork, CachedRating, CachedReviewCount, CachedCompletionRate, CachedResponseRate)
- AgentDocument (Type, BlobPath, Status, ReviewedBy, ReviewedAt)
- AgentAvailabilityRule (DayOfWeek, StartTime, EndTime), AgentTimeOff (Start, End, Reason)

Catalog
- ServiceCategory (hierarchical: Id, ParentId, Name, Slug, IconUrl, Keywords[], IsActive)
- AgentService (AgentId, CategoryId, Title, Description, PricingType[Hourly|Fixed],
  PriceMinor, Currency, MinHours, IsActive)

Bookings
- Booking (Id, ClientId, AgentId, AgentServiceId, Status, ScheduledStart, ScheduledEnd,
  Address (value object with geo point), Notes, PriceSnapshot (rate, hours, subtotal, fee, total),
  Currency, CancelledBy, CancellationReason, CreatedAt)
- BookingStatusHistory (BookingId, From, To, ChangedBy, ChangedAt, Reason)

Payments
- Payment (BookingId, Provider, ProviderReference, AmountMinor, Currency, Status[Pending|Held|Released|Refunded|Failed])
- Payout (AgentId, AmountMinor, Status, ProviderReference), LedgerEntry (double-entry style: account, debit/credit)

Reviews
- Review (BookingId UNIQUE, ClientId, AgentId, Rating 1-5, Comment, AgentReply, IsHidden, CreatedAt)

Messaging / Notifications
- Conversation (BookingId), Message (ConversationId, SenderId, Body, SentAt, ReadAt)
- Notification (UserId, Type, Payload JSONB, Channel, ReadAt, SentAt)

AI
- AiSearchSession (UserId, RawQuery, ExtractedIntent JSONB, CandidateAgentIds, SelectedAgentId, Model, LatencyMs, CreatedAt)

Admin
- Dispute (BookingId, OpenedBy, Reason, Status, Resolution, ResolvedBy), AuditLog

Rules: Money = long minor units + currency; UTC DateTimeOffset; soft delete via IsDeleted
with global query filters; optimistic concurrency token on Booking and Payment.
List the invariants for each aggregate before writing code.
```

---

## Prompt 2.2: EF Core mappings and migrations

```text
For each module, create the DbContext (one schema per module, e.g. "agents", "bookings"),
IEntityTypeConfiguration classes, and the initial migration.

Requirements:
- Enable PostGIS (NetTopologySuite) for AgentProfile.BaseLocation and Booking address geography(Point,4326)
- GIST index on location; btree indexes on (CategoryId, IsActive), (AgentId, ScheduledStart), (Status)
- Unique constraints: User.Email, Review.BookingId, Conversation.BookingId, ServiceCategory.Slug
- JSONB columns for Notification.Payload and AiSearchSession.ExtractedIntent
- Check constraints: Rating BETWEEN 1 AND 5, PriceMinor >= 0, ScheduledEnd > ScheduledStart
- Concurrency tokens (xmin on PostgreSQL) for Booking and Payment
- Audit interceptor populating CreatedAt/UpdatedAt/CreatedBy
- Soft-delete interceptor plus global filters
- Outbox message table
- Design-time factory and a script to apply migrations on startup in Development only

Also write migration notes: how to create, apply, roll back, and generate idempotent SQL for production.
```

---

## Prompt 2.3: Seed data

```text
Create an idempotent seeder (Development and Staging only) that inserts:
- A 2-level category tree: Home Services (Cleaning, Laundry, Plumbing basics), Education
  (Home Tutoring: Math, English, Sciences, Exam Prep), Errands (Grocery, Parcel Pickup, Queueing,
  Bill Payment), Personal Care, Events Help. Each with 8-15 search keywords and synonyms.
- 1 admin, 10 clients, 30 agents with realistic profiles, varied ratings (3.2 to 5.0),
  completion rates, prices, radius, and locations scattered around a configurable city center.
- 60 completed bookings with reviews so ratings and completion rates are meaningful.
- A Bogus/Faker-based generator with a fixed seed so data is reproducible.
Provide a CLI command `dotnet run --project tools/Seeder -- --reset`.
```

**Acceptance criteria**
- A fresh database reaches full schema with one command
- Geo query "agents within 5 km of point X" runs < 50 ms on 10k seeded agents (explain with `EXPLAIN ANALYZE`)
- Seeder can be re-run without duplicates
