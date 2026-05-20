# Engineering Rules - Will Tech OrbitFlow

These rules guide new work in this repository. If existing code does not fully meet a rule yet, improve it when touching that area instead of hiding the gap.

## 1. Architecture Boundaries

- Controllers stay thin: receive input, call a service, return a response.
- Services own business logic and orchestration.
- Repositories are the only layer that touches Prisma for feature data access.
- DTOs validate input at the API boundary.
- Events are preferred for side effects that can evolve into async workflows.

## 2. Module Shape

Feature modules should follow this structure when it fits:

```text
src/modules/<feature>/
|-- <feature>.module.ts
|-- <feature>.controller.ts
|-- <feature>.service.ts
|-- <feature>.repository.ts
|-- dto/
|   |-- create-<feature>.dto.ts
|   `-- update-<feature>.dto.ts
`-- <feature>.service.spec.ts
```

Small modules can stay smaller. Do not add files only to satisfy a pattern.

## 3. Complexity

- Prefer files under 300 lines.
- Prefer functions under 40 lines.
- Split code when responsibilities become mixed or tests become hard to read.
- Avoid abstractions that only make the project look bigger.

## 4. Error Handling

- Throw NestJS HTTP exceptions or project-specific exceptions, not raw strings.
- Return consistent error response shapes through the global exception filter.
- Log failures with useful context, without leaking secrets or personal data.
- Keep service errors explicit enough for API consumers and tests.

## 5. Logging

- Application logs use the shared logger.
- Logs should include timestamp, severity, module/context, and message.
- Add request IDs when request-scoped logging is introduced.
- Never log passwords, tokens, refresh tokens, or raw secrets.

## 6. Testing

- Unit tests are required for shared authorization, security-sensitive logic, and complex services.
- Controller or integration tests should be added for important user flows.
- Keep tests close to the code when that is the local pattern.
- Reuse `apps/api/src/test/test-harness.ts` for shared mocks and framework helpers.
- Coverage should grow with risk; do not claim production confidence from shallow tests.

## 7. Security

- API routes are private by default.
- Use `@Public()` only for routes that truly need no authentication.
- Workspace-owned resources must validate tenant access.
- Shared mutations should require explicit role checks.
- Input validation and CORS rules must stay aligned with the deployment model.

## 8. Git And Reviews

- Use Conventional Commit style when possible: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Prefer one logical change per commit.
- Pull requests should explain behavior changes, security impact, and validation commands.

## 9. Dependencies

- Add dependencies only when they remove real complexity or provide mature infrastructure.
- Remove packages that are not used by current code.
- Run dependency review before production releases.

## 10. Documentation

- Update docs when behavior, architecture, or setup changes.
- Update `docs/specs` when behavior contracts change.
- Keep AI-facing docs honest: label future ideas as future ideas.
- Do not leave empty placeholder files in the repository.
