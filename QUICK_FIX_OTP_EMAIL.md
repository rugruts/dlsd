# 🚀 Quick Fix: OTP Email Issue

## The Problem
✉️ You're getting a "magic link" email instead of a verification code.

## The Solution (2 minutes)

### Step 1: Open Supabase Dashboard
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### Step 2: Navigate to Email Templates
```
Authentication → Email Templates → Magic Link
```

### Step 3: Replace Template Content

**Delete everything and paste this:**

```html
<h2>Your DumpSack Verification Code</h2>

<p>Your verification code is:</p>

<h1 style="font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 10px; background: #f5f5f5; padding: 20px; border-radius: 8px; font-family: monospace;">
  {{ .Token }}
</h1>

<p><strong>This code expires in 60 minutes.</strong></p>

<p>If you didn't request this, ignore this email.</p>
```

### Step 4: Save Template

Click **Save** button at the bottom.

### Step 5: Test

1. Go back to your app
2. Request a new verification code
3. Check your email
4. You should now see the 6-digit code!

---

## ⚠️ Important Notes

1. **Edit the "Magic Link" template** - NOT "Confirm Signup" or others
2. **Remove any `{{ .ConfirmationURL }}`** - This creates the magic link
3. **Use `{{ .Token }}`** - This is your 6-digit code
4. **Wait 1 minute** after saving for changes to take effect

---

## ✅ What You Should See

**Before (Wrong):**
```
Subject: Confirm your signup
Body: Click this link to sign in: https://...
```

**After (Correct):**
```
Subject: Your DumpSack Verification Code
Body: Your verification code is: 123456
```

---

## 🔍 Still Not Working?

Check these:

1. **Did you save the template?** Look for a success message
2. **Are you editing "Magic Link"?** Not another template
3. **Wait 60 seconds** and try again
4. **Check spam folder** for the new email
5. **Clear your email cache** (refresh inbox)

---

## 📸 Visual Guide

```
Supabase Dashboard
    ↓
Authentication (left sidebar)
    ↓
Email Templates (tab)
    ↓
Magic Link (select this one!)
    ↓
[Edit template content]
    ↓
Replace with code above
    ↓
Save
    ↓
Test in app
```

---

## 💡 Pro Tip

After fixing, you can customize the email to match your brand:
- Change colors to DumpSack theme (#0E3A2F, #F26A2E)
- Add your logo
- Customize the message

See `SUPABASE_OTP_EMAIL_SETUP.md` for a professional template!

---

**That's it! Your OTP emails should now work correctly.** 🎉

