# Brevo Email & SMS API Setup Guide

This project uses **Brevo** (formerly Sendinblue) for sending transactional emails and SMS. Brevo provides a reliable REST API for sending both emails and SMS without SMTP configuration.

## Why Brevo?

### Email
- ✅ No SMTP configuration needed
- ✅ More reliable than SMTP
- ✅ Better deliverability
- ✅ Free tier: 300 emails/day
- ✅ Easy API integration
- ✅ Email tracking and analytics

### SMS
- ✅ Same API key for both email and SMS
- ✅ Reliable SMS delivery
- ✅ Pay-as-you-go pricing
- ✅ Easy integration
- ✅ SMS tracking and analytics

## Setup Steps

### 1. Create a Brevo Account

1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Brevo account
2. Go to **Settings** → **SMTP & API** → **API Keys**
3. Click **Generate a new API key**
4. Give it a name (e.g., "Hotel Booking System")
5. Copy the API key (you'll only see it once!)

### 3. Verify Your Sender Email

1. Go to **Settings** → **Senders**
2. Click **Add a sender**
3. Enter your email address (e.g., `noreply@hotelnavjeevanpalace.com`)
4. Verify the email address by clicking the verification link sent to your email
5. Wait for approval (usually instant for verified emails)

### 4. Configure SMS Sender (for SMS)

1. Go to **SMS** → **Senders** in Brevo dashboard
2. Click **Add a sender**
3. Enter your sender name (e.g., `NAVJEE` or `NAVJEEVAN`)
4. Note: Sender name must be 3-11 characters, alphanumeric only
5. Wait for approval (usually instant)

### 5. Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Brevo credentials:
   ```env
   BREVO_API_KEY=xkeysib-your-api-key-here
   BREVO_SENDER_EMAIL=noreply@hotelnavjeevanpalace.com
   BREVO_SENDER_NAME=Hotel Navjeevan Palace
   SMS_PROVIDER=brevo
   BREVO_SMS_SENDER=NAVJEE
   ```

### 6. Install Dependencies

```bash
npm install
```

This will install `@getbrevo/brevo` package automatically.

### 7. Test Email & SMS Sending

**Test Email:**
```bash
node utils/testBrevoEmail.js
```

**Test SMS:**
```bash
node utils/testBrevoSMS.js
```

The services will automatically initialize when the server starts. Check the console logs for:
- ✅ `Email sent successfully!` (when emails are sent)
- ✅ `SMS sent successfully!` (when SMS are sent)

## Troubleshooting

### Error: "Invalid API key"
- Make sure `BREVO_API_KEY` is set correctly in `.env`
- Check that there are no extra spaces or quotes
- Regenerate the API key if needed

### Error: "Sender email not verified"
- Go to Brevo dashboard → Settings → Senders
- Verify your sender email address
- Wait for approval (can take a few minutes)

### Error: "Daily sending limit exceeded"
- Free tier: 300 emails/day
- Upgrade to a paid plan for more emails
- Check your usage in Brevo dashboard

### Emails not being sent
1. Check server console logs for error messages
2. Verify all environment variables are set
3. Check Brevo dashboard → Statistics for email status
4. Ensure sender email is verified and approved

## Email & SMS Templates

### Email Templates
The system sends two types of emails:

1. **Booking Confirmation** - Sent when a booking is confirmed
2. **Enquiry Acknowledgment** - Sent when an enquiry is received

Both emails are HTML formatted with professional styling.

### SMS Templates
The system sends two types of SMS:

1. **Booking Confirmation SMS** - Sent when a booking is confirmed
2. **Enquiry Acknowledgment SMS** - Sent when an enquiry is received

SMS messages are concise and include booking ID, dates, and amount.

## Free Tier Limits

### Email
- **300 emails/day** (free tier)
- **Unlimited contacts**
- **Email tracking**
- **No credit card required**

### SMS
- **Pay-as-you-go pricing**
- **Check pricing**: [Brevo SMS Pricing](https://www.brevo.com/pricing/)
- **SMS credits** can be purchased as needed
- **No monthly commitment**

For production use with higher volume, consider upgrading to a paid plan.

## Support

- Brevo Documentation: [https://developers.brevo.com/](https://developers.brevo.com/)
- Brevo Support: [https://help.brevo.com/](https://help.brevo.com/)

