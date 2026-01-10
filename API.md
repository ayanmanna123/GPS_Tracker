# 📌 GPS Tracker – API Documentation
 
API 1: Update Device Location
```bash
http://localhost:5000/api/v1/update/location
```
❌ No authentication required

Request Body (JSON)
```bash
{
  "deviceID": "BUS-1234",
  "latitude": -26.56079650426524,
  "longitude": 89.4147844315885
}
```

API 2: Create Bus

Method: POST
```bash
http://localhost:5000/api/v1/create/newBus
```

✅ Authentication required (Bearer Token)

Request Body (JSON)
```bash
{
  "deviceID": "BUS-123467"
}
```

API 3: All live location
Method: GET

```bash
http://localhost:5000/api/v1/AllLocation
```


API 4: get a particular bus details 
Method: GET

```bash
http://localhost:5000/api/v1/get/location/BUS-111
```

API 5: find in a particular from and to coordinate bus is availed or not 

Method: POST
```bash
http://localhost:5000/api/v1/Myroute/find-bus
```

❌ No authentication required

Request Body (JSON)
```bash
{
  "fromLat": 22.6286173,
  "fromLng": 88.44061,
  "toLat": 22.560914280963402,
  "toLng": 88.41491847524925
}
```
API 6: Find Bus by ID

Method: POST
```bash
http://localhost:5000/api/v1/Myroute/find-bus-By-id
```

❌ No authentication required

Request Body (JSON)
```bash
{
  "DeviceId": "BUS-1234"
}
```
API 7: Find Bus by Name

Method: POST
```bash
http://localhost:5000/api/v1/Myroute/find-bus-bu-name
```

❌ No authentication required

Request Body (JSON)
```bash
{
  "BusName": "44"
}
```

API 8: Create Driver

Method: POST
```bash
http://localhost:5000/api/v1/driver/createUser
```

✅ Authentication required (Bearer Token)

Request Body (JSON)
```bash
{
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "picture": "https://example.com/profile.jpg",
  "licenceId": "DL-1234-765876",
  "driverExp": "5 years"
}
```

API 9: Verify Driver Email

Method: GET
```bash
http://localhost:5000/api/v1/driver/veryfi/email/{email}
```

❌ No authentication required

Example
```bash
http://localhost:5000/api/v1/driver/veryfi/email/example@gmail.com
```

API 10: Update Driver Profile

Method: PUT
```bash
http://localhost:5000/api/v1/driver/update/profile
```

✅ Authentication required (Bearer Token)

Request Body (JSON)
```bash
{
  "fullname": "ayan manna"
}
```

API 11: Get All Buses of a Driver(a driver how much bus create or won for this)

Method: GET
```bash
http://localhost:5000/api/v1/driver/allBus
```

✅ Authentication required (Bearer Token)

API 12: Get All Bus Locations (Map View)

Method: GET
```bash
http://localhost:5000/api/v1/AllLocation
```

❌ No authentication required

API 13: Create Bus (by Driver)

Method: POST
```bash
http://localhost:5000/api/v1/Bus/createbus
```

✅ Authentication required (Bearer Token)

Request Body (JSON)
```bash
{
  "name": "12",
  "deviceID": "test1",
  "to": "Downtown",
  "from": "Airport",
  "timeSlots": [
    { "startTime": "07:30", "endTime": "09:30" },
    { "startTime": "11:00", "endTime": "13:00" },
    { "startTime": "16:00", "endTime": "18:00" }
  ],
  "ticketprice": 100
}
```
API 14: Calculate Ticket Price

Method: POST
```bash
http://localhost:5000/api/v1/Bus/calculate/price
```

❌ No authentication required

Request Body (JSON)
```bash
{
  "busId": "BUS-111",
  "fromLat": 22.6004,
  "fromLng": 88.426115,
  "toLat": 22.585077,
  "toLng": 88.436742
}
```
API 15: Get All User Purchased Tickets

Method: GET
```bash
http://localhost:5000/api/v1/Bus/user/all-ticket
```

✅ Authentication required (Bearer Token)


API 16: Get Ticket by ID

