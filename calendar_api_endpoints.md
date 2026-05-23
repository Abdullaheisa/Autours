# Calendar API Endpoints Specification

This document details the expected request and response structures for the Booking Calendar endpoints in both the Admin Dashboard and the Company Dashboard.

---

## 1. Admin Calendar Endpoint

This endpoint is used when the Admin clicks on a specific date in the calendar. It returns all bookings for that specific date across all companies, as well as a summary of the countries where these bookings occurred.

**Endpoint:** `GET /api/admin/calendar/bookings`

### Request (Query Parameters)
The frontend will send the exact date (Day, Month, Year) to fetch its specific bookings.

| Parameter | Type   | Required | Description |
| :--- | :--- | :--- | :--- |
| `day` | integer | Yes | The target day (1-31). |
| `month` | integer | Yes | The target month (1-12). |
| `year` | integer | Yes | The target year (e.g., 2024). |

### Request Example
```http
GET /api/admin/calendar/bookings?day=20&month=5&year=2024
Authorization: Bearer <Admin_JWT_Token>
```

### Response Example
The response must clearly include two things in the `data` object:
1. `countries`: A list of all countries that have bookings on this specific day (used for filters and stats).
2. `bookings`: The actual list of bookings to be displayed in the table/cards.

```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "countryCode": "SA",
        "countryName": "Saudi Arabia",
        "totalBookings": 15
      },
      {
        "countryCode": "AE",
        "countryName": "UAE",
        "totalBookings": 8
      }
    ],
    "bookings": [
      {
        "id": "BK-24051234",
        "vehicle": "Toyota Camry",
        "category": "Sedan",
        "grade": "Standard",
        "companyName": "Budget Rent A Car",
        "country": "SA",
        "countryName": "Saudi Arabia",
        "duration": "3 Days",
        "status": "Pending",
        "type": "pending",
        "date": "2024-05-20T10:00:00Z"
      },
      {
        "id": "BK-24059876",
        "vehicle": "Nissan Patrol",
        "category": "SUV",
        "grade": "Full Option",
        "companyName": "National Car Rental",
        "country": "AE",
        "countryName": "UAE",
        "duration": "5 Days",
        "status": "Completed",
        "type": "completed",
        "date": "2024-05-20T14:30:00Z"
      }
    ]
  }
}
```

---

## 2. Company Calendar Endpoint

This endpoint retrieves bookings exclusively for the logged-in company for a specific date. 

**Endpoint:** `GET /api/company/calendar/bookings`

> **Note:** The backend must identify the company and its country from the `Authorization` token automatically.

### Request (Query Parameters)
Just like the admin, the request sends the exact day, month, and year.

| Parameter | Type   | Required | Description |
| :--- | :--- | :--- | :--- |
| `day` | integer | Yes | The target day (1-31). |
| `month` | integer | Yes | The target month (1-12). |
| `year` | integer | Yes | The target year (e.g., 2024). |

### Request Example
```http
GET /api/company/calendar/bookings?day=20&month=5&year=2024
Authorization: Bearer <Company_JWT_Token>
```

### Response Example
The response brings only the bookings belonging to this company. If this company operates in multiple countries (or branches), you can optionally include the `countries` or `branches` summary. Otherwise, just the bookings are sufficient.

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "BK-24055555",
        "vehicle": "Hyundai Tucson",
        "category": "SUV",
        "grade": "Premium",
        "duration": "5 Days",
        "status": "Completed",
        "type": "completed",
        "date": "2024-05-20T14:30:00Z"
      }
    ]
  }
}
```
