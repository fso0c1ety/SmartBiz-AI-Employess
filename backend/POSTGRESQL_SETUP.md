# Free PostgreSQL Setup Guide

## Option 1: Supabase (RECOMMENDED - Easiest & Best Free Tier)

**Best for**: Beginners, quick setup, includes pgvector out of the box

### Steps:

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email/GitHub
4. Create a new organization and project
5. Wait 2-5 minutes for database initialization
6. Go to **Settings → Database → Connection string**
7. Copy the **URI** (looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)
8. Add to `.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres"
```

### Benefits:
- ✅ 500MB free storage
- ✅ pgvector pre-installed (for embeddings)
- ✅ Real PostgreSQL database
- ✅ Easy backup & restore
- ✅ No credit card required
- ✅ Perfect for development & testing

---

## Option 2: Railway (Alternative Cloud - Free Tier)

**Best for**: Simple setup with free credits

### Steps:

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Select **PostgreSQL**
4. Railway generates a free database
5. Click on **PostgreSQL** plugin
6. Go to **Connect** tab
7. Copy **Database URL**
8. Add to `.env`:
```
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"
```

### Benefits:
- ✅ $5 free credits monthly
- ✅ PostgreSQL included
- ✅ Easy to deploy backend too
- ✅ No credit card needed initially

---

## Option 3: Docker (Local - Completely Free)

**Best for**: Full local development, no internet needed

### Prerequisites:
- Download Docker Desktop from https://www.docker.com/products/docker-desktop

### Steps:

1. **Install Docker Desktop** (free community edition)
2. **Create `docker-compose.yml`** in your backend folder:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: smartbiz_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: localpassword123
      POSTGRES_DB: smartbiz_ai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    command:
      - "postgres"
      - "-c"
      - "shared_preload_libraries=vector"

volumes:
  postgres_data:
```

3. **Add pgvector** to your local setup:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg15
    # ... rest of config
```

4. **Start PostgreSQL**:
```bash
docker-compose up -d
```

5. **Add to `.env`**:
```
DATABASE_URL="postgresql://postgres:localpassword123@localhost:5432/smartbiz_ai"
```

6. **Verify connection**:
```bash
docker-compose ps
```

### Benefits:
- ✅ Completely free
- ✅ No internet needed once running
- ✅ Full local control
- ✅ Easy to reset/backup
- ✅ pgvector included

### Useful Docker Commands:
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs postgres

# Connect to database
docker exec -it smartbiz_postgres psql -U postgres -d smartbiz_ai

# Reset database (delete all data)
docker-compose down -v
docker-compose up -d
```

---

## Option 4: PostgreSQL Local Installation (Windows)

**Best for**: Permanent local setup

### Steps:

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run installer
3. Choose installation directory
4. Set password for `postgres` user (remember this!)
5. Port: Keep as 5432
6. Finish installation

### Install pgvector extension:

1. Download pgvector from https://github.com/pgvector/pgvector/releases
2. Extract to PostgreSQL folder
3. Run command in pgAdmin or psql:
```sql
CREATE EXTENSION vector;
```

### Create database:

```bash
# Open PowerShell
psql -U postgres

# Then in psql:
CREATE DATABASE smartbiz_ai;
\c smartbiz_ai
CREATE EXTENSION vector;
\q
```

### Add to `.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartbiz_ai"
```

### Benefits:
- ✅ Completely free
- ✅ Permanent local setup
- ✅ No Docker needed
- ✅ Full control

---

## Option 5: Render (Free Tier)

**Best for**: If you want database + backend in one place

### Steps:

1. Go to https://render.com
2. Sign up with GitHub
3. Create new **PostgreSQL** database
4. Free tier includes 1 database
5. Copy connection string
6. Add to `.env`

### Benefits:
- ✅ Free tier available
- ✅ Can deploy backend here too
- ✅ Easy integration

---

## Quick Comparison

| Option | Cost | Setup Time | pgvector | Best For |
|--------|------|-----------|----------|----------|
| **Supabase** | Free | 5 min | ✅ Yes | Beginners |
| **Railway** | Free credits | 5 min | ✅ Yes | Quick start |
| **Docker** | Free | 10 min | ✅ Yes | Developers |
| **PostgreSQL Local** | Free | 15 min | ⚠️ Manual | Permanent |
| **Render** | Free | 10 min | ✅ Yes | Full stack |

---

## Setting Up Prisma After Database

Once you have a database and `.env` configured:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# View database GUI
npx prisma studio
```

---

## My Recommendation

**For beginners**: Use **Supabase**
- Easiest setup (5 minutes)
- pgvector already installed
- Free tier is generous
- Perfect for testing

**For local development**: Use **Docker**
- Completely free
- Full control
- Works offline
- Easy to reset

**For production later**: Upgrade Supabase to paid or migrate to Railway

---

## Troubleshooting

### Connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Your database isn't running. Start it with `docker-compose up -d`

### pgvector not found
```
Error: extension "vector" does not exist
```
→ Run `CREATE EXTENSION vector;` in your database

### Wrong password
```
FATAL: password authentication failed
```
→ Check your DATABASE_URL in `.env`

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::5432
```
→ Change port in docker-compose.yml to 5433

---

## Next Steps

1. Choose your preferred option
2. Set up database
3. Add `DATABASE_URL` to `.env`
4. Run `npx prisma db push`
5. Start developing!

Questions? Check the backend `README.md` for more details.
