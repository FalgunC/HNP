const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const roomController = require('../controllers/roomController');

// Room routes
router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/:id', roomController.getRoomById);

// Booking routes
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/:booking_id', bookingController.getBookingById);
router.get('/availability', bookingController.checkAvailability);

// Bank details endpoint (for booking page)
router.get('/bank-details', (req, res) => {
  res.json({
    success: true,
    bankDetails: {
      bankName: process.env.BANK_NAME || 'State Bank of India',
      accountName: process.env.BANK_ACCOUNT_NAME || 'Hotel Navjeevan Palace',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890123456',
      ifscCode: process.env.BANK_IFSC || 'SBIN0001234',
      upiId: process.env.BANK_UPI_ID || 'navjeevanpalace@paytm'
    }
  });
});

module.exports = router;
