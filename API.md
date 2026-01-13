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

````bash
http://localhost:5000/api/v1/support/ask


❌ No authentication required

Request Body (JSON)
```bash
{
  "question": "how to cancel ticket"
}
````
