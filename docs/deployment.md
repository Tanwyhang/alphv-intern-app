# Deployment Guide

Complete guide for deploying ALPHV ColorShapes to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Production Setup](#supabase-production-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Supabase account ([supabase.com](https://supabase.com))
- ✅ Vercel account ([vercel.com](https://vercel.com))
- ✅ Google Cloud Console project with OAuth credentials
- ✅ Custom domain (optional but recommended)

---

## Supabase Production Setup

### 1. Create Production Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `alphv-colorshapes-prod`
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier or Pro (recommended for production)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### 2. Run Database Migrations

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option B: Manual SQL Execution

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Run migrations in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_add_profile_insert_policy.sql`

### 3. Configure Authentication

#### Enable Google OAuth

1. Go to **Authentication → Providers**
2. Enable **Google** provider
3. Add credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Configure redirect URLs:
   - Add: `https://your-project.supabase.co/auth/v1/callback`
   - Add: `https://your-domain.com/auth/callback`

#### Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Edit OAuth 2.0 Client
4. Add **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   https://your-domain.com/auth/callback
   ```
5. Save changes

### 4. Configure Row Level Security

Verify RLS policies are enabled:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Should show rowsecurity = true for:
-- - profiles
-- - entries
```

### 5. Get Production Credentials

1. Go to **Settings → API**
2. Copy the following:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key (keep secret!)

---

## Vercel Deployment

### 1. Push Code to Git

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "feat: ready for production deployment"

# Add remote (GitHub example)
git remote add origin https://github.com/yourusername/alphv-intern-app.git

# Push
git push -u origin main
```

### 2. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or specific folder if monorepo)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3. Configure Environment Variables

Add all environment variables in Vercel dashboard:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important**: 
- Use **Production** environment for all variables
- Never commit `.env.local` to git
- Keep `service_role` key in Vercel only (not `NEXT_PUBLIC`)

### 4. Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for build
3. Vercel will provide a deployment URL (e.g., `https://your-app.vercel.app`)

---

## Environment Configuration

### Production Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJhbGci...` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production site URL | `https://app.example.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Secret | `GOCSPX-...` |

### Environment-Specific Configs

```typescript
// lib/config.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  oauth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
}
```

---

## Post-Deployment Steps

### 1. Verify Deployment

- [ ] Visit production URL
- [ ] Check login page loads
- [ ] Test Google OAuth login
- [ ] Verify redirect to correct dashboard
- [ ] Test CRUD operations (admin)
- [ ] Test real-time updates (multiple tabs)
- [ ] Check responsive design (mobile)

### 2. Create Admin User

1. Login with your Google account
2. Open [Supabase Dashboard](https://supabase.com/dashboard)
3. Navigate to **Table Editor → profiles**
4. Find your user row
5. Change `role` from `'user'` to `'admin'`
6. Refresh your app - should redirect to `/admin`

### 3. Configure Custom Domain (Optional)

#### In Vercel:

1. Go to **Settings → Domains**
2. Add your custom domain (e.g., `app.example.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5 minutes - 48 hours)

#### Update Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
```

#### Update OAuth Redirects:

1. **Supabase**: Add `https://app.example.com/auth/callback`
2. **Google Cloud**: Add same redirect URI

### 4. Enable Production Features

#### A. Analytics (Optional)

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### B. Error Tracking (Recommended)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: 'production',
})
```

### 5. Performance Optimization

#### Enable Caching

```typescript
// next.config.ts
export default {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, stale-while-revalidate=86400',
        },
      ],
    },
  ],
}
```

#### Image Optimization

- Use Next.js `<Image>` component
- Configure image domains in `next.config.ts`
- Enable WebP format

---

## Monitoring & Maintenance

### 1. Vercel Dashboard

Monitor:
- **Deployments**: Build status, duration
- **Analytics**: Page views, visitors
- **Functions**: Execution time, errors
- **Bandwidth**: Data transfer usage

### 2. Supabase Dashboard

Monitor:
- **Database**: Active connections, query performance
- **Auth**: Login activity, user growth
- **Storage**: Database size, backup status
- **API**: Request count, error rate

### 3. Set Up Alerts

#### Vercel Alerts

1. Go to **Settings → Alerts**
2. Enable:
   - Deployment failed
   - Excessive bandwidth usage
   - Function errors

#### Supabase Alerts

1. Go to **Settings → Alerts**
2. Enable:
   - Database approaching limit
   - High error rate
   - Unusual activity

### 4. Regular Maintenance

#### Weekly:
- [ ] Check error logs
- [ ] Review analytics
- [ ] Monitor database size

#### Monthly:
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Database backup verification
- [ ] Performance audit

#### Quarterly:
- [ ] Major version updates
- [ ] Security audit
- [ ] User feedback review
- [ ] Feature prioritization

---

## Troubleshooting

### Deployment Fails

**Error**: `Build failed`

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `npm run build` locally to test
4. Check TypeScript errors
5. Verify Next.js config

### OAuth Not Working

**Error**: `Redirect URI mismatch`

**Solutions**:
1. Verify redirect URIs in Google Cloud Console
2. Check `NEXT_PUBLIC_SITE_URL` is correct
3. Ensure Supabase has correct redirect URI
4. Clear browser cookies and retry

### Database Connection Issues

**Error**: `Failed to fetch`

**Solutions**:
1. Check Supabase project status
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Review Supabase logs for errors
5. Check Row Level Security policies

### Real-time Not Working

**Error**: `WebSocket connection failed`

**Solutions**:
1. Verify Realtime is enabled in Supabase
2. Check browser console for errors
3. Test on different network (firewalls may block WebSockets)
4. Verify RLS policies allow reading

### Performance Issues

**Symptoms**: Slow page loads, high latency

**Solutions**:
1. Enable Vercel Edge Network
2. Optimize database queries (add indexes)
3. Implement pagination for large datasets
4. Use Vercel Analytics to identify slow pages
5. Consider upgrading Supabase plan

---

## Rollback Procedure

If deployment causes issues:

### 1. Instant Rollback (Vercel)

1. Go to **Deployments** in Vercel
2. Find last working deployment
3. Click **"⋯"** → **"Promote to Production"**
4. Confirms rollback

### 2. Database Rollback (Supabase)

1. Go to **Database → Backups**
2. Select backup from before issue
3. Restore backup
4. Verify data integrity

### 3. Code Rollback (Git)

```bash
# Revert last commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

---

## Production Checklist

Before going live:

### Security
- [ ] All RLS policies enabled
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] OAuth redirect URIs whitelisted
- [ ] Service role key kept secret

### Performance
- [ ] Database indexed
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN enabled (Vercel default)

### Monitoring
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Alerts set up
- [ ] Backup schedule verified

### Testing
- [ ] Login/logout works
- [ ] CRUD operations work (admin)
- [ ] Real-time updates work
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Documentation
- [ ] README updated
- [ ] API docs complete
- [ ] Architecture documented
- [ ] Deployment guide reviewed

---

## Support Resources

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Community**: [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- **Documentation**: See `docs/` folder

---

**Last Updated**: October 2025

**Deployment Status**: 🚀 Ready for Production
