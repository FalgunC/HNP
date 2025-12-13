# Deployment Guide - Hotel Navjeevan Palace

This guide will help you deploy the Hotel Navjeevan Palace booking website to production.

## 📋 Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

2. **Backend Hosting** (Choose one):
   - Render (recommended): https://render.com
   - Railway: https://railway.app
   - Cyclic: https://cyclic.sh

3. **Frontend Hosting**:
   - Netlify: https://netlify.com

4. **Email Service**:
   - Gmail account (for Nodemailer)

5. **SMS Service** (Optional):
   - MSG91 account: https://msg91.com

## 🚀 Step-by-Step Deployment

### Part 1: Backend Deployment (Render)

1. **Prepare Backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

4. **Configure Service:**
   - **Name:** hotel-navjeevan-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Add Environment Variables:**
   Click "Environment" and add:
   ```
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   SESSION_SECRET=generate-a-random-secret-key-here
   ADMIN_EMAIL=admin@hotelnavjeevanpalace.com
   ADMIN_PASSWORD=YourSecurePassword123!
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=Hotel Navjeevan Palace <your-email@gmail.com>
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your-msg91-auth-key
   MSG91_SENDER_ID=NAVJEE
   BANK_NAME=State Bank of India
   BANK_ACCOUNT_NAME=Hotel Navjeevan Palace
   BANK_ACCOUNT_NUMBER=your-account-number
   BANK_IFSC=your-ifsc-code
   BANK_UPI_ID=your-upi-id
   FRONTEND_URL=https://hotelnavjeevanpalace.netlify.app
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the service URL (e.g., `https://hotel-navjeevan-backend.onrender.com`)

7. **Seed Database:**
   - After first deployment, run seed script:
   - In Render dashboard, go to "Shell" tab
   - Run: `npm run seed`

### Part 2: Frontend Deployment (Netlify)

1. **Update API URL:**
   - Edit `frontend/config.js`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
   ```
   This single file is used by all HTML pages, so you only need to update it once.

2. **Update Sitemap:**
   - Edit `frontend/sitemap.xml`
   - Replace `https://your-domain.netlify.app` with your actual Netlify URL

3. **Create Netlify Account:**
   - Go to https://netlify.com
   - Sign up with GitHub

4. **Deploy Site:**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   - Configure:
     - **Base directory:** frontend
     - **Build command:** (leave empty)
     - **Publish directory:** frontend

5. **Configure Site:**
   - Go to "Site settings" → "Build & deploy"
   - Set base directory: `frontend`
   - Save

6. **Update Environment (if needed):**
   - Go to "Site settings" → "Environment variables"
   - Add any frontend-specific variables

7. **Custom Domain (Optional):**
   - Go to "Domain settings"
   - Add your custom domain
   - Follow DNS configuration instructions

### Part 3: Gmail Setup (for Email)

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Create app password for "Mail"
   - Use this password in `EMAIL_PASS` (not your regular password)

### Part 4: MSG91 Setup (Optional, for SMS)

1. **Create MSG91 Account:**
   - Sign up at https://msg91.com
   - Verify your account

2. **Get Auth Key:**
   - Go to dashboard
   - Copy your auth key
   - Add to `MSG91_AUTH_KEY` in backend environment

3. **Set Sender ID:**
   - Configure sender ID (max 6 characters)
   - Add to `MSG91_SENDER_ID`

## ✅ Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is deployed and accessible
- [ ] API URL updated in all frontend files
- [ ] Database seeded with rooms and admin user
- [ ] Admin panel accessible at `/admin/login`
- [ ] Test booking flow end-to-end
- [ ] Test email notifications
- [ ] Test SMS notifications (if configured)
- [ ] Update sitemap.xml with actual domain
- [ ] Test admin panel features
- [ ] Verify CORS settings
- [ ] Check error handling

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access is enabled

**Email Not Sending:**
- Verify Gmail app password (not regular password)
- Check SMTP settings
- Verify EMAIL_USER and EMAIL_PASS

**SMS Not Sending:**
- Verify MSG91 auth key
- Check phone number format
- SMS is optional - booking works without it

### Frontend Issues

**API Calls Failing:**
- Verify API_BASE_URL is correct
- Check CORS settings in backend
- Verify backend is running

**404 Errors:**
- Check Netlify redirects configuration
- Verify file paths

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Using strong SESSION_SECRET
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Render/Netlify)
- [ ] CORS properly configured
- [ ] Database credentials secure

## 📞 Support

If you encounter issues:
1. Check server logs in Render dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test API endpoints directly

---

**Deployment completed successfully! 🎉**

