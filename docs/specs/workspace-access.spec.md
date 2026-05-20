# Workspace Access Spec

## Purpose

Workspace access is the core multi-tenant boundary. Data owned by one workspace must not leak into another workspace through direct reads, writes, or AI-generated code.

## Role Order

```text
VIEWER < MEMBER < ADMIN < OWNER
```

## Invariants

- Workspace-owned operations must call `WorkspaceAccessService`.
- A user without membership cannot access workspace data.
- A lower role cannot perform an action requiring a higher role.
- Board, post, and comment access must resolve the parent workspace before allowing the operation.
- Frontend role checks are convenience only; backend checks are authoritative.
- Generic global role guards must not be used for workspace-scoped roles.

## Test Coverage

Primary tests live in:

```text
apps/api/src/common/authorization/workspace-access.service.spec.ts
```

The tests validate allowed access, missing membership, insufficient role, parent workspace lookup, and missing resources.
