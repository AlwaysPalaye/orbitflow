# Self-Hosting OrbitFlow

Deploy your own OrbitFlow backend foundation on a VPS, cloud server, EasyPanel, Coolify, or Portainer.

OrbitFlow is backend-first. The default deployment includes:

- PostgreSQL
- Redis
- NestJS API
- NGINX API gateway

Add your frontend as a separate app, static deployment, mobile app, or optional Docker service when your product needs it.

## Requirements

- 1 vCPU and 1GB RAM minimum for small testing environments
- Docker and Docker Compose
- A domain name for production

## Quick Start

```bash
git clone https://github.com/AlwaysPalaye/orbitflow.git
cd orbitflow
cp .env.example .env
```

The root `.env` file is used by Docker Compose. For local API development outside Docker, copy the same example to `apps/api/.env`.

Generate secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Set at least:

```env
POSTGRES_PASSWORD=your_strong_db_password
REDIS_PASSWORD=your_strong_redis_password
JWT_SECRET=your_32_char_or_longer_secret
JWT_REFRESH_SECRET=another_32_char_or_longer_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

Deploy:

```bash
docker compose -f docker-compose.production.yml up -d
```

Verify:

```bash
docker compose -f docker-compose.production.yml ps
curl http://localhost/health
```

## Architecture

```text
Internet
  |
  v
NGINX (:80)
  |
  v
API (:3001)
  |
  |-- PostgreSQL (:5432)
  `-- Redis (:6379)
```

Only NGINX is exposed publicly by default.

## Adding A Frontend

You can deploy a frontend in one of three ways:

1. Separate host/CDN, such as Vercel, Netlify, Cloudflare Pages, or S3/R2.
2. Separate Docker service in the same compose file.
3. Mobile or desktop client calling the public API.

If you add a Docker frontend service, update:

- `docker-compose.production.yml`
- `infrastructure/nginx/nginx.conf`
- `CORS_ORIGIN`

See:

- `docs/FRONTEND_GUIDE.md`
- `docs/frontend/ADD_FRONTEND.md`

## EasyPanel Deployment

1. Create a custom Docker Compose app.
2. Point it to your GitHub repository.
3. Set compose file path to `docker-compose.production.yml`.
4. Add environment variables.
5. Deploy.

## Coolify Deployment

1. Add a Docker Compose project.
2. Point it to your repository URL.
3. Set compose file to `docker-compose.production.yml`.
4. Configure environment variables.
5. Deploy.

## Updating

```bash
git pull origin main
docker compose -f docker-compose.production.yml up -d --build
```

## Backups

```bash
docker exec orbitflow-postgres pg_dump -U orbitflow orbitflow > backup_$(date +%Y%m%d).sql
cat backup_YYYYMMDD.sql | docker exec -i orbitflow-postgres psql -U orbitflow orbitflow
```

## Production Notes

- Terminate HTTPS at your platform, load balancer, or NGINX.
- Keep `CORS_ORIGIN` aligned with your frontend domain.
- Rotate secrets before publishing a public repository.
- Review `pnpm audit` before production releases.
- Review audit event coverage, retention, and export needs before handling sensitive customer data.
