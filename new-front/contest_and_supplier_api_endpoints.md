# Contest Popup & Supplier Intelligence — API Contract

> **تحكم في الوضع الحالي:**
> ملف `.env.local` — أضف هذا المتغير للتبديل للـ Real API:
> ```
> NEXT_PUBLIC_USE_REAL_API=true
> NEXT_PUBLIC_API_BASE_URL=https://api.autours.net
> ```
> إذا كان المتغير غير موجود أو `false` — يعمل النظام تلقائياً بالـ Mock data.

---

## جدول المحتويات

1. [Contest Popup — Public Endpoints](#1-contest-popup--public-endpoints)
2. [Contest Control — Admin Endpoints](#2-contest-control--admin-endpoints)
3. [Supplier Intelligence — Admin Endpoints](#3-supplier-intelligence--admin-endpoints)
4. [Shared Response Formats](#4-shared-response-formats)
5. [Error Handling](#5-error-handling)
6. [Frontend Integration Notes](#6-frontend-integration-notes)

---

## 1. Contest Popup — Public Endpoints

---

### 1.1 — Get Popup Settings

```
GET /api/contest/settings
```

**Response — 200 OK:**
```json
{
  "enabled": true,
  "campaignVersion": 3,
  "forceInteraction": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | `boolean` | هل البوب أب مفعّل؟ |
| `campaignVersion` | `number` | رقم الحملة — لو تغيّر يظهر البوب للكل |
| `forceInteraction` | `boolean` | هل يُجبر المستخدم على التسجيل؟ |

---

### 1.2 — Register User

```
POST /api/contest/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Ahmed Mohamed",
  "phone": "+971501234567",
  "email": "ahmed@example.com",
  "country": "Egypt"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | YES | الاسم الكامل |
| `phone` | `string` | YES | رقم الهاتف |
| `email` | `string` | YES | البريد الإلكتروني |
| `country` | `string` | NO | الدولة |

**Response — 201 Created:**
```json
{
  "id": "reg_a3f7b2c1",
  "name": "Ahmed Mohamed",
  "phone": "+971501234567",
  "email": "ahmed@example.com",
  "country": "Egypt",
  "date": "2025-05-22T14:30:00.000Z"
}
```

**Response — 409 Conflict:**
```json
{
  "message": "This email is already registered for the current campaign.",
  "code": "ALREADY_REGISTERED"
}
```

---

## 2. Contest Control — Admin Endpoints

جميع الـ endpoints تتطلب: `Authorization: Bearer <admin_token>`

---

### 2.1 — Get Admin Settings

```
GET /api/admin/contest/settings
Authorization: Bearer <token>
```

**Response — 200 OK:**
```json
{
  "enabled": true,
  "campaignVersion": 3,
  "forceInteraction": false
}
```

---

### 2.2 — Update Settings

```
PUT /api/admin/contest/settings
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (partial — أي field أو كلهم):**
```json
{
  "enabled": false,
  "forceInteraction": true
}
```

**Response — 200 OK:**
```json
{
  "enabled": false,
  "campaignVersion": 3,
  "forceInteraction": true
}
```

---

### 2.3 — Reset Campaign (يجبر البوب يظهر لكل المستخدمين من جديد)

```
POST /api/admin/contest/reset
Authorization: Bearer <token>
```

**Request Body:** `{}`

**Response — 200 OK:**
```json
{
  "enabled": true,
  "campaignVersion": 4,
  "forceInteraction": false
}
```

---

### 2.4 — List Registrations

```
GET /api/admin/contest/registrations
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | رقم الصفحة |
| `per_page` | `number` | `50` | عدد النتائج |
| `search` | `string` | `""` | بحث في الاسم / الإيميل / الهاتف |
| `country` | `string` | `""` | فلتر بالدولة |
| `campaign_version` | `number` | — | فلتر بإصدار الحملة |
| `date_from` | `string ISO` | — | من تاريخ |
| `date_to` | `string ISO` | — | إلى تاريخ |

**Example:**
```
GET /api/admin/contest/registrations?page=1&per_page=20&search=ahmed&country=Egypt
```

**Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "reg_a3f7b2c1",
      "name": "Ahmed Mohamed",
      "phone": "+971501234567",
      "email": "ahmed@example.com",
      "country": "Egypt",
      "date": "2025-05-22T14:30:00.000Z"
    }
  ],
  "total": 87,
  "current_page": 1,
  "last_page": 5,
  "per_page": 20
}
```

---

### 2.5 — Delete Registration

```
DELETE /api/admin/contest/registrations/:id
Authorization: Bearer <token>
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Registration deleted successfully."
}
```

---

## 3. Supplier Intelligence — Admin Endpoints

جميع الـ endpoints تتطلب: `Authorization: Bearer <admin_token>`

---

### 3.1 — List Supplier Intelligence Data

```
GET /api/admin/supplier-intelligence
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `country` | `string` | `"All"` | فلتر بالدولة (UAE, Egypt, Kuwait) |
| `city` | `string` | `"All"` | فلتر بالمدينة |
| `category` | `string` | `"All"` | فئة السيارة (SUV, Sedan, Economy) |
| `carType` | `string` | `"All"` | نوع الوقود (Petrol, Diesel, Electric, Hybrid) |
| `search` | `string` | `""` | بحث باسم المورد أو السيارة |
| `page` | `number` | `1` | رقم الصفحة |
| `per_page` | `number` | `20` | عدد النتائج |

**Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "sup-v001",
      "name": "Emirates Drive",
      "logo": "https://cdn.autours.net/suppliers/emirates-drive.png",
      "carName": "Toyota Fortuner",
      "carImage": "https://cdn.autours.net/cars/fortuner.jpg",
      "category": "SUV",
      "transmission": "Automatic",
      "fuel": "Petrol",
      "seats": 7,
      "dailyPrice": 320,
      "weeklyPrice": 2000,
      "monthlyPrice": 7500,
      "rating": 4.8,
      "availability": 12,
      "marketPosition": "Competitive",
      "negotiationStatus": "none",
      "lastUpdated": "2025-05-22",
      "branchLocations": ["Dubai Marina, Dubai"],
      "fleetSize": 145,
      "contactEmail": "contact@emiratesdrive.com",
      "contactPhone": "+971 4 123 4567",
      "notes": "",
      "priority": "Medium"
    }
  ],
  "stats": {
    "lowestPrice": 180,
    "highestPrice": 950,
    "averagePrice": 380,
    "cheapestSupplier": "Budget Rentals UAE",
    "expensiveSupplier": "Luxury Fleet Dubai",
    "totalSuppliers": 14,
    "totalCars": 67
  },
  "pagination": {
    "current_page": 1,
    "last_page": 4,
    "total": 67,
    "per_page": 20
  }
}
```

**`data[]` — Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | معرّف فريد |
| `name` | `string` | اسم المورد |
| `logo` | `string` | رابط شعار المورد |
| `carName` | `string` | اسم السيارة |
| `carImage` | `string` | صورة السيارة |
| `category` | `string` | فئة السيارة |
| `transmission` | `string` | ناقل الحركة (Automatic / Manual) |
| `fuel` | `string` | نوع الوقود |
| `seats` | `number` | عدد المقاعد |
| `dailyPrice` | `number` | السعر اليومي |
| `weeklyPrice` | `number` | السعر الأسبوعي |
| `monthlyPrice` | `number` | السعر الشهري |
| `rating` | `number` | تقييم المورد (1–5) |
| `availability` | `number` | عدد السيارات المتاحة |
| `marketPosition` | `string` | `Cheapest` / `Competitive` / `Expensive` / `Premium` |
| `negotiationStatus` | `string` | `none` / `in-progress` / `completed` / `rejected` |
| `lastUpdated` | `string YYYY-MM-DD` | آخر تحديث للسعر |
| `branchLocations` | `string[]` | مواقع الفروع |
| `fleetSize` | `number` | حجم الأسطول |
| `contactEmail` | `string` | إيميل التواصل |
| `contactPhone` | `string` | هاتف التواصل |
| `notes` | `string` | ملاحظات التفاوض |
| `priority` | `string` | `Low` / `Medium` / `High` |

**`stats` — Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `lowestPrice` | `number` | أقل سعر يومي |
| `highestPrice` | `number` | أعلى سعر يومي |
| `averagePrice` | `number` | متوسط السعر |
| `cheapestSupplier` | `string` | اسم أرخص مورد |
| `expensiveSupplier` | `string` | اسم أغلى مورد |
| `totalSuppliers` | `number` | عدد الموردين |
| `totalCars` | `number` | إجمالي السيارات |

---

### 3.2 — Update Negotiation Status

```
PATCH /api/admin/supplier-intelligence/:supplierId/negotiation
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "negotiationStatus": "in-progress",
  "notes": "Contacted supplier, waiting for counter offer.",
  "priority": "High"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `negotiationStatus` | `string` | YES | `none`, `in-progress`, `completed`, `rejected` |
