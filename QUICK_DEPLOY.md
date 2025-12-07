# 🚀 SmartBiz AI Employees - Deploy Backend & Build APK

## Quick 5-Step Deployment

### Step 1: Deploy Backend to Railway (5 minutes)

1. **Go to [Railway.app](https://railway.app)**
   - Click "Sign up" → Select "Sign up with GitHub"
   - Authorize Railway to access your GitHub

2. **Create New Project**
   - Click "+ New Project"
   - Select "Deploy from GitHub repo"
   - Search for and select `SmartBiz-AI-Employees`
   - Click "Deploy Now"

3. **Configure Root Directory**
   - Railway will ask "Which service would you like to deploy?"
   - Since this is a monorepo, you need to manually set the root
   - In your Railway dashboard:
     - Go to Settings
     - Set "Root Directory" to: `backend`
   - Click Save

4. **Wait for Auto-Detection**
   - Railway will detect the Node.js backend
   - It will auto-detect the Dockerfile in the backend folder
   - Wait for the build to complete (~3-5 minutes)

5. **Add Environment Variables**
   - Once deployed, click on the "backend" service
   - Go to "Variables" tab
   - Add these variables:
     ```
     JWT_SECRET = your-super-secret-jwt-key-production
     DEEPSEEK_API_KEY = sk-5a98cdbd57ad43f38a2c705f29e39051
     DEEPSEEK_MODEL = deepseek-chat
     DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
     NODE_ENV = production
     ALLOWED_ORIGINS = *
     PORT = 5001
     ```

6. **Get Your Backend URL**
   - In Railway, your backend service shows a URL like:
   - `https://smartbiz-backend-prod.railway.app` ← **Copy this!**

---

### Step 2: Update Frontend with Backend URL

1. **Update Environment Variable**
   - Open `.env` file in your project root
   - Replace the API URL with your Railway URL:
     ```
     EXPO_PUBLIC_API_URL=https://smartbiz-backend-prod.railway.app/api
     REACT_APP_API_URL=https://smartbiz-backend-prod.railway.app/api
     ```

2. **Add GitHub Secret (for APK builds)**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: `https://smartbiz-backend-prod.railway.app/api` ← Your Railway URL
   - (Optional fallback) Add `REACT_APP_API_URL` with the same value
   - Click "Add secret"

---

### Step 3: Push to GitHub (Trigger APK Build)

```bash
# Commit your changes
git add .
git commit -m "Deploy backend to Railway and update API URL"

# Push to GitHub
git push origin main
```

---

### Step 4: Monitor APK Build

1. **Watch GitHub Actions**
   - Go to your repo → "Actions" tab
   - You'll see "Build Android APK" workflow running
   - Wait ~10-15 minutes for the build to complete

2. **Download APK**
   - Once done, click the workflow run
   - Scroll down to "Artifacts"
   - Download `smartbiz-ai-employees-xxx`

---

### Step 5: Install & Test on Phone

1. **Transfer APK to Phone**
   - Email it to yourself, or
   - Use ADB: `adb install path/to/apk`

2. **Install APK**
   - Open the file on your phone
   - Click "Install"
   - Grant permissions if needed

3. **Test the App**
   - Sign up / Login
   - Chat with an AI agent
   - Create new agents
   - Everything should work from anywhere! ✅

---

## 🎉 You're Done!

Your backend is now live on Railway and your APK works worldwide!

---

## Troubleshooting

### APK can't connect to backend
- **Problem**: "Cannot reach server" error
- **Solution**: 
  1. Check Railway URL is correct in `.env`
  2. Test URL in browser: `https://your-railway-url/health`
  3. Make sure `ALLOWED_ORIGINS = *` in Railway

### Railway build failed
- **Problem**: "Build failed" in Railway dashboard
- **Solution**:
  1. Click the failed deployment
  2. Check the logs for error
  3. Common fixes:
     - Ensure `backend/package.json` exists
     - Check `backend/src/server.ts` exists
     - Verify `DEEPSEEK_API_KEY` is set

### APK install fails
- **Problem**: "App not installed" or "Parse error"
- **Solution**:
  1. Ensure Android version matches (API 21+)
  2. Clear app cache: Settings → Apps → Clear Storage
  3. Try different device or emulator

---

## Optional: Create Release Tags for APK Versions

```bash
# Create a version tag
git tag -a v1.0.0 -m "Version 1.0.0 - Deployed"

# Push the tag
git push origin v1.0.0
```

This will automatically create a GitHub Release with the APK attached!

