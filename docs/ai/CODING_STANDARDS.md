# Coding Standards - Will Tech OrbitFlow

These standards keep the foundation readable for humans and predictable for AI-assisted work.

## TypeScript

- Keep strict mode enabled.
- Use type-only imports for type-only references.
- Prefer `interface` for object shapes and `type` for unions or mapped types.
- Avoid `any`; use `unknown` and narrow it when the type is not known.
- Add explicit return types to exported helpers and non-trivial service/repository methods.

## Functions

- A function should do one clear job.
- Use early returns to reduce nesting.
- Extract helpers when a method starts mixing validation, persistence, and formatting.
- Async code should fail clearly; do not swallow errors.

```typescript
// Good
async function getUser(id: string): Promise<User> {
  const user = await this.userRepository.findById(id);

  if (!user) {
    throw new NotFoundException(`User ${id} not found`);
  }

  return user;
}

// Bad
async function getUser(id: string) {
  try {
    const user = await this.userRepository.findById(id);
    if (user) {
      return user;
    } else {
      throw new Error('not found');
    }
  } catch (error) {
    throw error;
  }
}
```

## DTOs And Validation

- All external input enters through DTOs.
- DTOs live in a module-level `dto/` folder.
- Use `class-validator` decorators for required shape, length, enum, and optional rules.
- Do not pass raw request bodies into services.

## API Responses

Successful responses are wrapped by the global transform interceptor:

```json
{ "data": {}, "meta": {} }
```

Errors are wrapped by the global exception filter:

```json
{ "error": { "code": "WORKSPACE_NOT_FOUND", "message": "..." } }
```

Frontend code should consume this contract instead of guessing per endpoint.

## Comments

- Comment why a decision exists, not what the next line does.
- Keep comments short and useful.
- Remove stale comments when behavior changes.

## Imports

- Follow the configured `import/order` rule.
- Avoid circular imports.
- Prefer module boundaries over deep imports across feature folders.

## Tests

- Use descriptive `describe` and `it` blocks.
- Follow Arrange, Act, Assert.
- Mock external dependencies, not the unit under test.
- Test tenant and authorization behavior whenever data can cross workspace boundaries.
