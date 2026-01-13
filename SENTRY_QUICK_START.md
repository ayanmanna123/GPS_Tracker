# 🚀 Sentry Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites

If you encounter import errors, install the additional Sentry tracing package:

```bash
# Backend
cd Backend
npm install @sentry/tracing
```

### Step 1: Sign Up (2 minutes)

1. Go to [sentry.io](https://sentry.io/signup/)
2. Create free account
3. Create **2 projects**:
   - **Backend** → Platform: Node.js
   - **Frontend** → Platform: React

### Step 2: Get DSN Keys (1 minute)

**Backend DSN:**
1. Select "Backend" project
2. Settings → Projects → [Your Project] → Client Keys (DSN)
3. Copy the DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

**Frontend DSN:**
1. Select "Frontend" project  
2. Settings → Projects → [Your Project] → Client Keys (DSN)
3. Copy the DSN

### Step 3: Configure Environment (2 minutes)

**Backend:** Edit `Backend/.env`
```env
SENTRY_DSN=https://your_backend_dsn@sentry.io/123456
```

**Frontend:** Edit `Frontend/.env`
```env
VITE_SENTRY_DSN=https://your_frontend_dsn@sentry.io/654321
```

### Step 4: Test (1 minute)

**Start servers:**
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend  
cd Frontend
npm run dev
```

**Verify in console:**
```
✅ Sentry initialized for development environment
✅ HTTP Server running at http://localhost:5000
🔌 WebSocket Server ready for connections
📊 Sentry monitoring active
✅ Performance monitoring initialized
```

**Test error capture:**
- Visit: http://localhost:5173
- Open browser console
- Type: `throw new Error("Test Error")`
- Check Sentry dashboard → Issues (should appear within 10 seconds)

---

## ✅ You're Done!

Your app now has:
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Session replay
- ✅ User context tracking
- ✅ Alert notifications

---

## 📊 View Your Dashboard

### Check Captured Errors
1. Go to Sentry Dashboard
2. Click **Issues** → See all errors
3. Click on error → View details, stack trace, user info

### Monitor Performance
1. Click **Performance** → See slow transactions
2. View API response times, database queries
3. Identify bottlenecks

### Watch Session Replays (Frontend)
1. Click error → **Replays** tab
2. Watch video of what user did before error
3. See DOM changes, clicks, navigation

---

## 🎯 What Gets Tracked Automatically

### Backend
- ✅ All API errors (4xx, 5xx)
- ✅ Uncaught exceptions
- ✅ Database errors
- ✅ Slow requests (>3s)
- ✅ Authentication failures
- ✅ File upload errors

### Frontend
- ✅ Component errors
- ✅ API call failures
- ✅ Network errors
- ✅ Slow page loads (>5s)
- ✅ High memory usage (>80%)
- ✅ User interactions

---

## 🔧 Common Issues

### Issue: "Sentry DSN not configured" warning

**Fix:** Add `SENTRY_DSN` to `.env` file

### Issue: No errors appearing in dashboard

**Fixes:**
1. Check DSN is correct (no extra spaces)
2. Wait 10-30 seconds for processing
3. Verify internet connection
4. Check project is active in Sentry

### Issue: Too many errors

**Fix:** Increase sample rate in production:
```env
# Backend/.env
SENTRY_TRACES_SAMPLE_RATE=0.1  # Only track 10%
```

---

## 📈 Next Steps

1. **Set up alerts** → Settings → Alerts → New Alert Rule
2. **Add team members** → Settings → Teams → Invite
3. **Configure integrations** → Settings → Integrations (Slack, Email)
4. **Review errors weekly** → Prioritize and fix critical issues

---

## 💡 Pro Tips

### Tip 1: Filter Noise
Ignore known issues in Sentry:
- Settings → Inbound Filters → Add custom rules

### Tip 2: Track Custom Events
```javascript
// Frontend
import { trackUserInteraction } from "./services/sentryService";
trackUserInteraction("click", "Book Bus Button", { busId });

// Backend  
import { captureMessage } from "./utils/sentry.js";
captureMessage("Payment successful", "info", { amount: 1500 });
```

### Tip 3: Production Settings
When deploying to production:
```env
# Backend/.env
NODE_ENV=production
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # Lower rate for cost savings

# Frontend/.env
VITE_SENTRY_DSN=https://your_production_dsn@sentry.io/123
```

---

## 📞 Need Help?

- **Full Documentation:** See [ERROR_MONITORING_SETUP.md](./ERROR_MONITORING_SETUP.md)
- **Sentry Docs:** [docs.sentry.io](https://docs.sentry.io/)
- **Community:** [forum.sentry.io](https://forum.sentry.io/)

---

## 🎉 Congratulations!

You now have **enterprise-level error monitoring** on your GPS Tracker app! 

**Free Plan Includes:**
- ✅ 5,000 errors/month
- ✅ 10,000 performance transactions/month
- ✅ 50 session replays/month
- ✅ 1 project
- ✅ 30 days data retention

**Happy Tracking! 🚀**
