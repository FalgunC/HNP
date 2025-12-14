# 🔧 Email Troubleshooting Guide

## Issues Fixed

### 1. Admin Confirmation Showing "Failed, Failed"
**Problem:** Admin panel shows email and SMS as failed even when they might succeed.

**Solution Applied:**
- ✅ Converted Mongoose document to plain object before sending to email service
- ✅ Added proper error handling and validation
- ✅ Ensured email results are properly returned
- ✅ Added detailed logging for debugging

### 2. Users Not Receiving Enquiry Emails
**Problem:** Enquiry acknowledgment emails not being sent when users submit bookings.

**Solution Applied:**
- ✅ Converted booking object to plain object before email sending
- ✅ Added email validation before sending
- ✅ Improved error logging
- ✅ Ensured email service is called correctly

---

## 🔍 Debugging Steps

### Step 1: Check Server Logs

Look for these log messages:

**For Enquiry Emails:**
```
📧 [BOOKING] Sending enquiry acknowledgment email to: user@example.com
✅ [BOOKING] Enquiry email sent successfully (ID: ...)
```
OR
```
❌ [BOOKING] Enquiry email failed: [error message]
```

**For Admin Confirmation:**
```
📧 [ADMIN] Sending confirmation email to: user@example.com
✅ [ADMIN] Confirmation email sent successfully (ID: ...)
```
OR
```
❌ [ADMIN] Confirmation email failed: [error message]
```

### Step 2: Run Debug Script

```bash
cd backend
node utils/testEmailDebug.js
```

This will:
- Check environment variables
- Test email sending
- Show detailed error messages
- Help identify the issue

### Step 3: Check Environment Variables

Make sure these are set in your `.env` file:

```env
BREVO_API_KEY=xkeysib-your-key-here
BREVO_SENDER_EMAIL=your-verified-email@domain.com
BREVO_SENDER_NAME=Hotel Navjeevan Palace
```

### Step 4: Verify Brevo Configuration

1. **Check API Key:**
   - Go to: https://app.brevo.com/settings/keys/api
   - Verify your API key is active

2. **Check Sender Email:**
   - Go to: https://app.brevo.com/settings/senders
   - Verify sender email shows "Verified" status

3. **Check Email Statistics:**
   - Go to: https://app.brevo.com/statistics/emails
   - See if emails are being sent
   - Check for bounces or errors

---

## 🐛 Common Issues & Solutions

### Issue 1: "Email service not configured"
**Error:** `Email service not configured. Please set BREVO_API_KEY in environment variables.`

**Solution:**
- ✅ Check `.env` file exists in `backend/` folder
- ✅ Verify `BREVO_API_KEY` is set correctly
- ✅ No extra spaces or quotes around the key
- ✅ Restart server after updating `.env`

### Issue 2: "Invalid email address"
**Error:** `Invalid email address`

**Solution:**
- ✅ Check booking email is valid format
- ✅ Ensure email contains `@` symbol
- ✅ Check for typos in email address

### Issue 3: "Sender email not verified"
**Error:** `Sender email not verified. Please verify sender in Brevo dashboard.`

**Solution:**
- ✅ Go to Brevo Dashboard → Settings → Senders
- ✅ Verify sender email is approved
- ✅ Wait a few minutes if status is "Pending"
- ✅ Check email inbox for verification link

### Issue 4: "Invalid API key"
**Error:** `Invalid API key. Please check BREVO_API_KEY in .env file.`

**Solution:**
- ✅ Regenerate API key in Brevo dashboard
- ✅ Copy new key to `.env` file
- ✅ Restart server

### Issue 5: Emails sent but not received
**Solution:**
- ✅ Check spam/junk folder
- ✅ Verify recipient email is correct
- ✅ Check Brevo dashboard → Statistics for email status
- ✅ Check if email was bounced or blocked

---

## ✅ Testing Checklist

- [ ] Environment variables set correctly
- [ ] Brevo API key is valid
- [ ] Sender email is verified
- [ ] Test email script runs successfully
- [ ] Server logs show email attempts
- [ ] Brevo dashboard shows emails sent
- [ ] Emails received in inbox (check spam)

---

## 📞 Still Having Issues?

1. **Check Server Logs:**
   - Look for `[EMAIL]`, `[BOOKING]`, `[ADMIN]` prefixes
   - Note any error messages

2. **Run Debug Script:**
   ```bash
   node utils/testEmailDebug.js
   ```

3. **Check Brevo Dashboard:**
   - Statistics → Emails
   - Check for errors or bounces

4. **Verify Configuration:**
   - Double-check all environment variables
   - Ensure `.env` file is in `backend/` folder
   - Restart server after changes

---

**The code has been updated with better error handling and debugging. Try again and check the server logs for detailed error messages.**

