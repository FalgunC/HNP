const brevo = require('@getbrevo/brevo');

// Initialize Brevo SMS API client
let smsApiInstance = null;

const initializeBrevoSMS = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set in environment variables');
    console.error('💡 Please add BREVO_API_KEY to your .env file');
    return null;
  }

  if (!smsApiInstance) {
    const defaultClient = brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    smsApiInstance = new brevo.TransactionalSMSApi();
  }
  return smsApiInstance;
};

// Format phone number for Brevo (E.164 format)
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let formatted = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume India (91)
  if (!formatted.startsWith('91') && formatted.length === 10) {
    formatted = '91' + formatted;
  }
  
  // Add + prefix for E.164 format
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return formatted;
};

// Send SMS via Brevo
const sendViaBrevo = async (phone, message) => {
  try {
    const api = initializeBrevoSMS();
    if (!api) {
      console.error('❌ Brevo SMS API not initialized');
      return { success: false, error: 'SMS service not configured' };
    }

    // Validate phone number
    if (!phone || phone.length < 10) {
      console.error('❌ Invalid phone number:', phone);
      return { success: false, error: 'Invalid phone number' };
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Validate message
    if (!message || message.trim().length === 0) {
      console.error('❌ Empty SMS message');
      return { success: false, error: 'Empty message' };
    }

    // Brevo SMS requires sender name (must be configured in Brevo dashboard)
    const senderName = process.env.BREVO_SMS_SENDER || 'NAVJEE';

    // Create SMS request object
    const sendTransacSms = {
      sender: senderName,
      recipient: formattedPhone,
      content: message
    };

    // Send SMS via Brevo API
    const result = await api.sendTransacSms(sendTransacSms);
    
    console.log('✅ SMS sent successfully via Brevo!');
    console.log('   Message ID:', result.messageId);
    console.log('   To:', formattedPhone);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ SMS sending failed!');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Response:', error.response.body);
    }
    
    // Provide helpful error messages
    if (error.message && error.message.includes('API key')) {
      console.error('💡 Check BREVO_API_KEY in your .env file');
    } else if (error.message && error.message.includes('sender')) {
      console.error('💡 Verify BREVO_SMS_SENDER is configured in Brevo dashboard');
      console.error('   Go to: Brevo Dashboard → SMS → Senders');
    } else if (error.message && error.message.includes('credit')) {
      console.error('💡 Insufficient SMS credits in Brevo account');
      console.error('   Check your balance at: Brevo Dashboard → SMS → Credits');
    }
    
    return { success: false, error: error.message };
  }
};

// Main SMS sending function (supports multiple providers)
const sendSMS = async (phone, message) => {
  const provider = process.env.SMS_PROVIDER || 'brevo';
  
  if (provider === 'brevo') {
    return await sendViaBrevo(phone, message);
  } else if (provider === 'msg91') {
    // Legacy MSG91 support (kept for backward compatibility)
    return await sendViaMSG91(phone, message);
  } else if (provider === 'twilio') {
    return await sendViaTwilio(phone, message);
  }
  
  console.log('⚠️ SMS provider not configured, skipping SMS');
  return { success: false, error: 'SMS provider not configured' };
};

// Legacy MSG91 SMS (for backward compatibility)
const sendViaMSG91 = async (phone, message) => {
  try {
    const https = require('https');
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'NAVJEE';
    
    if (!authKey) {
      console.log('⚠️ MSG91 auth key not configured');
      return { success: false, error: 'MSG91 not configured' };
    }
    
    // Format phone number (remove + and ensure 91 prefix for India)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('91')) {
      formattedPhone = '91' + formattedPhone;
    }
    
    const data = JSON.stringify({
      sender: senderId,
      route: '4',
      country: '91',
      sms: [
        {
          message: message,
          to: [formattedPhone]
        }
      ]
    });
    
    const options = {
      hostname: 'api.msg91.com',
      port: 443,
      path: '/api/v2/sendsms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'authkey': authKey
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ SMS sent via MSG91');
            resolve({ success: true });
          } else {
            console.error('❌ SMS error:', responseData);
            resolve({ success: false, error: responseData });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ SMS request error:', error);
        resolve({ success: false, error: error.message });
      });
      
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('❌ SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Twilio SMS (alternative - not implemented)
const sendViaTwilio = async (phone, message) => {
  console.log('⚠️ Twilio not implemented yet');
  return { success: false, error: 'Twilio not implemented' };
};

// Format date safely for SMS
const formatDateSafe = (d) => {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'N/A';
  }
};

// Send booking confirmation SMS
const sendBookingConfirmationSMS = async (booking) => {
  try {
    const customerName = booking.customer_name || booking.name || 'Guest';
    const bookingId = booking.booking_id || 'N/A';
    const checkInDate = formatDateSafe(booking.check_in);
    const amount = (booking.amount || 0).toLocaleString('en-IN');
    const roomType = booking.room_type || 'Room';
    
    let message = `Dear ${customerName}, your booking ${bookingId} is CONFIRMED at Hotel Navjeevan Palace. `;
    message += `Room: ${roomType}, Check-in: ${checkInDate}, Amount: ₹${amount}. `;
    message += `We look forward to welcoming you! For queries: 0294-2482909`;
    
    return await sendSMS(booking.phone, message);
  } catch (error) {
    console.error('❌ Error creating booking confirmation SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send enquiry acknowledgment SMS
const sendEnquiryAcknowledgmentSMS = async (booking) => {
  try {
    const customerName = booking.customer_name || booking.name || 'Guest';
    const bookingId = booking.booking_id || 'N/A';
    const checkInDate = formatDateSafe(booking.check_in);
    const amount = (booking.amount || 0).toLocaleString('en-IN');
    const roomType = booking.room_type || 'Room';
    
    let message = `Dear ${customerName}, thank you for your enquiry ${bookingId} at Hotel Navjeevan Palace. `;
    message += `Room: ${roomType}, Check-in: ${checkInDate}, Amount: ₹${amount}. `;
    message += `We have received your request and will confirm shortly. For queries: 0294-2482909`;
    
    return await sendSMS(booking.phone, message);
  } catch (error) {
    console.error('❌ Error creating enquiry acknowledgment SMS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendBookingConfirmationSMS,
  sendEnquiryAcknowledgmentSMS,
  sendViaBrevo
};
