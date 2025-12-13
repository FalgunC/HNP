const https = require('https');

// Send SMS via MSG91
const sendSMS = async (phone, message) => {
  const provider = process.env.SMS_PROVIDER || 'msg91';
  
  if (provider === 'msg91') {
    return sendViaMSG91(phone, message);
  } else if (provider === 'twilio') {
    return sendViaTwilio(phone, message);
  }
  
  console.log('⚠️ SMS provider not configured, skipping SMS');
  return { success: false, error: 'SMS provider not configured' };
};

// MSG91 SMS
const sendViaMSG91 = async (phone, message) => {
  try {
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

// Twilio SMS (alternative)
const sendViaTwilio = async (phone, message) => {
  // Twilio implementation would go here
  // For now, return not configured
  console.log('⚠️ Twilio not implemented yet');
  return { success: false, error: 'Twilio not implemented' };
};

// Send booking confirmation SMS
const sendBookingConfirmationSMS = async (booking) => {
  const message = `Dear ${booking.customer_name}, your booking ${booking.booking_id} is confirmed at Hotel Navjeevan Palace. Check-in: ${new Date(booking.check_in).toLocaleDateString('en-IN')}, Amount: ₹${booking.amount}. For queries: 0294-2482909`;
  
  return await sendSMS(booking.phone, message);
};

module.exports = {
  sendSMS,
  sendBookingConfirmationSMS
};

