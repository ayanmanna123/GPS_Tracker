# GPS Tracker Frontend

## Overview

This is the frontend for the GPS Tracker application. It is a React application built with Vite that provides a user interface for interacting with the backend API.

## Features

- User and Driver authentication
- Bus search and tracking on a map
- Real-time location updates
- Ticket booking and payment with Razorpay
- Journey planning with transfer points and walking routes
- AI-powered support chat
- User profiles
- Ticket history
- Review and rating system
- Internationalization support

## Tech Stack

- **React**: JavaScript library for building user interfaces
- **Vite**: Next generation frontend tooling
- **Redux Toolkit**: The official, opinionated, batteries-included toolset for efficient Redux development
- **React Router**: Declarative routing for React
- **Auth0 React**: Auth0 SDK for React Single Page Applications
- **Axios**: Promise based HTTP client for the browser and node.js
- **Leaflet**: An open-source JavaScript library for mobile-friendly interactive maps
- **React Leaflet**: React components for Leaflet maps
- **Tailwind CSS**: A utility-first CSS framework
- **i18next**: An internationalization-framework written in and for JavaScript

## Folder Structure

```
Frontend
├───public
│   ├───applogo.svg
│   └───vite.svg
├───src
│   ├───assets
│   │   └───react.svg
│   ├───components
│   │   ├───page
│   │   │   ├───Bus.jsx
│   │   │   ├───BusDetailsPage2.jsx
│   │   │   ├───BusMap.jsx
│   │   │   ├───BusSearch.jsx
│   │   │   ├───Complete.jsx
│   │   │   ├───CreateBus.jsx
│   │   │   ├───DriverLogin.jsx
│   │   │   ├───FllowBusMap.jsx
│   │   │   ├───History.jsx
│   │   │   ├───Home.jsx
│   │   │   ├───LocationTracker.jsx
│   │   │   ├───MicInput.jsx
│   │   │   ├───MyTickets.jsx
│   │   │   ├───NearbyPOIMap.jsx
│   │   │   ├───Profile.jsx
│   │   │   ├───RazorpayPayment.jsx
│   │   │   ├───ReviewForm.jsx
│   │   │   ├───SupportChat.jsx
│   │   │   ├───SupportPopover.jsx
│   │   │   ├───theme-toggle.jsx
│   │   │   ├───TicketDetails.jsx
│   │   │   └───UserLogin.jsx
│   │   ├───shared
│   │   │   ├───LocationSearch.jsx
│   │   │   └───Navbar.jsx
│   │   └───ui
│   │       ├───avatar.jsx
│   │       ├───button.jsx
│   │       ├───card.jsx
│   │       ├───input.jsx
│   │       ├───label.jsx
│   │       ├───popover.jsx
│   │       ├───select.jsx
│   │       └───sonner.jsx
│   ├───hooks
│   │   └───useSpeechToText.js
│   ├───i18n
│   │   ├───index.js
│   │   └───locales
│   │       ├───as.json
│   │       ├───bn.json
│   │       ├───en.json
│   │       ...
│   ├───lib
│   │   └───utils.js
│   ├───Redux
│   │   ├───auth.reducer.js
│   │   ├───history.reducer.js
│   │   ├───locationSlice.js
│   │   └───store.js
│   └───services
│       ├───apiConnector.js
│       ├───apis.js
│       ├───busSearchService.js
│       ├───geocode.js
│       ├───journeyIntegrationService.js
│       ├───journeyPlanningService.js
│       └───operations
│           └───busAPI.js
├───.gitignore
├───components.json
├───eslint.config.js
├───index.html
├───jsconfig.json
├───package.json
├───README.md
├───vercel.json
└───vite.config.js
```

## Tech Stack

- **React**: JavaScript library for building user interfaces
- **Vite**: Next generation frontend tooling
- **Redux Toolkit**: The official, opinionated, batteries-included toolset for efficient Redux development
- **React Router**: Declarative routing for React
- **Auth0 React**: Auth0 SDK for React Single Page Applications
- **Axios**: Promise based HTTP client for the browser and node.js
- **Leaflet**: An open-source JavaScript library for mobile-friendly interactive maps
- **React Leaflet**: React components for Leaflet maps
- **Tailwind CSS**: A utility-first CSS framework
- **i18next**: An internationalization-framework written in and for JavaScript

## Features

- User and Driver authentication
- Bus search and tracking on a map
- Real-time location updates
- Ticket booking and payment with Razorpay
- Journey planning with transfer points and walking routes
- AI-powered support chat
- User profiles
- Ticket history
- Review and rating system
- Internationalization support

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the `Frontend` directory:
    ```bash
    cd Frontend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the application

```bash
npm run dev
```

The application will be running on `http://localhost:5173` (or another port if 5173 is in use).

## Environment Variables

Create a `.env` file in the `Frontend` directory with the following variables:

````
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
``` Navigate to the `Frontend` directory:
    ```bash
    cd Frontend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the application

```bash
npm run dev
````

The application will be running on `http://localhost:5173` (or another port if 5173 is in use).

## Environment Variables

Create a `.env` file in the `Frontend` directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```