| `notes` | `string` | NO | ملاحظات حرة |
| `priority` | `string` | NO | `Low`, `Medium`, `High` |

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "sup-v001",
    "negotiationStatus": "in-progress",
    "notes": "Contacted supplier, waiting for counter offer.",
    "priority": "High",
    "updatedAt": "2025-05-22T15:00:00.000Z"
  }
}
```

---

### 3.3 — Export to Excel (Future Backend Export)

```
GET /api/admin/supplier-intelligence/export
Authorization: Bearer <token>
```

نفس Query Parameters بتاعت 3.1

**Response — 200 OK:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Supplier-Intelligence-2025-05-22.xlsx"
<binary xlsx data>
```

> الـ Export حالياً يعمل client-side. هذا الـ endpoint للمستقبل فقط.

---

## 4. Shared Response Formats

### Paginated Response

```json
{
  "data": [],
  "total": 150,
  "current_page": 1,
  "last_page": 8,
  "per_page": 20
}
```

### ContestRegistrationDTO

```json
{
  "id": "reg_a3f7b2c1",
  "name": "Ahmed Mohamed",
  "phone": "+971501234567",
  "email": "ahmed@example.com",
  "country": "Egypt",
  "date": "2025-05-22T14:30:00.000Z"
}
```

### ContestSettingsDTO

