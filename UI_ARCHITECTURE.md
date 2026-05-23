# Autours UI Architecture & Wireframe

This document explains the structure and key components of the Search and Booking pages.

## 1. Search Page (`/search`)

The Search Page is designed for high conversion, allowing users to quickly filter and find their ideal rental car.

### Layout Structure:
- **Header**: Global Navigation and Currency Switcher.
- **Top Bar**:
  - **Category Filter**: Horizontal scrollable list of car types (SUV, Luxury, etc.).
  - **Results Count**: Real-time feedback on filtered results.
- **Main Body**:
  - **Sidebar (Left)**:
    - `ResultsSearchBar`: portal-based search modification.
    - `PriceFilter`: Range slider for daily price.
    - `CompanyFilter`: Filter by rental provider.
  - **Results Grid (Right)**:
    - List of `CarCard` components.
- **Footer**: Global site footer.

### Key Shared Components:
- `CarCard`: Displays vehicle image, name, price, and specs. Used in Search and Booking.
- `ResultsSearchBar`: Functional search form with custom calendar.
- `SearchSummary`: Sticky summary of dates, location, and currency.

---

## 2. Booking Page (`/booking`)

The Booking Page streamlines the final conversion by focusing on details and registration.

### Layout Structure:
- **Stepper**: Visual progress indicator (Select Car -> Booking -> Confirmation).
- **Sidebar (Left/Top Mobile)**:
  - `SearchSummary`: Read-only view of rental details.
  - `ResultsSearchBar`: Configured for **in-place availability checks** (fixed location).
  - **Invoice Section**: Dynamic total price that updates with currency and date changes.
- **Main Content (Right)**:
  - `CarCard`: Selected vehicle details (booking buttons hidden).
  - **Registration Form**: Premium form with global country/phone support and salutations.
- **Footer**: Global site footer.

---

## 3. Global State & Data

- **Redux (`src/store`)**: 
  - `searchSlice`: Manages current search params and vehicle data.
  - `currencySlice`: Manages active currency and exchange rates.
- **Shared Data (`src/data`)**:
  - `worldCountries.ts`: Full list of countries and phone codes.
  - `carCategories.ts`: Definitions for car types and icons.

## 4. How to Modify

- **To update colors/spacing**: Edit the Tailwind classes or the global CSS.
- **To add a new car**: Update the data returned by the vehicle API.
- **To add a new filter**: Modify `src/app/search/page.tsx` and ensure the filter logic is handled in the `searchSlice`.
