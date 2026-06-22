# Tastetionary Server

A location-aware restaurant and food recommendation API built with NestJS. Users register their area, leave keyword-tagged reviews, and get personalized restaurant recommendations based on proximity, category, and community reviews.

## Features

- **Location-based restaurant recommendation** — PostGIS geography queries find restaurants within a configurable radius, ranked by review keywords, categories, and price range
- **Food recommendation with Redis caching** — keyword/category-filtered food suggestions cached in Redis (TTL 24h); recommendation history tracked per food item
- **Community review system** — keyword tags, price ranges, one-line summaries, revisit opinions, and like/dislike reactions
- **Kakao Places integration** — restaurant metadata (name, location, phone, address) pulled from Kakao Places API and stored with PostGIS geography coordinates
- **Review moderation** — report flow with image upload to AWS S3 and Discord webhook notification
- **JWT authentication** — access/refresh token pair with OTP-based identity verification
- **nestia SDK** — automatic TypeScript client SDK generated from controller types

## Architecture

```
Client (Mobile / Web)
        │
        ▼
  NestJS API Server
  ┌─────────────────────────────────────────────────┐
  │  food      │  restaurant   │  user   │  auth    │
  │  domain    │  domain       │  domain │  domain  │
  │            │               │         │          │
  │  Redis     │  PostGIS      │  JWT    │  OTP     │
  │  cache     │  geo queries  │  tokens │  verify  │
  └─────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   PostgreSQL      Kakao Places    AWS S3
   + PostGIS         API          (images)
                      │
                  Discord
                  (report alerts)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js, TypeScript |
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| External API | Kakao Places API |
| Storage | AWS S3 |
| Notification | Discord Webhook |
| SDK generation | nestia |
| CI/CD | GitHub Actions |
| Container | Docker, docker-compose |

## Key Technical Decisions

### PostGIS for location queries
Restaurant proximity search uses PostgreSQL's `geography` type with GiST indexes. This enables efficient `ST_DWithin` distance queries directly in the database without application-layer filtering.

```sql
-- Finds restaurants within maxDistanceMeter of the user's registered location
SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint($lon, $lat), 4326)::geography) AS distance
FROM external_restaurant_informations
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($lon, $lat), 4326)::geography, $maxDistance)
```

### GIN indexes for keyword search
Review keywords are stored as `String[]` arrays. GIN indexes on `keywords` and preference arrays allow efficient `@>` (contains) operator queries without full table scans.

### Redis for food recommendation history
Food recommendations are cached in Redis under `food:recommendations` with a 24-hour TTL. Each recommendation increments a counter and records `lastRecommendedAt`, enabling a "recently recommended" feed without additional DB queries.

### Kakao Places as external data source
Rather than maintaining a restaurant database, restaurant metadata is fetched on first review and cached in `external_restaurant_informations` keyed by Kakao's UUID. Subsequent reviews reuse the cached record.

### nestia for type-safe API contracts
Controllers are decorated with nestia, which generates a fully typed TypeScript SDK published to npm (`@tastetionary/api`). Frontend clients consume the SDK instead of hand-writing fetch calls.

## Getting Started

### Prerequisites
- Node.js 24+
- Docker + docker-compose
- Kakao Developers account (Places API key)
- AWS account (S3 bucket)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/tastetionary/tastetionary-server.git
cd tastetionary-server
npm install

# 2. Configure environment
cp .env.sample .env
# Fill in: DATABASE_URL, REDIS_URL, KAKAO_API_KEY, AWS_*, JWT_SECRET

# 3. Start dependencies
docker-compose up -d   # PostgreSQL + PostGIS + Redis

# 4. Run migrations
npx prisma migrate dev

# 5. Start server
npm run start:dev
```

Server runs at `http://localhost:8080`.

### Running tests

```bash
# Unit tests
npm run test

# E2E tests (requires running DB + Redis)
npm run test:e2e
```

## Manual API Testing (VS Code REST Client)

Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension, then:

1. Add to `.vscode/settings.json`:
```json
{
  "rest-client.environmentVariables": {
    "local": {
      "base_url": "http://localhost:3000",
      "content_type_json": "application/json"
    }
  }
}
```
2. Open any `.http` file in `intergration_test/` and click **Send Request**.
3. shift + cmd + P and find `Rest Client: Switch Environment` and select local(or other env)
4. move to any other \*.http in http/ and click
   (before click, server should be running)

## Project Structure

```
src/
├── domain/
│   ├── food/           # Food recommendation + Redis caching
│   ├── restaurant/     # Restaurant discovery, reviews, reactions
│   ├── user/           # User profile, location (PostGIS), preferences
│   ├── authentication/ # OTP verification flows
│   ├── account/        # Login, JWT token management
│   ├── admin/          # Admin operations
│   └── configuration/  # App config service
├── third-party/
│   ├── kakao/          # Kakao Places API client
│   ├── aws/            # S3 upload / presigned URL
│   ├── discord/        # Webhook notifications
│   ├── google/         # Google OAuth
│   └── naver/          # Naver OAuth
└── common/
    ├── exception/      # Domain exception hierarchy
    ├── redis/          # Redis operations wrapper
    └── util/           # Shared utilities
prisma/
├── schema.prisma       # DB schema (PostGIS geography, GIN/GiST indexes)
└── migrations/
packages/
└── api/                # Auto-generated nestia TypeScript SDK
```

## CI/CD

GitHub Actions pipelines:

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `unit-test.yml` | PR to main / develop | Jest unit tests |
| `e2e-test.yml` | PR to main / develop | End-to-end API tests |
| `codeql.yml` | PR to main / develop | CodeQL static analysis |
| `deploy-dev.yml` | push to develop | lint → codeql → test → trivy scan → Railway deploy |
| `trivy-scheduled.yml` | every Monday 00:00 UTC | Weekly Docker image vulnerability scan |
| `dependabot.yml` | every Monday | Auto PRs for npm / GitHub Actions / Docker updates |

## API Reference

The TypeScript SDK is published to npm:

```bash
npm install @tastetionary/api
```

Full endpoint documentation is available via the nestia-generated SDK types.

## License

MIT
