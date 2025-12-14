const AdminUser = require('../models/AdminUser');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendBookingConfirmation } = require('../utils/emailService');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

// Admin login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('admin/login', { error: 'Email and password are required' });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      console.log('Login attempt - Admin not found:', email);
      return res.render('admin/login', { error: 'Invalid email or password' });
    }

    if (!admin.isActive) {
      console.log('Login attempt - Admin inactive:', email);
      return res.render('admin/login', { error: 'Account is inactive. Please contact administrator.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Login attempt - Password mismatch:', email);
      return res.render('admin/login', { error: 'Invalid email or password' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Set session
    req.session.adminId = admin._id.toString();
    req.session.adminEmail = admin.email;
    req.session.adminName = admin.name;

    console.log('✅ Admin login successful:', email);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', { error: 'Login failed. Please try again. Error: ' + error.message });
  }
};

// Admin logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

// Dashboard
const dashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get statistics
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });
    
    const pendingEnquiries = await Booking.countDocuments({
      booking_status: 'Enquiry'
    });
    
    const confirmedBookings = await Booking.countDocuments({
      booking_status: { $in: ['Confirmed', 'Checked In'] }
    });

    // Calculate revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          payment_status: { $in: ['Paid', 'Confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('room_id')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upcoming check-ins (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingCheckIns = await Booking.find({
      check_in: { $gte: today, $lte: nextWeek },
      booking_status: { $in: ['Confirmed', 'Checked In'] }
    })
      .populate('room_id')
      .sort({ check_in: 1 })
      .limit(10);

    res.render('admin/dashboard', {
      adminName: req.session.adminName,
      stats: {
        totalBookings,
        todayBookings,
        pendingEnquiries,
        confirmedBookings,
        totalRevenue
      },
      recentBookings,
      upcomingCheckIns
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/error', { error: 'Failed to load dashboard' });
  }
};

