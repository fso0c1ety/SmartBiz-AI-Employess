# AI Setup Guide - Getting OpenAI API Key

## Step 1: Create OpenAI Account

1. Go to https://platform.openai.com
2. Click "Sign up" or "Sign in"
3. Complete registration (email verification required)

## Step 2: Get API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. **Save it somewhere safe** - you won't see it again!

## Step 3: Add to Backend

1. Open `backend/.env`
2. Replace this line:
```
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

With your actual key:
```
OPENAI_API_KEY="sk-YOUR_ACTUAL_KEY_HERE"
```

## Step 4: Test It

1. Restart the backend server
2. Try using AI chat or content generation
3. Check console for any errors

## Pricing

- Pay-as-you-go pricing
- **Embeddings**: $0.02 per 1M tokens
- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5**: Much cheaper

## What Works Without API Key

Without a valid API key, these still work:
- ✅ User registration/login
- ✅ Create businesses and agents
- ✅ View agents and memories
- ✅ Send messages (will get error but endpoint works)

These need the API key:
- ❌ AI chat responses
- ❌ Content generation
- ❌ Memory embeddings

## For Testing/Development

If you want to test without spending money:
1. Use GPT-3.5-turbo (cheaper)
2. Set OpenAI account spending limits
3. Get $5 free trial credits (sometimes available)

## Troubleshooting

### "Invalid API key"
- Make sure you copied the FULL key
- No extra spaces before/after

### "Rate limit exceeded"
- You've exceeded your API quota
- Check https://platform.openai.com/account/billing/overview

### "Insufficient quota"
- Add a payment method to your OpenAI account

---

**Once you have the key, paste it below and restart the backend!**
