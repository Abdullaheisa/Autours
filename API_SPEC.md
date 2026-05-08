# Autours API Specification

This document outlines the required API endpoints and data structures for the Autours Car Rental marketplace.

## 1. Vehicles & Listings

### GET `/api/vehicles`
Fetches a list of available vehicles based on search criteria.

**Request Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `pickupLoc` | string | Yes | Location branch/city name |
| `date_from` | string | Yes | Format: `YYYY-MM-DD` |
| `date_to` | string | Yes | Format: `YYYY-MM-DD` |
| `category` | string | No | Filter by car category (e.g., 'Luxury', 'SUV') |
| `price_min` | number | No | Minimum daily price |
| `price_max` | number | No | Maximum daily price |
| `currency` | string | No | Currency code for pricing (USD, SAR, etc.) |

**Response Body (JSON):**
```json
{
  "count": 42,
  "results": [
    {
      "id": "uuid-v4",
      "name": "Mercedes G63 AMG",
      "category": "Luxury",
      "price_per_day": 500,
      "currency": "USD",
      "images": ["url1", "url2"],
      "specs": {
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Petrol"
      },
      "company": {
        "name": "Elite Cars",
        "logo": "logo_url"
      }
    }
  ]
}
```

### GET `/api/vehicles/{id}`
Fetches details for a specific vehicle.

---

## 2. Locations

### GET `/api/locations`
Fetches available pickup/drop-off locations.

**Response Body (JSON):**
```json
[
  {
    "id": "loc-1",
    "location": "Dubai",
    "name": "Dubai International Airport",
    "location_type": "Airport",
    "country": "UAE"
  }
]
```

---

## 3. Categories

### GET `/api/categories`
Fetches the car categories available for filtering.

---

## 4. Booking Flow

### POST `/api/bookings`
Creates a new booking request.

**Request Body:**
```json
{
  "vehicle_id": "uuid",
  "dates": {
    "from": "2026-05-15",
    "to": "2026-06-14",
    "pickup_time": "10:00",
    "return_time": "10:00"
  },
  "user_details": {
    "salutation": "Mr",
    "full_name": "Abdullah Eissa",
    "email": "user@example.com",
    "phone_code": "+971",
    "phone": "123456789",
    "country": "Egypt"
  }
}
```

---

## 5. Global Search Flow

1.  **Home Page**: User selects location and dates.
2.  **Search Page**: 
    *   Calls `GET /api/vehicles` with initial params.
    *   User can use **Sidebar Filters** (Price, Category) which triggers a re-fetch or local filter.
3.  **Booking Page**:
    *   User reviews selection.
    *   Submits registration/booking form via `POST /api/bookings`.

---

## Implementation Notes:
*   **Currency Conversion**: The frontend handles currency conversion based on a global exchange rate state (managed in Redux).
*   **Local Filtering**: To improve performance, category and price filtering can be done on the frontend if the full result set is already loaded.