// View all bookings
const viewBookings = async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      date_from, 
      date_to,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) {
      query.booking_status = status;
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    if (date_from || date_to) {
      query.check_in = {};
      if (date_from) {
        query.check_in.$gte = new Date(date_from);
      }
      if (date_to) {
        query.check_in.$lte = new Date(date_to);
      }
    }

    if (search) {
      query.$or = [
        { booking_id: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('room_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.render('admin/bookings', {
      bookings,
      filters: { status, payment_status, date_from, date_to, search },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('View bookings error:', error);
    res.render('admin/error', { error: 'Failed to load bookings' });
  }
};

// View single booking
const viewBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('room_id');
    
    if (!booking) {
      return res.render('admin/error', { error: 'Booking not found' });
    }

    res.render('admin/booking-detail', { booking });
  } catch (error) {
    console.error('View booking error:', error);
    res.render('admin/error', { error: 'Failed to load booking' });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.booking_status = booking_status;
    await booking.save();

    res.json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.payment_status = 'Paid';
    booking.booking_status = 'Confirmed';
    await booking.save();

    // Populate room details
    await booking.populate('room_id');

    // Convert booking to plain object
    const bookingData = {
      booking_id: booking.booking_id,
      customer_name: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      room_type: booking.room_type,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights: booking.nights,
      guests: booking.guests,
      amount: booking.amount,
      payment_mode: booking.payment_mode,
      payment_status: booking.payment_status,
      booking_status: booking.booking_status
    };

    // Send confirmation email (non-blocking, production-safe)
    (async () => {
      try {
        console.log(`📧 [ADMIN] Sending confirmation email to: ${bookingData.email}`);
        const emailResult = await sendBookingConfirmation(bookingData);
        if (emailResult && emailResult.success) {
          console.log(`✅ [ADMIN] Confirmation email sent successfully (ID: ${emailResult.messageId || 'N/A'})`);
        } else {
          console.error(`❌ [ADMIN] Confirmation email failed: ${emailResult?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`❌ [ADMIN] Confirmation email error: ${error.message}`);
      }
    })().catch(error => {
      console.error(`❌ [ADMIN] Email notification error: ${error.message}`);
    });

    res.json({ success: true, message: 'Payment confirmed and confirmation email sent' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Confirm enquiry (convert enquiry to confirmed booking)
const confirmEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.booking_status !== 'Enquiry') {
      return res.status(400).json({ error: 'This is not an enquiry. Only enquiries can be confirmed.' });
    }

    // Update booking status to Confirmed
    booking.booking_status = 'Confirmed';
    if (booking.payment_mode === 'Pay at Hotel') {
      booking.payment_status = 'Confirmed';
    }
    await booking.save();

    // Populate room details
    await booking.populate('room_id');

    // Convert booking to plain object to ensure all fields are available
    const bookingData = {
      booking_id: booking.booking_id,
      customer_name: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      room_type: booking.room_type,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights: booking.nights,
      guests: booking.guests,
      amount: booking.amount,
      payment_mode: booking.payment_mode,
      payment_status: booking.payment_status,
      booking_status: booking.booking_status
    };

    // Send confirmation email (production-ready with proper error handling)
    let emailResult = { success: false, error: null };

    try {
      console.log(`📧 [ADMIN] Sending confirmation email to: ${bookingData.email}`);
      console.log(`📧 [ADMIN] Booking ID: ${bookingData.booking_id}`);
      
      if (!bookingData.email || !bookingData.email.includes('@')) {
        console.error(`❌ [ADMIN] Invalid email address: ${bookingData.email}`);
        emailResult = { success: false, error: 'Invalid email address' };
      } else {
        emailResult = await sendBookingConfirmation(bookingData);
        if (emailResult && emailResult.success) {
          console.log(`✅ [ADMIN] Confirmation email sent successfully (ID: ${emailResult.messageId || 'N/A'})`);
        } else {
          console.error(`❌ [ADMIN] Confirmation email failed: ${emailResult?.error || 'Unknown error'}`);
          emailResult = { success: false, error: emailResult?.error || 'Unknown error' };
        }
      }
    } catch (error) {
      console.error(`❌ [ADMIN] Confirmation email error: ${error.message}`);
      console.error(`❌ [ADMIN] Error stack: ${error.stack}`);
      emailResult = { success: false, error: error.message };
    }

    // Always return success even if email fails (booking is confirmed)
    res.json({ 
      success: true, 
      message: 'Enquiry confirmed! Confirmation email sent to customer.',
      emailSent: emailResult.success,
      emailError: emailResult.success ? null : emailResult.error
    });
  } catch (error) {
    console.error('Confirm enquiry error:', error);
    res.status(500).json({ error: 'Failed to confirm enquiry: ' + error.message });
  }
};

// Export bookings to CSV
const exportBookings = async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      date_from, 
      date_to 
    } = req.query;

    const query = {};

    if (status) {
      query.booking_status = status;
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    if (date_from || date_to) {
      query.check_in = {};
      if (date_from) {
        query.check_in.$gte = new Date(date_from);
      }
      if (date_to) {
        query.check_in.$lte = new Date(date_to);
      }
    }

    const bookings = await Booking.find(query)
      .populate('room_id')
      .sort({ createdAt: -1 });

    const csvPath = path.join(__dirname, '../temp/bookings-export.csv');
    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'booking_id', title: 'Booking ID' },
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'room_type', title: 'Room Type' },
        { id: 'check_in', title: 'Check-in' },
        { id: 'check_out', title: 'Check-out' },
        { id: 'nights', title: 'Nights' },
        { id: 'guests', title: 'Guests' },
        { id: 'amount', title: 'Amount' },
        { id: 'payment_mode', title: 'Payment Mode' },
        { id: 'payment_status', title: 'Payment Status' },
        { id: 'booking_status', title: 'Booking Status' },
        { id: 'created_at', title: 'Created At' }
      ]
    });

    const records = bookings.map(booking => ({
      booking_id: booking.booking_id,
      customer_name: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      room_type: booking.room_type,
      check_in: booking.check_in.toLocaleDateString('en-IN'),
      check_out: booking.check_out.toLocaleDateString('en-IN'),
      nights: booking.nights,
      guests: booking.guests,
      amount: booking.amount,
      payment_mode: booking.payment_mode,
      payment_status: booking.payment_status,
      booking_status: booking.booking_status,
      created_at: booking.createdAt.toLocaleDateString('en-IN')
    }));

    await csvWriter.writeRecords(records);

    res.download(csvPath, `bookings-export-${Date.now()}.csv`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file
      setTimeout(() => {
        if (fs.existsSync(csvPath)) {
          fs.unlinkSync(csvPath);
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Export bookings error:', error);
    res.status(500).json({ error: 'Failed to export bookings' });
  }
};

module.exports = {
  login,
  logout,
  dashboard,
  viewBookings,
  viewBooking,
  updateBookingStatus,
  confirmPayment,
  confirmEnquiry,
  exportBookings
};

