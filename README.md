# 🚌 Where Is My Bus – Real-Time Bus Tracking & Booking System

<div align="center">

![Where Is My Bus Logo](https://img.shields.io/badge/Where%20Is%20My%20Bus-Real--Time%20Tracking-blue?style=for-the-badge&logo=bus&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white)](https://auth0.com/)

**Revolutionizing Public Transportation with Real-Time Intelligence**

[🌐 Live Demo](https://whereismybus.netlify.app) • [📖 Documentation](API.md) • [🚀 Quick Start](#-installation--setup) • [🤝 Contributing](CONTRIBUTING.md)

---

</div>

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Features](#-features)
- [🎯 Target Audience](#-target-audience)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📂 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🧪 Usage](#-usage)
- [📸 Screenshots](#-screenshots)
- [🔧 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [🏆 Contributors](#-contributors)
- [📌 Roadmap](#-roadmap)
- [📜 License](#-license)
- [⭐ Support](#-support)
- [📞 Contact](#-contact)

---

## ✨ Overview

**Where Is My Bus** is a cutting-edge, full-stack web application that transforms the public transportation experience by providing real-time bus tracking, seamless booking, and intelligent route planning. Built with modern technologies and a user-centric design, it empowers commuters with live location data, secure payments, and comprehensive journey management.

Whether you're a daily commuter, a tourist exploring new cities, or a transport operator managing fleets, Where Is My Bus delivers unparalleled visibility and convenience in public transit.

---

## 🚀 Features

### 🔍 **Smart Search & Discovery**
- **Multi-criteria Search**: Find buses by route (from/to), bus name, or unique ID
- **Intelligent Filtering**: Sort by departure time, price, or availability
- **Nearby Places Integration**: Discover hospitals, schools, and clinics along routes

### 📍 **Real-Time Tracking**
- **Live GPS Monitoring**: Track bus locations in real-time on interactive maps
- **ETA Predictions**: Get accurate arrival time estimates
- **Route Visualization**: See complete journey paths with stops and landmarks

### 🎫 **Seamless Booking**
- **One-Click Booking**: Instant ticket reservation with secure payment
- **Multiple Payment Options**: Integrated with Razorpay for safe transactions
- **Booking Management**: View, modify, or cancel bookings with ease

### 🌐 **User Experience**
- **Multi-Language Support**: Accessible in multiple languages
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Customizable interface for user preference

### 👤 **User Management**
- **Secure Authentication**: JWT-based auth with Auth0 integration
- **Profile Management**: Personalized user dashboards
- **Booking History**: Complete transaction and journey records

### 🔔 **Notifications & Alerts**
- **Real-Time Updates**: Push notifications for bus arrivals and delays
- **SMS/Email Alerts**: Configurable notification preferences

### 🤖 **AI-Powered Features** (Optional)
- **Smart Route Suggestions**: AI-driven optimal path recommendations
- **Predictive Analytics**: Anticipate delays and suggest alternatives

---

## 🎯 Target Audience

- **🚶 Daily Commuters**: Students, professionals, and regular travelers
- **🧳 Tourists & Visitors**: Exploring cities with public transport
- **🏢 Transport Operators**: Managing and monitoring bus fleets
- **🏛️ City Planners**: Analyzing transportation patterns
- **📱 Mobile Users**: On-the-go access to transportation information

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | UI Framework | 18.x |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool | 4.x |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | Programming Language | ES6+ |
| ![Google Maps](https://img.shields.io/badge/Google%20Maps-4285F4?style=flat&logo=google-maps&logoColor=white) | Mapping Service | API v3 |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Styling | 3.x |

### ⚙️ Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Runtime | 18.x |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) | Web Framework | 4.x |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) | Database | 6.x |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) | Caching | 7.x |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white) | Authentication | 9.x |

### 🔧 Additional Tools
| Technology | Purpose |
|------------|---------|
| ![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=flat&logo=auth0&logoColor=white) | Identity Management |
| ![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=white) | Payment Gateway |
| ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white) | AI Integration |
| ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) | Real-Time Communication |

---

## 🏗️ Architecture

```mermaid
graph TB
    A[🌐 Frontend - React/Vite] --> B[🚀 API Gateway - Express.js]
    B --> C[👤 Authentication - Auth0/JWT]
    B --> D[💳 Payment - Razorpay]
    B --> E[📍 Location Services - Google Maps]
    B --> F[🤖 AI Services - OpenAI]

    C --> G[(🗄️ MongoDB)]
    D --> G
    E --> H[(⚡ Redis Cache)]
    F --> H

    I[📡 WebSocket Server] --> A
    I --> J[📱 Mobile Clients]

    K[🚌 GPS Devices] --> L[📊 Tracking Service]
    L --> H
    L --> G

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#fff3e0
```

**System Components:**
- **Frontend Layer**: Responsive React application with real-time updates
- **API Layer**: RESTful APIs with GraphQL support for complex queries
- **Data Layer**: MongoDB for persistent storage, Redis for caching
- **Real-Time Layer**: WebSocket connections for live tracking
- **External Services**: Integration with payment gateways and mapping services

---

## 📂 Project Structure

```
GPS_Tracker/
├── 📁 Backend/
│   ├── 📁 controllers/          # Business logic handlers
│   ├── 📁 middleware/           # Authentication & validation
│   ├── 📁 models/              # Database schemas
│   ├── 📁 routes/              # API endpoints
│   ├── 📁 services/            # External service integrations
│   ├── 📁 utils/               # Helper functions
│   ├── 📄 server.js            # Application entry point
│   └── 📄 package.json         # Dependencies & scripts
│
├── 📁 Frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 Redux/           # State management
│   │   └── 📄 App.jsx          # Main application component
│   ├── 📄 vite.config.js       # Build configuration
│   └── 📄 package.json         # Dependencies & scripts
│
├── 📁 docs/                    # Documentation
├── 📄 README.md                # Project documentation
├── 📄 API.md                   # API reference
├── 📄 CONTRIBUTING.md          # Contribution guidelines
└── 📄 LICENSE                  # License information
```

---

## ⚙️ Installation & Setup

### 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/)
- **Redis** (v7 or higher) - [Download](https://redis.io/)
- **Git** - [Download](https://git-scm.com/)

### 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ayanmanna123/GPS_Tracker.git
   cd GPS_Tracker
   ```

2. **Environment Setup**
   ```bash
   # Copy environment templates
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   ```

3. **Backend Configuration**
   ```bash
   cd Backend

   # Install dependencies
   npm install

   # Configure environment variables in .env
   # See ENV_SETUP.md for detailed configuration
   ```

4. **Frontend Configuration**
   ```bash
   cd ../Frontend

   # Install dependencies
   npm install

   # Configure environment variables in .env
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start Backend
   cd Backend
   npm run dev

   # Terminal 2: Start Frontend
   cd Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### 🐳 Docker Setup (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🧪 Usage

### 👤 User Journey

1. **Registration/Login**
   - Create account or sign in with Auth0
   - Complete profile setup

2. **Search & Book**
   - Search buses by route or location
   - Select preferred bus and seat
   - Complete secure payment

3. **Track & Travel**
   - Monitor real-time bus location
   - Receive arrival notifications
   - Access journey history

### 🔧 Developer Usage

```javascript
// Example API usage
import { searchBuses, bookTicket } from './services/api';

// Search buses
const buses = await searchBuses({
  from: 'New York',
  to: 'Boston',
  date: '2024-01-15'
});

// Book a ticket
const booking = await bookTicket({
  busId: 'bus123',
  seats: ['A1', 'A2'],
  paymentMethod: 'razorpay'
});
```

---

## 📸 Screenshots

<div align="center">

### 🏠 Homepage
![Homepage](https://via.placeholder.com/800x400/4CAF50/white?text=Homepage+Screenshot)

### 🗺️ Live Tracking
![Live Tracking](https://via.placeholder.com/800x400/2196F3/white?text=Live+Tracking+Screenshot)

### 🎫 Booking Interface
![Booking](https://via.placeholder.com/800x400/FF9800/white?text=Booking+Interface+Screenshot)

### 👤 User Dashboard
![Dashboard](https://via.placeholder.com/800x400/9C27B0/white?text=User+Dashboard+Screenshot)

</div>

*📝 Note: Replace placeholder images with actual screenshots from your application*

---

## 🔧 API Documentation

Comprehensive API documentation is available in [API.md](API.md)

### 🚀 Quick API Reference

```http
# Authentication
POST /api/v1/auth/login
POST /api/v1/auth/register

# Bus Operations
GET /api/v1/buses/search?from=NYC&to=BOS
GET /api/v1/buses/{id}/location

# Booking
POST /api/v1/bookings
GET /api/v1/bookings/{id}

# Real-time Updates
WebSocket: ws://localhost:5000/ws/tracking
```

For detailed API specifications, see [API.md](API.md)

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! 🚀

### 📝 How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/GPS_Tracker.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test thoroughly
5. **Commit** with clear messages: `git commit -m "Add amazing feature"`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### 🏷️ Issue Labels

- `🐛 bug` - Bug fixes
- `✨ feature` - New features
- `📚 documentation` - Documentation improvements
- `🔧 enhancement` - Code improvements
- `🎨 ui/ux` - User interface updates
- `🧪 testing` - Test additions/updates

### 📋 Development Guidelines

- Follow [ESLint](https://eslint.org/) rules
- Write comprehensive tests
- Update documentation for API changes
- Ensure responsive design
- Maintain code coverage above 80%

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🏆 Contributors

### 🌟 Core Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ayanmanna123">
        <img src="https://github.com/ayanmanna123.png" width="100px;" alt="Ayan Manna"/><br />
        <sub><b>Ayan Manna</b></sub>
      </a><br />
      <a href="#projectManagement" title="Project Management">📋</a>
      <a href="#code" title="Code">💻</a>
    </td>
  </tr>
</table>
## 🤝 All Contributors

Thanks goes to these wonderful people ❤️

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Gupta-02"><img src="https://avatars.githubusercontent.com/u/182321898?v=4?s=100" width="100px;" alt="C Sai Prathyun Gupta"/><br /><sub><b>C Sai Prathyun Gupta</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Gupta-02" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ayanmanna123"><img src="https://avatars.githubusercontent.com/u/188359690?v=4?s=100" width="100px;" alt="Ayan Manna"/><br /><sub><b>Ayan Manna</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=ayanmanna123" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/santanu-atta03"><img src="https://avatars.githubusercontent.com/u/195717385?v=4?s=100" width="100px;" alt="Santanu Atta"/><br /><sub><b>Santanu Atta</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=santanu-atta03" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kiran95021"><img src="https://avatars.githubusercontent.com/u/181767771?v=4?s=100" width="100px;" alt="shirishala kiran"/><br /><sub><b>shirishala kiran</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Kiran95021" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ShivanshCoding36"><img src="https://avatars.githubusercontent.com/u/101795319?v=4?s=100" width="100px;" alt="Shivansh Mathur"/><br /><sub><b>Shivansh Mathur</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=ShivanshCoding36" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gauravkarakoti.netlify.app/"><img src="https://avatars.githubusercontent.com/u/180496085?v=4?s=100" width="100px;" alt="Gaurav Karakoti"/><br /><sub><b>Gaurav Karakoti</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=GauravKarakoti" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Namithnp"><img src="https://avatars.githubusercontent.com/u/92907249?v=4?s=100" width="100px;" alt="Namith N P"/><br /><sub><b>Namith N P</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Namithnp" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://my-portfolio-xc1h.onrender.com/"><img src="https://avatars.githubusercontent.com/u/181775638?v=4?s=100" width="100px;" alt="Shubham Singh Rawat"/><br /><sub><b>Shubham Singh Rawat</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=ShubhamSinghRawat10" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Atharva2093"><img src="https://avatars.githubusercontent.com/u/188373515?v=4?s=100" width="100px;" alt="Atharva2093"/><br /><sub><b>Atharva2093</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Atharva2093" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adarsharya.vercel.app/"><img src="https://avatars.githubusercontent.com/u/81669068?v=4?s=100" width="100px;" alt="ADARSH ARYA"/><br /><sub><b>ADARSH ARYA</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=GEARdHAX" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Suvam18"><img src="https://avatars.githubusercontent.com/u/183584732?v=4?s=100" width="100px;" alt="Suvam Chatterjee "/><br /><sub><b>Suvam Chatterjee </b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Suvam18" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lakshya1304"><img src="https://avatars.githubusercontent.com/u/235142471?v=4?s=100" width="100px;" alt="Lakshya Goyal"/><br /><sub><b>Lakshya Goyal</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=lakshya1304" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://pranitee-portfolio.vercel.app/"><img src="https://avatars.githubusercontent.com/u/201430234?v=4?s=100" width="100px;" alt="Pranitee Kishor Sonavane"/><br /><sub><b>Pranitee Kishor Sonavane</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Pranitee-Sonavane" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/VyankateshPandit"><img src="https://avatars.githubusercontent.com/u/138808552?v=4?s=100" width="100px;" alt="Vyankatesh Pandit"/><br /><sub><b>Vyankatesh Pandit</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=VyankateshPandit" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Biswajitn23"><img src="https://avatars.githubusercontent.com/u/90197902?v=4?s=100" width="100px;" alt="Biswajit Nayak"/><br /><sub><b>Biswajit Nayak</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Biswajitn23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mytoplinks-neeru.netlify.app/"><img src="https://avatars.githubusercontent.com/u/161798182?v=4?s=100" width="100px;" alt="Neeru "/><br /><sub><b>Neeru </b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=neeru24" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Saisathvik94"><img src="https://avatars.githubusercontent.com/u/179990491?v=4?s=100" width="100px;" alt="Sai Sathvik"/><br /><sub><b>Sai Sathvik</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Saisathvik94" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/apps/allcontributors"><img src="https://avatars.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt="allcontributors[bot]"/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=allcontributors[bot]" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Neeraj-code-beep"><img src="https://avatars.githubusercontent.com/u/224738797?v=4?s=100" width="100px;" alt="Neeraj Mishra"/><br /><sub><b>Neeraj Mishra</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Neeraj-code-beep" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://shrinivasmudabe.me/"><img src="https://avatars.githubusercontent.com/u/166788110?v=4?s=100" width="100px;" alt="Shrinivas Mudabe"/><br /><sub><b>Shrinivas Mudabe</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Shriii19" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sakthijaw"><img src="https://avatars.githubusercontent.com/u/167529826?v=4?s=100" width="100px;" alt="Sakthi J"/><br /><sub><b>Sakthi J</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=sakthijaw" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://portfolio-demo-a0bf3.web.app/"><img src="https://avatars.githubusercontent.com/u/170798560?v=4?s=100" width="100px;" alt="pikachu"/><br /><sub><b>pikachu</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=sriram687" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lavya30"><img src="https://avatars.githubusercontent.com/u/155524014?v=4?s=100" width="100px;" alt="Lavya Goel"/><br /><sub><b>Lavya Goel</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=lavya30" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/heisenberg7519"><img src="https://avatars.githubusercontent.com/u/220874860?v=4?s=100" width="100px;" alt="Sahil Dhamal"/><br /><sub><b>Sahil Dhamal</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=heisenberg7519" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Souradeep858"><img src="https://avatars.githubusercontent.com/u/192359221?v=4?s=100" width="100px;" alt="Souradeep Chakraborty"/><br /><sub><b>Souradeep Chakraborty</b></sub></a><br /><a href="https://github.com/ayanmanna123/GPS_Tracker/commits?author=Souradeep858" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification.

---

## 📌 Roadmap

### 🚀 Phase 1 (Current)
- ✅ Real-time bus tracking
- ✅ Secure payment integration
- ✅ Multi-language support
- ✅ Responsive web design

### 🔮 Phase 2 (Q2 2024)
- 📱 Mobile app development (React Native)
- 🤖 AI-powered route optimization
- 📊 Advanced analytics dashboard
- 🔄 Offline functionality

### 🚁 Phase 3 (Q4 2024)
- 🔔 Push notification system
- 📈 Predictive maintenance alerts
- 🌍 Multi-city expansion
- 🤝 Partner integrations

### 💡 Future Ideas
- 🏆 Gamification features
- 🎯 Carbon footprint tracking
- 🔗 Integration with ride-sharing services
- 📱 AR navigation assistance

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2024 Ayan Manna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## ⭐ Support

### 💝 Show Your Support

If you find this project helpful, please consider:

- **⭐ Starring** the repository
- **🔗 Sharing** with your network
- **💬 Contributing** code or documentation
- **🐛 Reporting** issues and suggestions

### 🆘 Getting Help

- 📧 **Email**: [support@whereismybus.com](mailto:support@whereismybus.com)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ayanmanna123/GPS_Tracker/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/ayanmanna123/GPS_Tracker/issues)
- 📖 **Documentation**: [Wiki](https://github.com/ayanmanna123/GPS_Tracker/wiki)

---

## 📞 Contact

<div align="center">

**Ayan Manna** 👨‍💻

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ayanmanna)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/ayanmanna)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ayanmanna123)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=todoist&logoColor=white)](https://ayanmanna.dev)

**Project Link:** [https://github.com/ayanmanna123/GPS_Tracker](https://github.com/ayanmanna123/GPS_Tracker)

---

</div>

<div align="center">

**Made with ❤️ by [Ayan Manna](https://github.com/ayanmanna123) and the amazing open-source community**

---

*Last updated: January 2026*

</div>
