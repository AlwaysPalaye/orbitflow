# OrbitFlow Specs

These specs are living engineering contracts for humans and AI assistants.

They describe the behavior that should remain stable while the project evolves. They are intentionally close to the test suite, but they are not a replacement for tests. When behavior changes, update the relevant spec and the tests in the same pull request.

## How To Use These Specs

1. Read `docs/ai/AI_CONTEXT.md` first.
2. Read the spec that matches the area being changed.
3. Implement only inside the agreed scope.
4. Add or update tests using the API test harness when behavior changes.
5. Run the validation commands from the README.

## Current Specs

| Spec                              | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `auth.spec.md`                    | Authentication, JWT, and refresh token rotation |
| `workspace-access.spec.md`        | Tenant isolation and workspace roles            |
| `api-envelope.spec.md`            | Response and error envelope expectations        |
| `frontend-integration.spec.md`    | Contract for any external frontend              |
| `ai-development-workflow.spec.md` | Human-led AI-assisted development flow          |
| `saas-extension.spec.md`          | How new SaaS domains should be added            |

## Project Positioning

OrbitFlow follows a spec-guided workflow inspired by Spec-Driven Development. The specs define intent and contracts; the test harness validates critical behavior; the engineer remains responsible for review, security, and acceptance.
