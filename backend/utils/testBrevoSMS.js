/**
 * Test script for Brevo SMS API
 * 
 * Usage: node utils/testBrevoSMS.js
 * 
 * Make sure to set BREVO_API_KEY and BREVO_SMS_SENDER in .env
 */

require('dotenv').config();
const { sendBookingConfirmationSMS, sendEnquiryAcknowledgmentSMS, sendViaBrevo } = require('./smsService');

// Test booking data
const testBooking = {
  booking_id: 'TEST-' + Date.now(),
  customer_name: 'Test User',
  phone: '1234567890', // Change this to your phone number for testing (10 digits, no country code)
  email: 'test@example.com',
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
  phone: '1234567890', // Change this to your phone number for testing
  email: 'test@example.com',
  room_type: 'Standard Room',
  check_in: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  check_out: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  nights: 2,
  guests: 1,
  amount: 1998,
  payment_mode: 'Bank Transfer',
  payment_status: 'Pending Payment'
};

async function testSMS() {
  console.log('🧪 Testing Brevo SMS Service...\n');
  
  // Check configuration
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set in .env file');
    console.error('💡 Please add BREVO_API_KEY to your .env file');
    console.error('💡 Get your API key from: https://app.brevo.com/settings/keys/api');
    process.exit(1);
  }
  
  if (!process.env.BREVO_SMS_SENDER) {
    console.warn('⚠️  BREVO_SMS_SENDER is not set, using default: NAVJEE');
    console.warn('💡 Make sure to configure sender in Brevo Dashboard → SMS → Senders');
  }
  
  console.log('✅ Configuration check passed\n');
  
  // Validate phone number
  if (!testBooking.phone || testBooking.phone === '1234567890') {
    console.warn('⚠️  Please update testBooking.phone with your actual phone number');
    console.warn('   Format: 10 digits (e.g., 9876543210) or with country code');
  }
  
  // Test booking confirmation SMS
  console.log('📱 Testing Booking Confirmation SMS...');
  console.log(`   Sending to: ${testBooking.phone}`);
  try {
    const result1 = await sendBookingConfirmationSMS(testBooking);
    if (result1.success) {
      console.log('✅ Booking confirmation SMS sent successfully!');
      console.log('   Message ID:', result1.messageId);
    } else {
      console.error('❌ Failed to send booking confirmation SMS:', result1.error);
    }
  } catch (error) {
    console.error('❌ Error sending booking confirmation SMS:', error.message);
  }
  
  // Wait a bit before sending second SMS
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test enquiry acknowledgment SMS
  console.log('\n📱 Testing Enquiry Acknowledgment SMS...');
  console.log(`   Sending to: ${testEnquiry.phone}`);
  try {
    const result2 = await sendEnquiryAcknowledgmentSMS(testEnquiry);
    if (result2.success) {
      console.log('✅ Enquiry acknowledgment SMS sent successfully!');
      console.log('   Message ID:', result2.messageId);
    } else {
      console.error('❌ Failed to send enquiry acknowledgment SMS:', result2.error);
    }
  } catch (error) {
    console.error('❌ Error sending enquiry acknowledgment SMS:', error.message);
  }
  
  // Test simple SMS
  console.log('\n📱 Testing Simple SMS...');
  const testPhone = testBooking.phone;
  const testMessage = 'Test SMS from Hotel Navjeevan Palace booking system. This is a test message.';
  console.log(`   Sending to: ${testPhone}`);
  try {
    const { sendViaBrevo } = require('./smsService');
    const result3 = await sendViaBrevo(testPhone, testMessage);
    if (result3.success) {
      console.log('✅ Simple SMS sent successfully!');
      console.log('   Message ID:', result3.messageId);
    } else {
      console.error('❌ Failed to send simple SMS:', result3.error);
    }
  } catch (error) {
    console.error('❌ Error sending simple SMS:', error.message);
  }
  
  console.log('\n✨ Test completed!');
  console.log('💡 Check your phone for the test SMS messages');
  console.log('💡 If SMS are not received, check:');
  console.log('   1. BREVO_API_KEY is correct');
  console.log('   2. BREVO_SMS_SENDER is configured in Brevo dashboard');
  console.log('   3. Phone number is correct (10 digits for India)');
  console.log('   4. You have SMS credits in Brevo account');
  console.log('   5. Check Brevo dashboard → SMS → Statistics for SMS status');
  console.log('\n📊 Brevo SMS Dashboard: https://app.brevo.com/sms/campaigns');
}

// Run the test
testSMS().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

