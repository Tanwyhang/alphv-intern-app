# Setup Instructions

## 1. Run Database Migrations

```bash
npx supabase db reset
```

This will create the `profiles` and `entries` tables with RLS policies.

## 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`
6. Copy Client ID and Client Secret
7. Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 3. Start Supabase

```bash
npx supabase start
```

## 4. Create Admin User

After first login, update your role to admin in Supabase Studio:

1. Open http://127.0.0.1:54323
2. Go to Table Editor → profiles
3. Find your user and change role from 'user' to 'admin'

## 5. Start Next.js

```bash
npm run dev
```

Visit http://localhost:3000/login
