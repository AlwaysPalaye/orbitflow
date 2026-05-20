# Frontend Integration Spec

## Purpose

OrbitFlow is headless by design. Any frontend can be added as long as it respects the backend contracts.

## Allowed Frontend Shapes

- `apps/web` inside the monorepo.
- A separate repository deployed independently.
- A mobile app.
- An admin app.
- An AI-generated product interface reviewed by an engineer.

## Invariants

- The frontend must use `/api/v1` as the API base path unless deployment changes it intentionally.
- Private requests must send `Authorization: Bearer <accessToken>`.
- Refresh token handling must respect backend rotation.
- The frontend must preserve workspace context.
- UI role checks are optional convenience; backend authorization remains required.
- The frontend must consume `{ data, meta }` success responses and `{ error }` failures.
- Product-specific UI must not force backend foundation modules to become frontend-specific.

## AI Prompt Requirements

When asking AI to build a frontend, include:

- project context;
- product goal;
- files/folders in scope;
- API contract;
- auth and workspace rules;
- validation commands;
- explicit review expectations.

Use:

```text
docs/ai/FRONTEND_APP_PROMPT.md
docs/ai/HOW_TO_INSTRUCT_AI.md
```
