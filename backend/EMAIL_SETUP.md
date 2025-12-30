# Email Service Setup - Brevo SMTP

## What Changed
Switched to Brevo (formerly Sendinblue) SMTP Relay for better deliverability and to avoid port blocking issues on cloud platforms like Render.

## Required Environment Variables

Update your `.env` file and Render environment variables:

```env
EMAIL_USER=your-brevo-login-email
EMAIL_PASS=your-brevo-smtp-key
```

## Setup Instructions

### 1. Create a Brevo Account
- Go to [Brevo](https://www.brevo.com/) and sign up.

### 2. Get SMTP Credentials
1. Log into your dashboard.
2. Go to **Transactional** > **Settings** > **SMTP & API**.
3. Generate a new SMTP Key.
4. Note your **Login Email** and the **generated SMTP Key**.

### 3. Update Environment Variables

**Local (.env file):**
```env
EMAIL_USER=9f023e001@smtp-brevo.com
EMAIL_PASS=your-smtp-key-here
```

**Render Dashboard:**
1. Go to your backend service.
2. Navigate to "Environment".
3. Add/Update:
   - `EMAIL_USER`: Your Brevo login email
   - `EMAIL_PASS`: Your Brevo SMTP Master Password/Key

## Testing
- Run `node test-email.js` in the backend directory to verify configuration.
