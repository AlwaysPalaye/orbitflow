# Frontend Integration Guide

OrbitFlow is intentionally backend-first.

This repository does **not** include a required frontend application. That is a product decision: every SaaS has its own audience, workflows, visual language, and business model. A CRM, a finance platform, and a community product should not inherit the same UI just because they share a backend foundation.

Use this document to connect any frontend to the OrbitFlow API.

## Recommended Placement

When you decide to add a frontend, create it inside `apps/`:

```text
apps/
|-- api/        # Existing NestJS API
`-- web/        # Your frontend app, created by you or by an AI assistant
```

Common options:

| Use case           | Suggested frontend                       |
| ------------------ | ---------------------------------------- |
| SaaS dashboard     | Next.js, Remix, React Router             |
| Marketing + app    | Next.js                                  |
| Internal tool      | React + Vite                             |
| Mobile app         | React Native or Expo                     |
| Admin-only client  | Vite + React                             |
| Enterprise web app | Next.js with server-side auth middleware |

## API Contract

The API base path is:

```text
http://localhost:3001/api/v1
```

Successful responses are wrapped in an envelope:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-05-19T00:00:00.000Z"
  }
}
```

Errors are wrapped like this:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "statusCode": 401,
    "message": "Unauthorized",
    "path": "/api/v1/workspaces",
    "timestamp": "2026-05-19T00:00:00.000Z"
  }
}
```

Your frontend should always unwrap `response.data.data` when using Axios, or `payload.data` when using `fetch`.

## Authentication Flow

1. User registers or logs in.
2. API returns `accessToken` and `refreshToken`.
3. Frontend stores the access token in memory or a secure client store.
4. Frontend sends authenticated requests with:

```http
Authorization: Bearer <accessToken>
```

5. When the access token expires, call:

```http
POST /api/v1/auth/refresh
```

6. If refresh fails, clear auth state and redirect to login.

For production security, prefer HTTP-only cookies if your deployment model supports them. If you use local storage, keep the implementation simple and understand the XSS tradeoff.

## Minimal API Client Example

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ApiEnvelope<T> = {
  data: T;
  meta?: {
    timestamp?: string;
  };
};

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Request failed');
  }

  return (payload as ApiEnvelope<T>).data;
}
```

## Frontend Responsibilities

Your frontend should implement:

- login and registration pages;
- token storage and refresh flow;
- workspace selector;
- role-aware navigation;
- API error handling;
- loading and empty states;
- route protection;
- responsive layouts;
- product-specific domain screens.

OrbitFlow provides the backend structure. The frontend should express the product.

## How To Add A Frontend

Read the full implementation guide:

- [Add Frontend Guide](./frontend/ADD_FRONTEND.md)

If you want AI assistance, start with:

- [Frontend App Prompt](./ai/FRONTEND_APP_PROMPT.md)
- [How To Instruct AI](./ai/HOW_TO_INSTRUCT_AI.md)

## Design Principle

Do not copy a generic dashboard just to have a frontend.

Define the product first:

- Who is the user?
- What job are they trying to complete?
- Which data do they need to see first?
- Which actions must be fast?
- Which screens require role-based access?
- Which workflows are public, private, or admin-only?

Then build the frontend around that product.
