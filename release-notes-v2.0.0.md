# 🏨 Hotelier v2.0.0 — Modern Full-Stack Web Platform & Cloud Firestore

We are excited to announce the release of **Hotelier v2.0.0**! This milestone represents a complete ground-up modernization of the original 2018 Java Swing desktop project into a production-grade, full-stack serverless web application deployed on **Google Firebase** and backed by **Google Cloud Firestore**.

---

### 🌐 Live Deployment
- **Live Website:** [https://hotelierstays.web.app](https://hotelierstays.web.app)
- **Live API Endpoint:** [https://hotelierstays.web.app/api/health](https://hotelierstays.web.app/api/health)
- **Google Cloud Region:** `asia-south1` (Mumbai)
- **Database Engine:** Google Cloud Firestore (Native Mode)

---

### 🚀 What's New in v2.0.0

#### 1. Modern Architecture & Cloud Stack
- **Frontend:** Rebuilt with **React 18**, **Vite**, and **Tailwind CSS**, delivering ultra-fast hot reloading, responsive mobile-first layouts, and accessible Lucide icons.
- **Backend API:** Modular **Node.js 24 + Express** REST API deployed as **Firebase Cloud Functions (2nd Gen)** in `asia-south1`.
- **Database Layer:** Migrated from legacy MySQL/JDBC to **Google Cloud Firestore**, providing serverless auto-scaling, high availability, and zero database server management.
- **Offline / Local Fallback:** Integrated native zero-config **SQLite** (`node:sqlite`) for local development without cloud dependencies.

#### 2. Authentication & Role-Based Access Control (RBAC)
- **Stateless JWT Sessions:** Secure 7-day JSON Web Tokens replace legacy database state mutations.
- **BCrypt Password Hashing:** Salted hashes ensure user and administrator credentials are never stored in plaintext.
- **Two User Roles:**
  - **Customer (`USER`):** Browse properties, filter rooms, calculate nights, and manage personal reservations.
  - **Administrator (`ADMIN`):** Manage hotel inventory, room categories, pricing, and system-wide reservations.
- **Real-Time Profile Synchronization:** Auto-syncs profile changes between Firestore and client local storage.

#### 3. Smart Property Discovery & Live Booking Flow
- **Destination Filtering:** Filter by premier Kerala getaways (Kochi, Munnar, Wayanad, Kovalam) with real-time property counts.
- **Keyword & Rating Search:** Instant multi-parameter filtering across hotel names, cities, and star ratings (3★ to 5★).
- **Date Availability & Interval Validation:** Real-time check-in and check-out picker with nights counter.
- **Double-Booking Prevention:** Backend date-overlap algorithms ensure atomic reservations and eliminate race conditions.
- **Room Specifications:** Filter by Air Conditioning (AC / Non-AC) and Bed Capacity (Single, Double, Family).

#### 4. Customer Portal ("My Bookings")
- Comprehensive booking history with generated booking reference vouchers (`BK-XXXXX`).
- Reservation status tracking (`CONFIRMED`, `COMPLETED`, `CANCELLED`).
- Instant 1-click booking cancellation with modal verification.

#### 5. Administrator Control Center
- High-level business KPI dashboard: Total Revenue, Active Bookings, Total Hotels, and Total Rooms.
- Hotel management with dynamic photo URLs, star ratings, and contact info.
- Room inventory creator (replaces the missing 2018 `admin2.java` functionality).
- Global reservation management with status updates.

#### 6. Enterprise Web Security & Bot Defense Suite
- **A+ HTTP Security Headers:** Deployed via Firebase Hosting CDN:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - Strict **Content Security Policy (CSP)** tailored for Google Fonts and Unsplash imagery
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`
  - Server software fingerprinting eliminated (`X-Powered-By` disabled)
- **Universal Bot Defense (`robots.txt`):**
  - Allows verified search engines (`Googlebot`, `Bingbot`, `Applebot`, `DuckDuckBot`).
  - Allows social preview unfurlers (`WhatsApp`, `Twitterbot`, `Facebook`, `Slack`, `Telegram`, `LinkedIn`, `Discord`).
  - Blocks automated scrapers, AI dataset harvesters (`GPTBot`, `CCBot`, `Bytespider`), and vulnerability scanners.
- **WhatsApp-Optimized Open Graph Card:**
  - 1200 x 630 px social share banner (`og:image`) compressed to **23.8 KB** (comfortably under WhatsApp's 300 KB auto-unfurl limit).
- **PWA & Mobile Manifest:** Complete `site.webmanifest` and brand touch icons for home screen installability.

#### 7. Legacy Archive Preservation
- All historical 2018 college project files, Swing GUI text exports, and the original `mysql-connector-java-5.1.47-bin.jar` are carefully preserved in the [`legacy_swing/`](./legacy_swing) directory for archival and evolutionary comparison.

---

### 📦 Verification & Integrity
- All dependencies verified and up to date.
- Cloud Firestore rules deployed in production mode.
- Working tree clean and synchronized with `origin/master`.
