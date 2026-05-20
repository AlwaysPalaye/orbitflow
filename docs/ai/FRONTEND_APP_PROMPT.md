# AI Prompt - Add A Frontend To OrbitFlow

Use this prompt when asking an AI assistant to create a frontend inside this repository.

```text
You are working inside the OrbitFlow monorepo.

OrbitFlow is a backend-first, multi-tenant SaaS foundation. The existing backend lives in apps/api and must remain the source of truth for authentication, workspaces, roles, boards, posts, votes, comments, validation, and response envelopes.

Your task is to add a frontend application without changing backend architecture unless explicitly requested.

Create the frontend in:

apps/web

Requirements:

1. Use the frontend stack I choose: [Next.js / Vite / React / Vue / other].
2. Read docs/FRONTEND_GUIDE.md and docs/frontend/ADD_FRONTEND.md before implementing.
3. Respect the API response envelope:
   - success: { data, meta }
   - error: { error: { code, statusCode, message, path, timestamp } }
4. Build a small API client that unwraps API responses consistently.
5. Implement authentication against:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/refresh
6. Store and send the access token through:
   Authorization: Bearer <token>
7. Keep workspace context explicit in the UI.
8. Protect private routes.
9. Do not invent backend endpoints. If something is missing, stop and explain what API change is needed.
10. Do not remove or weaken backend guards, validation, DTOs, or workspace access rules.
11. Keep the frontend product-specific. Do not turn the backend foundation into a frontend-specific template.
12. Add scripts for dev, build, lint, and typecheck in apps/web/package.json.
13. Make sure pnpm lint, pnpm typecheck, and pnpm build pass from the repository root.

Product context:

[Describe the SaaS you want: CRM, finance, workflow, community, feedback, etc.]

Target users:

[Describe who uses it.]

Core screens:

[List the screens.]

Visual direction:

[Describe the UI style, density, brand, and interaction patterns.]

Constraints:

[List anything the AI must not change.]
```

## Review Checklist For The Human Orchestrator

After the AI creates the frontend, review:

- Did it use the API envelope correctly?
- Did it avoid hard-coded localhost URLs?
- Did it protect private routes?
- Did it preserve backend architecture?
- Did it introduce duplicate auth logic?
- Did it respect workspace/tenant boundaries?
- Did the root commands still pass?
