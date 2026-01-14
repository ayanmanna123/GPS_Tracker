# 🚌 Where Is My Bus – Real-Time Bus Tracking & Booking System

Where Is My Bus is a full-stack web application designed to help users search, track, and book buses in real time. The platform provides live bus location tracking on maps, route-based search, ticket booking with online payment, and nearby place discovery to improve the daily commuting experience.

This project is built with a modern tech stack and follows open-source best practices, making it beginner-friendly and scalable.

---

## 🚀 Features

- 🔍 Search buses by **Route (From & To)**, **Bus Name**, or **Bus ID**
- 📍 **Real-time bus tracking** on an interactive map
- 🗺️ View **nearby buses** and important places (Hospitals, Schools, Clinics)
- 🎫 **Bus ticket booking & cancellation**
- 💳 Secure online payments using **Razorpay**
- 🌐 **Multi-language support**
- 👤 User authentication & profile management
- 🧾 View booking history and tickets
- ⚠️ Proper error handling and validations

---

## 🧑‍💻 Target Audience

- Daily commuters
- Travelers using public transportation
- Users who need real-time bus location updates
- Transport management systems

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- JavaScript
- Google Maps API
- HTML, CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Redis
- JWT Authentication
- Auth0
- Razorpay
- OpenAI API (optional features)

---

## 📂 Project Structure

```bash
GPS_Tracker/
├── backend/
│ ├── src/
│ ├── .env
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── src/
│ ├── .env
│ ├── package.json
│ └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ayanmanna123/GPS_Tracker.git
```

```bash
cd GPS_Tracker
```

🔧 Backend Setup

```bash
cd Backend
```

```bash
npm install
```

Create .env file in backend/

```bash
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/<database_name>"
PORT=5000
jwt_Secret="dev_jwt_secret"
AUTH0_AUDIENCE="your_auth0_audience"
AUTH0_DOMAIN="your_auth0_domain"
NODE_ENV=development
RAZORPAY_SECRET="your_razorpay_secret"
GOOGLE_API_KEY="your_google_api_key"
OPENAI_API_KEY="your_openai_api_key"
REDIS_URI="redis://localhost:6379"
```

Start Backend Server

```bash
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

🎨 Frontend Setup

```bash
cd Frontend
```

```bash
npm install
```

Create .env file in frontend/

```bash
VITE_BASE_URL=http://localhost:5000/api/v1
```

Start Frontend

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

Steps to run both Frontend and Backend:

```bash
cd .\Frontend\
npm run both
```

🧪 Usage

Register / Login to the platform

Search buses using route, name, or bus ID

Track live bus location on the map

Book tickets and make payments

View and manage booked tickets

Explore nearby important places

🤝 Contribution Guidelines

Fork the repository

Create a new branch for your feature or fix

Commit with clear messages

Open a Pull Request with proper description

Beginner-friendly issues are labeled for new contributors.

📌 Future Enhancements

Push notifications for bus arrival

Mobile app integration

AI-based route prediction

Admin dashboard for bus operators

📜 License

This project is licensed under the MIT License.

⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub
It helps the project grow and motivates contributors!

Made with ❤️ by Ayan Manna
