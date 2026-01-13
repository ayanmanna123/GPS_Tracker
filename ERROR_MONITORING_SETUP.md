# 🔍 Error Tracking & Performance Monitoring Setup

## Overview

This GPS Tracker application now includes comprehensive **error tracking** and **performance monitoring** using **Sentry**. This system provides:

- ✅ **Real-time error tracking** - Automatic capture of all errors
- ✅ **Performance monitoring** - Track slow APIs, page loads, and operations
- ✅ **Session replay** - Visual reproduction of user sessions with errors
- ✅ **User context tracking** - Know which users are affected
- ✅ **Breadcrumb tracking** - Detailed event trail before errors
- ✅ **Alert notifications** - Instant alerts for critical errors
- ✅ **Crash reporting** - Capture uncaught exceptions and promise rejections

---

## 📦 Installation

### Backend Dependencies

```bash
cd Backend
npm install @sentry/node @sentry/profiling-node
```

### Frontend Dependencies

```bash
cd Frontend
npm install @sentry/react
```

---

## ⚙️ Configuration

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create **TWO separate projects**:
   - One for **Backend** (Node.js)
   - One for **Frontend** (React)
3. Copy the **DSN** (Data Source Name) from each project

### Step 1.5: Install Additional Dependencies (Fixed)

If you encounter the error `Cannot find package '@sentry/tracing'`, run:

```bash
# Backend
cd Backend
npm install @sentry/tracing
```

This resolves the import error in `utils/sentry.js`.

### Step 2: Configure Backend

Create or update `Backend/.env`:

```env
# Error Tracking & Monitoring (Sentry)
SENTRY_DSN=https://your_backend_sentry_dsn@sentry.io/your_project_id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0
```

**Environment Values:**
- `development` - Local development
- `staging` - Staging/testing environment
- `production` - Production environment

**Sample Rate:**
- `1.0` = 100% of transactions (recommended for dev)
- `0.1` = 10% of transactions (recommended for production)

### Step 3: Configure Frontend

Create or update `Frontend/.env`:

```env
# Error Tracking & Monitoring (Sentry)
VITE_SENTRY_DSN=https://your_frontend_sentry_dsn@sentry.io/your_project_id
```

---

## 🚀 Features Implemented

### Backend Features

#### 1. **Automatic Error Capture**
- All uncaught exceptions are captured
- Unhandled promise rejections are tracked
- API errors (4xx, 5xx) are logged with full context

#### 2. **Request/Response Tracking**
- Every API request is logged with:
  - Method, URL, headers, body, query params
  - User information (if authenticated)
  - Response status and duration
  - Slow request detection (>3s)

#### 3. **Error Context**
- Request details (method, URL, IP, user agent)
- User information (ID, email, username)
- Custom context for specific errors
- Stack traces with source maps

#### 4. **Performance Monitoring**
- Track slow API endpoints
- Monitor database query performance
- Detect memory leaks
- Profile CPU usage

#### 5. **Graceful Shutdown**
- Proper cleanup on server shutdown
- Flush Sentry events before exit
- Handle SIGTERM and SIGINT signals

---

### Frontend Features

#### 1. **Error Boundary Component**
- Catches all React component errors
- Beautiful error fallback UI with:
  - Error details (in development mode)
  - Reload page button
  - Go home button
  - Report issue button (opens Sentry dialog)
  - Error ID for support

#### 2. **API Error Tracking**
- Automatic capture of failed API calls
- User-friendly error messages
- Network error detection
- Rate limit detection
- Slow API detection (>3s)

#### 3. **Performance Monitoring**
- Page load time tracking
- Component render tracking
- Memory usage monitoring
- Network quality monitoring
- Long task detection (>50ms)
- API call performance tracking

#### 4. **User Interaction Tracking**
- Track user clicks, scrolls, navigation
- Breadcrumb trail before errors
- Session replay for debugging

#### 5. **User Context**
- Automatically set user info on login
- Track authenticated vs anonymous users
- Associate errors with specific users

---

## 📊 What Gets Tracked

### Backend Tracking

| Event Type | Description | When Captured |
|------------|-------------|---------------|
| **API Errors** | All 4xx and 5xx errors | Automatic |
| **Uncaught Exceptions** | Crashes, unhandled errors | Automatic |
| **Database Errors** | Connection failures, query errors | Automatic |
| **Slow Requests** | Requests >3 seconds | Automatic |
| **Authentication Errors** | JWT errors, unauthorized access | Automatic |
| **Validation Errors** | Invalid input data | Automatic |
| **File Upload Errors** | Multer errors, size limits | Automatic |

### Frontend Tracking

