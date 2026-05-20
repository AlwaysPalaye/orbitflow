# Security Rules - Will Tech OrbitFlow

> Security is not a feature. It is a requirement. These rules describe the current baseline and the direction of the project.

---

## Authentication

- JWT-based authentication with access + refresh token pattern.
- Access tokens expire in 15 minutes. Short-lived by design.
- Refresh tokens expire in 7 days and support rotation: each use issues a new refresh token and invalidates the old one.
- Refresh tokens are stored in Redis with TTL, enabling immediate session invalidation.
- Logout clears client tokens; server-side refresh token revocation should be used for production logout flows.

## Authorization (RBAC)

- Authentication is enforced globally by `JwtAuthGuard`; only endpoints marked with `@Public()` bypass JWT.
- Role-Based Access Control is enforced through `WorkspaceAccessService`.
- Tenant ownership checks are centralized in `WorkspaceAccessService`.
- Roles are workspace-scoped: a user can have different roles in different workspaces.
- Default roles: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`.
- Endpoints that mutate shared workspace resources should call the workspace access service with the minimum role required by the operation.

```typescript
await this.workspaceAccess.assertWorkspaceAccess(userId, workspaceId, 'ADMIN');
```

## Input Validation

- All user input is validated at the DTO level using `class-validator`.
- No raw request body should be passed to a service.
- String inputs should be trimmed and length-limited.
- IDs should be validated as UUIDs on public-facing routes.
- File uploads must be validated for type, size, and content before production use.

## Data Protection

- Passwords are hashed using bcrypt with a cost factor of 12.
- Sensitive fields, including tokens and password hashes, are never included in API responses.
- PII should not be logged in structured logs or error messages.
- Database queries use Prisma parameterized queries; avoid raw SQL unless reviewed.

## Rate Limiting

- Global rate limiting is enabled with short, medium, and long windows.
- Auth endpoints should keep stricter limits at the API gateway or route level.
- Public routes should be reviewed for abuse risk before release.

## Headers & Transport

- Production traffic should be served over HTTPS.
- Helmet is enabled in NestJS.
- NGINX includes security headers for container deployments.
- CORS must allow only known origins.

## Audit Logging

- The schema includes an `AuditLog` table for production audit trails.
- Domain services emit events for auth, workspace, board, post, vote, and comment actions.
- `AuditListener` persists the current baseline of important events.
- Production implementations should review event coverage for their domain and add request context such as IP address or request ID.
- Audit logs should include `userId`, `workspaceId`, `action`, `targetResource`, `timestamp`, and `ip`.

## Secrets Management

- Secrets are never committed to the repository.
- All secrets are loaded from environment variables.
- `.env.example` contains placeholder keys only.
- Production secrets should be managed via secure environment injection, CI/CD secrets, or a vault.

## Dependency Security

- Dependencies are audited regularly with `pnpm audit`, especially before releases.
- Known vulnerabilities are reviewed and upgraded or documented before production use.
- Only well-maintained, actively developed packages should be used.
