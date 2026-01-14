# Where Is My Bus – Real-Time Bus Tracking & Booking System

Where Is My Bus is a full-stack web application designed to help users search, track, and book buses in real time. The platform provides live bus location tracking on maps, route-based search, ticket booking with online payment, and nearby place discovery to improve the daily commuting experience.

This project is built with a modern tech stack and follows open-source best practices, making it beginner-friendly and scalable.

---

##  Features

-  Search buses by **Route (From & To)**, **Bus Name**, or **Bus ID**
-  **Real-time bus tracking** on an interactive map
-  View **nearby buses** and important places (Hospitals, Schools, Clinics)
-  **Bus ticket booking & cancellation**
-  Secure online payments using **Razorpay**
-  **Multi-language support**
-  User authentication & profile management
-  View booking history and tickets
-  Proper error handling and validations

---

##  Target Audience

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

## Installation & Setup

1. Clone the repository

```bash
git clone https://github.com/ayanmanna123/GPS_Tracker.git
cd GPS_Tracker
```

Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` with the following variables (replace placeholders):

```env
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/<database_name>"
PORT=5000
JWT_SECRET="your_jwt_secret"
AUTH0_AUDIENCE="your_auth0_audience"
AUTH0_DOMAIN="your_auth0_domain"
NODE_ENV=development
RAZORPAY_SECRET="your_razorpay_secret"
GOOGLE_API_KEY="your_google_api_key"
OPENAI_API_KEY="your_openai_api_key"
REDIS_URI="redis://localhost:6379"
```

Start the backend server

```bash
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

Frontend setup

```bash
cd Frontend
npm install
```

Create a `.env` file in `Frontend/`:

```env
VITE_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend

```bash
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

To run both frontend and backend concurrently (if a script is configured):

```bash
cd Frontend
npm run both
```

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

This project is licensed under the MIT License.

---

## Support

If you find this project useful, please consider starring it on GitHub.

---

Made by Ayan Manna
````
