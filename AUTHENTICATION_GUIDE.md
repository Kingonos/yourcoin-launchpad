# Authentication Guide

## Overview

Your application now includes complete authentication system using Supabase. Users can sign up, sign in, and manage their session with automatic logout functionality.

## Features

### 1. Sign Up / Sign In
- **Location**: `/auth` page
- **Methods**: Email and password
- **Validation**:
  - Email must be valid format
  - Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
- **Confirmation**: Account created immediately (no email confirmation required)

### 2. Session Management
- Sessions persist across page refreshes
- Real-time auth state updates
- Automatic session sync across browser tabs

### 3. User Menu
- **Location**: Header dropdown (top right)
- **Shows**: User's email address
- **Options**:
  - View current email
  - Sign Out (logout)

### 4. Protected Routes
- Use the `ProtectedRoute` component to protect pages that require authentication
- Non-authenticated users are automatically redirected to `/auth`

## How to Use

### For Users

#### Signing Up
1. Go to `/auth`
2. Click "Sign Up" tab
3. Enter email and password (must meet requirements)
4. Click "Sign Up"
5. Account is created immediately
6. You can now sign in

#### Signing In
1. Go to `/auth`
2. Click "Sign In" tab (default)
3. Enter your email and password
4. Click "Sign In"
5. You'll be redirected to home page
6. Your email appears in header

#### Signing Out
1. Click on your email in the header
2. Click "Sign Out"
3. Session ends, you're logged out
4. Redirected to home page

### For Developers

#### Adding Authentication to a Page

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

// In your App.tsx routes:
<Route path="/my-page" element={
  <ProtectedRoute>
    <MyPage />
  </ProtectedRoute>
} />
```

#### Checking Authentication Status in a Component

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    console.log('User logged in:', session.user.email);
  } else {
    console.log('User logged out');
  }
});
```

#### Get User Information

```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user.id);
console.log('Email:', user.email);
```

## Database Tables

User data is stored in Supabase `auth.users` table (built-in):
- `id`: UUID (unique identifier)
- `email`: User's email address
- `created_at`: Account creation timestamp
- `last_sign_in_at`: Last login timestamp

## Security Notes

1. **Passwords** are hashed securely by Supabase
2. **Sessions** are stored as secure tokens
3. **No email confirmation** is required (emails are trusted)
4. **HTTPS only** - authentication only works over HTTPS in production
5. **Never expose** the `SUPABASE_ANON_KEY` in backend code

## Current Routes

- `/auth` - Sign in / Sign up page
- `/` - Home page (public)
- `/mint` - Mint page (public)
- `/swap` - Swap page (public)
- `/mining` - Mining page (public)
- `/treasury` - Treasury page (requires authentication)
- `/admin` - Admin panel (requires authentication + admin role)

## How Authentication Flows Work

### Sign Up Flow
1. User enters email + password
2. Supabase creates new user account
3. Session is created automatically
4. User sees success message
5. Can continue as authenticated user

### Sign In Flow
1. User enters email + password
2. Supabase verifies credentials
3. Session is created if valid
4. User redirected to home
5. Header shows user's email

### Sign Out Flow
1. User clicks "Sign Out" in header
2. Supabase session is destroyed
3. Header shows "Sign In" button again
4. Redirected to home page

## Troubleshooting

### "Invalid login credentials" error
- Email or password is incorrect
- Try signing up if account doesn't exist

### Session not persisting
- Check browser cookies are enabled
- Clear browser cache and try again
- Check if localStorage is working

### Logout not working
- Try hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear browser cache
- Check browser console for errors

### Can't sign up
- Email already registered (use sign in instead)
- Password doesn't meet requirements
- Check browser console for validation errors

## Next Steps

1. Wrap protected pages with `<ProtectedRoute>`
2. Update page permissions as needed
3. Test sign up and sign in flows
4. Test logout functionality
5. Verify sessions persist on refresh

For more information, see: https://supabase.com/docs/guides/auth
