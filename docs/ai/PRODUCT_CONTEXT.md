# Product Context - Will Tech OrbitFlow

> This document defines what OrbitFlow is and why the foundation exists.

---

## Product Vision

OrbitFlow is an open-source SaaS foundation for builders who want a secure and organized backend before designing their own product-specific frontend.

The reference domain is a feedback board, but the intended value is broader: the same foundation can support CRM, finance, workflow, internal tools, client portals, interaction platforms, and other multi-tenant products.

The product is designed to be:

- **Multi-tenant** - workspace-isolated by default.
- **Backend-first** - frontend decisions stay open.
- **Secure** - authentication, validation, RBAC, and tenant checks are core.
- **Adaptable** - domain modules can be replaced or extended.
- **AI-friendly** - documentation gives AI tools architectural context.
- **Portfolio-ready** - transparent, practical, and open to improvement.

---

## Core Domains

| Domain         | Description                                     | Priority |
| -------------- | ----------------------------------------------- | -------- |
| Auth           | JWT auth, refresh rotation, sessions            | Critical |
| Workspaces     | Multi-tenant isolation and membership           | Critical |
| Users          | Profile and account data                        | Critical |
| Authorization  | Workspace roles and access checks               | Critical |
| Feedback Board | Reference domain for boards, posts, votes       | High     |
| Audit Trail    | Event-driven persistence for important actions  | High     |
| Billing        | Future Stripe/subscription integration          | High     |
| Notifications  | Future email, websocket, or async notifications | Medium   |
| Frontend       | Consumer-defined app built on top of the API    | Optional |

---

## Target Users

- Developers who want a SaaS backend foundation.
- Founders validating products with better technical structure.
- Students studying Software Engineering and Systems Architecture.
- Builders using AI-assisted development.
- Teams that want a modular monolith before moving to distributed systems.

---

## Non-Functional Goals

| Requirement       | Direction                                      |
| ----------------- | ---------------------------------------------- |
| Security          | Private by default, explicit public routes     |
| Maintainability   | Feature modules with controller/service/repo   |
| Tenant isolation  | Workspace-scoped authorization                 |
| Extensibility     | Replace domain modules without changing core   |
| Observability     | Logging and health checks as baseline          |
| Documentation     | Human and AI-readable engineering context      |
| Deployment        | Docker + NGINX API gateway                     |
| Frontend strategy | Bring your own app, guided by docs and prompts |

---

## Tech Decisions Log

| Decision          | Choice             | Rationale                                     |
| ----------------- | ------------------ | --------------------------------------------- |
| Monorepo tool     | Turborepo + pnpm   | Fast, cacheable, workspace-friendly           |
| Backend framework | NestJS             | Modular, decorator-based, enterprise patterns |
| Database          | PostgreSQL         | Relational, reliable, scalable                |
| Cache / sessions  | Redis              | TTL support and future queue/pub-sub support  |
| ORM               | Prisma             | Type-safe database access                     |
| Auth              | JWT + refresh flow | Simple, portable, API-friendly                |
| Frontend          | Bring your own     | Keeps the foundation product-agnostic         |

---

## Product Boundary

OrbitFlow owns:

- API architecture;
- authentication;
- authorization;
- tenant model;
- validation;
- audit event persistence baseline;
- infrastructure;
- AI/human documentation.

Your product owns:

- frontend framework;
- visual language;
- domain-specific screens;
- billing model;
- customer workflows;
- business rules beyond the shared foundation.
