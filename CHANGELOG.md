# Changelog

All notable changes to the **Hotelier** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.3.0] - 2026-11-02

### Added
- **Tier 3: Admin Operations & DevOps Automation**:
  - **Financial CSV / Excel Report Export**:
    - Backend route `GET /api/admin/reports/financial/export` generating RFC 4180 compliant CSV reports with UTF-8 BOM (`\uFEFF`) for seamless Microsoft Excel compatibility.
    - Exports 23 detailed financial ledger columns including Reservation ID, booking timestamp, guest details, hotel & destination, room category, nights, base room tariffs, meal plans, hospitality add-ons, coupon deductions, 18% GST tax breakdown, grand totals, and payment methods.
    - Integrated interactive Export modal in `AdminDashboardPage.jsx` with date range filters, hotel portfolio picker, and status filters, plus instant "Quick Export View" button.
  - **Promo Code & Campaign Manager**:
    - Backend admin management endpoints in `server/src/routes/admin.js` (`GET /api/admin/coupons`, `POST /api/admin/coupons`, `PATCH /api/admin/coupons/:id/toggle`, `DELETE /api/admin/coupons/:id`).
    - Input validation schema `couponCreateSchema` in `server/src/schemas/index.js` enforcing valid discount types (`PERCENTAGE`, `FLAT`), values, max caps, minimum booking thresholds, and expiration dates.
    - New dedicated "Promo Codes" Tab 5 in `AdminDashboardPage.jsx` featuring promo cards, quick code copying, active/inactive toggle switch, deletion confirmations, and a "Create Promo Code" modal with one-click random code generator (`Sparkles`).
  - **DevOps Automation: GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)**:
    - Automated CI/CD pipeline triggered on push and pull requests to `master`.
    - Automated multi-tier verification: dependency installation, Vitest backend unit and security tests, production client bundling, Playwright Chromium installation, and Playwright E2E smoke execution with artifact test report archiving.
  - **Playwright E2E Smoke Test Suite (`e2e/smoke.spec.js`)**:
    - Comprehensive browser smoke tests validating core guest journeys: branding & discovery, multi-currency switcher dynamic rate conversions, AI Concierge ("Aria") interactions & prompt chips, side-by-side comparison dock and tray, and guest authentication dialog validation.
  - **Automated Vitest Test Suite**:
    - Expanded test suite to 44 passing tests covering coupon creation validation and schema constraints.

---

## [4.2.0] - 2026-11-02

### Added
- **Tier 2: Booking Lifecycle & Hospitality Operations**:
  - **Booking Modification & Date Rescheduling Flow**:
    - Guests can reschedule confirmed stays directly from `MyBookingsPage.jsx` via a dedicated Reschedule Stay modal.
    - Added `PATCH /api/reservations/:id/reschedule` endpoint with automated double-booking overlap protection, self-reservation conflict exclusion, room rate recalculation, and timestamp tracking.
    - Added `PATCH /api/reservations/:id/modify` endpoint allowing guests to update guest contact numbers and special requests.
  - **Add-On Experiences & Meal Plan Upgrades at Checkout**:
    - Integrated meal plan upgrades (`Room Only`, `Royal Breakfast Buffet`, `Half Board`, `All-Inclusive Luxury`) directly into Step 1 of `BookingModal.jsx`.
    - Added curated add-on experiences (`Ayurvedic Rejuvenation Massage`, `Chauffeured Airport Transfer`, `Beachfront Candlelight Dinner`, `Late Check-Out until 4 PM`).
    - Stored selected meal plan and add-on items in Firestore reservation documents, dynamically converted with the active currency switcher (`CurrencyContext`).
    - Itemized meal plans and hospitality add-ons in booking cards and printable PDF tax invoices.
  - **Cloud-Synced Wishlist for Logged-In Users**:
    - Created `server/src/routes/wishlist.js` (`GET /`, `POST /:hotelId`, `DELETE /:hotelId`, `POST /sync`).
    - Upgraded `WishlistContext.jsx` to seamlessly synchronize bookmarks to Firestore when guests log in while preserving offline guest capabilities with localStorage fallback.
    - Added "Cloud Synced" indicator in `WishlistPage.jsx`.
  - **Guest Profile & Loyalty Tier Portal (`/profile`)**:
    - Created `GuestProfilePage.jsx` featuring dynamic loyalty tiers (`Silver Member`, `Gold Elite`, `Platinum Ambassador`) calculated from completed stay counts and total spend.
    - Reward points engine granting 10 points per ₹100 spent, tier perks breakdown, night and expenditure stats, and interactive personal profile editing (`PATCH /api/auth/profile`).
    - Integrated direct loyalty navigation in `Navbar.jsx` with real-time tier badges and crown icon.
  - **Automated Test Suite Expansion**:
    - Expanded Vitest automated test suite to 40 passing tests across `overlap.test.js`, `security.test.js`, and `validation.test.js`.

## [4.1.0] - 2026-11-02

### Added
- **Tier 1: Guest Experience & Smart Discovery**:
  - **Side-by-Side Hotel Comparison Drawer (`ComparisonDrawer.jsx`)**: Compare up to 3 hotels side by side across pricing, star ratings, amenities, destinations, and direct booking links. Full-screen comparison matrix and persistent floating bottom tray.
  - **Interactive Room Availability Calendar Heatmap (`AvailabilityCalendar.jsx`)**: 30-to-60-day visual availability heatmap on `HotelDetailPage.jsx` showing standard pricing, weekend surge tariffs (+18%), and high-demand dates with 2-click date range selection and quick presets (*This Weekend*, *Next Weekend*, *3-Day Getaway*, *7-Day Staycation*).
  - **AI Concierge & Smart Trip Planner Widget ("Aria" - `AIConciergeModal.jsx`)**: Floating assistant launcher at bottom-right of screen with interactive conversational recommendation drawer, quick prompt chips, and embedded hotel cards with real-time rates.
  - **Multi-Currency & Regional Localization Switcher (`CurrencyContext.jsx`)**: Dropdown in `Navbar.jsx` with real-time exchange rates for `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, and `AED (AED)`. Synchronizes formatted pricing across all listings, booking checkout, tax vouchers, and administrative analytics.

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
