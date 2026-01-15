# 🚌 Where Is My Bus – Real-Time Bus Tracking & Booking System
**Where Is My Bus** is a full-stack web application designed to help users search, track, and book buses in real time. The platform provides live bus location tracking on maps, route-based search, ticket booking with online payment, and nearby place discovery to improve the daily commuting experience.

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

##  Tech Stack

### Frontend
- React (Vite)
- JavaScript
- Google Maps API
- HTML, CSS

### Backend
- Node.js

````markdown
# Where Is My Bus — Real-Time Bus Tracking and Booking System

Where Is My Bus is a full-stack web application that helps users search, track, and book buses in real time. The platform offers live bus location tracking on maps, route-based search, ticket booking with online payment, and nearby place discovery to improve daily commuting.

This project uses a modern tech stack and follows open-source best practices, making it approachable for contributors and scalable for production use.

---

## Features

- Search buses by Route (From & To), Bus Name, or Bus ID
- Real-time bus tracking on an interactive map
- View nearby buses and important places (hospitals, schools, clinics)
- Bus ticket booking and cancellation
- Secure online payments using Razorpay
- Multi-language support
- User authentication and profile management
- View booking history and tickets
- Error handling and input validations

---

## Target Audience

- Daily commuters
- Travelers using public transportation
- Users who need real-time bus location updates
- Transport management teams and operators

---

## Tech Stack

### Frontend

- React (Vite)
- JavaScript
- Google Maps API
- HTML and CSS

### Backend

- Node.js
- Express.js
- MongoDB
- (Optional) Redis for caching
- JWT-based authentication
- Auth0 (optional integrations)
- Razorpay for payments
- OpenAI API (optional features)

### 🛠️ Technical Deep Dive

#### 📍 Real-Time Data Flow
1. **Emitter:** The bus location is sent via a post request or socket to the backend.
2. **Caching:** To prevent database bottlenecks, the latest coordinates are stored in **Redis**.
3. **Consumption:** The Frontend fetches the latest coordinates from the Redis cache via the `/tracking` endpoint.
4. **Rendering:** Coordinates are fed into the Google Maps SDK to move the bus marker in real-time.

#### 💳 Payment & Security Flow
We use **Razorpay** for secure transactions:
- **Order Creation:** Backend creates a `razorpay_order_id`.
- **Payment:** Frontend handles the UI; the user pays via Razorpay.
- **Verification:** Razorpay sends a **Webhook** or callback to our backend. We verify the `razorpay_signature` using the `RAZORPAY_SECRET` before confirming the ticket in MongoDB.

---

## Project Structure

```bash
GPS_Tracker/
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── package.json
│   └── index.js
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🏗️ System Architecture
To ensure high performance for real-time tracking, the system separates persistent data (MongoDB) from volatile, high-frequency updates (Redis).
```mermaid
graph TD
    subgraph Client_Layer
        A[React Frontend]
    end

    subgraph Integration_Layer
        G[Google Maps API]
        R[Razorpay Gateway]
    end

    subgraph Backend_Services
        B[Node.js / Express]
        D[(Redis - Live Cache)]
        C[(MongoDB - Persistent)]
    end

    A <-->|REST API / WebSockets| B
    B <--> D
    B <--> C
    B --- R
    A --- G
```

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/ayanmanna123/GPS_Tracker.git
cd GPS_Tracker
```
### 🔧 Backend Setup
```bash
cd Backend
npm install
```
### 🔧 Environment Variables Reference
| Key | Description | Source |
| :--- | :--- | :--- |
| `MONGO_URI` | Connection string for MongoDB Atlas | [MongoDB](https://mongodb.com) |
| `REDIS_URI` | Connection string for Redis (Local or Cloud) | [Redis](https://redis.io) |
| `AUTH0_DOMAIN` | Your Auth0 Tenant Domain | [Auth0](https://auth0.com) |
| `RAZORPAY_SECRET` | Secret key for payment verification | [Razorpay](https://dashboard.razorpay.com) |
| `GOOGLE_API_KEY` | Key for Maps, Places, and Geocoding | [Google Console](https://console.cloud.google.com) |
**Start Backend Server**
```bash
npm run dev
```
**Backend will run on:**
```bash
http://localhost:5000
```
### 🎨 Frontend Setup
```bash
cd Frontend
npm install
```
**Create `.env` file in `frontend/`**
```bash
VITE_BASE_URL=http://localhost:5000/api/v1
```
**Start Frontend**
```bash
npm run dev
```
**Frontend will run on:**
```bash
http://localhost:5173
```
**Steps to run both Frontend and Backend:**
```bash
cd Frontend
npm run both
```
### 📡 API Reference
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/buses/search` | `GET` | Search for buses by route or name |
| `/api/v1/tracking/:id` | `GET` | Get real-time GPS from Redis cache |
| `/api/v1/bookings` | `POST` | Create a new bus booking |
| `/api/v1/bookings/user` | `GET` | Get booking history for logged-in user |

---

## Usage

- Register or log in to the platform
- Search buses using route, name, or bus ID
- Track live bus locations on the map
- Book tickets and complete payments
- View and manage booked tickets
- Explore nearby important places

---

## Contributors

Thanks to everyone who has contributed to this project.

<a href="https://github.com/ayanmanna123/GPS_Tracker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ayanmanna123/GPS_Tracker&max=300" />
</a>

Contributions are welcome — see `CONTRIBUTING.md` for details.

---

## Contribution Guidelines

- Fork the repository
- Create a new branch for your feature or fix
- Commit with clear messages
- Open a pull request with a descriptive title and summary

Beginner-friendly issues are labeled for new contributors.

---

## Future Enhancements

- Push notifications for bus arrival
- Mobile app integration
- AI-based route prediction
- Admin dashboard for operators

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Support

If you find this project useful, please consider starring it on GitHub.

---

## _Made with ❤️ by Ayan Manna_
