# Deployment URLs - Quick Reference

## 🌐 Live URLs

- **Frontend:** https://hotelnavjeevanpalace.netlify.app/
- **Backend API:** https://hnp.onrender.com/api
- **Admin Panel:** https://hnp.onrender.com/admin/login

## 🔧 Configuration Status

### Frontend Configuration ✅
- **Config File:** `frontend/config.js`
- **API URL:** Auto-detects environment
  - Production: `https://hnp.onrender.com/api`
  - Local: `http://localhost:3000/api`
- **Sitemap:** Updated with frontend URL
- **Robots.txt:** Updated with frontend URL

### Backend Configuration Required ⚠️

**IMPORTANT:** Update the following in your Render backend environment variables:

```
FRONTEND_URL=https://hotelnavjeevanpalace.netlify.app
```

This is required for CORS to work properly and allow the frontend to make API calls.

## 📝 Quick Setup Checklist

- [x] Frontend deployed to Netlify
- [x] Backend deployed to Render
- [x] Frontend config.js updated with backend URL
- [x] Sitemap.xml updated
- [x] Robots.txt updated
- [ ] **FRONTEND_URL set in Render backend environment variables** ⚠️
- [ ] MongoDB Atlas connection configured
- [ ] Email settings configured (optional)
- [ ] SMS settings configured (optional)
- [ ] Bank details configured
- [ ] Admin password changed from default
- [ ] Test booking flow end-to-end

## 🔗 Important Links

- **Website:** https://hotelnavjeevanpalace.netlify.app/
- **Admin Login:** https://hnp.onrender.com/admin/login
- **API Health Check:** https://hnp.onrender.com/health

---

**Last Updated:** December 13, 2024

