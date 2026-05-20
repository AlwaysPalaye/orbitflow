# API Envelope Spec

## Purpose

The API must be predictable for any frontend, including frontends generated with AI assistance.

## Success Envelope

Regular successful responses use:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

Paginated successful responses use:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

## Error Envelope

Errors use:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 400,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/api/v1/example"
  }
}
```

## Invariants

- Controllers return domain data; interceptors and filters own envelope formatting.
- Frontends must consume `data` and `meta`, not raw controller shapes.
- List endpoints should return pagination metadata.
- Error payloads must not leak secrets, stack traces, tokens, or database internals.

## Test Coverage

Primary success envelope tests live in:

```text
apps/api/src/common/interceptors/transform.interceptor.spec.ts
```

Error envelope behavior is documented in `docs/API_REFERENCE.md` and should receive integration tests when e2e coverage is added.
