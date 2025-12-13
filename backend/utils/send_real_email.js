const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sendBookingConfirmation } = require('./emailService');

(async () => {
  const booking = {
    booking_id: 'REALTEST-' + Date.now(),
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

  try {
    console.log('Using SMTP host:', process.env.EMAIL_HOST, 'port:', process.env.EMAIL_PORT);
    const result = await sendBookingConfirmation(booking);
    console.log('Result:', result);
  } catch (err) {
    console.error('Send failed:', err);
    process.exitCode = 1;
  }
})();
