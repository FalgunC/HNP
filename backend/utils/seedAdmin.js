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
    
    let existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Update password if it's the default or if we want to reset it
      if (process.env.RESET_ADMIN_PASSWORD === 'true') {
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log('✅ Admin user password updated:', adminEmail);
        console.log('   New Password:', adminPassword);
      } else {
        console.log('⚠️ Admin user already exists:', adminEmail);
        console.log('   To reset password, set RESET_ADMIN_PASSWORD=true in .env');
      }
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
        name: 'Pocket Friendly',
        type: 'Pocket Friendly',
        price: 651,
        description: 'Simple, clean, and affordable stay for short visits.',
        amenities: [ 'TV', 'Cooler', 'Attached Bathroom', 'Hot Water','Room Service'],
        maxGuests: 2,
        images: ['/images/ordinary-basic.jpg'],
        isActive: true
      },
      {
        name: 'Ordinary / Basic Room',
        type: 'Ordinary / Basic Room',
        price: 999,
        description: 'Clean and simple room. Best for budget travelers at affordable rates.',
        amenities: [ 'Air cooled', 'TV', 'Attached Bathroom', 'Hot Water', 'Room Service'],
        maxGuests: 2,
        images: ['/images/ordinary-basic.jpg'],
        isActive: true
      },
      {
        name: 'Budget / Economy Room',
        type: 'Budget / Economy Room',
        price: 1450,
        description: 'Comfortable room with better space and amenities.',
        amenities: ['AC','TV', 'Attached Bathroom', 'Hot Water','Room Service'],
        maxGuests: 2,
        images: ['/images/budget-economy.jpg'],
        isActive: true
      },
      {
        name: 'Standard Room',
        type: 'Standard Room',
        price: 2950,
        description: 'More spacious and comfortable room with essential amenities.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service'],
        maxGuests: 2,
        images: ['/images/standard.jpg'],
        isActive: true
      }
    ];
    

    // Delete old rooms and create new ones with updated data
    await Room.deleteMany({});
    console.log('🗑️  Old rooms deleted');
    
    for (const roomData of rooms) {
      const room = new Room(roomData);
      await room.save();
      console.log(`✅ Room created: ${roomData.type} - ₹${roomData.price}/night`);
    }

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();

