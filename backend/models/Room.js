const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Standard Room', 'Deluxe Room', 'Family Suite']
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amenities: [{
    type: String
  }],
  maxGuests: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

