/**
 * Test script for Brevo Email API
 * 
 * Usage: node utils/testBrevoEmail.js
 * 
 * Make sure to set BREVO_API_KEY, BREVO_SENDER_EMAIL, and BREVO_SENDER_NAME in .env
 */

require('dotenv').config();
const { sendBookingConfirmation, sendEnquiryAcknowledgment } = require('./emailService');

// Test booking data
const testBooking = {
  booking_id: 'TEST-' + Date.now(),
  customer_name: 'Test User',
  email: 'phalgunchoudhary@gmail.com', // Change this to your email for testing
  phone: '1234567890',
  room_type: 'Deluxe Room',
  check_in: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  check_out: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
  nights: 2,
  guests: 2,
  amount: 2998,
  payment_mode: 'Pay at Hotel',
  payment_status: 'Confirmed'
};

const testEnquiry = {
  booking_id: 'ENQ-' + Date.now(),
  customer_name: 'Test Enquiry User',
  email: 'phalgunchoudhary@gmail.com', // Change this to your email for testing
  phone: '1234567890',
  room_type: 'Standard Room',
  check_in: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  check_out: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  nights: 2,
  guests: 1,
  amount: 1998,
  payment_mode: 'Bank Transfer',
  payment_status: 'Pending Payment'
};

async function testEmails() {
  console.log('🧪 Testing Brevo Email Service...\n');
  
  // Check configuration
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set in .env file');
    console.error('💡 Please add BREVO_API_KEY to your .env file');
    process.exit(1);
  }
  
  if (!process.env.BREVO_SENDER_EMAIL) {
    console.warn('⚠️  BREVO_SENDER_EMAIL is not set, using default');
  }
  
  console.log('✅ Configuration check passed\n');
  
  // Test booking confirmation email
  console.log('📧 Testing Booking Confirmation Email...');
  console.log(`   Sending to: ${testBooking.email}`);
  try {
    const result1 = await sendBookingConfirmation(testBooking);
    if (result1.success) {
      console.log('✅ Booking confirmation email sent successfully!\n');
    } else {
      console.error('❌ Failed to send booking confirmation email:', result1.error);
    }
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error.message);
  }
  
  // Wait a bit before sending second email
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test enquiry acknowledgment email
  console.log('📧 Testing Enquiry Acknowledgment Email...');
  console.log(`   Sending to: ${testEnquiry.email}`);
  try {
    const result2 = await sendEnquiryAcknowledgment(testEnquiry);
    if (result2.success) {
      console.log('✅ Enquiry acknowledgment email sent successfully!\n');
    } else {
      console.error('❌ Failed to send enquiry acknowledgment email:', result2.error);
    }
  } catch (error) {
    console.error('❌ Error sending enquiry acknowledgment:', error.message);
  }
  
  console.log('\n✨ Test completed!');
  console.log('💡 Check your email inbox (and spam folder) for the test emails');
  console.log('💡 If emails are not received, check:');
  console.log('   1. BREVO_API_KEY is correct');
  console.log('   2. BREVO_SENDER_EMAIL is verified in Brevo dashboard');
  console.log('   3. Test email address is correct');
  console.log('   4. Check Brevo dashboard → Statistics for email status');
}

// Run the test
testEmails().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

