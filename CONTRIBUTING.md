# Contributing To OrbitFlow

Thank you for helping improve this SaaS foundation. The project is intentionally open to feedback, corrections, and better engineering decisions.

## Development Workflow

1. Create a feature branch from `develop`: `git checkout -b feat/module-name`.
2. Follow commit conventions when possible: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
3. Run the relevant checks before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

4. Update the related spec in `docs/specs` when behavior changes.
5. Open a Pull Request against `develop`.

## Architecture Rules

- Controllers should stay thin.
- Services own business logic.
- Repositories are the database access layer.
- DTOs validate external input.
- Workspace-owned data must enforce tenant access.
- Security changes should explain the risk they affect.
- Behavior changes should update specs and tests together.

## Naming Conventions

| Type             | Convention   | Example                   |
| ---------------- | ------------ | ------------------------- |
| Files            | `kebab-case` | `create-workspace.dto.ts` |
| Classes          | `PascalCase` | `WorkspacesService`       |
| Methods          | `camelCase`  | `findByUserId()`          |
| Constants        | `UPPER_CASE` | `BCRYPT_ROUNDS`           |
| Database tables  | `snake_case` | `workspace_members`       |
| Environment vars | `UPPER_CASE` | `DATABASE_URL`            |

## Module Structure

Most feature modules should follow this shape:

```text
modules/example/
|-- example.module.ts
|-- example.controller.ts
|-- example.service.ts
|-- example.repository.ts
`-- dto/
    |-- create-example.dto.ts
    `-- update-example.dto.ts
```

Do not add empty files just to match the structure. Keep the code honest and useful.

## Frontend Contributions

This repository does not ship a required frontend. If you propose frontend code, explain whether it is:

- a documentation recipe;
- an optional example package;
- a product-specific app that should live outside the foundation.

Backend structure should not become coupled to one frontend framework.

## Specs And Tests

Specs live in `docs/specs`. Treat them as behavior contracts for humans and AI assistants.

When changing critical behavior, update:

- the related spec;
- the related unit/integration tests;
- `docs/API_REFERENCE.md` when public API behavior changes.

Use `apps/api/src/test/test-harness.ts` for shared test helpers instead of creating ad hoc mocks in every file.