```json
{
  "enabled": true,
  "campaignVersion": 3,
  "forceInteraction": false
}
```

---

## 5. Error Handling

```json
{
  "message": "Human-readable error.",
  "code": "MACHINE_READABLE_CODE",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

| HTTP Status | Code | متى يحدث |
|-------------|------|-----------|
| `400` | `VALIDATION_ERROR` | بيانات مفقودة أو غير صحيحة |
| `401` | `UNAUTHORIZED` | التوكن مفقود أو منتهي الصلاحية |
| `403` | `FORBIDDEN` | صلاحيات غير كافية |
| `404` | `NOT_FOUND` | السجل غير موجود |
| `409` | `ALREADY_REGISTERED` | المستخدم مسجّل في نفس الحملة |
| `422` | `UNPROCESSABLE` | بيانات صحيحة الشكل لكن غير منطقية |
| `500` | `SERVER_ERROR` | خطأ داخلي |

---

## 6. Frontend Integration Notes

### تفعيل الـ Real API

في ملف `.env.local`:
```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_API_BASE_URL=https://api.autours.net
```

### Mock Mode (الوضع الحالي)

| Feature | Storage |
|---------|---------|
| Contest Settings | `localStorage['autours_contest_settings']` |
| Contest Registrations | `localStorage['autours_contest_registrations']` |
| Supplier Intelligence | mock data من `src/data/cars.ts` |

### منطق campaignVersion

```
if localStorage['contest_registered_version'] == campaignVersion
  → البوب لا يظهر
else
  → البوب يظهر
```

عند "Reset Campaign" → `campaignVersion++` → البوب يظهر لجميع المستخدمين

### ربط الـ Endpoints بالكود

| Endpoint | Service File | Redux Slice | Component |
|----------|-------------|-------------|-----------|
| `GET /api/contest/settings` | `contest.api.ts → fetchSettings()` | `contestSlice → fetchContestSettings` | `ContestPopup.tsx` |
| `POST /api/contest/register` | `contest.api.ts → registerUser()` | `contestSlice → registerContestUser` | `ContestPopup.tsx` |
| `GET /api/admin/contest/settings` | `contest.api.ts → fetchSettings()` | `contestSlice → fetchContestSettings` | `ContestPopupControlPage.tsx` |
| `PUT /api/admin/contest/settings` | `contest.api.ts → updateSettings()` | `contestSlice → updateContestSettings` | `ContestPopupControlPage.tsx` |
| `POST /api/admin/contest/reset` | `contest.api.ts → resetCampaign()` | `contestSlice → resetCampaign` | `ContestPopupControlPage.tsx` |
| `GET /api/admin/contest/registrations` | `contest.api.ts → fetchRegistrations()` | `contestSlice → fetchRegistrations` | `ContestPopupControlPage.tsx` |
| `GET /api/admin/supplier-intelligence` | `supplierAnalytics.api.ts → fetchSupplierAnalytics()` | `supplierAnalyticsSlice → loadSupplierAnalytics` | `SupplierIntelligencePage.tsx` |
| `PATCH /api/admin/supplier-intelligence/:id/negotiation` | `supplierAnalytics.api.ts → updateNegotiationStatusAPI()` | `supplierAnalyticsSlice → updateNegotiation` | `NegotiationModal.tsx` |
