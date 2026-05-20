# Auth Spec

## Purpose

Authentication must provide a secure baseline for SaaS products without coupling the backend to a specific frontend.

## Invariants

- Registration rejects an email that already exists.
- Passwords are stored only as hashes.
- Successful registration emits `auth.registered`.
- Login rejects unknown users and invalid passwords with the same public error.
- Failed password login for a known user emits `auth.login_failed` with the user id for audit logging.
- Successful login updates `lastLoginAt` and emits `auth.logged_in`.
- Access tokens are JWTs with the authenticated user id in `sub`.
- Refresh tokens are opaque UUID values stored in Redis.
- Refresh token rotation invalidates the previous token before issuing a new one.
- Expired or missing refresh tokens are rejected.

## Out Of Scope Today

- Email verification flow.
- Password reset flow.
- Explicit logout endpoint.
- Social login.

## Test Coverage

Primary tests live in:

```text
apps/api/src/modules/auth/auth.service.spec.ts
apps/api/src/modules/auth/auth.http-contract.spec.ts
```

The tests validate registration, login, failed login, refresh token rotation, expired refresh tokens, DTO validation, auth route status codes, and API envelope behavior.
