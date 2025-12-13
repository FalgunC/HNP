# Quick Start Guide - Hotel Navjeevan Palace

Get the booking website up and running locally in minutes.

## ⚡ Quick Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Edit .env with your MongoDB connection string

# Seed database (creates admin user and rooms)
npm run seed

# Start server
npm start
```

Backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Open index.html in browser
# Or use a local server:
# Python: python -m http.server 8888
# Node: npx http-server -p 8888
```

Frontend will run on `http://localhost:8888`

### 3. Access Points

- **Frontend:** http://localhost:8888
- **Backend API:** http://localhost:3000/api
- **Admin Panel:** http://localhost:3000/admin/login
  - Email: `admin@hotelnavjeevanpalace.com`
  - Password: `Admin@123`

## 🔧 Minimum Configuration

For local testing, you only need:

1. **MongoDB Connection:**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to `.env` as `MONGODB_URI`

2. **Session Secret:**
   - Generate random string
   - Add to `.env` as `SESSION_SECRET`

3. **Update Frontend API URL:**
   - In all HTML files, set:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

## ✅ Test the System

1. **Visit frontend:** http://localhost:8888
2. **Click "Book Now"**
3. **Fill booking form**
4. **Submit booking**
5. **Check admin panel:** http://localhost:3000/admin/login
6. **View booking in dashboard**

## 📧 Email & SMS (Optional for Testing)

Email and SMS are optional. Bookings will work without them, but notifications won't be sent.

To enable:
- **Email:** Configure Gmail in `.env`
- **SMS:** Configure MSG91 in `.env`

## 🚀 Next Steps

- See `README.md` for full documentation
- See `DEPLOYMENT.md` for production deployment
- Customize room details, pricing, and content

---

**Ready to go! 🎉**

