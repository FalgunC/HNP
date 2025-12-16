/**
 * PRODUCTION-READY EMAIL NOTIFICATION SYSTEM
 * 
 * Uses Brevo (formerly Sendinblue) REST API for reliable email delivery
 * - No SMTP port blocking issues
 * - High deliverability (SPF/DKIM compatible)
 * - Works reliably on Render and Netlify
 * 
 * Email Types:
 * 1. User Enquiry Acknowledgment - Sent automatically when user submits enquiry
 * 2. Booking Confirmation - Sent when admin confirms booking
 */

const brevo = require('@getbrevo/brevo');

// ============================================
// BREVO API INITIALIZATION
// ============================================

let apiInstance = null;

/**
 * Initialize Brevo API client (singleton pattern)
 * @returns {Object|null} Brevo API instance or null if not configured
 */
const initializeBrevo = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ [EMAIL] BREVO_API_KEY is not set in environment variables');
    console.error('💡 [EMAIL] Please add BREVO_API_KEY to your .env file');
    console.error('💡 [EMAIL] Get your API key from: https://app.brevo.com/settings/keys/api');
    return null;
  }

  if (!apiInstance) {
    try {
      const defaultClient = brevo.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      apiInstance = new brevo.TransactionalEmailsApi();
      console.log('✅ [EMAIL] Brevo API initialized successfully');
    } catch (error) {
      console.error('❌ [EMAIL] Failed to initialize Brevo API:', error.message);
      return null;
    }
  }
  return apiInstance;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Safely format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateSafe = (date) => {
  try {
    if (!date) return 'N/A';
    const dt = new Date(date);
    if (isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return 'N/A';
  }
};

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// ============================================
// CORE EMAIL SENDING FUNCTION
// ============================================

/**
 * Send email via Brevo API (reusable function)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML email content
 * @param {string} options.textContent - Plain text content (optional)
 * @returns {Promise<Object>} Result object with success status
 */
const sendEmail = async ({ to, subject, htmlContent, textContent = null }) => {
  try {
    // Initialize API
    const api = initializeBrevo();
    if (!api) {
      return { 
        success: false, 
        error: 'Email service not configured. Please set BREVO_API_KEY in environment variables.' 
      };
    }

    // Validate recipient email
    if (!isValidEmail(to)) {
      console.error(`❌ [EMAIL] Invalid recipient email: ${to}`);
      return { success: false, error: 'Invalid email address' };
    }

    // Get sender configuration
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'noreply@hotelnavjeevanpalace.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Hotel Navjeevan Palace';

    // Validate sender email
    if (!isValidEmail(senderEmail)) {
      console.error(`❌ [EMAIL] Invalid sender email: ${senderEmail}`);
      return { success: false, error: 'Invalid sender email configuration' };
    }

    // Create email payload
    const sendSmtpEmail = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to.trim() }],
      subject: subject,
      htmlContent: htmlContent,
      ...(textContent && { textContent: textContent })
    };

    // Send email via Brevo API
    const result = await api.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ [EMAIL] Sent successfully to ${to}`);
    console.log(`   [EMAIL] Message ID: ${result.messageId}`);
    console.log(`   [EMAIL] Subject: ${subject}`);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: to 
    };

  } catch (error) {
    // Log error but don't crash the server
    console.error('❌ [EMAIL] Sending failed!');
    console.error(`   [EMAIL] Error: ${error.message}`);
    console.error(`   [EMAIL] To: ${to}`);
    console.error(`   [EMAIL] Subject: ${subject}`);
    
    if (error.response && error.response.body) {
      console.error(`   [EMAIL] API Response:`, JSON.stringify(error.response.body, null, 2));
    }

    // Provide helpful error messages
    let errorMessage = error.message || 'Unknown error';
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check BREVO_API_KEY in .env file.';
    } else if (error.message && error.message.includes('sender')) {
      errorMessage = 'Sender email not verified. Please verify sender in Brevo dashboard.';
    } else if (error.message && error.message.includes('credit') || error.message.includes('quota')) {
      errorMessage = 'Email quota exceeded. Please check your Brevo account limits.';
    }

    return { 
      success: false, 
      error: errorMessage,
      details: error.message 
    };
  }
};

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Generate User Enquiry Acknowledgment Email Template
 * @param {Object} booking - Booking/enquiry object
 * @returns {Object} Email content with HTML and text
 */
const generateEnquiryAcknowledgmentEmail = (booking) => {
  const customerName = booking.customer_name || booking.name || 'Guest';
  const bookingId = booking.booking_id || 'N/A';
  const roomType = booking.room_type || 'N/A';
  const checkIn = formatDateSafe(booking.check_in);
  const checkOut = formatDateSafe(booking.check_out);
  const nights = booking.nights || 'N/A';
  const guests = booking.guests || 'N/A';
  const amount = (booking.amount || 0).toLocaleString('en-IN');
  const paymentMode = booking.payment_mode || 'N/A';
  // For Pay at Hotel, payment status must always be "Pay at Hotel"
  const paymentStatus = paymentMode === 'Pay at Hotel' ? 'Pay at Hotel' : (booking.payment_status || 'Pending Payment');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 600;
    }
    .header p { 
      margin: 10px 0 0 0; 
      font-size: 14px; 
      opacity: 0.9;
    }
    .content { 
      padding: 30px 20px; 
      background: #ffffff; 
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #555555;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .enquiry-box { 
      background: #fff9e6; 
      border-left: 4px solid #f59e0b; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px;
    }
    .enquiry-box h2 { 
      margin: 0 0 15px 0; 
      color: #92400e; 
      font-size: 18px;
    }
    .detail-row { 
      margin: 12px 0; 
      padding: 8px 0; 
      border-bottom: 1px solid #f3f4f6; 
      display: flex;
      justify-content: space-between;
    }
    .detail-row:last-child { 
      border-bottom: none; 
    }
    .label { 
      font-weight: 600; 
      color: #555555; 
      flex: 0 0 40%;
    }
    .value { 
      color: #111827; 
      text-align: right;
      flex: 1;
    }
    .status-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }
    .contact-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 4px;
      margin: 25px 0;
    }
    .contact-info h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #111827;
    }
    .contact-info p {
      margin: 6px 0;
      font-size: 14px;
      color: #555555;
    }
    .footer { 
      text-align: center; 
      padding: 25px 20px; 
      background: #f9fafb;
      color: #6b7280; 
      font-size: 12px; 
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🏨 Hotel Navjeevan Palace</h1>
      <p>Enquiry Received - We're Reviewing Your Request</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        <p>Dear <strong>${customerName}</strong>,</p>
      </div>
      
      <div class="message">
        <p>Thank you for contacting Hotel Navjeevan Palace! </p>
        <p>We have received your room enquiry .</p>
        <p>You will receive a <strong>confirmation email</strong> shortly once we confirm your room booking .</p>
      </div>
      
      <div class="enquiry-box">
        <h2>📋 Your Enquiry Details</h2>
        <div class="detail-row">
          <span class="label">Enquiry ID:</span>
          <span class="value"><strong>${bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Room Type:</span>
          <span class="value">${roomType}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-in Date:</span>
          <span class="value">${checkIn}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out Date:</span>
          <span class="value">${checkOut}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Nights:</span>
          <span class="value">${nights}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Guests:</span>
          <span class="value">${guests}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Amount:</span>
          <span class="value"><strong style="color: #f59e0b; font-size: 16px;">₹${amount}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Mode:</span>
          <span class="value">${paymentMode}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Status:</span>
          <span class="value">${paymentStatus}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value"><span class="status-badge">⏳ Pending Confirmation</span></span>
        </div>
      </div>
      
      ${(paymentMode === 'Bank Transfer' || paymentMode === 'Pay Online') ? `
      <div class="enquiry-box" style="background: #fee2e2; border-left-color: #dc2626;">
        <p style="color: #dc2626; font-weight: 700; font-size: 16px; text-align: center; padding: 15px; border-radius: 4px; border: 2px solid #dc2626;">
          ⚠️ <strong>BOOKING AMOUNT IS NON-REFUNDABLE.</strong>
        </p>
      </div>
      ` : ''}
      
      <div class="enquiry-box" style="background: #eff6ff; border-left-color: #3b82f6;">
        <h2 style="color: #1e40af;">🕐 Check-In / Check-Out Information</h2>
        <div class="detail-row">
          <span class="label">Check-in Time:</span>
          <span class="value"><strong>12:00 PM (Noon)</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out Time:</span>
          <span class="value"><strong>10:00 AM</strong></span>
        </div>
        <p style="margin-top: 15px; color: #1e40af; font-size: 14px; padding: 12px; border-radius: 4px;">
          <strong>Note:</strong> Early check-in and late check-out are subject to availability and may incur additional charges.
        </p>
      </div>
      
      <div class="message">
        <p>Please keep this Enquiry ID - </p>
        <p><strong>(${bookingId})</strong></p>
        <p> You may need it when contacting us about your booking.</p>
      </div>
      
      <div class="contact-info">
        <h3>📞 Need Help?</h3>
        <p><strong>Phone:</strong> 0294-2482909 / 7230082909 / 9828027795 </p>
        <p><strong>Email:</strong> navjeevanudaipur@gmail.com</p>
        <p><strong>Address:</strong> 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Rajasthan)</p>
      </div>
      
      
    
    <div class="footer">
      <p><strong>Hotel Navjeevan Palace, Udaipur</strong></p>
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>For inquiries, please contact us using the information above.</p>
      <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; text-align: center;">
        © 2024 Hotel Navjeevan Palace. All rights reserved.<br>
        Subject to Udaipur Jurisdiction Only
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Dear ${customerName},

Thank you for your interest in Hotel Navjeevan Palace! We have successfully received your room enquiry and our team is currently reviewing your request.

ENQUIRY DETAILS:
- Enquiry ID: ${bookingId}
- Room Type: ${roomType}
- Check-in: ${checkIn}
- Check-out: ${checkOut}
- Nights: ${nights}
- Guests: ${guests}
- Total Amount: ₹${amount}
- Payment Mode: ${paymentMode}
- Payment Status: ${paymentStatus}
- Status: Pending Confirmation

${(paymentMode === 'Bank Transfer' || paymentMode === 'Pay Online') ? `
⚠️ BOOKING AMOUNT IS NON-REFUNDABLE.
` : ''}

CHECK-IN / CHECK-OUT INFORMATION:
- Check-in Time: 12:00 PM (Noon)
- Check-out Time: 10:00 AM
Note: Early check-in and late check-out are subject to availability and may incur additional charges.

Please keep this Enquiry ID (${bookingId}) for your reference.

CONTACT INFORMATION:
Phone: 0294-2482909 / 7230082909
Email: navjeevanhoteludr@yahoo.com
Address: 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Rajasthan)

We look forward to welcoming you to Hotel Navjeevan Palace!

---
Hotel Navjeevan Palace, Udaipur
This is an automated email. Please do not reply.
  `;

  return { htmlContent, textContent };
};

