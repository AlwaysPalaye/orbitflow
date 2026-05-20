# Security Policy - OrbitFlow

## Reporting Vulnerabilities

If you discover a security vulnerability, do not open a public issue with exploit details. Report it privately to the maintainer so it can be reviewed and fixed responsibly.

## Security Architecture

### Authentication

| Component          | Implementation                                   |
| ------------------ | ------------------------------------------------ |
| Access tokens      | JWT with short expiration                        |
| Refresh tokens     | UUID v4 values stored in Redis with TTL          |
| Token rotation     | Every refresh invalidates the old refresh token  |
| Password hashing   | bcrypt with cost factor 12                       |
| Session revocation | Server-side refresh token deletion through Redis |

### Authorization

| Pattern     | Details                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| Model       | Role-Based Access Control                                               |
| Scope       | Workspace-level roles                                                   |
| Roles       | `OWNER` > `ADMIN` > `MEMBER` > `VIEWER`                                 |
| Enforcement | Global JWT guard and workspace access checks                            |
| Default     | Routes require authentication unless explicitly marked with `@Public()` |

### Input Validation

- DTOs are validated with `class-validator`.
- `whitelist: true` strips unknown properties.
- `forbidNonWhitelisted: true` rejects unexpected fields.
- `transform: true` enables safe type conversion through NestJS validation.

### Rate Limiting

| Layer  | Direction                                                    |
| ------ | ------------------------------------------------------------ |
| API    | Global throttling in NestJS                                  |
| NGINX  | Stricter limits for `/api/v1/auth/` in container deployments |
| Public | Public routes should be reviewed before production traffic   |

### Transport Security

- The local and default Docker examples expose HTTP for development simplicity.
- Production deployments should terminate HTTPS at the platform, load balancer, reverse proxy, or NGINX layer.
- Helmet is enabled in NestJS.
- NGINX adds baseline security headers.
- CORS must be restricted to known frontend/client origins.

### Data Protection

- Tenant isolation is enforced through workspace-scoped access checks.
- `passwordHash` is not returned by user-facing API responses.
- Secrets must be loaded from environment variables, not committed files.
- Logs must not include passwords, JWTs, refresh tokens, or raw secrets.

### Audit Trail

The Prisma schema includes an `AuditLog` model, and the API includes an event listener that persists important auth, workspace, board, post, vote, and comment actions.

Production products should review audit coverage for their own domain, add query/export workflows when needed, and attach request context such as IP address or request ID before relying on audit logs for compliance.

### Dependency Management

- The lockfile is committed and CI uses `--frozen-lockfile`.
- Run `pnpm audit` before releases and dependency upgrades.
- Review transitive vulnerabilities based on real exposure, not only severity labels.

## Threat Model

| Threat                       | Current mitigation                                                  |
| ---------------------------- | ------------------------------------------------------------------- |
| Brute force login            | Global throttling and NGINX auth route rate limits                  |
| Token theft                  | Short-lived access tokens and refresh token rotation                |
| CSRF                         | Bearer-token API by default; cookie deployments need SameSite rules |
| XSS                          | Helmet headers and frontend-specific review when a frontend exists  |
| SQL injection                | Prisma parameterized queries; raw SQL should be reviewed            |
| Privilege escalation         | Global JWT guard, RBAC, and workspace-scoped access checks          |
| Data leakage between tenants | Centralized `WorkspaceAccessService` checks                         |
| Dependency vulnerabilities   | Lockfile enforcement and release-time dependency audit              |
