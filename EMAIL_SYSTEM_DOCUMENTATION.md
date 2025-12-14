# 📧 Production-Ready Email Notification System

## Overview

This hotel booking system uses **Brevo (formerly Sendinblue)** REST API for reliable, production-ready email notifications. The system is designed to work seamlessly on Render, Netlify, and other cloud platforms without SMTP port blocking issues.

## ✅ Features

- ✅ **REST API-based** - No SMTP port blocking
- ✅ **High Deliverability** - SPF/DKIM compatible
- ✅ **Production-Ready** - Error handling, logging, graceful failures
- ✅ **Free Tier** - 300 emails/day free
- ✅ **Professional Templates** - HTML + Plain text fallback
- ✅ **Modular Architecture** - Clean, reusable code

## 📋 Email Types

### 1️⃣ User Enquiry Acknowledgment Email

**Trigger:** Automatically sent when a user submits an enquiry/booking request

**Content:**
- Enquiry received confirmation
- Booking is under review notice
- Complete enquiry details (ID, dates, room, amount)
- Hotel contact information
- Professional, friendly tone

**Function:** `sendEnquiryAcknowledgment(booking)`

**Location:** `backend/utils/emailService.js`

**Triggered in:** `backend/controllers/bookingController.js` → `createBooking()`

---

### 2️⃣ Booking Confirmation Email

**Trigger:** Sent when admin confirms a booking from the admin panel

**Content:**
- Booking confirmed message
- Complete booking details (ID, dates, room, amount)
- Payment status and mode
- Bank transfer details (if applicable)
- Hotel contact information
- Professional, welcoming tone

**Function:** `sendBookingConfirmation(booking)`

**Location:** `backend/utils/emailService.js`

**Triggered in:** 
- `backend/controllers/adminController.js` → `confirmEnquiry()`
- `backend/controllers/adminController.js` → `confirmPayment()`

---

## 🏗️ Architecture

```
backend/
├── utils/
│   └── emailService.js          # Core email service (reusable functions)
├── controllers/
│   ├── bookingController.js     # User enquiry email trigger
│   └── adminController.js       # Admin confirmation email trigger
└── routes/
    ├── api.js                   # Public API routes
    └── admin.js                 # Admin panel routes
```

### Core Functions

#### `sendEmail(options)` - Core Reusable Function
```javascript
const result = await sendEmail({
  to: 'customer@example.com',
  subject: 'Email Subject',
  htmlContent: '<html>...</html>',
  textContent: 'Plain text version' // Optional
});
```

#### `sendEnquiryAcknowledgment(booking)` - User Enquiry Email
```javascript
const result = await sendEnquiryAcknowledgment(booking);
// Returns: { success: true/false, messageId: '...', error: '...' }
```

#### `sendBookingConfirmation(booking)` - Booking Confirmation Email
```javascript
const result = await sendBookingConfirmation(booking);
// Returns: { success: true/false, messageId: '...', error: '...' }
```

---

## ⚙️ Configuration

### Environment Variables

Create/update `backend/.env`:

```env
# Brevo API Configuration
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_SENDER_EMAIL=noreply@hotelnavjeevanpalace.com
BREVO_SENDER_NAME=Hotel Navjeevan Palace

# Bank Details (for booking confirmation emails)
BANK_NAME=State Bank of India
BANK_ACCOUNT_NAME=Hotel Navjeevan Palace
BANK_ACCOUNT_NUMBER=1234567890123456
BANK_IFSC=SBIN0001234
BANK_UPI_ID=navjeevanpalace@paytm
```

### Setup Steps

