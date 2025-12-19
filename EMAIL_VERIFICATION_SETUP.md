# Email Verification Setup Guide

I've implemented email verification and password reset flows. Now you need to configure Supabase to make them work properly.

---

## What I Implemented

### Email Verification
- Users must verify email before logging in
- Signup redirects to verification page
- Email contains link to `/auth/confirm`
- Login blocks unverified users with clear message

### Password Reset
- "Forgot password?" link on login page
- Request reset email at `/forgot-password`
- Set new password at `/reset-password`
- Password strength validation (8+ chars, uppercase, lowercase, number)

### New Routes
- `/auth/confirm` - Handles email verification
- `/auth/verify-email` - Shown after signup
- `/auth/error` - Shows verification errors
- `/forgot-password` - Request password reset
- `/reset-password` - Set new password

---

## Supabase Configuration (IMPORTANT)

### Step 1: Enable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable **Confirm email**
4. Save changes

### Step 2: Configure Email Templates

1. Go to **Authentication** → **Email Templates**

2. **Confirm signup** template:
   - Subject: `Confirm your Cerebro account`
   - Body:
   ```html
   <h2>Confirm your email</h2>
   <p>Follow this link to confirm your account:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
   <p>Or copy and paste this URL into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>
   ```

3. **Reset password** template:
   - Subject: `Reset your Cerebro password`
   - Body:
   ```html
   <h2>Reset your password</h2>
   <p>Follow this link to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
   <p>Or copy and paste this URL into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>
   <p>If you didn't request this, you can ignore this email.</p>
   ```

### Step 3: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**

2. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   https://your-production-domain.vercel.app/auth/confirm
   https://your-production-domain.vercel.app/auth/callback
   ```

3. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.vercel.app`

### Step 4: Verify Email Provider Settings

1. Go to **Authentication** → **Providers** → **Email**

2. Verify these settings:
   - **Enable email provider**: ON
   - **Confirm email**: ON
   - **Secure email change**: ON (recommended)
   - **Double confirm email changes**: OFF (unless you want extra security)

---

## Testing the Flow

### Test Email Verification

1. **Sign up with a new account**
   ```
   Navigate to: http://localhost:3000/signup
   Enter email and password (must meet requirements)
   Click "Create Account"
   ```

2. **Check for verification email**
   - Should redirect to `/auth/verify-email`
   - Check your email inbox
   - Click the verification link

3. **Verify redirect works**
   - Clicking link should go to `/auth/confirm`
   - Should redirect to `/dashboard`
   - You should be logged in

4. **Test blocked login**
   - Try logging in BEFORE verifying email
   - Should see: "Please verify your email before logging in"

### Test Password Reset

1. **Request password reset**
   ```
   Navigate to: http://localhost:3000/login
   Click "Forgot password?"
   Enter your email
   Click "Send Reset Link"
   ```

2. **Check for reset email**
   - Should see: "Check your email for a password reset link"
   - Check your email inbox
   - Click the reset link

3. **Set new password**
   - Should redirect to `/reset-password`
   - Enter new password (see strength requirements)
   - Click "Update Password"
   - Should redirect to `/dashboard`
   - Try logging in with new password

---

## Common Issues

### Issue: "Email link is invalid or has expired"

**Cause**: Email verification link expired (default: 24 hours)

**Fix**:
1. Go to Supabase → Authentication → Email Templates
2. Increase expiry time if needed
3. Request a new verification email

### Issue: Email verification link does nothing

**Cause**: Redirect URL not configured in Supabase

**Fix**:
1. Go to Authentication → URL Configuration
2. Add your app URLs to Redirect URLs list
3. Make sure they exactly match (including http/https)

### Issue: Emails not sending

**Cause**: Using Supabase's email service on free tier (limited)

**Options**:
1. **Short term**: Wait for rate limit to reset
2. **Long term**: Configure custom SMTP
   - Go to Authentication → Email → SMTP Settings
   - Add your email provider (Gmail, SendGrid, etc.)

### Issue: Still receiving blank email

**Cause**: Email template not saved correctly

**Fix**:
1. Go to Authentication → Email Templates
2. Click on "Confirm signup"
3. Make sure template has HTML content with `{{ .ConfirmationURL }}`
4. Click "Save" at bottom

---

## Production Deployment

When deploying to Vercel:

1. **Update Supabase URLs**
   - Add production URL to Redirect URLs
   - Update Site URL to production domain

2. **Test on preview deployment first**
   ```bash
   vercel
   # Get preview URL like: https://cerebro-abc123.vercel.app
   # Add this to Supabase Redirect URLs
   # Test full signup → verify → login flow
   ```

3. **Deploy to production**
   ```bash
   vercel --prod
   # Update Site URL in Supabase to production domain
   ```

---

## Email Template Customization

You can customize the email templates further:

### Available Variables

- `{{ .Email }}` - User's email
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .Token }}` - Raw token (not recommended to use directly)
- `{{ .SiteURL }}` - Your site URL

### Example Enhanced Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1e293b; padding: 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0;">Cerebro</h1>
  </div>

  <div style="padding: 30px 20px; background: #ffffff;">
    <h2 style="color: #1e293b;">Verify your email</h2>
    <p style="color: #475569; line-height: 1.6;">
      Thanks for signing up for Cerebro! Click the button below to verify your email address and get started tracking your cognitive performance.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="background: #be123c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Verify Email
      </a>
    </div>

    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #64748b; font-size: 12px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>
  </div>

  <div style="background: #f1f5f9; padding: 20px; text-align: center;">
    <p style="color: #64748b; font-size: 12px; margin: 0;">
      Cerebro - Privacy-first cognitive tracking
    </p>
  </div>
</div>
```

---

## Security Notes

### Current Security Features

- Email verification required before login
- Password strength requirements enforced
- Password reset requires valid email token
- Tokens expire after 24 hours
- Rate limiting on auth endpoints (Supabase default)

### Recommended Additional Security (Week 2)

- Configure custom SMTP to avoid rate limits
- Set up email change confirmation
- Add account deletion flow
- Implement session timeout
- Add login activity log

---

## Next Steps

1. **Configure Supabase** using steps above
2. **Test the full flow** locally
3. **Verify emails are working**
4. **Test password reset**
5. **Deploy to preview** and test again
6. **Deploy to production**

---

## Quick Verification Checklist

Before deploying:
- [ ] Email confirmation enabled in Supabase
- [ ] Email templates configured with ConfirmationURL
- [ ] Redirect URLs added to Supabase
- [ ] Site URL set correctly
- [ ] Tested signup → verify → login flow
- [ ] Tested password reset flow
- [ ] Tested weak password rejection
- [ ] Emails sending correctly

Once this is all working, users will have a complete, secure authentication experience!