/**
 * Generate Booking Confirmation Email Template
 * @param {Object} booking - Booking object
 * @returns {Object} Email content with HTML and text
 */
const generateBookingConfirmationEmail = (booking) => {
  const customerName = booking.customer_name || booking.name || 'Guest';
  const bookingId = booking.booking_id || 'N/A';
  const roomType = booking.room_type || 'N/A';
  const checkIn = formatDateSafe(booking.check_in);
  const checkOut = formatDateSafe(booking.check_out);
  const nights = booking.nights || 'N/A';
  const guests = booking.guests || 'N/A';
  const amount = (booking.amount || 0).toLocaleString('en-IN');
  const paymentMode = booking.payment_mode || 'N/A';
  // For Pay at Hotel, payment status must always be "Pay at Hotel"
  const paymentStatus = paymentMode === 'Pay at Hotel' ? 'Pay at Hotel' : (booking.payment_status || 'Pending Payment');

  // Bank transfer details section (if applicable - for Pay Online/Bank Transfer)
  const bankTransferSection = (paymentMode === 'Bank Transfer' || paymentMode === 'Pay Online') ? `
      <div class="enquiry-box" style="background: #fef2f2; border-left-color: #dc2626;">
        <h2 style="color: #991b1b;">💳 Bank Transfer Details</h2>
        <div class="detail-row">
          <span class="label">Bank Name:</span>
          <span class="value">${process.env.BANK_NAME || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Account Name:</span>
          <span class="value">${process.env.BANK_ACCOUNT_NAME || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Account Number:</span>
          <span class="value"><strong>${process.env.BANK_ACCOUNT_NUMBER || 'N/A'}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">IFSC Code:</span>
          <span class="value"><strong>${process.env.BANK_IFSC || 'N/A'}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">UPI ID:</span>
          <span class="value">${process.env.BANK_UPI_ID || 'N/A'}</span>
        </div>
        <p style="margin-top: 15px; color: #dc2626; font-weight: 600; font-size: 14px; background: #fef2f2; padding: 12px; border-radius: 4px;">
          📱 <strong>Please share the payment screenshot on the following number:</strong><br>
          <strong style="font-size: 16px;">7230082909</strong>
        </p>
        <p style="margin-top: 15px; color: #dc2626; font-weight: 700; font-size: 16px; background: #fee2e2; padding: 15px; border-radius: 4px; text-align: center; border: 2px solid #dc2626;">
          ⚠️ <strong>BOOKING AMOUNT IS NON-REFUNDABLE.</strong>
        </p>
      </div>
  ` : '';
  
  // Non-refundable notice for Online Payment (separate section if not in bank transfer section)
  const nonRefundableNotice = (paymentMode === 'Bank Transfer' || paymentMode === 'Pay Online') ? '' : '';
  
  // Check-in/Check-out information section (for both payment methods)
  const checkInOutSection = `
      <div class="enquiry-box" style="background: #eff6ff; border-left-color: #3b82f6;">
        <h2 style="color: #1e40af;">🕐 Check-In / Check-Out Information</h2>
        <div class="detail-row">
          <span class="label">Check-in Time:</span>
          <span class="value"><strong>12:00 PM (Noon)</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out Time:</span>
          <span class="value"><strong>10:00 AM</strong></span>
        </div>
        <p style="margin-top: 15px; color: #1e40af; font-size: 14px; padding: 12px; border-radius: 4px;">
          <strong>Note:</strong> Early check-in and late check-out are subject to availability and may incur additional charges.
        </p>
      </div>
  `;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 600;
    }
    .header p { 
      margin: 10px 0 0 0; 
      font-size: 14px; 
      opacity: 0.9;
    }
    .success-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 10px;
    }
    .content { 
      padding: 30px 20px; 
      background: #ffffff; 
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #555555;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .booking-box { 
      background: #f0fdf4; 
      border-left: 4px solid #10b981; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px;
    }
    .booking-box h2 { 
      margin: 0 0 15px 0; 
      color: #065f46; 
      font-size: 18px;
    }
    .detail-row { 
      margin: 12px 0; 
      padding: 8px 0; 
      border-bottom: 1px solid #d1fae5; 
      display: flex;
      justify-content: space-between;
    }
    .detail-row:last-child { 
      border-bottom: none; 
    }
    .label { 
      font-weight: 600; 
      color: #555555; 
      flex: 0 0 40%;
    }
    .value { 
      color: #111827; 
      text-align: right;
      flex: 1;
    }
    .status-badge {
      display: inline-block;
      background: #d1fae5;
      color: #065f46;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }
    .contact-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 4px;
      margin: 25px 0;
    }
    .contact-info h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #111827;
    }
    .contact-info p {
      margin: 6px 0;
      font-size: 14px;
      color: #555555;
    }
    .footer { 
      text-align: center; 
      padding: 25px 20px; 
      background: #f9fafb;
      color: #6b7280; 
      font-size: 12px; 
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🏨 Hotel Navjeevan Palace</h1>
      <p>Booking Confirmed!</p>
      <div class="success-badge">✓ CONFIRMED</div>
    </div>
    
    <div class="content">
      <div class="greeting">
        <p>Dear <strong>${customerName}</strong>,</p>
      </div>
      
      <div class="message">
        <p> We are delighted to inform you that your <strong>booking</strong> at <strong>Hotel Navjeevan Palace</strong> has been <strong>successfully confirmed</strong>.</p>
        <p>We look forward to welcoming you and ensuring you have a comfortable and memorable stay with us.</p>
      </div>
      
      <div class="booking-box">
        <h2>✅ Booking Confirmation Details</h2>
        <div class="detail-row">
          <span class="label">Booking ID:</span>
          <span class="value"><strong style="color: #059669; font-size: 16px;">${bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Room Type:</span>
          <span class="value">${roomType}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-in Date:</span>
          <span class="value">${checkIn}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out Date:</span>
          <span class="value">${checkOut}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Nights:</span>
          <span class="value">${nights}</span>
        </div>
        <div class="detail-row">
          <span class="label">Number of Guests:</span>
          <span class="value">${guests}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Amount:</span>
          <span class="value"><strong style="color: #059669; font-size: 18px;">₹${amount}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Mode:</span>
          <span class="value">${paymentMode}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Status:</span>
          <span class="value"><span class="status-badge">${paymentStatus}</span></span>
        </div>
      </div>
      
      ${bankTransferSection}
      ${nonRefundableNotice}
      ${checkInOutSection}
      
      <div class="message">
        <p>Please keep this Booking ID - </p>
        <p><strong>(${bookingId})</strong></p>
        <p> You may need it when check-in or contacting us about your booking.</p>
      </div>
      
      <div class="contact-info">
        <h3>📞 Contact Information</h3>
        <p><strong>Phone:</strong> 0294-2482909 / 7230082909 / 9828027795 </p>
        <p><strong>Email:</strong> navjeevanudaipur@gmail.com</p>
        <p><strong>Address:</strong> 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Rajasthan)</p>
      </div>
      
      <div class="message">
        <p style="color: #059669; font-weight: 600;">We look forward to welcoming you to Hotel Navjeevan Palace!</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hotel Navjeevan Palace, Udaipur</strong></p>
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>For inquiries, please contact us using the information above.</p>
      <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; text-align: center;">
        © 2024 Hotel Navjeevan Palace. All rights reserved.<br>
        Subject to Udaipur Jurisdiction Only
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Dear ${customerName},

Thank you for choosing Hotel Navjeevan Palace! We are delighted to confirm that your booking has been successfully confirmed.

BOOKING CONFIRMATION DETAILS:
- Booking ID: ${bookingId}
- Room Type: ${roomType}
- Check-in: ${checkIn}
- Check-out: ${checkOut}
- Nights: ${nights}
- Guests: ${guests}
- Total Amount: ₹${amount}
- Payment Mode: ${paymentMode}
- Payment Status: ${paymentStatus}

${(paymentMode === 'Bank Transfer' || paymentMode === 'Pay Online') ? `
BANK TRANSFER DETAILS:
- Bank Name: ${process.env.BANK_NAME || 'N/A'}
- Account Name: ${process.env.BANK_ACCOUNT_NAME || 'N/A'}
- Account Number: ${process.env.BANK_ACCOUNT_NUMBER || 'N/A'}
- IFSC Code: ${process.env.BANK_IFSC || 'N/A'}
- UPI ID: ${process.env.BANK_UPI_ID || 'N/A'}

Please share the payment screenshot on the following number: 7230082909

⚠️ BOOKING AMOUNT IS NON-REFUNDABLE.
` : ''}

CHECK-IN / CHECK-OUT INFORMATION:
- Check-in Time: 12:00 PM (Noon)
- Check-out Time: 10:00 AM
Note: Early check-in and late check-out are subject to availability and may incur additional charges.

Please keep this Booking ID (${bookingId}) for your reference.

CONTACT INFORMATION:
Phone: 0294-2482909 / 7230082909
Email: navjeevanhoteludr@yahoo.com
Address: 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Rajasthan)

