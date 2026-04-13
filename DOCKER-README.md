# 🐳 Docker Setup - PKDAC Project

## Files Created

1. **Dockerfile** - Multi-stage build for optimized production image
2. **docker-compose.yml** - Complete stack with MySQL, App, and Adminer
3. **.dockerignore** - Excludes unnecessary files from Docker context
4. **prisma/init.sql** - Database initialization script
5. **docker-start.bat** - Interactive menu for Windows users
6. **DOCKER.md** - Detailed documentation

## Configuration Changes

### next.config.js
- Added `output: "standalone"` for optimized Docker builds

## Quick Start Guide

### Option 1: Using the Batch Script (Windows)
```bash
docker-start.bat
```

### Option 2: Using Docker Compose Commands

```bash
# Build and start all services
docker-compose up -d

# View application logs
docker-compose logs -f app

# Access the application
# App: http://localhost:3000
# Adminer (DB Admin): http://localhost:8080
```

## Architecture

```
┌─────────────────┐
│   Next.js App   │ :3000
│  (pkdac-app)    │
└────────┬────────┘
         │
         │ depends on
         ▼
┌─────────────────┐
│   MySQL 8.0     │ :3306
│  (pkdac-mysql)  │
└─────────────────┘

┌─────────────────┐
│   Adminer       │ :8080
│ (pkdac-adminer) │
└─────────────────┘
```

## Services

| Service   | Port | Description                    |
|-----------|------|--------------------------------|
| App       | 3000 | Next.js Application            |
| MySQL     | 3306 | Database Server                |
| Adminer   | 8080 | Web-based Database Management  |

## Common Commands

### Development
```bash
# Rebuild app after code changes
docker-compose up -d --build app

# Run migrations
docker-compose exec app npx prisma migrate dev

# Seed database
docker-compose exec app npm run db:seed
```

### Database Operations
```bash
# Generate Prisma Client
docker-compose exec app npx prisma generate

# Push schema changes
docker-compose exec app npx prisma db push

# Check migration status
docker-compose exec app npx prisma migrate status
```

### Troubleshooting
```bash
# Check service status
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart app service
docker-compose restart app

# Access app container shell
docker-compose exec app sh

# Access MySQL shell
docker-compose exec mysql mysql -u pkdac_user -p pkdac_db
```

## Environment Variables

Before deploying to production, update these in `docker-compose.yml`:

- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `RESEND_API_KEY` - Your Resend email API key
- `RESEND_FROM_EMAIL` - Your sender email address

## Production Checklist

- [ ] Create `.env` file with real credentials
- [ ] Update `NEXTAUTH_SECRET` with a secure random string
- [ ] Set up SSL/TLS with a reverse proxy (nginx/traefik)
- [ ] Configure automated backups for MySQL volume
- [ ] Set resource limits in docker-compose.yml
- [ ] Use Docker secrets for sensitive data
- [ ] Enable health checks
- [ ] Set up monitoring and logging

## Notes

- Database data persists in Docker volume `mysql_data`
- The app container automatically runs migrations on startup
- Adminer provides a web UI for database management
- Multi-stage build keeps the final image size small
- The container runs as a non-root user for security

## Troubleshooting

### MySQL Connection Issues
```bash
# Wait for MySQL to be ready (takes ~10-20 seconds to start)
docker-compose logs -f mysql
```

### Prisma Client Errors
```bash
# Regenerate Prisma Client
docker-compose exec app npx prisma generate
```

### Port Conflicts
If ports 3000, 3306, or 8080 are already in use, edit `docker-compose.yml` and change the port mappings:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

## Clean Up

```bash
# Stop all services
docker-compose down

# Stop and remove all data (WARNING: deletes everything)
docker-compose down -v
```
