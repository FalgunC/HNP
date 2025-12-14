# 🚀 Production Deployment Guide - Netlify + Render

Complete guide for deploying the Hotel Navjeevan Palace booking system to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Brevo API key configured
- [ ] Brevo sender email verified
- [ ] MongoDB Atlas database created
- [ ] Environment variables documented
- [ ] Code tested locally
- [ ] Email system tested
- [ ] Admin panel tested

---

## 🌐 Deployment Architecture

```
Frontend (Netlify)
    ↓
    API Calls
    ↓
Backend (Render)
    ↓
MongoDB Atlas
    ↓
Brevo API (Email/SMS)
```

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Repository

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Production-ready deployment"
   git push origin main
   ```

2. **Verify `.gitignore` includes:**
   - `.env`
   - `node_modules/`
   - `temp/`
   - `*.log`

### Step 2: Create Render Service

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Sign up/Login

2. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service:**
   - **Name:** `hotel-navjeevan-palace-backend`
   - **Region:** Choose closest to your users (e.g., `Singapore` or `Mumbai`)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node 18` or `Node 20`

### Step 3: Set Environment Variables in Render

Click **"Environment"** tab and add:

```env
# Server
NODE_ENV=production
PORT=10000

# MongoDB
MONGODB_URI=your-mongodb-atlas-connection-string

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-characters

# Brevo Email
BREVO_API_KEY=xkeysib-your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@hotelnavjeevanpalace.com
BREVO_SENDER_NAME=Hotel Navjeevan Palace

# Brevo SMS
SMS_PROVIDER=brevo
BREVO_SMS_SENDER=NAVJEE

# Bank Details
BANK_NAME=State Bank of India
BANK_ACCOUNT_NAME=Hotel Navjeevan Palace
BANK_ACCOUNT_NUMBER=1234567890123456
BANK_IFSC=SBIN0001234
BANK_UPI_ID=navjeevanpalace@paytm

# Frontend URL (Netlify)
FRONTEND_URL=https://your-app-name.netlify.app
NETLIFY_URL=https://your-app-name.netlify.app
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build the application
   - Start the server
3. Wait for deployment to complete
4. Note your backend URL: `https://your-service-name.onrender.com`

---

## 🎨 Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. **Update API URL in frontend:**
   - Open `frontend/config.js` (or wherever API URL is configured)
   - Update to your Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-service-name.onrender.com/api';
   ```

2. **Update `frontend/netlify.toml`** (if exists):
   ```toml
   [build]
     publish = "frontend"
     command = "echo 'No build needed'"
   ```

### Step 2: Deploy to Netlify

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com/
   - Sign up/Login

2. **Create New Site:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to GitHub
   - Select your repository

3. **Configure Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** (leave empty or `echo 'No build'`)
   - **Publish directory:** `frontend`

4. **Set Environment Variables (if needed):**
   - Go to **Site settings** → **Environment variables**
   - Add: `REACT_APP_API_URL` or similar (if your frontend uses it)

5. **Deploy:**
   - Click **"Deploy site"**
   - Wait for deployment
   - Note your frontend URL: `https://your-app-name.netlify.app`

### Step 3: Update Backend CORS

1. **Go back to Render:**
   - Open your backend service
   - Go to **Environment** tab
   - Update `FRONTEND_URL` and `NETLIFY_URL` with your Netlify URL
   - Click **"Save Changes"**
   - Render will automatically redeploy

---

## ✅ Post-Deployment Testing

### Test 1: Health Check
```bash
curl https://your-backend.onrender.com/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Test 2: API Endpoints
```bash
# Get rooms
curl https://your-backend.onrender.com/api/rooms

# Get bank details
curl https://your-backend.onrender.com/api/bank-details
```

### Test 3: Email System
1. Submit a booking via frontend
2. Check email inbox for enquiry acknowledgment
3. Login to admin panel
4. Confirm an enquiry
5. Check email inbox for booking confirmation

### Test 4: Admin Panel
1. Visit: `https://your-backend.onrender.com/admin/login`
2. Login with admin credentials
3. Test all admin functions

