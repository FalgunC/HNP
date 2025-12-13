const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Hotel Navjeevan Palace',
      to: booking.email,
      subject: `Booking Confirmation - ${booking.booking_id}`,
      html: `
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
              <p>Dear ${booking.customer_name},</p>
              <p>Thank you for choosing Hotel Navjeevan Palace! Your booking has been confirmed.</p>
              
              <div class="booking-details">
                <h2>Booking Details</h2>
                <div class="detail-row">
                  <span class="label">Booking ID:</span> ${booking.booking_id}
                </div>
                <div class="detail-row">
                  <span class="label">Room Type:</span> ${booking.room_type}
                </div>
                <div class="detail-row">
                  <span class="label">Check-in:</span> ${new Date(booking.check_in).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="detail-row">
                  <span class="label">Check-out:</span> ${new Date(booking.check_out).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="detail-row">
                  <span class="label">Number of Nights:</span> ${booking.nights}
                </div>
                <div class="detail-row">
                  <span class="label">Guests:</span> ${booking.guests}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> ₹${booking.amount.toLocaleString('en-IN')}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Mode:</span> ${booking.payment_mode}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> ${booking.payment_status}
                </div>
              </div>
              
              ${booking.payment_mode === 'Bank Transfer' && booking.payment_status === 'Pending Payment' ? `
              <div class="booking-details">
                <h3>Bank Transfer Details</h3>
                <p><strong>Bank Name:</strong> ${process.env.BANK_NAME}</p>
                <p><strong>Account Name:</strong> ${process.env.BANK_ACCOUNT_NAME}</p>
                <p><strong>Account Number:</strong> ${process.env.BANK_ACCOUNT_NUMBER}</p>
                <p><strong>IFSC Code:</strong> ${process.env.BANK_IFSC}</p>
                <p><strong>UPI ID:</strong> ${process.env.BANK_UPI_ID}</p>
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
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation
};

