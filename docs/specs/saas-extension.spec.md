# SaaS Extension Spec

## Purpose

OrbitFlow should be adaptable to CRM, finance, feedback, workflow, community, and other SaaS products without rewriting the foundation.

## New Domain Module Shape

Use this shape when the module needs full API behavior:

```text
apps/api/src/modules/<feature>/
|-- <feature>.module.ts
|-- <feature>.controller.ts
|-- <feature>.service.ts
|-- <feature>.repository.ts
|-- dto/
|   |-- create-<feature>.dto.ts
|   `-- update-<feature>.dto.ts
`-- <feature>.service.spec.ts
```

Small modules can be smaller. Do not add empty files to satisfy the pattern.

## Invariants

- Workspace-owned data must include a tenant boundary.
- Services must call `WorkspaceAccessService` before reading or mutating scoped data.
- Repositories own Prisma access for feature data.
- DTOs validate external input.
- Controllers stay thin.
- Paginated list endpoints should return `PaginatedResult`.
- Domain side effects should emit events before introducing queues or workers.
- Sensitive or business-critical events should be reviewed for audit logging.
- New behavior should update the relevant spec and tests.

## Replacing The Reference Domain

The feedback domain (`boards`, `posts`, `comments`, `votes`) is a reference implementation. A product may keep it, rename it, or replace it with its own domain modules.

When replacing it, update:

- `apps/api/src/app.module.ts`;
- `apps/api/prisma/schema.prisma`;
- `apps/api/prisma/seed.ts`;
- `docs/API_REFERENCE.md`;
- specs and tests related to the removed domain.
