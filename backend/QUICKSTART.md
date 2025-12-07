# Quick Start Guide

## 1. Install Dependencies
```bash
cd backend
npm install
```

## 2. Set Up Database

### Using Supabase (Easiest)
1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize
4. Go to Settings → Database → Connection String
5. Copy URI and add to `.env` as `DATABASE_URL`

### Using Local PostgreSQL
```bash
# Install PostgreSQL and pgvector
createdb smartbiz_ai
psql smartbiz_ai -c "CREATE EXTENSION vector;"
```

## 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

## 4. Run Migrations
```bash
npx prisma generate
npx prisma db push
```

## 5. Start Server
```bash
npm run dev
```

Server runs on http://localhost:5000

## 6. Test API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Create Business
```bash
curl -X POST http://localhost:5000/api/business/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Business","industry":"Technology","brandTone":"professional"}'
```

### Create Agent
```bash
curl -X POST http://localhost:5000/api/agent/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"businessId":"BUSINESS_ID","agentName":"Marketing Manager"}'
```

### Chat with Agent
```bash
curl -X POST http://localhost:5000/api/agent/AGENT_ID/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Create a social media post about our new product"}'
```

## 7. View Database
```bash
npx prisma studio
```

Opens GUI at http://localhost:5555

---

That's it! Your backend is ready. 🚀
