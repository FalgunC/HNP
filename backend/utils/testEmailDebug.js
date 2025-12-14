/**
 * Debug script to test email service
 * Run this to diagnose email issues
 */

require('dotenv').config();
const { sendEnquiryAcknowledgment, sendBookingConfirmation } = require('./emailService');

async function testEmailDebug() {
  console.log('🔍 Email Service Debug Test\n');
  console.log('═══════════════════════════════════════════════════');
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Set' : '❌ NOT SET');
  console.log('BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL || '❌ NOT SET');
  console.log('BREVO_SENDER_NAME:', process.env.BREVO_SENDER_NAME || '❌ NOT SET');
  
  if (!process.env.BREVO_API_KEY) {
    console.error('\n❌ BREVO_API_KEY is not set!');
    console.error('💡 Please set BREVO_API_KEY in your .env file');
    process.exit(1);
  }
  
  // Test booking data
  const testBooking = {
    booking_id: 'TEST-' + Date.now(),
    customer_name: 'Test User',
    email: 'manoj9828@gmail.com', // Change this to your email
    phone: '1234567890',
    room_type: 'Deluxe Room',
    check_in: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    check_out: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    nights: 2,
    guests: 2,
    amount: 2998,
    payment_mode: 'Pay at Hotel',
    payment_status: 'Confirmed'
  };
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📧 Testing Enquiry Acknowledgment Email...');
  console.log('═══════════════════════════════════════════════════');
  console.log('Booking Data:', JSON.stringify(testBooking, null, 2));
  
  try {
    const result = await sendEnquiryAcknowledgment(testBooking);
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Email sent successfully!');
      console.log('💡 Check your email inbox (and spam folder)');
    } else {
      console.log('\n❌ FAILED! Email not sent.');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📧 Testing Booking Confirmation Email...');
  console.log('═══════════════════════════════════════════════════');
  
  try {
    const result2 = await sendBookingConfirmation(testBooking);
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result2, null, 2));
    
    if (result2.success) {
      console.log('\n✅ SUCCESS! Email sent successfully!');
      console.log('💡 Check your email inbox (and spam folder)');
    } else {
      console.log('\n❌ FAILED! Email not sent.');
      console.log('Error:', result2.error);
      console.log('Details:', result2.details);
    }
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ Debug test completed!');
  console.log('═══════════════════════════════════════════════════\n');
}

testEmailDebug().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

