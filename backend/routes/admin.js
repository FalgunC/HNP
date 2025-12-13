const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', isNotAuthenticated, adminController.login);

router.get('/logout', isAuthenticated, adminController.logout);

// Dashboard
router.get('/dashboard', isAuthenticated, adminController.dashboard);

// Bookings
router.get('/bookings', isAuthenticated, adminController.viewBookings);
router.get('/bookings/:id', isAuthenticated, adminController.viewBooking);
router.put('/bookings/:id/status', isAuthenticated, adminController.updateBookingStatus);
router.put('/bookings/:id/confirm-payment', isAuthenticated, adminController.confirmPayment);
router.put('/bookings/:id/confirm-enquiry', isAuthenticated, adminController.confirmEnquiry);

// Export
router.get('/export', isAuthenticated, adminController.exportBookings);

module.exports = router;

