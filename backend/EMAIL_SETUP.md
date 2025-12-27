# Email Service Setup - Outlook SMTP

## What Changed
Switched from Gmail SMTP to Outlook SMTP to avoid Render's port blocking.

## Required Environment Variables

Update your `.env` file and Render environment variables:

```env
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-password
```

## Setup Instructions

### 1. Create/Use an Outlook Account
- Go to https://outlook.com and sign up or use existing account
- **Important**: If you have 2FA enabled, you'll need an App Password (see below)

### 2. Generate App Password (if 2FA is enabled)
1. Go to https://account.microsoft.com/security
2. Click "Advanced security options"
3. Under "App passwords", click "Create a new app password"
4. Copy the generated password (you'll use this as `EMAIL_PASS`)

### 3. Update Environment Variables

**Local (.env file):**
```env
EMAIL_USER=youremail@outlook.com
EMAIL_PASS=your-app-password-or-regular-password
```

**Render Dashboard:**
1. Go to your backend service on Render
2. Navigate to "Environment" tab
3. Update or add:
   - `EMAIL_USER` = your Outlook email
   - `EMAIL_PASS` = your App Password (or regular password if no 2FA)
4. Save changes (will trigger redeploy)

## Testing
After updating:
1. Commit and push changes to GitHub
2. Render will auto-redeploy
3. Test OTP sending from your Vercel frontend

## Why This Should Work
- Outlook SMTP is completely **FREE** with no daily limits
- Uses different servers than Gmail, likely not blocked by Render
- Fully compatible with Nodemailer
