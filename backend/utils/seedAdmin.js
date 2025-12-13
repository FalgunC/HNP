require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const Room = require('../models/Room');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_navjeevan');
    console.log('✅ Connected to MongoDB');

    // Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hotelnavjeevanpalace.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
    } else {
      const admin = new AdminUser({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        role: 'super_admin'
      });
      await admin.save();
      console.log('✅ Admin user created:', adminEmail);
      console.log('   Password:', adminPassword);
    }

    // Seed Rooms
    const rooms = [
      {
        name: 'Standard Room',
        type: 'Standard Room',
        price: 999,
        description: 'Comfortable budget-friendly room perfect for solo travelers or couples. Features essential amenities for a pleasant stay.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi'],
        maxGuests: 2,
        images: [],
        isActive: true
      },
      {
        name: 'Deluxe Room',
        type: 'Deluxe Room',
        price: 1499,
        description: 'Spacious and well-appointed room with modern amenities. Ideal for families or guests seeking extra comfort.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi', 'Mini Fridge', 'Comfortable Seating'],
        maxGuests: 3,
        images: [],
        isActive: true
      },
      {
        name: 'Family Suite',
        type: 'Family Suite',
        price: 2999,
        description: 'Luxurious family suite with separate living area. Perfect for families or groups looking for premium accommodation.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi', 'Mini Fridge', 'Living Area', 'Extra Bedding', 'Premium Furnishings'],
        maxGuests: 4,
        images: [],
        isActive: true
      }
    ];

    for (const roomData of rooms) {
      const existingRoom = await Room.findOne({ type: roomData.type });
      if (existingRoom) {
        console.log(`⚠️ Room ${roomData.type} already exists`);
      } else {
        const room = new Room(roomData);
        await room.save();
        console.log(`✅ Room created: ${roomData.type}`);
      }
    }

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();