1. **Get Brevo API Key**
   - Sign up at [brevo.com](https://www.brevo.com/)
   - Go to Settings → SMTP & API → API Keys
   - Generate new API key
   - Copy to `BREVO_API_KEY` in `.env`

2. **Verify Sender Email**
   - Go to Settings → Senders
   - Add sender email (e.g., `noreply@hotelnavjeevanpalace.com`)
   - Verify email address
   - Wait for approval

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Test Email Sending**
   ```bash
   node utils/testBrevoEmail.js
   ```

---

## 🔄 Email Flow

### User Enquiry Flow

```
User submits booking form
    ↓
createBooking() in bookingController.js
    ↓
Booking saved with status "Enquiry"
    ↓
sendEnquiryAcknowledgment(booking) called
    ↓
Email sent to user automatically
    ↓
User receives enquiry acknowledgment email
```

### Admin Confirmation Flow

```
Admin clicks "Confirm Enquiry" in admin panel
    ↓
confirmEnquiry() in adminController.js
    ↓
Booking status changed to "Confirmed"
    ↓
sendBookingConfirmation(booking) called
    ↓
Email sent to user instantly
    ↓
User receives booking confirmation email
```

---

## 🛡️ Error Handling

The email system is designed to **never crash the server**:

1. **Validation Checks**
   - Email address validation
   - API key validation
   - Sender email validation

2. **Try-Catch Blocks**
   - All email functions wrapped in try-catch
   - Errors logged but don't throw exceptions

3. **Graceful Failures**
   - Returns `{ success: false, error: '...' }` on failure
   - Server continues operating normally
   - Errors logged to console with `[EMAIL]` prefix

4. **Non-Blocking**
   - Emails sent asynchronously
   - Don't block API responses
   - Use `Promise.allSettled()` for multiple emails

---

## 📊 Logging

All email operations are logged with clear prefixes:

```
✅ [EMAIL] Sent successfully to customer@example.com
   [EMAIL] Message ID: abc123
   [EMAIL] Subject: Booking Confirmed - BOOK-12345

❌ [EMAIL] Sending failed!
   [EMAIL] Error: Invalid API key
   [EMAIL] To: customer@example.com
```

---

## 📧 Email Templates

### Template Features

- **Responsive Design** - Works on mobile and desktop
- **Professional Styling** - Clean, modern design
- **Plain Text Fallback** - For email clients that don't support HTML
- **Clear Information Hierarchy** - Easy to scan
- **Brand Colors** - Consistent with hotel branding

### Template Structure

1. **Header** - Hotel name and email type
2. **Greeting** - Personalized customer name
3. **Message** - Main content
4. **Details Box** - Booking/enquiry information
5. **Contact Info** - Hotel contact details
6. **Footer** - Automated email notice

---

## 🧪 Testing

### Test Email Sending

```bash
# Test enquiry acknowledgment email
node utils/testBrevoEmail.js

# Test booking confirmation email
# (Update test data in testBrevoEmail.js first)
```

### Manual Testing

1. **Test User Enquiry Email:**
   - Submit a booking form via frontend
   - Check email inbox (and spam folder)
   - Verify all details are correct

2. **Test Admin Confirmation Email:**
   - Login to admin panel
   - Find an enquiry
   - Click "Confirm Enquiry"
   - Check customer's email inbox
   - Verify confirmation details

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check API Key**
   ```bash
   echo $BREVO_API_KEY
   ```
   - Verify key is set in `.env`
   - Check for extra spaces or quotes
   - Regenerate if needed

2. **Check Sender Email**
   - Must be verified in Brevo dashboard
   - Must be approved (usually instant)
   - Check Settings → Senders

3. **Check Logs**
   - Look for `[EMAIL]` prefixed messages
   - Check for error messages
   - Verify recipient email is valid

4. **Check Brevo Dashboard**
   - Go to Statistics → Emails
   - Check email status (sent, bounced, etc.)
   - Verify daily limits not exceeded

### Common Errors

| Error | Solution |
|-------|----------|
| "Invalid API key" | Check `BREVO_API_KEY` in `.env` |
| "Sender email not verified" | Verify sender in Brevo dashboard |
| "Daily limit exceeded" | Free tier: 300 emails/day |
| "Invalid email address" | Check recipient email format |

---

## 📈 Production Checklist

- [x] Brevo API key configured
- [x] Sender email verified
- [x] Environment variables set
- [x] Email templates tested
- [x] Error handling verified
- [x] Logging working
- [x] User enquiry email working
- [x] Admin confirmation email working
- [x] Plain text fallback included
- [x] Mobile-responsive templates

---

## 🔗 Resources

- [Brevo Documentation](https://developers.brevo.com/)
- [Brevo Dashboard](https://app.brevo.com/)
- [Brevo API Reference](https://developers.brevo.com/api-reference)
- [Email Best Practices](https://help.brevo.com/hc/en-us/articles/209467485)

---

## 📝 Code Examples

### Triggering User Enquiry Email

```javascript
// In bookingController.js
const { sendEnquiryAcknowledgment } = require('../utils/emailService');

// After saving booking
await booking.save();

// Send email (non-blocking)
sendEnquiryAcknowledgment(booking)
  .then(result => {
    if (result.success) {
      console.log('✅ Enquiry email sent');
    } else {
      console.error('❌ Email failed:', result.error);
    }
  })
  .catch(err => console.error('Email error:', err));
```

### Triggering Booking Confirmation Email

```javascript
// In adminController.js
const { sendBookingConfirmation } = require('../utils/emailService');

// After confirming booking
booking.booking_status = 'Confirmed';
await booking.save();

// Send confirmation email
const emailResult = await sendBookingConfirmation(booking);
if (emailResult.success) {
  console.log('✅ Confirmation email sent');
} else {
  console.error('❌ Email failed:', emailResult.error);
}
```

---

**Email System Status: ✅ Production Ready**

All emails are sent reliably using Brevo REST API with proper error handling and logging.

