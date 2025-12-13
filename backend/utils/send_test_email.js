const nodemailer = require('nodemailer');

(async () => {
  try {
    // Create a test account and transporter
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Sample booking object
    const booking = {
      booking_id: 'TEST12345',
      customer_name: 'Phalgun Choudhary',
      email: 'phalgunchoudhary@gmail.com',
      phone: '9999999999',
      room_type: 'Deluxe',
      check_in: new Date(Date.now() + 24 * 60 * 60 * 1000),
      check_out: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      nights: 2,
      guests: 2,
      amount: 4500,
      payment_mode: 'Pay at Hotel',
      payment_status: 'Confirmed'
    };

    const html = `<!doctype html><html><body>
      <h2>Booking Confirmation - ${booking.booking_id}</h2>
      <p>Dear ${booking.customer_name},</p>
      <p>Your booking for a ${booking.room_type} room is confirmed.</p>
      <ul>
        <li>Check-in: ${new Date(booking.check_in).toLocaleString()}</li>
        <li>Check-out: ${new Date(booking.check_out).toLocaleString()}</li>
        <li>Nights: ${booking.nights}</li>
        <li>Guests: ${booking.guests}</li>
        <li>Amount: ₹${booking.amount}</li>
      </ul>
      <p>Thank you — Hotel Navjeevan Palace</p>
    </body></html>`;

    const info = await transporter.sendMail({
      from: 'Hotel Navjeevan Palace <no-reply@example.com>',
      to: booking.email,
      subject: `Booking Confirmation - ${booking.booking_id}`,
      html
    });

    console.log('Message sent:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL:', preview);
    else console.log('No preview URL available.');
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exitCode = 1;
  }
})();
