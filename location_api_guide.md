# توثيق API أماكن استلام السيارات (Locations) - Autours Project

هذا الملف يشرح تفاصيل الـ API الخاص بجلب أماكن الاستلام (الدول/المدن/المناطق) التي تظهر في حقل "Pickup Location" في صفحة البحث الرئيسية.

---

## 1. تفاصيل الـ API الأساسي (Pickup Locations)

هذا هو الـ API المسؤول عن استرجاع الأماكن التي يتوفر بها سيارات للإيجار من قاعدة البيانات المحلية الخاصة بالموقع.

*   **الرابط (Endpoint):** `GET /get/locations`
*   **الوظيفة:** يجلب جميع فروع السيارات (Branches) المتاحة في قاعدة البيانات، مرتبة أبجدياً، ومفلترة لتجنب تكرار نفس اسم المكان (باستخدام `unique('location')`).

### شكل الريكويست (Request):
لا يحتاج هذا الـ API إلى إرسال أي بيانات في الـ Body (لأنه `GET`).
```http
GET https://www.autours.net/get/locations
```

### شكل الريسبونس (Response JSON):
بناءً على كود الـ Backend في `VehicleController`، يعود الرد عبارة عن `JSON Object` يحتوي على بيانات الفروع (بسبب استخدام الدالة `unique` في Laravel التي تحول الـ Array إلى Object).

مثال لشكل الداتا الراجعة:
```json
{
  "0": {
    "id": 1,
    "name": "Dubai Airport Branch",
    "location": "Dubai",
    "adresse": "Terminal 1",
    "company_id": 5,
    "currency": "AED",
    "country": "UAE",
    "lat": "25.2532",
    "lng": "55.3657",
    "location_type": "Airport"
  },
  "2": {
    "id": 3,
    "name": "Abu Dhabi City Center",
    "location": "Abu Dhabi",
    "adresse": "Downtown",
    "company_id": 8,
    "currency": "AED",
    "country": "UAE",
    "lat": "24.4539",
    "lng": "54.3773",
    "location_type": "City"
  }
}
```

---

## 2. كيفية معالجة وربط هذه البيانات في الفرونت إند (Vue.js / React)

### أ- طريقة المعالجة الحالية (Vue.js):
في ملف `SearchForm.vue`، يتم جلب البيانات وتحويلها إلى مصفوفة (Array) باستخدام `Object.values` لكي يسهل عمل `Loop` عليها في قائمة البحث:

```javascript
const getLocations = async () => {
    try {
        const response = await axios.get('/get/locations')
        // تحويل الـ JSON Object إلى Array
        locations.all.value = Object.values(response.data)
    } catch (error) {
        console.error(error)
    }
}
```

### ب- فلترة البحث (Remote Search):
عندما يكتب المستخدم حرفاً في مربع البحث، لا يتم استدعاء الـ API مرة أخرى، بل يتم عمل فلترة (Filter) محلياً على المصفوفة المحفوظة في الـ State (وهو ما يُعرف بالفلترة بـ Frontend):
```javascript
const remoteLocations = (query) => {
    if (query) {
        locations.options.value = locations.all.value.filter((item) =>
            // ملحوظة: في الكود القديم، كان هناك خطأ برمجي باعتبار item نص (String)،
            // بينما هو في الواقع كائن (Object). الطريقة الصحيحة:
            item.location.toLowerCase().includes(query.toLowerCase())
        )
    }
}
```

---

## 3. كيفية تطبيق ذلك في مشروعك الجديد (Next.js / React)

لربط هذا الـ API في لوحة التحكم أو موقعك الجديد المبني بـ React، يمكنك استخدام هذا الكود:

```typescript
import { useState, useEffect } from 'react';

// تعريف نوع البيانات
interface LocationBranch {
  id: number;
  name: string;
  location: string;
  country: string;
}

export function LocationSearchInput() {
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('https://www.autours.net/get/locations');
        const data = await res.json();
        // تحويل الـ Object القادم من Laravel إلى Array
        setLocations(Object.values(data));
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);

  // 2. فلترة النتائج بناءً على ما يكتبه المستخدم
  const filteredLocations = locations.filter(loc => 
    loc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <input 
        type="text" 
        placeholder="اختر موقع الاستلام..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <ul>
        {filteredLocations.map((loc) => (
          <li key={loc.id} onClick={() => console.log('Selected:', loc.location)}>
            {loc.location} - {loc.country}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### ملخص:
- **الرابط:** `/get/locations` يجلب **فروع الشركات** (Branches) المسجلة.
- الداتا تأتي على هيئة كائن (Object)، يجب تحويلها لـ Array باستخدام `Object.values`.
- القيمة التي تهمك في الـ Form لعرضها كاسم المكان وإرسالها لاحقاً في بحث السيارات هي خاصية `location`.
