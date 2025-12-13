# Brevo SMS Integration - Complete

## ✅ What Was Changed

### 1. **SMS Service (`backend/utils/smsService.js`)**
- ✅ Completely rewritten to use Brevo SMS REST API
- ✅ Removed dependency on MSG91 (kept for backward compatibility)
- ✅ Added Brevo SMS API initialization
- ✅ Updated `sendBookingConfirmationSMS()` function
- ✅ Updated `sendEnquiryAcknowledgmentSMS()` function
- ✅ Added phone number formatting (E.164 format)
- ✅ Added better error handling and logging
- ✅ Maintained backward compatibility with MSG91

### 2. **Environment Configuration (`backend/env.example`)**
- ✅ Added `SMS_PROVIDER=brevo` configuration
- ✅ Added `BREVO_SMS_SENDER` configuration
- ✅ Kept legacy MSG91 config for reference

### 3. **Documentation**
- ✅ Updated `backend/BREVO_SETUP.md` with SMS setup instructions
- ✅ Created `backend/utils/testBrevoSMS.js` for testing

## 🚀 Quick Setup

### Step 1: Configure SMS Sender in Brevo
1. Log in to [Brevo Dashboard](https://app.brevo.com/)
2. Go to **SMS** → **Senders**
3. Click **Add a sender**
4. Enter sender name (e.g., `NAVJEE` or `NAVJEEVAN`)
   - Must be 3-11 characters
   - Alphanumeric only
   - No spaces or special characters
5. Wait for approval (usually instant)

### Step 2: Update Environment Variables
Update `backend/.env`:
```env
BREVO_API_KEY=xkeysib-your-api-key-here
SMS_PROVIDER=brevo
BREVO_SMS_SENDER=NAVJEE
```

**Note:** Brevo SMS uses the same API key as email, so you don't need a separate key!

### Step 3: Test SMS Sending
```bash
cd backend
node utils/testBrevoSMS.js
```

**Important:** Update the phone number in `testBrevoSMS.js` before testing!

## 📱 SMS Functions

### `sendBookingConfirmationSMS(booking)`
Sends booking confirmation SMS when a booking is confirmed.

**Parameters:**
- `booking` - Object containing booking details

**Returns:**
- `{ success: true, messageId: '...' }` on success
- `{ success: false, error: '...' }` on failure

### `sendEnquiryAcknowledgmentSMS(booking)`
Sends enquiry acknowledgment SMS when an enquiry is received.

**Parameters:**
- `booking` - Object containing enquiry details

**Returns:**
- `{ success: true, messageId: '...' }` on success
- `{ success: false, error: '...' }` on failure

### `sendViaBrevo(phone, message)`
Sends a custom SMS message.

**Parameters:**
- `phone` - Phone number (10 digits for India, or with country code)
- `message` - SMS message text

**Returns:**
- `{ success: true, messageId: '...' }` on success
- `{ success: false, error: '...' }` on failure

## 🔍 How It Works

1. **Initialization**: When the SMS service is first used, it initializes the Brevo SMS API client with your API key.

2. **Phone Number Formatting**: 
   - Automatically formats phone numbers to E.164 format
   - Adds country code (91 for India) if missing
   - Handles various input formats

3. **SMS Sending**: 
   - Validates phone number and message
   - Sends SMS via Brevo REST API
   - Returns success/error status

4. **Error Handling**:
   - Validates API key presence
   - Validates phone numbers
   - Validates sender name
   - Provides helpful error messages
   - Logs all operations

## 📊 SMS Message Format

### Booking Confirmation SMS
```
Dear [Name], your booking [ID] is CONFIRMED at Hotel Navjeevan Palace. 
Room: [Type], Check-in: [Date], Amount: ₹[Amount]. 
We look forward to welcoming you! For queries: 0294-2482909
```

### Enquiry Acknowledgment SMS
```
Dear [Name], thank you for your enquiry [ID] at Hotel Navjeevan Palace. 
Room: [Type], Check-in: [Date], Amount: ₹[Amount]. 
We have received your request and will confirm shortly. For queries: 0294-2482909
```

## 🐛 Troubleshooting

### SMS Not Sending

1. **Check API Key**
   ```bash
   # Verify in .env file
   echo $BREVO_API_KEY
   ```

2. **Check Sender Name**
   - Must be configured in Brevo dashboard → SMS → Senders
   - Must be approved (usually instant)
   - Must match `BREVO_SMS_SENDER` in `.env`

3. **Check Phone Number**
   - Must be valid 10-digit number (for India)
   - Or include country code (e.g., +919876543210)
   - No spaces or special characters

4. **Check SMS Credits**
   - Go to Brevo Dashboard → SMS → Credits
   - Ensure you have sufficient credits
   - Purchase credits if needed

5. **Check Logs**
   - Look for error messages in server console
   - Check Brevo dashboard → SMS → Statistics

### Common Errors

- **"Invalid API key"**: Check `BREVO_API_KEY` in `.env`
- **"Sender not found"**: Configure sender in Brevo dashboard → SMS → Senders
- **"Insufficient credits"**: Purchase SMS credits in Brevo dashboard
- **"Invalid phone number"**: Check phone number format (10 digits for India)

## 💰 SMS Pricing

Brevo SMS uses pay-as-you-go pricing:
- Check current pricing: [Brevo SMS Pricing](https://www.brevo.com/pricing/)
- Credits can be purchased as needed
- No monthly commitment required
- Pricing varies by country

## 🔄 Backward Compatibility

The SMS service maintains backward compatibility with MSG91:
- Set `SMS_PROVIDER=msg91` in `.env` to use MSG91
- MSG91 configuration still works if needed
- Default provider is now Brevo

## 📝 Next Steps

1. ✅ Set up Brevo account (if not already done)
2. ✅ Configure SMS sender in Brevo dashboard
3. ✅ Update `.env` file with SMS configuration
4. ✅ Test SMS sending
5. ✅ Purchase SMS credits if needed
6. ✅ Deploy to production

## 🔗 Resources

- [Brevo SMS Documentation](https://developers.brevo.com/docs/send-transactional-sms)
- [Brevo SMS Dashboard](https://app.brevo.com/sms/campaigns)
- [Brevo SMS Pricing](https://www.brevo.com/pricing/)

---

**SMS Integration Complete!** 🎉

The SMS service is now using Brevo API and ready to send booking and enquiry SMS notifications.

