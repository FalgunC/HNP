const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_id: {
    type: String,
    required: true,
    unique: true
  },
  customer_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  room_type: {
    type: String,
    required: true
  },
  check_in: {
    type: Date,
    required: true
  },
  check_out: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true
  },
  payment_mode: {
    type: String,
    required: true,
    enum: ['Pay at Hotel', 'Bank Transfer']
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['Pending Payment', 'Paid', 'Confirmed'],
    default: 'Pending Payment'
  },
  booking_status: {
    type: String,
    required: true,
    enum: ['Enquiry', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
    default: 'Enquiry'
  },
  payment_proof: {
    type: String // URL or path to uploaded payment proof
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ booking_id: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ check_in: 1, check_out: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