We look forward to welcoming you to Hotel Navjeevan Palace!

---
© 2024 Hotel Navjeevan Palace. All rights reserved.
Subject to Udaipur Jurisdiction Only
  `;

  return { htmlContent, textContent };
};

// ============================================
// PUBLIC EMAIL FUNCTIONS
// ============================================

/**
 * Send User Enquiry Acknowledgment Email
 * Triggered: Automatically when user submits an enquiry/booking request
 * 
 * @param {Object} booking - Booking/enquiry object
 * @returns {Promise<Object>} Result object with success status
 */
const sendEnquiryAcknowledgment = async (booking) => {
  try {
    // Validate booking object
    if (!booking || !booking.email) {
      console.error('❌ [EMAIL] Invalid booking object for enquiry acknowledgment');
      return { success: false, error: 'Invalid booking data' };
    }

    // Generate email content
    const { htmlContent, textContent } = generateEnquiryAcknowledgmentEmail(booking);
    const subject = `Enquiry Received - ${booking.booking_id || 'N/A'} - Hotel Navjeevan Palace`;

    // Send email
    const result = await sendEmail({
      to: booking.email,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    });

    return result;

  } catch (error) {
    // Don't crash the server - log and return error
    console.error('❌ [EMAIL] Error in sendEnquiryAcknowledgment:', error.message);
    return { 
      success: false, 
      error: error.message || 'Failed to send enquiry acknowledgment email' 
    };
  }
};

/**
 * Send Booking Confirmation Email
 * Triggered: When admin confirms a booking from admin panel
 * 
 * @param {Object} booking - Booking object
 * @returns {Promise<Object>} Result object with success status
 */
const sendBookingConfirmation = async (booking) => {
  try {
    // Validate booking object
    if (!booking || !booking.email) {
      console.error('❌ [EMAIL] Invalid booking object for confirmation');
      return { success: false, error: 'Invalid booking data' };
    }

    // Generate email content
    const { htmlContent, textContent } = generateBookingConfirmationEmail(booking);
    const subject = `Booking Confirmed - ${booking.booking_id || 'N/A'} - Hotel Navjeevan Palace`;

    // Send email
    const result = await sendEmail({
      to: booking.email,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent
    });

    return result;

  } catch (error) {
    // Don't crash the server - log and return error
    console.error('❌ [EMAIL] Error in sendBookingConfirmation:', error.message);
    return { 
      success: false, 
      error: error.message || 'Failed to send booking confirmation email' 
    };
  }
};

/**
 * Generate Booking Cancelled Email Template
 * @param {Object} booking
 * @returns {Object} Email content
 */
const generateBookingCancelledEmail = (booking) => {
  const customerName = booking.customer_name || 'Guest';
  const bookingId = booking.booking_id || 'N/A';
  const cancelledAt = formatDateSafe(new Date());
  const contactPhone = '0294-2482909 / 7230082909';
  const contactEmail = process.env.CONTACT_EMAIL || 'navjeevanudaipur@gmail.com';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;color:#333}
    .card{max-width:600px;margin:20px auto;background:#fff;padding:20px;border-radius:6px}
    .header{background:#ef4444;color:#fff;padding:16px;border-radius:6px 6px 0 0;text-align:center}
    .content{padding:16px}
    .footer{font-size:12px;color:#666;padding-top:12px}
    .detail{background:#f9fafb;padding:12px;border-radius:4px;margin:12px 0}
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h2>Booking Cancelled - Hotel Navjeevan Palace</h2></div>
    <div class="content">
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>We regret to inform you that your booking has been <strong>cancelled</strong>.</p>

      <div class="detail">
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Guest Name:</strong> ${customerName}</p>
        <p><strong>Cancelled At:</strong> ${cancelledAt}</p>
      </div>

      <p>If you have any questions, please contact us:</p>
      <p><strong>Phone:</strong> ${contactPhone}</p>
      <p><strong>Email:</strong> ${contactEmail}</p>

      <div class="footer">
        <p>This is an automated message from Hotel Navjeevan Palace. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `Dear ${customerName},\n\nYour booking (${bookingId}) has been cancelled on ${cancelledAt}.\nIf you have questions contact ${contactPhone} or ${contactEmail}.\n\nHotel Navjeevan Palace`;

  return { htmlContent, textContent };
};

/**
 * Send Booking Cancelled Email
 */
const sendBookingCancelled = async (booking) => {
  try {
    if (!booking || !booking.email) {
      console.error('❌ [EMAIL] Invalid booking object for cancellation email');
      return { success: false, error: 'Invalid booking data' };
    }

    const { htmlContent, textContent } = generateBookingCancelledEmail(booking);
    const subject = `Booking Cancelled - ${booking.booking_id || 'N/A'} - Hotel Navjeevan Palace`;

    const result = await sendEmail({
      to: booking.email,
      subject,
      htmlContent,
      textContent
    });

    return result;
  } catch (error) {
    console.error('❌ [EMAIL] Error in sendBookingCancelled:', error.message);
    return { success: false, error: error.message || 'Failed to send cancellation email' };
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sendEmail,                    // Core reusable function
  sendEnquiryAcknowledgment,   // User enquiry email (automatic)
  sendBookingConfirmation,      // Admin confirmation email
  sendBookingCancelled          // Admin cancellation email
};
