# Changelog

All notable changes to the **Hotelier** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.4.0] - 2026-10-30

### Added
- **Input Validation & Schema Enforcement (Zod)**: Comprehensive validation schemas in `server/src/schemas/index.js` (`registerSchema`, `loginSchema`, `reservationSchema`, `reviewSchema`, `hotelSchema`, `roomSchema`, `couponApplySchema`).
- **Client-Side Form Validation**: Pre-flight validation in `AuthModal.jsx` and `BookingModal.jsx` with instant error feedback.
- **Security Hardening**:
  - Integrated `helmet` for HTTP security headers (`nosniff`, `SAMEORIGIN`, referrer policies).
  - Shifted JWT storage from `localStorage` to **HttpOnly Secure Cookies** with refresh token rotation (`POST /api/auth/refresh`, `POST /api/auth/logout`).
  - Added dual-mode authentication supporting both HttpOnly cookies and Bearer tokens.
  - Enforced mandatory `JWT_SECRET` in production environments.
- **Data Fetching & Caching Layer (TanStack Query v5)**: Replaced manual `useEffect` waterfalls with `@tanstack/react-query` hooks in `useHotelQueries.js` across `HomePage`, `HotelDetailPage`, `MyBookingsPage`, and `AdminDashboardPage`.
- **Automated Integration Test Suite (Vitest)**: Added 30 automated tests in `server/test/` validating double-booking overlap logic, Zod validation schemas, and security token/cookie behaviors.
- **Vite Code Splitting**: Split monolithic bundle into cacheable vendor chunks (`vendor-react`, `vendor-query`, `vendor-leaflet`, `vendor-charts`, `vendor-icons`, `vendor-forms`).
- **PWA Service Worker (`sw.js`)**: Added network-first navigation caching and stale-while-revalidate strategy for static assets.
- **RFC 9116 `security.txt`**: Added `/.well-known/security.txt` vulnerability disclosure endpoint.

---

## [3.3.0] - 2026-10-30

### Added
- **Visual Analytics & Charts (`recharts`)**: Monthly revenue trajectory area chart, destination booking demand bar chart, and reservation fulfillment donut chart in `AdminDashboardPage.jsx`.
- **Property Edit & Full Metadata Manager**: Modal UI to edit property details, nightly base rates, and GPS coordinates.
- **Dedicated Rooms Inventory Tab**: Centralized table to manage room tariffs and toggle maintenance status.
- **Destinations & Categories Manager**: Interactive modals to add/remove holiday regions and room categories.
- **Direct Image File Uploads (`multer`)**: Drag-and-drop image file uploader with responsive preview in `ImageDropzone.jsx`.

---

## [3.2.0] - 2026-10-29

### Added
- **Interactive Map View (Leaflet / OpenStreetMap)**: Split-screen "Show on Map" toggle on Home Page with interactive price pins, popups, and embedded property maps.
- **Multi-Image Photo Galleries & Lightbox**: Bento-grid hero gallery and fullscreen lightbox carousel with keyboard navigation.
- **Wishlist & Saved Stays Portal (`/wishlist`)**: One-click heart bookmarking, live badge counter, and dedicated wishlist management page.
- **Hero Search with Date Availability**: Check-in, check-out, and guest count filters on the hero search bar with real-time room availability filtering.
- **Dark Mode & Toast Notifications**: Dark/Light theme toggle with persistent preference, non-blocking toast alerts, and modal confirmation dialogs.

---

## [3.1.0] - 2026-10-28

### Added
- **Verified Guest Reviews & Ratings**: Post-stay verified reviews with star breakdowns.
- **Dynamic Pricing, Taxes & Coupons**: Itemized GST (12%), platform service fees, and instant promo code validation (`WELCOME20`, `MONSOON15`, `FLAT500`).
- **Payment Gateway Integration**: Multi-method test checkout (UPI, Cards, Net Banking) with automated transaction IDs.
- **Printable Invoices & Check-In Vouchers**: Digital tax invoice with dynamic check-in QR codes (`BK-XXXXX`).
- **Multi-Tier Rate Limiting (`express-rate-limit`)**: Brute-force protection on auth endpoints and sensitive action rate limits.

---

## [2.0.0] - 2026-10-28

### Added
- Complete cloud modernization from 2018 Java Swing desktop app to React 18, Vite, Tailwind CSS, Express, and Google Cloud Firestore.
- Serverless deployment on Firebase Hosting and Firebase Cloud Functions.
