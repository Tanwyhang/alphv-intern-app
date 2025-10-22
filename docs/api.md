# API Documentation

## Overview

This document describes the API architecture, endpoints, and data flows in the ALPHV ColorShapes application.

---

## API Architecture

The application uses **Supabase** as a Backend-as-a-Service (BaaS), which provides:

1. **Auto-generated REST API** - Based on database schema
2. **Real-time WebSocket API** - For live data synchronization
3. **Authentication API** - OAuth and session management
4. **RPC Functions** - Custom PostgreSQL functions (if needed)

### Base URLs

```
Development:  http://localhost:54321
Production:   https://[your-project].supabase.co
```

---

## Authentication API

### Google OAuth Login

**Endpoint**: Server Action (`login/google-actions.ts`)

```typescript
'use server'

export async function loginWithGoogle() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  return data.url
}
```

**Flow**:
1. Client calls server action
2. Server initiates OAuth flow with Google
3. User authenticates with Google
4. Google redirects to callback URL with code
5. Callback exchanges code for session
6. Session stored in HTTP-only cookie

### OAuth Callback

**Endpoint**: `GET /auth/callback`

**Query Parameters**:
- `code` (string, required) - OAuth authorization code
- `next` (string, optional) - Redirect URL after login

**Response**: Redirects to appropriate dashboard

```typescript
// app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, request.url))
}
```

### Sign Out

**Endpoint**: `POST /api/auth/signout`

**Response**: 
```json
{ "success": true }
```

```typescript
// app/api/auth/signout/route.ts
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
```

---

## Database API (Supabase REST API)

All database operations go through Supabase's auto-generated REST API. The client SDK handles the HTTP requests.

### Get Current User

```typescript
const { data: { user }, error } = await supabase.auth.getUser()
```

**Response**:
```typescript
{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    created_at: '2024-01-01T00:00:00Z',
    // ... other fields
  }
}
```

### Get User Profile

```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single()
```

**Response**:
```typescript
{
  id: 'uuid',
  role: 'admin' | 'user',
  created_at: '2024-01-01T00:00:00Z'
}
```

---

## Entries API

### List All Entries

```typescript
const { data: entries, error } = await supabase
  .from('entries')
  .select('*')
  .order('created_at', { ascending: false })
```

**SQL Equivalent**:
```sql
SELECT * FROM entries 
ORDER BY created_at DESC
```

**Response**:
```typescript
[
  {
    id: 'uuid',
    name: 'Blue Circle',
    shape: 'circle',
    color: '#3B82F6',
    created_by: 'user-uuid',
    created_at: '2024-01-01T12:00:00Z'
  },
  // ... more entries
]
```

**RLS Policy**: ✅ All authenticated users can read

### Create Entry

```typescript
const { data: entry, error } = await supabase
  .from('entries')
  .insert({
    name: 'Red Square',
    shape: 'square',
    color: '#EF4444',
  })
  .select()
  .single()
```

**SQL Equivalent**:
```sql
INSERT INTO entries (name, shape, color, created_by)
VALUES ('Red Square', 'square', '#EF4444', auth.uid())
RETURNING *
```

**Response**:
```typescript
{
  id: 'uuid',
  name: 'Red Square',
  shape: 'square',
  color: '#EF4444',
  created_by: 'user-uuid',
  created_at: '2024-01-01T12:00:00Z'
}
```

**RLS Policy**: ✅ Only admins can insert  
**Error (403)**: User doesn't have admin role

### Update Entry

```typescript
const { data: entry, error } = await supabase
  .from('entries')
  .update({
    name: 'Updated Name',
    color: '#10B981',
  })
  .eq('id', entryId)
  .select()
  .single()
```

**SQL Equivalent**:
```sql
UPDATE entries 
SET name = 'Updated Name', color = '#10B981'
WHERE id = 'entry-uuid'
RETURNING *
```

**Response**:
```typescript
{
  id: 'uuid',
  name: 'Updated Name',
  shape: 'square',
  color: '#10B981',
  created_by: 'user-uuid',
  created_at: '2024-01-01T12:00:00Z'
}
```

**RLS Policy**: ✅ Only admins can update  
**Error (403)**: User doesn't have admin role

### Delete Entry

```typescript
const { error } = await supabase
  .from('entries')
  .delete()
  .eq('id', entryId)
```

**SQL Equivalent**:
```sql
DELETE FROM entries 
WHERE id = 'entry-uuid'
```

**Response**: No data returned (success = no error)

**RLS Policy**: ✅ Only admins can delete  
**Error (403)**: User doesn't have admin role

---

## Real-time API

### Subscribe to Table Changes

The application uses Supabase Realtime to sync data across clients.

```typescript
const channel = supabase
  .channel('entries-changes')
  .on('postgres_changes', {
    event: '*',        // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'entries'
  }, (payload) => {
    console.log('Change received:', payload)
    
    // payload structure:
    // {
    //   eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    //   new: { ... },     // New row data
    //   old: { ... },     // Old row data (UPDATE/DELETE)
    //   table: 'entries',
    //   schema: 'public'
    // }
  })
  .subscribe()

// Cleanup
return () => { channel.unsubscribe() }
```

### Real-time Events

#### INSERT Event

