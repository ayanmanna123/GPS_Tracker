# Environment Variables Setup Guide (ENV_SETUP.md)

This document explains how to configure all required environment variables for the **Where Is My Bus (GPS_Tracker)** project.

⚠️ Do NOT commit your `.env` file to GitHub.

---

## Backend Environment Setup

Create a `.env` file inside the `backend/` directory.

```env
MONGO_URI=""
PORT="5000"
jwt_Secret=""
AUTH0_AUDIENCE=""
AUTH0_DOMAIN=""
NODE_ENV=development
RAZORPAY_SECRET=""
GOOGLE_API_KEY=""
OPENAI_API_KEY=""
REDIS_URI=""
```

---

## Variable Explanations

### MONGO_URI

MongoDB connection string.
Get it from MongoDB Atlas → Connect → Application.

Example:
mongodb+srv://username:password@cluster0.mongodb.net/whereismybus

---

### PORT

Backend server port (recommended: 5000).

---

### jwt_Secret

Used for JWT authentication.
Generate using:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

---

### AUTH0_AUDIENCE

Auth0 API Identifier.
Get from Auth0 Dashboard → APIs.

---

### AUTH0_DOMAIN

Auth0 domain.
Example: dev-xxxx.us.auth0.com

---

### RAZORPAY_SECRET

Razorpay payment secret key.
Get from Razorpay Dashboard → Settings → API Keys.

---

### GOOGLE_API_KEY

Google Maps & Places API key.
Get from Google Cloud Console.

---

### OPENAI_API_KEY (Optional)

Used for AI features.
Get from https://platform.openai.com

---

### REDIS_URI

Redis connection URI.
Local example:
redis://127.0.0.1:6379

---

### NODE_ENV

Environment mode.
Use: development or production

---

## Frontend Environment Setup

Create a `.env` file inside the `frontend/` directory.

```env
VITE_BASE_URL=http://localhost:5000/api/v1
```

---

## Security Notes

- Never commit `.env`
- Add `.env` to `.gitignore`
- Use test keys in development

---

Happy Coding 🚀
