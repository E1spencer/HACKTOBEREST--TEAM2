# 05: Catalog, Search and Discovery

**Goal:** Fast, filterable agent discovery that the AI layer (file 07) will reuse as its deterministic search engine.

---

## Prompt 5.1: Category catalog

```text
Implement the Catalog module:
- GET /api/v1/categories (tree, cached 10 min, ETag), GET /api/v1/categories/{slug}
- Admin CRUD for categories (file 13 will use it), including keywords/synonyms used by search and AI
- Response includes agent count per category (cached, refreshed by a job every 10 minutes)
Use IMemoryCache (add IDistributedCache abstraction to allow Redis later).
```

---

## Prompt 5.2: Agent search

```text
Implement GET /api/v1/agents/search with query parameters:
  categoryId or categorySlug, q (free text), lat, lng, radiusKm (default 10, max 50),
  minRating, maxPricePerHour (minor units), minCompletionRate, verifiedOnly,
  availableOn (date) and availableFrom/availableTo (time), language,
  sort (relevance|rating|price_asc|price_desc|distance|completion), page, pageSize (max 50).

Response item: agentId, displayName, photoUrl, rating, reviewCount, completionRate,
  pricePerHour (from the matching service), serviceTitle, distanceKm, verified, nextAvailableSlot, badges.

Implementation requirements:
- Use a dedicated read model/query service with EF Core projections or Dapper (no entity loading).
- PostGIS ST_DWithin + ST_Distance, pg_trgm for fuzzy text matching on title/bio/keywords,
  and full-text search (tsvector) on service titles and descriptions.
- Only list agents satisfying the "listable" rules from file 04.
- Relevance score (document the formula in code and in docs):
    score = 0.35*textMatch + 0.25*bayesianRating + 0.15*completionRate
          + 0.15*proximityDecay + 0.10*responseRate - priceOutlierPenalty
  Use a Bayesian average for ratings: (C*m + sum)/(C + n) with m = platform mean, C = 10.
- Keyset pagination for stable results; cap total results to 500 per query.
- Return facets (counts by rating bracket, price bracket) when `includeFacets=true`.
- Response caching of identical anonymous queries for 30 seconds.

Add the indexes via migration and include an EXPLAIN ANALYZE benchmark script on 10k seeded agents.
Write integration tests for each filter and for ranking order.
```

---

## Prompt 5.3: Search analytics hooks

```text
Log every search (anonymized user id, filters, result count, zero-result flag, latency) to a
SearchEvent table. Add GET /api/v1/admin/analytics/zero-result-searches so we learn which
services customers want that we lack. Make this opt-out for privacy settings.
```

**Acceptance criteria**
- p95 search latency < 200 ms on seeded data
- Ranking is deterministic and explainable (`?debug=true` returns per-component scores for admins)
- Zero-result searches are recorded
