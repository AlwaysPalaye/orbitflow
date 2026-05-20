# AI Development Workflow Spec

## Purpose

AI can help implement faster, but the engineer owns the system. This spec defines how AI assistance should be used without weakening architecture, security, or review discipline.

## Human Responsibilities

- Define product intent.
- Select the spec that applies to the change.
- Set file scope and constraints.
- Review generated code.
- Validate security and tenant isolation.
- Run tests and quality checks.
- Decide what is accepted.

## AI Responsibilities

- Read the provided context before editing.
- Stay inside the requested scope.
- Follow existing module boundaries.
- Add tests when behavior changes.
- Avoid inventing secrets, endpoints, or architecture decisions.
- Explain assumptions that affect security or data contracts.

## Required Context For AI Tasks

```text
docs/ai/AI_CONTEXT.md
docs/ai/ARCHITECTURE.md
docs/ai/ENGINEERING_RULES.md
docs/specs/<related-spec>.md
```

## Validation Baseline

Before accepting AI-generated code, run the relevant subset of:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm test:ci` when coverage or CI parity matters.

## Positioning

This project is spec-guided and AI-ready. It is not a promise that AI output is automatically correct. The specs and harness exist so generated code has constraints and reviewable behavior.
