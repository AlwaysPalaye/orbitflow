# API Reference - Quick Start

> Interactive Swagger documentation is available at `http://localhost:3001/docs` when `NODE_ENV` is not `production`.

## Response Envelope

All successful responses follow this format:

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-19T11:00:00.000Z"
  }
}
```

All error responses follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "statusCode": 401,
    "message": "Invalid credentials",
    "path": "/api/v1/auth/login",
    "timestamp": "2026-05-19T11:00:00.000Z"
  }
}
```

## Rate Limiting

| Tier   | Limit        | Window     |
| ------ | ------------ | ---------- |
| Short  | 3 requests   | 1 second   |
| Medium | 20 requests  | 10 seconds |
| Long   | 100 requests | 60 seconds |

## Quick Examples

### Register

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "will@willtech.com",
    "password": "SecurePassword123!",
    "firstName": "Will",
    "lastName": "Tech"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "will@willtech.com",
    "password": "SecurePassword123!"
  }'
```

### Create Workspace (authenticated)

```bash
curl -X POST http://localhost:3001/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "description": "Product feedback board"
  }'
```

### Create Board (authenticated)

```bash
curl -X POST http://localhost:3001/api/v1/workspaces/WORKSPACE_ID/boards \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Feature Requests",
    "description": "Vote on what we build next",
    "isPublic": true,
    "color": "#6366f1"
  }'
```

### View Public Board (no auth)

```bash
curl http://localhost:3001/api/v1/public/my-company/feature-requests
```

### Submit Post (authenticated)

```bash
curl -X POST http://localhost:3001/api/v1/boards/BOARD_ID/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dark mode support",
    "description": "It would be great to have dark mode in the dashboard.",
    "category": "UI/UX"
  }'
```

### Toggle Vote (authenticated)

```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/votes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Health Check

```bash
curl http://localhost:3001/health
```
