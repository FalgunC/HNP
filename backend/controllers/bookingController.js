const Booking = require('../models/Booking');
const Room = require('../models/Room');
const generateBookingId = require('../utils/generateBookingId');
const { sendEnquiryAcknowledgment } = require('../utils/emailService');

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { room_id, check_in, check_out, customer_name, email, phone, guests, payment_mode } = req.body;

    // Validation
    if (!room_id || !check_in || !check_out || !customer_name || !email || !phone || !guests || !payment_mode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Get room details
    const room = await Room.findById(room_id);
    if (!room || !room.isActive) {
      return res.status(404).json({ error: 'Room not found or not available' });
    }

    // Validate guests
    if (guests > room.maxGuests) {
      return res.status(400).json({ error: `Maximum ${room.maxGuests} guests allowed for this room type` });
    }

    // Calculate amount
    const amount = room.price * nights;

    // Generate unique booking ID
    let bookingId;
    let isUnique = false;
    while (!isUnique) {
      bookingId = generateBookingId();
      const existing = await Booking.findOne({ booking_id: bookingId });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create enquiry (not confirmed booking)
    const booking = new Booking({
      booking_id: bookingId,
      customer_name,
      email,
      phone,
      room_id,
      room_type: room.type,
      check_in: checkInDate,
      check_out: checkOutDate,
      nights,
      guests,
      amount,
      payment_mode,
      payment_status: 'Pending Payment',
      booking_status: 'Enquiry'
    });

    await booking.save();

    // Populate room details for response
    await booking.populate('room_id');

    // Send enquiry acknowledgment email (non-blocking, production-safe)
    // This runs asynchronously and won't block the API response
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

    // Send enquiry acknowledgment email
    (async () => {
      try {
        console.log(`📧 [BOOKING] Sending enquiry acknowledgment email to: ${bookingData.email}`);
        console.log(`📧 [BOOKING] Booking ID: ${bookingData.booking_id}`);
        
        if (!bookingData.email || !bookingData.email.includes('@')) {
          console.error(`❌ [BOOKING] Invalid email address: ${bookingData.email}`);
          return;
        }

        const emailResult = await sendEnquiryAcknowledgment(bookingData);
        if (emailResult && emailResult.success) {
          console.log(`✅ [BOOKING] Enquiry email sent successfully (ID: ${emailResult.messageId || 'N/A'})`);
        } else {
          console.error(`❌ [BOOKING] Enquiry email failed: ${emailResult?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`❌ [BOOKING] Enquiry email error: ${error.message}`);
        console.error(`❌ [BOOKING] Error stack: ${error.stack}`);
      }
    })().catch(error => {
      console.error(`❌ [BOOKING] Email notification error: ${error.message}`);
    });



    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. You will receive an acknowledgment email shortly. Confirmation will be sent after review.',
      booking: {
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
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const booking = await Booking.findOne({ booking_id }).populate('room_id');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Check room availability
const checkAvailability = async (req, res) => {
  try {
    const { room_id, check_in, check_out } = req.query;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({ error: 'room_id, check_in, and check_out are required' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room_id,
      booking_status: { $in: ['Confirmed', 'Checked In'] },
      $or: [
        {
          check_in: { $lte: checkInDate },
          check_out: { $gt: checkInDate }
        },
        {
          check_in: { $lt: checkOutDate },
          check_out: { $gte: checkOutDate }
        },
        {
          check_in: { $gte: checkInDate },
          check_out: { $lte: checkOutDate }
        }
      ]
    });

    const isAvailable = overlappingBookings.length === 0;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Room is available' : 'Room is not available for selected dates'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  checkAvailability
};

