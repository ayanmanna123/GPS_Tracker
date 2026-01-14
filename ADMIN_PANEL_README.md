# Admin Panel Documentation

## Overview
This admin panel allows administrators to manage users, drivers, buses, and view analytics for the GPS Tracker system. It provides comprehensive oversight of the platform's operations.

## Features

### 1. Dashboard
- View overall platform statistics
- Total users, drivers, buses, and earnings
- Daily performance metrics

### 2. User Management
- View all registered users
- Promote/demote users to/from admin status
- Paginated user listings

### 3. Driver Management
- View all registered drivers
- Activate/deactivate driver accounts
- View driver performance metrics

### 4. Bus Management
- View all registered buses
- See bus details, routes, and driver assignments
- Track bus creation statistics

### 5. Analytics
- User trip statistics (how many trips each user took)
- Driver performance metrics (how many buses each driver manages)
- Daily revenue reports
- Customer engagement metrics

## Backend API Endpoints

### Authentication
All admin endpoints require admin authentication via the `isAdmin` middleware.

### GET `/api/v1/admin/stats`
Returns overall platform statistics:
- Total users, drivers, buses
- Total and monthly earnings
- Today's successful payments

### GET `/api/v1/admin/users`
Returns paginated list of all users

### PATCH `/api/v1/admin/users/:userId/status`
Updates user status (admin/user)

### GET `/api/v1/admin/drivers`
Returns paginated list of all drivers

### GET `/api/v1/admin/driver-stats`
Returns driver performance metrics

### PATCH `/api/v1/admin/drivers/:driverId/status`
Updates driver status (active/inactive)

### GET `/api/v1/admin/buses`
Returns paginated list of all buses

### GET `/api/v1/admin/user-trip-stats`
Returns user trip statistics (trip count, total spent, average ticket price)

### GET `/api/v1/admin/daily-stats`
Returns daily revenue and usage statistics

## Frontend Components

### AdminDashboard
Main dashboard showing overall statistics

### AdminUsers
User management interface

### AdminDrivers
Driver management interface

### AdminBuses
Bus management interface

### AdminAnalytics
Analytics and reporting interface

### AdminSidebar
Navigation sidebar for admin panel

## Admin Access

### Making a User an Admin
To promote a user to admin status, use the promotion script:

```bash
cd Backend
node scripts/promoteToAdmin.js user@example.com
```

Alternatively, you can manually update the user's status field in the database to "admin".

### Admin Interface Access
Admin users will see an "Admin Panel" link in the navigation bar across all device sizes (desktop, tablet, mobile).

## Security
- Admin access is restricted via the `isAdmin` middleware
- Only users with `status: "admin"` can access admin endpoints
- All admin endpoints require valid authentication tokens

## Data Models
- User model: `status` field determines admin access
- Driver model: `status` field for active/inactive management
- Bus model: Contains bus details and driver associations
- Payment model: Used for calculating earnings and trip statistics