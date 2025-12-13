const Room = require('../models/Room');

// Get all active rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    
    if (!room || !room.isActive) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

module.exports = {
  getAllRooms,
  getRoomById
};

