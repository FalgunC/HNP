# Hotel Navjeevan Palace - Booking Website

A production-ready hotel booking website for Hotel Navjeevan Palace, Udaipur, Rajasthan.

## 🏨 Hotel Information

- **Name:** Hotel Navjeevan Palace
- **Location:** 1, Shivaji Nagar, City Station Road, Udaipur-313001 (Raj.)
- **Phone:** 0294-2482909 / 7230082909
- **Email:** navjeevanhoteludr@yahoo.com

## 🚀 Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Static pages optimized for Netlify

### Backend
- Node.js
- Express.js
- EJS (for admin panel)
- MongoDB Atlas (Mongoose)
- express-session (authentication)
- bcrypt (password hashing)
- Nodemailer (email notifications)
- MSG91/Twilio (SMS notifications)

## 📁 Project Structure

```
H_N_P/
├── backend/
│   ├── models/          # MongoDB models
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utilities (email, SMS, etc.)
│   ├── views/            # EJS templates (admin panel)
│   ├── public/           # Static assets
│   ├── temp/             # Temporary files (CSV exports)
│   ├── server.js         # Main server file
│   └── package.json
├── frontend/
│   ├── index.html        # Home page
│   ├── rooms.html        # Rooms & pricing
│   ├── booking.html      # Booking form
│   ├── confirmation.html # Booking confirmation
│   ├── about.html        # About us
│   ├── contact.html      # Contact page
│   ├── robots.txt        # SEO
│   ├── sitemap.xml       # SEO
│   └── netlify.toml       # Netlify config
├── .gitignore
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for email notifications)
- MSG91 account (for SMS - optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   - Set `MONGODB_URI` (MongoDB Atlas connection string)
   - Set `SESSION_SECRET` (random string)
   - Configure email settings (Gmail)
   - Configure SMS settings (MSG91 - optional)
   - Set bank details for online payments

5. **Seed database:**
   ```bash
   npm run seed
   ```
   This creates:
   - Admin user (default: admin@hotelnavjeevanpalace.com / Admin@123)
   - Room types (Standard, Deluxe, Family Suite)

6. **Start server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Update API URL:**
   Edit `frontend/config.js` and update the `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```
   This single file is used by all HTML pages, so you only need to update it once.

2. **Deploy to Netlify:**
   - Connect your repository to Netlify
   - Set build directory to `frontend`
   - Deploy

## 📋 Room Categories & Pricing

- **Standard Room:** ₹999/night (Max 2 guests)
- **Deluxe Room:** ₹1499/night (Max 3 guests)
- **Family Suite:** ₹2999/night (Max 4 guests)

## 🔐 Admin Panel

### Access
- URL: `http://your-backend-url.com/admin/login`
- Default credentials (change after first login):
  - Email: `admin@hotelnavjeevanpalace.com`
  - Password: `Admin@123`

### Features
- View all bookings
- Filter bookings by status, payment, date
- Confirm bank transfer payments
- Mark check-in/check-out
- Export bookings to CSV
- Dashboard with statistics

## 💳 Payment Modes

1. **Pay at Hotel:**
   - Booking confirmed immediately
   - Payment on arrival

2. **Bank Transfer:**
   - Booking status: Pending Payment
   - Bank details shown to customer
   - Admin confirms payment manually
   - Notifications sent after confirmation

## 📧 Notifications

### Email
- Sent automatically after booking
- Includes booking details
- Bank transfer details (if applicable)

### SMS
- Sent automatically after booking
- Includes booking ID and key details
- Requires MSG91 configuration

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:booking_id` - Get booking by ID
- `GET /api/availability` - Check room availability

### Admin Endpoints (Protected)
- `GET /admin/login` - Login page
- `POST /admin/login` - Login
- `GET /admin/dashboard` - Dashboard
- `GET /admin/bookings` - All bookings
- `GET /admin/bookings/:id` - Booking details
- `PUT /admin/bookings/:id/status` - Update booking status
- `PUT /admin/bookings/:id/confirm-payment` - Confirm payment
- `GET /admin/export` - Export bookings to CSV

## 🚢 Deployment

### Backend (Render/Railway/Cyclic)

1. **Render:**
   - Connect GitHub repository
   - Set root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables

2. **Railway:**
   - Connect repository
   - Set root directory: `backend`
   - Add environment variables
   - Deploy

3. **Cyclic:**
   - Connect repository
   - Set root directory: `backend`
   - Add environment variables
   - Deploy

### Frontend (Netlify)

1. Connect repository
2. Set base directory: `frontend`
3. Build command: (none - static site)
4. Publish directory: `frontend`
5. Update `API_BASE_URL` in all HTML files to point to backend URL

## 🔒 Security Notes

- Change default admin password immediately
- Use strong `SESSION_SECRET`
- Keep `.env` file secure (never commit)
- Use HTTPS in production
- Configure CORS properly

## 📝 Environment Variables

See `backend/.env.example` for all required variables.

## 🐛 Troubleshooting

### Email not sending
- Check Gmail app password (not regular password)
- Enable "Less secure app access" or use app password
- Verify SMTP settings

### SMS not sending
- Verify MSG91 auth key
- Check phone number format (should include country code)
- SMS is optional - booking works without it

### MongoDB connection issues
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Verify network access

## 📞 Support

For issues or questions:
- Email: navjeevanhoteludr@yahoo.com
- Phone: 0294-2482909 / 7230082909

## 📄 License

This project is proprietary software for Hotel Navjeevan Palace.

---

**Built with ❤️ for Hotel Navjeevan Palace, Udaipur**