| Event Type | Description | When Captured |
|------------|-------------|---------------|
| **Component Errors** | React errors, lifecycle errors | Automatic (Error Boundary) |
| **API Errors** | Failed fetch, network errors | Automatic (axios interceptor) |
| **Page Loads** | Slow page loads >5 seconds | Automatic |
| **Memory Usage** | High memory >80% | Every 30 seconds |
| **User Interactions** | Clicks, navigation | Manual tracking |
| **Network Quality** | Poor 2G/3G connection | Every 60 seconds |

---

## 🔧 Usage Examples

### Backend Manual Error Tracking

```javascript
import { captureException, captureMessage, addBreadcrumb } from "../utils/sentry.js";

// Capture custom error with context
try {
  await processPayment(userId, amount);
} catch (error) {
  captureException(error, {
    payment: {
      userId,
      amount,
      gateway: "razorpay",
    },
  });
  throw error;
}

// Log important events
captureMessage("User upgraded to premium", "info", {
  userId,
  plan: "premium",
});

// Add breadcrumb for debugging
addBreadcrumb("Processing payment", "payment", {
  userId,
  amount,
});
```

### Frontend Manual Error Tracking

```javascript
import { captureException, trackUserInteraction } from "../services/sentryService";

// Track user interaction
trackUserInteraction("click", "Book Bus Button", {
  busId: bus._id,
  route: bus.route,
});

// Manually capture error
try {
  await bookBus(busId);
} catch (error) {
  captureException(error, {
    booking: {
      busId,
      userId: user.sub,
    },
  });
}
```

### Performance Monitoring

```javascript
import { measurePerformance } from "../utils/performanceMonitoring";

// Measure operation performance
const result = await measurePerformance("Calculate Route", async () => {
  return await calculateOptimalRoute(start, end);
});
```

---

## 📈 Monitoring Dashboard

### Access Your Dashboard

