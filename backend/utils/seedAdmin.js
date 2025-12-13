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
        name: 'Single Bed 1',
        type: 'Single Bed 1',
        price: 999,
        description: 'Comfortable single bed room perfect for solo travelers. Features essential amenities including AC, TV, attached bathroom, and 24/7 hot water.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi'],
        maxGuests: 1,
        images: ['/images/single-bed-1.jpg'],
        isActive: true
      },
      {
        name: 'Single Bed 2',
        type: 'Single Bed 2',
        price: 1499,
        description: 'Spacious single bed room with modern amenities. Ideal for solo travelers seeking extra comfort and space.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi', 'Mini Fridge', 'Comfortable Seating'],
        maxGuests: 1,
        images: ['/images/single-bed-2.jpg'],
        isActive: true
      },
      {
        name: 'Double Bed',
        type: 'Double Bed',
        price: 2999,
        description: 'Comfortable double bed room perfect for couples. Features all modern amenities including AC, TV, attached bathroom, and premium furnishings.',
        amenities: ['AC', 'TV', 'Attached Bathroom', '24/7 Hot Water', 'Room Service', 'Free WiFi', 'Mini Fridge', 'Extra Bedding', 'Premium Furnishings'],
        maxGuests: 2,
        images: ['/images/double-bed.jpg'],
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

