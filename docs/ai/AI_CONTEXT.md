# AI Context - Will Tech OrbitFlow

This file is the first context an AI assistant should read before changing this repository.

## Project Identity

OrbitFlow is a backend-first SaaS foundation. It exists to provide a clean, secure, and adaptable base for web platforms without forcing a specific frontend or business niche.

The current reference domain is a feedback board with workspaces, boards, posts, votes, and comments. That domain is intentionally replaceable. The reusable foundation is the architecture around authentication, authorization, tenant isolation, validation, API envelopes, infrastructure, and documentation.

Behavior expectations live in `docs/specs`. Read the related spec before changing auth, workspace access, API envelopes, frontend integration, or domain extension patterns.

## Human And AI Roles

The human engineer owns:

- product intent;
- architecture decisions;
- security review;
- final acceptance;
- tradeoff decisions.

The AI assistant helps with:

- implementation inside defined boundaries;
- documentation updates;
- tests;
- refactors;
- frontend generation when requested.

AI should not invent architecture direction without being asked.

## Current Shape

Real implemented packages:

- `apps/api` - NestJS API.
- `packages/tsconfig` - shared TypeScript configuration.
- `packages/eslint-config` - shared lint configuration.

Optional future additions:

- `apps/web` - frontend chosen by the consumer.
- `apps/worker` - background jobs if async pressure appears.
- domain-specific modules for CRM, finance, workflow, portals, or other SaaS products.

## Non-Negotiable Boundaries

- Do not remove backend guards, validation, DTOs, or workspace access checks.
- Do not add a frontend unless the task explicitly asks for one.
- Do not invent backend endpoints for a frontend. Explain what endpoint is missing.
- Do not commit secrets or real credentials.
- Keep reusable foundation logic separate from product-specific UI assumptions.

## Required Reading For Common Tasks

- Backend architecture: `docs/ai/ARCHITECTURE.md`
- Coding style: `docs/ai/CODING_STANDARDS.md`
- Security baseline: `docs/ai/SECURITY_RULES.md`
- Frontend integration: `docs/FRONTEND_GUIDE.md`
- AI prompt patterns: `docs/ai/HOW_TO_INSTRUCT_AI.md`
- Behavior specs: `docs/specs/README.md`
- Testing strategy: `docs/TESTING_STRATEGY.md`
