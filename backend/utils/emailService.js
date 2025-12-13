const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
let apiInstance = null;

const initializeBrevo = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set in environment variables');
    console.error('💡 Please add BREVO_API_KEY to your .env file');
    console.error('💡 Get your API key from: https://app.brevo.com/settings/keys/api');
    return null;
  }

  if (!apiInstance) {
    const defaultClient = brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    apiInstance = new brevo.TransactionalEmailsApi();
  }
  return apiInstance;
};

const formatDateSafe = (d) => {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return 'N/A';
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  try {
    const api = initializeBrevo();
    if (!api) {
      console.error('❌ Brevo API not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    // Validate email address
    const recipientEmail = booking.email || booking.email_address;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.error('❌ Invalid email address:', recipientEmail);
      return { success: false, error: 'Invalid email address' };
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'noreply@hotelnavjeevanpalace.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Hotel Navjeevan Palace';

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1e40af; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hotel Navjeevan Palace</h1>
            <p>Booking Confirmation</p>
          </div>
          <div class="content">
            <p>Dear ${booking.customer_name || booking.name || 'Guest'},</p>
            <p>Thank you for choosing Hotel Navjeevan Palace! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h2>Booking Details</h2>
              <div class="detail-row">
                <span class="label">Booking ID:</span> ${booking.booking_id || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="label">Room Type:</span> ${booking.room_type || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="label">Check-in:</span> ${formatDateSafe(booking.check_in)}
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span> ${formatDateSafe(booking.check_out)}
              </div>
              <div class="detail-row">
                <span class="label">Number of Nights:</span> ${booking.nights || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="label">Guests:</span> ${booking.guests || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span> ₹${(booking.amount || 0).toLocaleString('en-IN')}
              </div>
              <div class="detail-row">
                <span class="label">Payment Mode:</span> ${booking.payment_mode || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="label">Payment Status:</span> ${booking.payment_status || 'N/A'}
              </div>
            </div>
            
            ${booking.payment_mode === 'Bank Transfer' && booking.payment_status === 'Pending Payment' ? `
            <div class="booking-details">
              <h3>Bank Transfer Details</h3>
              <p><strong>Bank Name:</strong> ${process.env.BANK_NAME || 'N/A'}</p>
              <p><strong>Account Name:</strong> ${process.env.BANK_ACCOUNT_NAME || 'N/A'}</p>
              <p><strong>Account Number:</strong> ${process.env.BANK_ACCOUNT_NUMBER || 'N/A'}</p>
              <p><strong>IFSC Code:</strong> ${process.env.BANK_IFSC || 'N/A'}</p>
              <p><strong>UPI ID:</strong> ${process.env.BANK_UPI_ID || 'N/A'}</p>
              <p style="margin-top: 15px; color: #dc2626;"><strong>Please complete the payment and share the transaction details for confirmation.</strong></p>
            </div>
            ` : ''}
            
            <p>We look forward to welcoming you to Hotel Navjeevan Palace!</p>
            <p>For any queries, please contact us at:</p>
            <p>Phone: 0294-2482909 / 7230082909<br>
            Email: navjeevanhoteludr@yahoo.com<br>
            Address: 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Raj.)</p>
          </div>
          <div class="footer">
            <p>Hotel Navjeevan Palace, Udaipur</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create sendSmtpEmail object
    const sendSmtpEmail = {
      subject: `Booking Confirmation - ${booking.booking_id || 'N/A'}`,
      htmlContent: emailContent,
      sender: { name: senderName, email: senderEmail },
      to: [{ email: recipientEmail, name: booking.customer_name || booking.name || 'Guest' }]
    };

    // Send email via Brevo API
    const result = await api.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Booking confirmation email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   To:', recipientEmail);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Response:', error.response.body);
    }
    
    // Provide helpful error messages
    if (error.message && error.message.includes('API key')) {
      console.error('💡 Check BREVO_API_KEY in your .env file');
    } else if (error.message && error.message.includes('sender')) {
      console.error('💡 Verify BREVO_SENDER_EMAIL is a verified sender in Brevo dashboard');
    }
    
    return { success: false, error: error.message };
  }
};

// Send enquiry acknowledgment email
const sendEnquiryAcknowledgment = async (booking) => {
  try {
    const api = initializeBrevo();
    if (!api) {
      console.error('❌ Brevo API not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    // Validate email address
    const recipientEmail = booking.email || booking.email_address;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.error('❌ Invalid email address:', recipientEmail);
      return { success: false, error: 'Invalid email address' };
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'noreply@hotelnavjeevanpalace.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Hotel Navjeevan Palace';

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .enquiry-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; border-radius: 5px; }
          .detail-row { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
          .value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .thank-you { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #D4AF37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🏨 Hotel Navjeevan Palace</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Enquiry Received</p>
          </div>
          <div class="content">
            <p>Dear <strong>${booking.customer_name || booking.name || 'Guest'}</strong>,</p>
            
            <div class="thank-you">
              <p style="margin: 0; font-size: 16px; color: #856404;">
                <strong>Thank you for your consideration!</strong> We have received your room enquiry and will confirm your booking shortly.
              </p>
            </div>
            
            <div class="enquiry-details">
              <h2 style="margin-top: 0; color: #D4AF37;">Enquiry Details</h2>
              <div class="detail-row">
                <span class="label">Enquiry ID:</span>
                <span class="value"><strong>${booking.booking_id || 'N/A'}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Room Type:</span>
                <span class="value">${booking.room_type || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">${formatDateSafe(booking.check_in)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">${formatDateSafe(booking.check_out)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Number of Nights:</span>
                <span class="value">${booking.nights || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Guests:</span>
                <span class="value">${booking.guests || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value"><strong style="color: #D4AF37; font-size: 18px;">₹${(booking.amount || 0).toLocaleString('en-IN')}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Mode:</span>
                <span class="value">${booking.payment_mode || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value" style="color: #856404; font-weight: bold;">⏳ Pending Confirmation</span>
              </div>
            </div>
            
            <p style="margin-top: 25px; font-size: 15px; line-height: 1.8;">
              Our team is reviewing your enquiry and will send you a <strong>confirmation email and SMS</strong> shortly. 
              Please keep this enquiry ID (<strong>${booking.booking_id || 'N/A'}</strong>) for your reference.
            </p>
            
            <p style="margin-top: 20px;">
              For any urgent queries, please contact us at:<br>
              <strong>Phone:</strong> 0294-2482909 / 7230082909<br>
              <strong>Email:</strong> navjeevanhoteludr@yahoo.com<br>
              <strong>Address:</strong> 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Raj.)
            </p>
            
            <p style="margin-top: 25px; color: #666; font-style: italic;">
              We look forward to welcoming you to Hotel Navjeevan Palace!
            </p>
          </div>
          <div class="footer">
            <p><strong>Hotel Navjeevan Palace, Udaipur</strong></p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create sendSmtpEmail object
    const sendSmtpEmail = {
      subject: `Enquiry Received - ${booking.booking_id || 'N/A'} - Hotel Navjeevan Palace`,
      htmlContent: emailContent,
      sender: { name: senderName, email: senderEmail },
      to: [{ email: recipientEmail, name: booking.customer_name || booking.name || 'Guest' }]
    };

    // Send email via Brevo API
    const result = await api.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Enquiry acknowledgment email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   To:', recipientEmail);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Response:', error.response.body);
    }
    
    // Provide helpful error messages
    if (error.message && error.message.includes('API key')) {
      console.error('💡 Check BREVO_API_KEY in your .env file');
    } else if (error.message && error.message.includes('sender')) {
      console.error('💡 Verify BREVO_SENDER_EMAIL is a verified sender in Brevo dashboard');
    }
    
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendEnquiryAcknowledgment
};