```typescript
{
  eventType: 'INSERT',
  new: {
    id: 'uuid',
    name: 'New Entry',
    shape: 'circle',
    color: '#3B82F6',
    created_by: 'user-uuid',
    created_at: '2024-01-01T12:00:00Z'
  },
  old: null,
  table: 'entries',
  schema: 'public',
  commit_timestamp: '2024-01-01T12:00:00Z'
}
```

#### UPDATE Event

```typescript
{
  eventType: 'UPDATE',
  new: {
    id: 'uuid',
    name: 'Updated Entry',  // Changed
    shape: 'circle',
    color: '#10B981',       // Changed
    created_by: 'user-uuid',
    created_at: '2024-01-01T12:00:00Z'
  },
  old: {
    id: 'uuid',
    name: 'Old Name',
    shape: 'circle',
    color: '#3B82F6',
    created_by: 'user-uuid',
    created_at: '2024-01-01T12:00:00Z'
  },
  table: 'entries',
  schema: 'public',
  commit_timestamp: '2024-01-01T12:05:00Z'
}
```

#### DELETE Event

```typescript
{
  eventType: 'DELETE',
  new: null,
  old: {
    id: 'uuid',
    name: 'Deleted Entry',
    shape: 'circle',
    color: '#3B82F6',
    created_by: 'user-uuid',
    created_at: '2024-01-01T12:00:00Z'
  },
  table: 'entries',
  schema: 'public',
  commit_timestamp: '2024-01-01T12:10:00Z'
}
```

---

## Error Handling

### Common Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Invalid data format, missing required fields |
| 401 | Unauthorized | No session, invalid token |
| 403 | Forbidden | RLS policy violation, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate key, constraint violation |
| 500 | Internal Server Error | Database error, server misconfiguration |

### Error Response Format

```typescript
{
  error: {
    message: 'Error message',
    details: 'Additional details',
    hint: 'Suggestion to fix',
    code: 'ERROR_CODE'
  }
}
```

### Example: Permission Denied

```typescript
// Admin-only operation attempted by regular user
const { data, error } = await supabase
  .from('entries')
  .insert({ name: 'Test', shape: 'circle', color: '#000' })

// error:
{
  message: 'new row violates row-level security policy for table "entries"',
  details: null,
  hint: null,
  code: '42501'
}
```

### Error Handling Best Practices

```typescript
try {
  const { data, error } = await supabase
    .from('entries')
    .insert(newEntry)
  
  if (error) {
    // Handle Supabase error
    if (error.code === '42501') {
      toast.error('You don\'t have permission to create entries')
    } else {
      toast.error('Failed to create entry')
    }
    return
  }
  
  // Success
  toast.success('Entry created successfully')
} catch (error) {
  // Handle network or unexpected errors
  console.error('Unexpected error:', error)
  toast.error('An unexpected error occurred')
}
```

---

## Rate Limiting

Supabase implements rate limiting to prevent abuse:

### Default Limits

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Real-time connections**: 100 concurrent connections per project

### Headers

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### Best Practices

1. **Batch operations** when possible
2. **Cache data** on the client
3. **Use real-time** instead of polling
4. **Implement exponential backoff** for retries

---

## Data Validation

### Client-Side Validation

```typescript
// Form validation
const schema = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  shape: {
    required: true,
    enum: ['box', 'circle', 'cone', 'cuboid', 'cylinder', 'diamond', 'heart', 'hexagon'],
  },
  color: {
    required: true,
    pattern: /^#[0-9A-Fa-f]{6}$/,  // Hex color
  },
}
```

### Server-Side Validation

Database constraints enforce data integrity:

```sql
-- NOT NULL constraints
ALTER TABLE entries 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN shape SET NOT NULL,
  ALTER COLUMN color SET NOT NULL;

-- CHECK constraints (if needed)
ALTER TABLE entries 
  ADD CONSTRAINT valid_color 
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

---

## Performance Optimization

### Query Optimization

```typescript
// ✅ Good: Select only needed columns
const { data } = await supabase
  .from('entries')
  .select('id, name, shape, color, created_at')
  .order('created_at', { ascending: false })
  .limit(50)

// ❌ Bad: Select all columns without limits
const { data } = await supabase
  .from('entries')
  .select('*')
```

### Pagination

```typescript
const pageSize = 50
const page = 1

const { data, count } = await supabase
  .from('entries')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

### Caching

```typescript
// Use SWR or React Query for automatic caching
import useSWR from 'swr'

function useEntries() {
  return useSWR('entries', async () => {
    const { data } = await supabase
      .from('entries')
      .select('*')
    return data
  })
}
```

---

## Testing

### Example API Tests

```typescript
import { createClient } from '@/lib/supabase'

describe('Entries API', () => {
  it('should fetch all entries', async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('entries')
      .select('*')
    
    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
  })
  
  it('should create entry as admin', async () => {
    // Test with admin credentials
    const { data, error } = await supabase
      .from('entries')
      .insert({
        name: 'Test Entry',
        shape: 'circle',
        color: '#000000'
      })
    
    expect(error).toBeNull()
    expect(data).toHaveProperty('id')
  })
  
  it('should deny create entry as user', async () => {
    // Test with user credentials
    const { error } = await supabase
      .from('entries')
      .insert({
        name: 'Test Entry',
        shape: 'circle',
        color: '#000000'
      })
    
    expect(error).toBeTruthy()
    expect(error.code).toBe('42501')
  })
})
```

---

## Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**Last Updated**: October 2025
