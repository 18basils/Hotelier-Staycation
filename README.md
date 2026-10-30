# 🏨 Hotelier — Modern Hotel Management & Reservation System

[![Live on Firebase](https://img.shields.io/badge/Live%20on-Firebase%20Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://hotelierstays.web.app)
[![Database](https://img.shields.io/badge/Database-Cloud%20Firestore-orange?style=for-the-badge&logo=firebase)](https://console.firebase.google.com/project/hotelierstays/firestore)
[![Security: CodeQL](https://img.shields.io/badge/Security-CodeQL%20Passed-brightgreen?style=for-the-badge&logo=github)](https://github.com/18basils/Hotelier-Staycation/security)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE.md)
[![Contributions: Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

A production-grade, full-stack serverless web application for hotel discovery, real-time room availability checking, atomic reservation booking, and administrative property management.

Rebuilt and modernized from the original 2018 Java Swing desktop project ([archived in `legacy_swing/`](file:///c:/Users/BASIL%20SHAJI/Documents/Projects/Clg%20Project/legacy_swing)) into a high-performance **React 18 + Vite + Tailwind CSS + Node.js Express + Google Cloud Firestore** platform hosted live on **Firebase**.

🌐 **Live Website:** [https://hotelierstays.web.app](https://hotelierstays.web.app)  
📡 **Live API:** [https://hotelierstays.web.app/api/health](https://hotelierstays.web.app/api/health)  
🔥 **Firebase Project ID:** `hotelierstays` (Region: `asia-south1` Mumbai)

---

## ⚡ Highlights & Key Features (v3.4.0)

### 🛡️ Technical, Security & Architectural Upgrades (v3.4.0 — Phase 4)
- **📋 Input Validation & Schema Enforcement (Zod)**:
  - Strict Zod schemas enforcing validation across all API routes (`registerSchema`, `loginSchema`, `reservationSchema`, `reviewSchema`, `hotelSchema`, `roomSchema`, `couponApplySchema`).
  - Pre-flight client-side Zod validation in `AuthModal.jsx` and `BookingModal.jsx` preventing invalid phone numbers, malformed emails, and invalid date ranges before making network requests.
- **🔒 Security Hardening (Helmet & HttpOnly Secure Cookies)**:
  - Integrated `helmet` for HTTP security headers (`nosniff`, `SAMEORIGIN`, referrer policies, XSS defenses).
  - Shifted JWT storage from `localStorage` to **HttpOnly Secure Cookies** with refresh token rotation (`POST /api/auth/refresh`, `POST /api/auth/logout`).
  - Enforced mandatory `JWT_SECRET` in production environments.
  - Retained dual-mode backwards compatibility (`req.cookies.hotelier_access_token` and `Authorization: Bearer <token>`).
- **⚡ High-Performance Data Fetching & Caching Layer (TanStack Query v5)**:
  - Modernized data layer with `@tanstack/react-query` v5 across `HomePage`, `HotelDetailPage`, `MyBookingsPage`, and `AdminDashboardPage`.
  - Automatic background refetching, instant stale-while-revalidate cached navigation, and automatic query invalidation upon mutations.
- **🧪 Automated Integration Test Suite (Vitest)**:
  - 30 comprehensive automated tests (`npm test`) validating room interval overlap logic, double-booking prevention, Zod validation constraints, and token security.

### 👑 Admin Portal Upgrades (v3.3.0 — Phase 3)
- **📊 Visual Analytics & Interactive Charts (`recharts`)**:
  - Monthly hospitality revenue trajectory area chart with financial tooltips.
  - Destination-wise booking demand bar chart across key vacation regions.
  - Real-time reservation fulfillment donut chart (Confirmed vs Completed vs Cancelled).
  - Top-performing properties leaderboard ranked by revenue and ratings.
- **✏️ Property Edit & Full Metadata Manager UI**:
  - Interactive "Edit Hotel" modal pre-filled with existing property attributes.
  - Manage nightly base rates, coordinates (`latitude`, `longitude`), and featured badges.
- **🛏️ Dedicated Rooms Inventory & Maintenance Manager**:
  - Centralized inventory table displaying all rooms across properties with real-time hotel filtering and search.
  - Instant one-click toggle between **Available for Booking** and **Under Maintenance / Out of Order**.
  - Quick tariff adjustments without touching raw database records.
- **🗺️ Destinations & Room Categories Manager**:
  - Add and delete holiday destinations/regions (e.g., Varkala, Munnar, Wayanad).
  - Add and delete room categories with AC climate specs, bed counts, and guest capacities.
- **📤 Direct Drag-and-Drop Image File Uploads (`multer`)**:
  - Replaced raw URL-only inputs with a responsive drag-and-drop file upload zone.
  - Server-side multipart handling with `multer` and automatic portable Base64 data URI processing with fallback web URL entry.

### 🌟 Modern Website & UX Enhancements (v3.2.0 — Phase 2)
- **🗺️ Interactive Map View (Leaflet / OpenStreetMap)**:
  - Split-screen "Show on Map" toggle on the Home Page displaying interactive Airbnb-style price pins (`₹X,XXX`).
  - Interactive property popup cards with thumbnail preview, rating, and direct booking links.
  - Embedded location map on the Hotel Details page with exact GPS coordinates and one-click Google Maps directions.
- **🖼️ Multi-Image Photo Galleries & Fullscreen Lightbox**:
  - High-resolution bento-grid hero gallery displaying property highlights.
  - Full-screen lightbox carousel with image counter, thumbnail strip navigation, and keyboard arrow controls.
- **❤️ Wishlist & Saved Stays Portal (`/wishlist`)**:
  - One-click heart bookmarking on hotel cards and detail pages.
  - Live saved badge counter in the Navbar.
  - Dedicated Saved Stays page with instant removal and quick booking links.
- **🔍 Global Search with Date Availability on Hero Banner**:
  - Check-in, Check-out, and Guest count selectors directly on the Home Page hero search bar.
  - Real-time room availability filtering that excludes sold-out properties for requested dates.
  - Smooth search parameter forwarding (`?checkIn=...&checkOut=...&guests=...`) pre-filling the booking modal.
- **🌓 Dark Mode & Non-Blocking Toast Notifications**:
  - Full-app Dark/Light theme toggle in Navbar with persistent `localStorage` preference and smooth Tailwind styling.
  - Replaced all blocking native `window.alert()` and `window.confirm()` dialogs with non-blocking toast notifications and custom modal confirmation dialogs.

### 🏨 Core Hospitality & Booking Features (v3.1.0 — Phase 1)

- **⭐ Verified Guest Reviews & Ratings System**:
  - Authenticated guest reviews tied directly to verified bookings.
  - Dynamic aggregation of average ratings (e.g. 4.9 ★) and star rating distribution breakdown.
  - "Verified Stay" badges preventing fraudulent or spam reviews.
- **🏷️ Dynamic Pricing, Taxes & Promo Codes**:
  - Itemized pricing with room base rate, 12% Hospitality GST, and platform service fees.
  - Instant promo code validation (`WELCOME20`, `MONSOON15`, `FLAT500`, `STAYCATION10`) with live discount savings.
- **💳 Payment Gateway Integration (Test Mode)**:
  - Multi-method checkout: **UPI (Google Pay / PhonePe / Paytm)**, **Credit / Debit Cards**, and **Net Banking**.
  - Automated transaction ID generation (`PAY-RZP-XXXXX`), payment status tracking (`PAID`, `REFUNDED`), and instant digital receipts.
- **📄 Downloadable PDF Invoices & Check-In Vouchers**:
  - Official tax invoice generator with dynamic reception check-in QR codes (`BK-XXXXX`).
  - Print-to-PDF layout with complete tax breakdown, stay policies, and payment verification stamp.
- **🏊 Structured Amenities & Price Range Filtering**:
  - Multi-select amenity pills: Free Wi-Fi, Swimming Pool, Ayurvedic Spa, Breakfast, EV Charging, Pet Friendly, Sea View, Valet Parking.
  - Interactive budget slider (₹1,500 to ₹15,000+/night) for tailored discovery.
- **🛡️ Enterprise Web Security & Threat Defense**:
  - **Multi-Tier Rate Limiting (`express-rate-limit`)**: Protects against credential stuffing on `/api/auth` (25 req/15 min), sensitive action abuse on reservations/reviews (60 req/15 min), and public API flooding (300 req/15 min).
  - **Explicit CORS Whitelist**: Strict origin validation (`hotelierstays.web.app`, `firebaseapp.com`, and localhost).
  - **GitHub CodeQL SAST**: 100% clean automated static application security scans with zero open alerts.
  - **HTTP Security Headers**: A+ grade Content Security Policy (CSP), HSTS (`max-age=31556926`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
  - **Universal Bot Defense (`robots.txt`)**: Welcomes legitimate search engines and social unfurlers while blocking aggressive AI harvesters (`GPTBot`, `CCBot`) and vulnerability scanners.
  - **WhatsApp & Telegram-Optimized Open Graph Banner**: 1200x630 px ($55.4\text{ KB}$) featuring a central $630\times 630$ px safe zone preventing blurry or cropped previews across mobile chat apps.
  - **PWA & Mobile Manifest**: Home screen installable with `site.webmanifest` and high-res brand icons.
- **🛡️ Secure Authentication & RBAC**:
  - JWT (JSON Web Tokens) with 7-day session validity.
  - Password hashing with **bcryptjs** (no plaintext credentials).
  - Role-Based Access Control (**Customer / USER** vs **Administrator / ADMIN**).
- **📅 Real-Time Room Availability & Atomic Booking**:
  - Real-time Check-in and Check-out date selection with duration calculation.
  - Atomic interval conflict checks preventing double-bookings.
- **📋 "My Bookings" Customer Portal**:
  - View all upcoming and past reservations with booking reference codes (e.g. `BK-10824`).
  - Active and Cancelled status filtering.
  - Instant booking cancellation with confirmation modal.
- **👑 Full Administrator Control Center**:
  - System-wide business metrics: Total Revenue, Active Bookings, Total Hotels, Total Rooms.
  - **Hotel Management**: Add new properties with photo URLs, star ratings, address, contact, and destinations.
  - **Room Management**: Add rooms to any hotel with category (AC/beds) and nightly pricing (*replaces the missing 2018 `admin2.java`*).
  - **Reservation Management**: View all customer reservations across the system with status updates (Confirm, Complete, Cancel).

---

## 🏗️ Architecture & Evolution

| Feature | 2018 Legacy Swing Project | 2026 Modern Full-Stack System |
| :--- | :--- | :--- |
| **Platform** | Java 8 Desktop (Swing GUI) | Responsive Web (Mobile, Tablet, Desktop) |
| **Frontend** | NetBeans Matisse GUI Forms | React 18 + Vite + Tailwind CSS + Lucide Icons |
| **Backend** | Direct JDBC in UI Frames | Modular REST API with Express.js |
| **Database** | MySQL 5.1 (bundled `.jar`) | Google Cloud Firestore (Live) & SQLite (Local) |
| **Session State** | Mutated DB columns (`log_user`, `select_id`) | Stateless JWT Bearer Tokens |
| **Passwords** | Plaintext SQL queries | Salted BCrypt Hashes |
| **Concurrency** | Direct SQL update (prone to race conditions) | Overlap verification prevents double-bookings |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or newer (built & tested on Node v24 LTS)
- **npm**: v9.0.0 or newer

### 1. Run the Application
From the root directory, simply run:
```bash
npm run dev
```

This starts both:
- **Backend API**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173`

Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

*(The SQLite database `hotel_system.db` will automatically initialize and seed with sample hotels, rooms, and categories on first launch).*

---

## 🔑 Demo Access

For security and database integrity on the live cloud deployment:

- **Customer / Guest Demo:** Click the 1-click **"Continue as Guest"** button in the Sign In modal (or use `user` / `user123`).
- **Create Your Own Account:** Click **"Sign Up"** to create a custom guest account in seconds.
- **Administrator Dashboard:** The `/admin` portal is restricted to authorized project administrators. Demonstrations of the administrative dashboard are available upon request.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current user profile (Auth required)

### Hotels & Places (`/api/hotels`)
- `GET /api/hotels` — List hotels with search & rating filters (`?placeId=&search=&minRating=`)
- `GET /api/hotels/places` — List all destinations with hotel counts
- `GET /api/hotels/:id` — Get single hotel details and available categories

### Rooms (`/api/rooms`)
- `GET /api/rooms/categories` — List all room categories
- `GET /api/rooms/hotel/:hotelId` — List rooms with dynamic date availability (`?checkIn=&checkOut=&ac=&beds=`)

### Reservations (`/api/reservations`)
- `POST /api/reservations` — Book a room with dynamic taxes, coupons & payment capture (Auth required, double-booking protected)
- `GET /api/reservations/my` — Get user's own booking history (Auth required)
- `GET /api/reservations/:id` — Get single booking details & printable invoice data (Auth required)
- `PATCH /api/reservations/:id/cancel` — Cancel active booking & initiate refund state (Auth required)
- `PATCH /api/reservations/:id/complete` — Mark booking as completed (allows verified review submission)

### Verified Guest Reviews (`/api/reviews`)
- `GET /api/reviews/hotel/:hotelId` — Get verified reviews with aggregated average rating & star distribution
- `GET /api/reviews/check-eligible/:hotelId` — Check if current user has an unreviewed completed stay (Auth required)
- `POST /api/reviews` — Submit verified stay review with 1–5 star rating and comment (Auth required)

### Coupons & Promo Codes (`/api/coupons`)
- `POST /api/coupons/validate` — Validate promo code (`WELCOME20`, `MONSOON15`, `FLAT500`, `STAYCATION10`) and calculate discount

### System Health (`/api/health`)
- `GET /api/health` — Platform status, Cloud Firestore connectivity & service metadata

### Admin Operations (`/api/admin`) *(Admin token required)*
- `GET /api/admin/stats` — Overview metrics (revenue, total bookings, room counts)
- `POST /api/admin/hotels` — Create a new hotel
- `PUT /api/admin/hotels/:id` — Update hotel details
- `DELETE /api/admin/hotels/:id` — Delete hotel
- `POST /api/admin/rooms` — Add room to an existing hotel
- `GET /api/admin/reservations` — View all system bookings
- `PATCH /api/admin/reservations/:id/status` — Update booking status (`CONFIRMED`, `COMPLETED`, `CANCELLED`)

---

## 📂 Project Directory Structure

```
├── .github/                    # Dependabot configuration, CodeQL & SECURITY.md
│   ├── dependabot.yml          # Automated weekly vulnerability dependencies scanner
│   └── SECURITY.md             # Responsible disclosure & private vulnerability policy
│
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── public/                 # Static assets, robots.txt, sitemap.xml, site.webmanifest
│   │   └── assets/             # Brand icons & 1200x630 Open Graph banner (55.4 KB with safe-zone)
│   ├── src/
│   │   ├── components/         # Navbar, AuthModal, BookingModal, ReviewModal, InvoiceModal
│   │   ├── context/            # AuthContext (state, JWT tokens, auto-sync)
│   │   ├── pages/              # HomePage, HotelDetailPage, MyBookingsPage, AdminDashboardPage
│   │   ├── App.jsx             # Routes & layout
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind directives & styles
│   ├── index.html              # HTML shell with full SEO & Open Graph meta tags
│   ├── tailwind.config.js      # Tailwind configuration
│   └── vite.config.js          # Vite config & API proxy
│
├── server/                     # Backend API (Node.js 24 + Express + Firebase Cloud Functions)
│   ├── src/
│   │   ├── middleware/         # JWT auth, requireAdmin & rateLimiter (express-rate-limit)
│   │   ├── routes/             # Auth, Hotels, Rooms, Reservations, Admin, Reviews, Coupons
│   │   ├── firestore.js        # Google Cloud Firestore SDK initialization
│   │   ├── seed-firestore.js   # Cloud Firestore seeder (places, hotels, rooms, users)
│   │   ├── db.js               # Native SQLite database setup (offline fallback)
│   │   ├── seed.js             # SQLite seeder
│   │   └── server.js           # Express app, CORS whitelist & Cloud Function v2 export
│   └── package.json
│
├── scripts/                    # Automation utilities
│   └── generate_hotelier_assets.py # Pixel-perfect OG banner and icon generator
│
├── CONTRIBUTING.md             # Contribution guidelines, development workflow & coding standards
├── LICENSE.md                  # Proprietary software license (UNLICENSED / All Rights Reserved)
├── firebase.json               # Firebase Hosting (HSTS, CSP, Permissions-Policy) & Cloud Functions
├── firestore.rules             # Production security rules for Cloud Firestore
├── legacy_swing/               # Original 2018 Java Swing Text Dumps & JAR Archive
│   ├── login.txt
│   ├── register.txt
│   ├── home j frame.txt
│   ├── detail j frame.txt
│   ├── all books.txt
│   ├── admin.txt
│   └── mysql-connector-java-5.1.47-bin.jar
│
└── package.json                # Root orchestration & scripts (concurrently)
```
