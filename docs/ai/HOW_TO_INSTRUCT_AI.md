# How To Instruct AI In This Project

This project is designed for AI-assisted development, but the AI should not drive the architecture alone.

The human role is to define intent, constraints, product direction, and review. The AI role is to help implement inside those boundaries.

## Good Instruction Pattern

Use this structure:

```text
Context:
[What this project is and what already exists.]

Related spec:
[Which file in docs/specs defines the behavior contract.]

Goal:
[What you want the AI to build.]

Scope:
[Which files/folders the AI can change.]

Constraints:
[What must not be changed.]

API contract:
[Which endpoints and response shapes must be respected.]

UI/product expectations:
[Who the user is and what experience matters.]

Validation:
[Which commands must pass.]
```

## Example

```text
Context:
This is OrbitFlow, a backend-first SaaS foundation. The API is in apps/api.

Related spec:
docs/specs/frontend-integration.spec.md

Goal:
Create a CRM frontend in apps/web using Next.js.

Scope:
You may create apps/web and add frontend-specific package dependencies.
Do not change apps/api unless an endpoint is missing, and ask first if it is.

Constraints:
Use the API envelope { data, meta }.
Use Authorization Bearer tokens.
Respect workspace context.
Do not bypass backend authorization.

Core screens:
- login
- register
- workspace selector
- contacts list
- contact detail
- pipeline board
- settings

Validation:
After implementation, pnpm lint, pnpm typecheck, and pnpm build must pass.
```

## What To Avoid

Avoid vague prompts:

```text
Build me a dashboard.
```

Better:

```text
Build a workspace-scoped finance dashboard that consumes the existing OrbitFlow API, uses the API envelope correctly, protects private routes, and keeps all frontend code inside apps/web.
```

## Human Review Rules

Before accepting AI-generated code, check:

- Does it match the architecture?
- Did it create shortcuts around security?
- Did it invent data models that belong in the backend?
- Did it hard-code secrets or API URLs?
- Did it make the frontend too generic for the product?
- Did it pass the root validation commands?
- Did it update the related spec when behavior changed?

AI can write fast. The engineer still owns the system.
