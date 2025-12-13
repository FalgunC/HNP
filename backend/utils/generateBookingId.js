// Generate unique booking ID
const generateBookingId = () => {
  const prefix = 'NJP';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

module.exports = generateBookingId;

