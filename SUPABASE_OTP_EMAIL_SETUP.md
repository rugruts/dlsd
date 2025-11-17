# Supabase OTP Email Configuration

## Problem
You're receiving magic link emails instead of OTP code emails when requesting verification codes.

## Solution
Configure Supabase to send OTP codes in the email template.

---

## Step-by-Step Fix

### 1. Go to Supabase Dashboard

1. Open your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Email Templates**

### 2. Configure "Magic Link" Template

The `signInWithOtp()` function uses the **"Magic Link"** email template by default.

**Find the template named:** `Magic Link`

### 3. Update the Email Template

Replace the email template with this OTP-focused version:

```html
<h2>Your DumpSack Verification Code</h2>

<p>Hi there,</p>

<p>Your verification code is:</p>

<h1 style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; background: #f0f0f0; padding: 20px; border-radius: 8px;">
  {{ .Token }}
</h1>

<p><strong>This code will expire in 60 minutes.</strong></p>

<p>If you didn't request this code, you can safely ignore this email.</p>

<p>Thanks,<br>
The DumpSack Team</p>
```

### 4. Key Template Variables

Supabase provides these variables for OTP emails:

- `{{ .Token }}` - The 6-digit OTP code
- `{{ .TokenHash }}` - Hashed token (for magic links - don't use this)
- `{{ .SiteURL }}` - Your site URL
- `{{ .ConfirmationURL }}` - Magic link URL (don't include this for OTP-only)

### 5. Remove Magic Link

**Important:** Do NOT include `{{ .ConfirmationURL }}` in the template if you want OTP-only authentication.

If you include the magic link, users might click it instead of entering the code.

---

## Alternative: Custom Email Template (Recommended)

For a more professional look:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DumpSack Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #0E3A2F; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #F4F3E9; margin: 0;">DumpSack</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0E3A2F; margin-top: 0;">Your Verification Code</h2>
    
    <p>Hi there,</p>
    
    <p>Use this code to sign in to your DumpSack wallet:</p>
    
    <div style="background: #F4F3E9; border: 2px solid #F26A2E; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
      <div style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #0E3A2F; font-family: 'Courier New', monospace;">
        {{ .Token }}
      </div>
    </div>
    
    <p style="color: #E45757; font-weight: 600;">⚠️ This code expires in 60 minutes</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      If you didn't request this code, please ignore this email. Your account is secure.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      Thanks,<br>
      <strong>The DumpSack Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>DumpSack - Your Gorbagana Wallet</p>
  </div>
  
</body>
</html>
```

---

## Verification

After updating the template:

1. **Save** the template in Supabase
2. **Test** by requesting a new OTP code in your app
3. **Check your email** - you should now see the 6-digit code prominently displayed
4. **No magic link** should be present

---

## Additional Settings

### OTP Expiry Time

To change how long the OTP is valid:

1. Go to **Authentication** → **Settings**
2. Find **"OTP Expiry"** setting
3. Default is 3600 seconds (60 minutes)
4. Recommended: 600 seconds (10 minutes) for better security

### OTP Length

The OTP length is configured in your Supabase project settings:

1. Go to **Authentication** → **Settings**
2. Find **"OTP Length"** (if available)
3. Set to **6** digits
4. If not available in UI, it defaults to 6 digits

---

## Troubleshooting

### Still Getting Magic Links?

1. **Clear browser cache** and try again
2. **Wait 1 minute** for Supabase to update the template
3. **Check spam folder** - new template might be flagged
4. **Verify you saved** the correct template (Magic Link, not Confirm Signup)

### Email Not Arriving?

1. Check **Supabase Logs**: Authentication → Logs
2. Verify **email provider** is configured (SMTP settings)
3. Check **rate limits**: Authentication → Rate Limits
4. Test with a different email address

### Wrong Template Being Used?

Make sure you're editing the **"Magic Link"** template, not:
- ❌ Confirm Signup
- ❌ Invite User
- ❌ Reset Password
- ✅ **Magic Link** ← This is the one!

---

## Testing Checklist

- [ ] Updated "Magic Link" email template
- [ ] Removed `{{ .ConfirmationURL }}` from template
- [ ] Saved template in Supabase
- [ ] Requested new OTP code in app
- [ ] Received email with 6-digit code
- [ ] No magic link in email
- [ ] Code works when entered in app

---

## Need Help?

If you're still having issues:

1. Share a screenshot of your email template in Supabase
2. Share the email you're receiving
3. Check Supabase logs for any errors

The code in `authOtp.ts` is correct - this is purely a Supabase email template configuration issue.

