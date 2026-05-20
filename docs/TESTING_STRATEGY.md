# Testing Strategy

OrbitFlow uses tests as a lightweight harness around critical SaaS contracts. The goal is not to test every framework detail. The goal is to protect security, tenant isolation, API contracts, and behavior that AI-generated changes could accidentally break.

## Current Harness

Shared test helpers live in:

```text
apps/api/src/test/test-harness.ts
```

The harness provides:

- typed dependency mocks;
- a transaction callback helper for Prisma-style unit tests;
- NestJS interceptor call handler helpers;
- lightweight HTTP contract helpers for route, DTO, filter, and envelope validation without a database.

## What Must Be Tested

Add or update tests when touching:

- authentication;
- refresh token rotation;
- workspace access and role checks;
- tenant-scoped reads or mutations;
- vote counters or other denormalized data;
- API envelope behavior;
- audit event handling;
- billing, email, storage, or other production-sensitive modules.

## Test Types

| Type              | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| Unit tests        | Fast validation of services, guards, listeners, helpers, and interceptors |
| HTTP contracts    | Validate route contracts with NestJS in memory and mocked infrastructure  |
| Integration tests | Validate modules with realistic NestJS wiring                             |
| E2E tests         | Validate real HTTP flows after the API surface stabilizes                 |

## Current Coverage Focus

Current tests cover:

- workspace role authorization;
- auth registration, login, failed login, and refresh rotation;
- auth HTTP contracts without PostgreSQL, Redis, `.env`, or frontend setup;
- vote toggle transaction behavior;
- audit listener safety;
- success response envelope formatting.

The next useful step, when needed, is adding a small real e2e suite for register -> login -> create workspace -> create board. That should wait until the project intentionally wants tests backed by real PostgreSQL and Redis.

## Commands

```bash
pnpm test
pnpm test:ci
pnpm lint
pnpm typecheck
pnpm build
```

## AI Review Rule

When AI writes code, tests should prove the contract that matters. A passing test suite does not replace human review, but it gives the engineer a harness for catching contract drift.
