# Add A Frontend To OrbitFlow

This guide explains how to add a frontend application without changing the backend foundation.

## 1. Choose The Frontend Shape

Pick the frontend based on the SaaS you are building:

| Product type         | Good fit                      |
| -------------------- | ----------------------------- |
| SaaS dashboard       | Next.js or React Router       |
| Internal tool        | Vite + React                  |
| Public content + app | Next.js                       |
| Mobile-first product | Expo / React Native           |
| Admin panel          | Vite + React + TanStack Query |

The backend does not require a specific frontend framework.

## 2. Create The App

Recommended location:

```text
apps/web
```

Example with Next.js:

```bash
pnpm create next-app apps/web --ts --tailwind --eslint --app
```

Example with Vite:

```bash
pnpm create vite apps/web --template react-ts
```

After creating the app, make sure its `package.json` has a workspace name:

```json
{
  "name": "@willtech/web"
}
```

Because `pnpm-workspace.yaml` already includes `apps/*`, the new frontend becomes part of the monorepo automatically.

## 3. Configure Environment Variables

For browser-based apps:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For Vite:

```env
VITE_API_URL=http://localhost:3001
```

Use the correct prefix for your framework.

## 4. Implement API Helpers

Create a small API client that knows the OrbitFlow envelope:

```typescript
type ApiEnvelope<T> = {
  data: T;
  meta?: { timestamp?: string };
};

export async function unwrapApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Request failed');
  }

  return (payload as ApiEnvelope<T>).data;
}
```

## 5. Implement Auth

Minimum expected flow:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- store `accessToken`;
- send `Authorization: Bearer <token>`;
- call `POST /api/v1/auth/refresh` when needed;
- clear auth state on refresh failure.

## 6. Protect Routes

Your frontend should protect private routes such as:

- dashboard;
- workspace settings;
- admin screens;
- billing;
- internal data views.

Public routes can include:

- landing page;
- public board pages;
- login;
- register;
- documentation pages.

## 7. Respect Multi-Tenancy

The frontend should always keep the active workspace explicit.

Recommended UI pattern:

- workspace selector in the app shell;
- active workspace stored in route, state, or URL;
- all workspace-owned screens fetch data through workspace-scoped endpoints;
- role-aware UI based on membership role.

## 8. Optional Docker Integration

If your frontend should run in Docker, add:

```text
infrastructure/docker/web/Dockerfile
```

Then add a `web` service to:

```text
infrastructure/docker/docker-compose.yml
docker-compose.production.yml
```

Finally, update:

```text
infrastructure/nginx/nginx.conf
```

Add a frontend upstream only after the frontend exists.

## 9. Quality Checklist

Before considering the frontend ready:

- [ ] API envelope handled correctly
- [ ] Auth refresh flow implemented
- [ ] Private routes protected
- [ ] Role-aware UI states
- [ ] Error states
- [ ] Loading states
- [ ] Empty states
- [ ] Mobile layout
- [ ] Environment variables documented
- [ ] Build passes in CI

## 10. Keep The Foundation Clean

Do not hard-code one product's frontend assumptions into the backend foundation.

If the frontend needs a new behavior, decide whether it belongs to:

- the domain module;
- a shared backend capability;
- frontend-only state;
- product-specific customization.
