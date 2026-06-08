# Autours Admin Dashboard

A professional admin dashboard for the Autours car rental platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **18 Sections**: Dashboard, Profile, Companies, Blogs, Profit Margin, Vehicles Photos, Bulk Upload, Categories, Specifications, Memberships, Customers, Rentals, Reviews, Terms, What's Included, Subscribers, Settings, Logout
- **SPA Navigation**: All sections work without page refresh
- **Responsive Design**: Mobile-first approach with sidebar overlay
- **Shared Components**: Reusable cards, filters, tables, pagination, and status badges
- **Charts**: Recharts integration for data visualization
- **Mock Data**: Complete demo data for all sections

## Project Structure

```
app/
├── components/           # Shared & chart components
│   ├── shared/          # Reusable UI components
│   │   ├── PageHeader.tsx
│   │   ├── StatsCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Pagination.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── GenericCard.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── DataTable.tsx
│   │   └── SectionLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── [Charts].tsx
├── sections/            # Page sections (18 total)
│   ├── dashboard/
│   ├── profile/
│   ├── companies/
│   ├── blogs/
│   ├── profit-margin/
│   ├── vehicles-photos/
│   ├── vehicles-bulk-upload/
│   ├── categories/
│   ├── specifications/
│   ├── memberships/
│   ├── customers/
│   ├── rentals/
│   ├── rental-reviews/
│   ├── rental-terms/
│   ├── what-is-included/
│   ├── subscribers/
│   ├── background-settings/
│   └── logout/
├── lib/
│   └── data.ts         # All mock data
├── dashboard/
│   └── page.tsx        # Main dashboard with routing
├── layout.tsx
├── page.tsx            # Redirect to /dashboard
└── globals.css
```

## Installation

```bash
npm install
npm run dev
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Recharts (charts)
