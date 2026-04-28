# MatchMyInterview — Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com → New Project
2. Once created, go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`     

3. Go to **SQL Editor** → paste contents of `supabase_schema.sql` → Run

4. Go to **Authentication → Settings**:
   - Enable **Anonymous sign-ins**
   - Enable **Email OTP** (under Email provider)

## Step 2: Create Agora Project

1. Go to https://console.agora.io → Create Project (Testing mode is fine)
2. Copy **App ID** → `NEXT_PUBLIC_AGORA_APP_ID`
3. Copy **App Certificate** → `AGORA_APP_CERTIFICATE`

> ⚠️ For MVP/testing, tokens are set to `null` (no token auth). For production, implement an Agora token server.

## Step 3: Create Razorpay Account

1. Go to https://dashboard.razorpay.com → Settings → API Keys
2. Generate keys and copy:
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

> Use **Test Mode** keys for development.

## Step 4: Fill in .env.local

Edit `/matchmyinterview/.env.local` with all the keys above.

## Step 5: Run the App

```bash
cd matchmyinterview
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

```bash
npm install -g vercel
vercel --cwd matchmyinterview
```

Add all env vars in Vercel dashboard under Project → Settings → Environment Variables.
