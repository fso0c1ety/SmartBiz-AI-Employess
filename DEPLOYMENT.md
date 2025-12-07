# SmartBiz AI Employees - Deployment Guide

## Quick Deployment to Railway.app

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Create a new project

### Step 2: Deploy Backend

#### Option A: Deploy from GitHub (Recommended)
1. In Railway, click "New Project" → "Deploy from GitHub repo"
2. Select your SmartBiz-AI-Employees repository
3. Railway will auto-detect and ask to deploy the backend
4. Set the following environment variables in Railway dashboard:

```
DATABASE_URL = postgresql://[auto-filled-by-railway]
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
DEEPSEEK_API_KEY = sk-5a98cdbd57ad43f38a2c705f29e39051
DEEPSEEK_MODEL = deepseek-chat
DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
PORT = 5001
NODE_ENV = production
ALLOWED_ORIGINS = https://your-apk-domain.com,https://your-frontend-domain.com
```

5. Railway will automatically:
   - Build the Docker image
   - Run migrations
   - Deploy the backend
   - Generate a public URL (e.g., `https://smartbiz-backend-prod.railway.app`)

#### Option B: Deploy from CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

### Step 3: Get Your Backend URL
After deployment, Railway will provide a public URL like:
```
https://smartbiz-backend-prod.railway.app
```

### Step 4: Update Frontend API URL

Update `src/services/api.service.ts`:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'https://smartbiz-backend-prod.railway.app/api';
```

Or use environment variables for EAS builds:
```bash
# Create a .env.production file
REACT_APP_API_URL=https://your-railway-backend-url/api
```

### Step 5: Update GitHub Actions (Optional)
If you want to use environment variables in the APK build:

Add to your GitHub repository secrets:
- `BACKEND_URL` = `https://your-railway-backend-url`

Then update the workflow to pass it to the build.

### Step 6: Build APK
```bash
# Push to GitHub to trigger workflow
git add .
git commit -m "Deploy backend and build APK"
git push origin main

# Or manually trigger in GitHub Actions
```

The APK will be built with the new backend URL and available for download in the workflow artifacts.

---

## Database Setup

Railway provides PostgreSQL automatically, but make sure:

1. In Railway dashboard, add a PostgreSQL plugin
2. Database URL is automatically set as `DATABASE_URL`
3. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

---

## Environment Variables Summary

### Production (Railway)
```
DATABASE_URL = postgresql://... (auto-filled)
JWT_SECRET = your-secure-key
DEEPSEEK_API_KEY = your-deepseek-key
DEEPSEEK_MODEL = deepseek-chat
NODE_ENV = production
PORT = 5001
ALLOWED_ORIGINS = https://your-domain.com
```

### Frontend (.env.production)
```
REACT_APP_API_URL = https://your-railway-backend-url/api
```

---

## Testing

1. Get your Railway backend URL from the dashboard
2. Test it: `curl https://your-backend-url/health`
3. Update frontend and rebuild APK
4. Install APK on phone
5. Test authentication and chat features

---

## Cost

Railway offers:
- **Free tier**: $5 credit/month (usually enough for development)
- **Pay-as-you-go**: PostgreSQL + Node.js typically costs $5-20/month for light usage
- No credit card required for free tier

---

## Troubleshooting

### Backend not deploying
- Check Railway logs in dashboard
- Ensure `backend/package.json` has correct `main` entry
- Verify environment variables are set

### APK can't connect to backend
- Test backend URL in browser: `https://your-url/health`
- Check `ALLOWED_ORIGINS` includes your frontend domain
- Ensure API URL in frontend matches Railway URL

### Database migrations failing
- Run manually: `railway run npx prisma migrate deploy`
- Check database logs in Railway dashboard

