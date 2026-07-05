# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # Start with watch mode
npm run build            # Build project

# Testing
npm run test             # Unit tests (src/ pattern)
npm run test:seq         # Sequential tests with bail + exit
npm run test:e2e         # E2E tests targeting controllers
npm run test:cov         # Coverage report

# Lint & Format
npm run lint             # ESLint with auto-fix
npm run format           # Prettier

# API Docs / SDK
npm run nestia           # Generate Swagger + SDK (requires build first)

# Database
npx prisma migrate dev   # Run migrations
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open DB GUI
```

To run a single test file:
```bash
npx jest path/to/test.spec.ts
```

Local PostgreSQL runs on port **5433** (not 5432). Start it with:
```bash
docker-compose -f docker/docker-compose.yaml up -d
```

## Architecture

NestJS REST API for a restaurant review platform. Follows **Clean Architecture** with three layers per domain: Controller → Facade → Service/Repository.

### Key path aliases (tsconfig.json)
- `@src` → `src/`
- `@domain` → `src/domain/`
- `@common` → `src/common/`
- `@thirdParty` → `src/third-party/`
- `@utils` → `src/utils/`

### Domain modules (`src/domain/`)
Each domain has its own NestJS module with controller, facade, service, and repository files.

| Module | Responsibility |
|---|---|
| `authentication` | JWT, OAuth (Kakao/Google/Naver), email verification, password reset |
| `user` | User profile, preferences, saved areas, bookmarked/excluded restaurants |
| `account` | OAuth account linking, password management |
| `restaurant` | Reviews, reactions (Like/Dislike), nearby search (PostGIS) |
| `food` | Food category management |
| `configuration` | Server metadata, JWT secrets, third-party config service |

### Common infrastructure (`src/common/`)
- `database/` — Prisma service wrapper
- `auth/` — JWT guards and decorators
- `redis/` — Redis client module (caching)
- `exception/` — Custom HTTP exception filters
- `logging/` — Winston logger module
- `dto/` — Shared pagination and response DTOs

### Third-party integrations (`src/third-party/`)
AWS S3, Brevo (email), Discord webhooks, Google/Kakao/Naver OAuth, Mailgun.

## Key Technologies

- **ORM**: Prisma 5 with PostgreSQL + PostGIS (geography type for location queries)
- **Validation**: Nestia + Typia (compile-time type validation, generates Swagger automatically)
- **Auth**: `@nestjs/jwt` with bcrypt; multi-provider OAuth
- **Functional patterns**: `fp-ts` Either type used throughout tests
- **Logging**: Winston with daily rotation (`src/utils/winston.config.ts`)

## Environment Variables

Copy `.env.sample` to `.env`. Required variables:

```
ENV=local|dev|test|prod
DATABASE_URL=postgresql://...
API_SERVER_PORT=8080
CORS_ORIGINS=http://localhost:3000,https://tastetionary.com,https://tastetionary.vercel.app
ACCESS_TOKEN_SECRET / ACCESS_TOKEN_EXPIRED_AT
REFRESH_TOKEN_SECRET / REFRESH_TOKEN_EXPIRED_AT
KAKAO_CLIENT_ID / KAKAO_REDIRECT_URI
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
NAVER_CLIENT_ID / NAVER_CLIENT_SECRET / NAVER_REDIRECT_URI
BREVO_API_KEY / BREVO_SENDER_EMAIL / BREVO_SENDER_NAME
DISCORD_WEBHOOK_URL
REDIS_URL=redis://localhost:6399
```

Environment validation is enforced at startup in `src/env.validation.ts` — app will fail fast on missing vars.

## Testing Conventions

- Test factories live in `test/factory/`
- `jest.setup.ts` provides helpers: Either assertion utilities, response validators, table truncation, JWT creation
- E2E tests hit the actual database; ensure PostgreSQL is running before running `test:e2e`
- Unit tests use `test:seq` for CI (bail on first failure)

## Security (Snyk)

Per `.github/instructions/snyk_rules.instructions.md`: all new first-party code must pass Snyk security scan before merging. Run scan, fix issues, rescan until clean.