Method: GET
```bash
http://localhost:5000/api/v1/Bus/get-ticket/{ticketId}
```

✅ Authentication required (Bearer Token)

Example
```bash
http://localhost:5000/api/v1/Bus/get-ticket/68e2b7bc60c852a5956463a5
```

API 17: Customer Support Chat

Method: POST
```bash
http://localhost:5000/api/v1/support/ask


❌ No authentication required

Request Body (JSON)
```bash
{
  "question": "how to cancel ticket"
}
```

---

# 🧠 AI Route Prediction APIs

## API 18: Get AI Route Predictions

Get optimal route predictions between two locations with ETA, reliability scores, and delay forecasts.

**Method:** GET
```bash
http://localhost:5000/api/v1/predict/route?fromLat=12.9716&fromLng=77.5946&toLat=12.9500&toLng=77.7000
```

❌ No authentication required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fromLat | number | ✅ | Origin latitude |
| fromLng | number | ✅ | Origin longitude |
| toLat | number | ✅ | Destination latitude |
| toLng | number | ✅ | Destination longitude |

**Response:**
```json
{
  "success": true,
  "routes": [
    {
      "busId": "BUS001",
      "busName": "City Express 1",
      "from": "Downtown Station",
      "to": "Airport Terminal",
      "estimatedMinutes": 35,
      "estimatedArrival": "02:45 PM",
      "confidence": 75,
      "reliabilityScore": 82,
      "delayProbability": 15,
      "averageDelay": 3,
      "distance": 12.5
    }
  ],
  "recommendedRoute": {...},
  "metadata": {
    "routesAnalyzed": 3,
    "offlineMode": false
  }
}
```

---

## API 19: Get ETA Prediction

Get estimated arrival time for a specific bus.

**Method:** GET
```bash
http://localhost:5000/api/v1/predict/eta?busId=BUS001&lat=12.9500&lng=77.7000
```

❌ No authentication required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| busId | string | ✅ | Bus device ID |
| lat | number | ❌ | Destination latitude |
| lng | number | ❌ | Destination longitude |

---

## API 20: Get Delay Prediction

Get delay forecast for a specific route.

**Method:** GET
```bash
http://localhost:5000/api/v1/predict/delays/{routeId}
```

❌ No authentication required

**Response:**
```json
{
  "success": true,
  "routeId": "ROUTE001",
  "prediction": {
    "delayProbability": 25,
    "expectedDelay": 5,
    "riskLevel": "low",
    "confidence": 70
  },
  "currentConditions": {
    "hour": 14,
    "isPeakHour": false
  }
}
```

---

## API 21: Get Route Reliability Score

Get historical reliability score for a route.

**Method:** GET
```bash
http://localhost:5000/api/v1/predict/reliability/{routeId}?days=30
```

❌ No authentication required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | number | ❌ | Days of history to analyze (default: 30) |

---

## API 22: Submit Prediction Feedback

Submit feedback to improve prediction accuracy.

**Method:** POST
```bash
http://localhost:5000/api/v1/predict/feedback
```

❌ No authentication required

**Request Body (JSON):**
```json
{
  "busId": "BUS001",
  "routeId": "ROUTE001",
  "predictedMinutes": 35,
  "actualMinutes": 40,
  "conditions": {
    "weather": { "condition": "rain" },
    "trafficLevel": 4
  }
}
```

---

## API 23: Get Prediction Model Stats

Get prediction model statistics and information.

**Method:** GET
```bash
http://localhost:5000/api/v1/predict/stats
```

❌ No authentication required

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalTripsLast30Days": 150,
    "averageTripDuration": 42.5,
    "averageDelay": 3.2,
    "uniqueRoutes": 5,
    "dataQuality": "Good"
  },
  "modelInfo": {
    "version": "1.0.0",
    "algorithm": "Weighted Historical Average with Condition Adjustment",
    "features": [
      "Time-of-day factor",
      "Day-of-week factor",
      "Weather adjustment",
      "Historical weighted average",
      "Confidence scoring"
    ]
  },
  "offlineMode": false
}
```