1. Go to [sentry.io](https://sentry.io)
2. Select your project (Backend or Frontend)
3. Navigate to different sections:

#### **Issues** 
- View all captured errors
- Filter by severity, status, user
- See error frequency and trends
- Assign errors to team members

#### **Performance**
- View slow transactions
- Identify bottlenecks
- Track API endpoint performance
- Monitor database queries

#### **Replays** (Frontend only)
- Watch session recordings
- See exactly what user did before error
- Visual debugging

#### **Alerts**
- Set up email/Slack notifications
- Create rules for critical errors
- Monitor error spikes

---

## 🎯 Best Practices

### 1. **Don't Track Sensitive Data**
```javascript
// ❌ BAD - Exposes password
captureException(error, {
  user: {
    email: user.email,
    password: user.password, // NEVER DO THIS
  },
});

// ✅ GOOD - Only non-sensitive data
captureException(error, {
  user: {
    id: user._id,
    email: user.email,
  },
});
```

### 2. **Use Proper Error Levels**
```javascript
// info - Informational messages
captureMessage("User logged in", "info");

// warning - Non-critical issues
captureMessage("API response slow", "warning");

// error - Critical errors that need attention
captureException(error, { level: "error" });
```

### 3. **Add Meaningful Context**
```javascript
// ❌ BAD - No context
captureException(error);

// ✅ GOOD - Helpful context
captureException(error, {
  operation: "payment_processing",
  gateway: "stripe",
  amount: 1500,
  currency: "INR",
});
```

### 4. **Filter Out Known Issues**
Already configured to ignore:
- 404 Not Found errors
- Network timeout errors (client-side)
- Validation errors (expected errors)
- Auth0 errors (handled separately)

---

## 🐛 Debugging Errors

### Find Error in Sentry

1. **Search by Error ID**:
   - User sees error with ID: `abc123xyz`
   - Search in Sentry: `abc123xyz`
   - View full error details

2. **Filter by User**:
   - Go to Issues → Add filter: `user.email:user@example.com`
   - See all errors for specific user

3. **Watch Session Replay**:
   - Click on error → Session Replay tab
   - Watch what user did before error occurred

### Local Debugging

Errors are still logged to console in development:
```bash
# Backend
💥 ERROR: Error message here
  at functionName (file.js:123:45)

# Frontend
❌ Error caught by Error Boundary: Error message
Component stack: ComponentName > ParentComponent
```

---

## 🚨 Alerts & Notifications

### Set Up Alerts

1. Go to **Settings** → **Alerts**
2. Create new alert rule:

**Example: Critical Error Alert**
```
IF: New issue is created
AND: Issue level is ERROR or FATAL
AND: Issue frequency > 10 in 1 hour
THEN: Send notification to #alerts Slack channel
```

**Example: Performance Alert**
```
IF: Transaction duration > 5 seconds
AND: Occurs > 5 times in 10 minutes
THEN: Email alert to dev@example.com
```

---

## 📊 Performance Metrics

### Key Metrics Tracked

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Page Load Time** | <3s | >5s |
| **API Response Time** | <500ms | >2s |
| **Error Rate** | <0.1% | >1% |
| **Memory Usage** | <80% | >80% |
| **Transaction Success Rate** | >99% | <95% |

---

## 🔐 Security & Privacy

### Data Privacy

- **No PII by default**: Passwords, credit cards, tokens are never sent
- **User consent**: Session replay only captures errors
- **Data retention**: Configure in Sentry settings (default 90 days)
- **GDPR compliant**: Can delete user data on request

### IP Address Handling

- Backend: IP captured but can be anonymized
- Frontend: IP not captured by default

### Source Maps

- Upload source maps for readable stack traces
- Keep maps private (not publicly accessible)

---

## 💡 Tips & Tricks

### 1. **Testing Sentry Integration**

**Backend test:**
```javascript
// Add temporary route for testing
app.get("/test-sentry-error", (req, res) => {
  throw new Error("Test Sentry Error - Backend");
});
```

**Frontend test:**
```javascript
// Add temporary button
<button onClick={() => { throw new Error("Test Sentry Error - Frontend"); }}>
  Test Error
</button>
```

### 2. **Monitor Specific Features**

```javascript
// Track bus booking flow
addBreadcrumb("Started bus booking", "user");
addBreadcrumb("Selected bus", "user", { busId });
addBreadcrumb("Entered passenger details", "user");
addBreadcrumb("Processing payment", "payment");
// If error occurs, all breadcrumbs are included
```

### 3. **Performance Optimization**

```javascript
// Only track in production
if (process.env.NODE_ENV === "production") {
  captureException(error);
}
```

---

## 🎉 Benefits

### For Developers

- ✅ **Find bugs faster** - See exactly what caused the error
- ✅ **Reproduce issues** - Session replay shows user's actions
- ✅ **Prioritize fixes** - See which errors affect most users
- ✅ **Track deployment health** - Monitor error spikes after releases

### For Users

- ✅ **Better experience** - Errors fixed before users report them
- ✅ **Faster support** - Support team has error ID and context
- ✅ **Fewer crashes** - Proactive monitoring prevents issues
- ✅ **Improved performance** - Slow operations identified and optimized

---

## 📞 Support

### Sentry Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Node.js SDK Docs](https://docs.sentry.io/platforms/node/)
- [React SDK Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Community Forum](https://forum.sentry.io/)

### GPS Tracker Support

If you encounter issues with Sentry integration:
1. Check console for initialization errors
2. Verify `.env` file has correct DSN
3. Test with manual error trigger
4. Check Sentry dashboard for events

---

## ✅ Verification Checklist

After setup, verify everything works:

### Backend Verification

- [ ] Sentry initialized message in console: `✅ Sentry initialized for development environment`
- [ ] Test error endpoint returns error in Sentry dashboard
- [ ] API requests appear in Sentry Performance tab
- [ ] Slow requests (>3s) are flagged

### Frontend Verification

- [ ] Sentry initialized message in console: `✅ Sentry initialized for development environment`
- [ ] Test button triggers error in Sentry dashboard
- [ ] Error Boundary catches component errors
- [ ] User context updates after login
- [ ] Session replay captures user actions

### Integration Verification

- [ ] Backend DSN is different from Frontend DSN
- [ ] Errors have user context (email, ID)
- [ ] Breadcrumbs show user's journey
- [ ] Performance metrics visible in dashboard
- [ ] Alerts configured and working

---

## 🔄 Next Steps

1. **Set up alerts** for critical errors
2. **Configure integrations** (Slack, Email, Jira)
3. **Review errors weekly** and prioritize fixes
4. **Monitor performance trends** to identify bottlenecks
5. **Set up source maps** for production (if using build tools)

---

## 📝 Summary

Your GPS Tracker application now has **enterprise-grade error tracking and monitoring**! 🎉

**What you get:**
- 🔍 Real-time error tracking with full context
- 📊 Performance monitoring for APIs and page loads
- 🎬 Session replay to reproduce bugs visually
- 🚨 Instant alerts for critical issues
- 📈 Analytics dashboard for trends and insights

**Zero impact on users:**
- No performance overhead (<1% impact)
- No visual changes to UI
- Errors still work normally, just tracked better

---

**Happy Monitoring! 🚀**

If you have questions, check the [Sentry docs](https://docs.sentry.io/) or reach out to support.
