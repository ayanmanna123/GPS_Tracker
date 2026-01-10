
# GPS Tracker Backend

## Overview

This is the backend for the GPS Tracker application. It is a Node.js application built with Express.js that provides a RESTful API for the frontend to consume.

## Project Architecture

The GPS Tracker system follows a modular, scalable architecture:

- **GPS Device**  
  Sends real-time location data (latitude, longitude, timestamp)

- **Backend API (Node.js + Express)**  
  - Validates and processes location data  
  - Stores data in MongoDB  
  - Uses Redis for caching and performance optimization  
  - Exposes REST APIs for frontend consumption

- **Frontend (React + Leaflet)**  
  - Displays real-time bus locations on interactive maps  
  - Handles journey planning, ticket booking, and user interaction

This separation allows independent scaling of frontend, backend, and device layers.

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB
- **Redis**: In-memory data structure store, used as a database, cache and message broker
- **Razorpay**: Payment gateway
- **@google/generative-ai, @huggingface/transformers, @langchain/community, @langchain/core, @langchain/google-genai, @xenova/transformers, openai, langchain**: Libraries for AI-powered support bot
- **Haversine**: For calculating distance between two points on a sphere
- **body-parser**: Node.js body parsing middleware
- **cookie-parser**: Parse Cookie header and populate `req.cookies`
- **cors**: Enable CORS
- **dotenv**: Loads environment variables from a `.env` file
- **express-jwt, express-oauth2-jwt-bearer, jwks-rsa**: For handling JWT authentication
- **nodemon**: Utility that will monitor for any changes in your source and automatically restart your server

## Folder Structure

```
Backend
├───controllers
│   ├───Bus.controller.js
│   ├───Driver.controller.js
│   ├───Journey.controller.js
│   ├───Location.controller.js
│   ├───MyLocation.controller.js
│   ├───Review.controller.js
│   ├───RoutePrediction.controller.js  # 🧠 AI Route Prediction
│   ├───supportBot.controller.js
│   ├───TecketPriceCalculator.controller.js
│   └───User.controller.js
├───middleware
│   └───isAuthenticated.js
├───models
│   ├───Bus.model.js
│   ├───Driver.model.js
│   ├───Location.model.js
│   ├───Payment.model.js
│   ├───Review.model.js
│   ├───TripHistory.model.js  # 🧠 Historical trip data for ML
│   └───User.model.js
├───routes
│   ├───bus.route.js
│   ├───Driver.route.js
│   ├───journey.route.js
│   ├───location.route.js
│   ├───MyLocation.route.js
│   ├───prediction.route.js  # 🧠 AI Route Prediction routes
│   ├───Review.route.js
│   ├───supportBot.routes.js
│   └───User.route.js
├───utils
│   ├───db.js
│   ├───getAddressFromCoordinates.js
│   ├───mockData.js  # 🧠 Offline mode mock data
│   ├───prediction.utils.js  # 🧠 ML prediction utilities
│   ├───redis.js
│   └───utilsgetAddressFromCoordinates.js
├───.gitignore
├───index.js
├───knowledge.json
├───package.json
└───vercel.json
```

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB
- **Redis**: In-memory data structure store, used as a database, cache and message broker
- **Razorpay**: Payment gateway
- **@google/generative-ai, @huggingface/transformers, @langchain/community, @langchain/core, @langchain/google-genai, @xenova/transformers, openai, langchain**: Libraries for AI-powered support bot
- **Haversine**: For calculating distance between two points on a sphere
- **body-parser**: Node.js body parsing middleware
- **cookie-parser**: Parse Cookie header and populate `req.cookies`
- **cors**: Enable CORS
- **dotenv**: Loads environment variables from a `.env` file
- **express-jwt, express-oauth2-jwt-bearer, jwks-rsa**: For handling JWT authentication
- **nodemon**: Utility that will monitor for any changes in your source and automatically restart your server

## Project Architecture

The GPS Tracker system follows a modular, scalable architecture:

- **GPS Device**  
  Sends real-time location data (latitude, longitude, timestamp)

- **Backend API (Node.js + Express)**  
  - Validates and processes location data  
  - Stores data in MongoDB  
  - Uses Redis for caching and performance optimization  
  - Exposes REST APIs for frontend consumption

- **Frontend (React + Leaflet)**  
  - Displays real-time bus locations on interactive maps  
  - Handles journey planning, ticket booking, and user interaction

This separation allows independent scaling of frontend, backend, and device layers.

## API Endpoints

### Bus Routes (`/api/bus`)

- `POST /createbus`: Create a new bus (protected)
- `GET /get/allBus`: Get all buses
- `POST /calculate/price`: Calculate ticket price
- `POST /verify-payment`: Verify payment (protected)
- `GET /user/all-ticket`: Get all tickets for a user (protected)
- `GET /get-ticket/:ticketid`: Get a ticket by ID (protected)
- `POST /create-order`: Create a new order

### Driver Routes (`/api/driver`)

- `POST /createUser`: Create a new driver (protected)
- `GET /veryfi/email/:email`: Verify driver's email
- `PUT /update/profile`: Update driver's profile (protected)
- `GET /allBus`: Get all buses for a driver (protected)

### Journey Routes (`/api/journey`)

- `POST /journey-planner`: Plan a journey
- `GET /transfer-points`: Get transfer points
- `POST /walking-route`: Get walking route

### Location Routes (`/api/location`)

- `PUT /update/location`: Update bus location
- `POST /create/newBus`: Create a new bus ID
- `GET /get/location/:deviceID`: Get bus location by device ID
- `GET /get/search`: Search for buses
- `GET /route/search`: Get buses along a route
- `GET /bus/:deviceId`: Get bus details by device ID
- `GET /AllLocation`: Get all bus locations
- `GET /debug/database`: Debug database
- `POST /debug/create-sample-buses`: Create sample buses for testing
- `GET /debug/test-route-search`: Test route search

### MyLocation Routes (`/api/my-location`)

- `POST /find-bus`: Find a bus by route
- `POST /find-bus-By-id`: Find a bus by ID
- `POST /find-bus-bu-name`: Find a bus by name
- `GET /bus-details/:deviceID`: Get bus details by device ID

### Review Routes (`/api/review`)

- `POST /reviews`: Create a new review (protected)

### Support Bot Routes (`/api/support`)

- `POST /ask`: Ask the support bot

### AI Route Prediction Routes (`/api/v1/predict`)

- `GET /route`: Get optimal route predictions with ETA, reliability, and delay forecasts
- `GET /eta`: Get ETA prediction for a specific bus
- `GET /delays/:routeId`: Get delay prediction for a route
- `GET /reliability/:routeId`: Get route reliability score
- `POST /feedback`: Submit prediction feedback for model improvement
- `GET /stats`: Get prediction model statistics and info

> **Note**: The prediction system works in **offline mode** with mock data when MongoDB/Redis are not configured.

### User Routes (`/api/user`)

- `POST /crete/User`: Create a new user (protected)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the application

```bash
npm run dev
```

The application will be running on `http://localhost:3000` (or the port specified in your `.env` file).

## Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```
PORT=3000
MONGO_URI=<your-mongodb-uri>
REDIS_URI=<your-redis-uri>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
JWT_SECRET=<your-jwt-secret>
AUTH0_DOMAIN=<your-auth0-domain>
AUTH0_AUDIENCE=<your-auth0-audience>
GOOGLE_API_KEY=<your-google-api-key>
```
