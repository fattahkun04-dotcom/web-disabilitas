# Docker Scripts

## Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Development Workflow

```bash
# Rebuild the app container after code changes
docker-compose up -d --build app

# Run database migrations
docker-compose exec app npx prisma migrate dev

# Seed the database
docker-compose exec app npm run db:seed

# Access the app
# http://localhost:3000
# Adminer: http://localhost:8080
```

## Database Management

```bash
# Generate Prisma Client
docker-compose exec app npx prisma generate

# Push schema changes (development)
docker-compose exec app npx prisma db push

# Run migrations (production)
docker-compose exec app npx prisma migrate deploy

# View database status
docker-compose exec app npx prisma migrate status

# Open Prisma Studio (alternative to Adminer)
docker-compose exec app npx prisma studio
```

## Troubleshooting

```bash
# Check service status
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart a specific service
docker-compose restart app

# Access app shell
docker-compose exec app sh

# Access MySQL shell
docker-compose exec mysql mysql -u pkdac_user -p pkdac_db
```

## Environment Variables

Update the `environment` section in `docker-compose.yml` with your actual values:

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: Your sender email address
- `NEXTAUTH_SECRET`: A secure random string for NextAuth

## Production Deployment

For production, consider:

1. Use `.env` file instead of hardcoding in docker-compose.yml
2. Set up proper secrets management
3. Use a reverse proxy (nginx/traefik) for SSL
4. Configure proper backup for MySQL volumes
5. Set resource limits in docker-compose.yml