---

## 🔍 Monitoring & Logs

### Render Logs
- Go to Render Dashboard → Your Service → **Logs**
- Monitor for errors, email sending status, etc.

### Netlify Logs
- Go to Netlify Dashboard → Your Site → **Functions** → **Logs**
- Check for frontend errors

### Brevo Dashboard
- Monitor email delivery: https://app.brevo.com/statistics/emails
- Check SMS delivery: https://app.brevo.com/sms/campaigns

---

## 🐛 Troubleshooting

### Backend Not Starting
- ✅ Check Render logs for errors
- ✅ Verify all environment variables are set
- ✅ Check MongoDB connection string
- ✅ Verify Node version compatibility

### Emails Not Sending
- ✅ Check Brevo API key in Render environment variables
- ✅ Verify sender email is verified in Brevo
- ✅ Check Render logs for email errors
- ✅ Check Brevo dashboard for email status

### CORS Errors
- ✅ Verify `FRONTEND_URL` is set correctly in Render
- ✅ Check Netlify URL matches in backend CORS config
- ✅ Clear browser cache

### Database Connection Issues
- ✅ Verify MongoDB Atlas IP whitelist includes Render IPs (0.0.0.0/0 for all)
- ✅ Check MongoDB connection string format
- ✅ Verify database user has correct permissions

---

## 🔐 Security Checklist

- [ ] `SESSION_SECRET` is strong (32+ characters, random)
- [ ] MongoDB connection string uses strong password
- [ ] Brevo API key is secure (never commit to git)
- [ ] Admin password changed from default
- [ ] CORS configured for specific origins (not wildcard)
- [ ] Environment variables not exposed in frontend
- [ ] HTTPS enabled (automatic on Render/Netlify)

---

## 📊 Environment Variables Reference

### Required for Production

```env
# Server
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://...

# Security
SESSION_SECRET=your-strong-secret-key

# Email (Brevo)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...

# SMS (Brevo)
SMS_PROVIDER=brevo
BREVO_SMS_SENDER=NAVJEE

# Frontend
FRONTEND_URL=https://your-app.netlify.app
NETLIFY_URL=https://your-app.netlify.app

# Bank Details
BANK_NAME=...
BANK_ACCOUNT_NAME=...
BANK_ACCOUNT_NUMBER=...
BANK_IFSC=...
BANK_UPI_ID=...
```

---

## 🚀 Quick Deploy Commands

### Render (Backend)
```bash
# No commands needed - Render auto-deploys from GitHub
# Just push to main branch:
git push origin main
```

### Netlify (Frontend)
```bash
# No commands needed - Netlify auto-deploys from GitHub
# Just push to main branch:
git push origin main
```

---

## 📝 Post-Deployment Tasks

1. **Test all features:**
   - [ ] User booking form
   - [ ] Email notifications
   - [ ] SMS notifications
   - [ ] Admin panel login
   - [ ] Admin booking confirmation
   - [ ] Admin payment confirmation
   - [ ] CSV export

2. **Monitor for 24 hours:**
   - [ ] Check error logs
   - [ ] Monitor email delivery
   - [ ] Check server uptime
   - [ ] Test booking flow end-to-end

3. **Update documentation:**
   - [ ] Note production URLs
   - [ ] Update API documentation
   - [ ] Document any issues found

---

## 🎉 You're Live!

Your hotel booking system is now deployed and ready for production use!

**Backend URL:** `https://your-service.onrender.com`  
**Frontend URL:** `https://your-app.netlify.app`  
**Admin Panel:** `https://your-service.onrender.com/admin/login`

---

## 📞 Support

- **Render Support:** https://render.com/docs
- **Netlify Support:** https://docs.netlify.com/
- **Brevo Support:** https://help.brevo.com/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/

---

**Happy Deploying! 🚀**

