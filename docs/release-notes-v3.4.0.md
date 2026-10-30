# Hotelier Staycation — Release Notes v3.4.0

**Release Date:** October 30, 2026  
**Platform Version:** `v3.4.0`  
**Live Application:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🚀 Overview of Phase 4: Technical, Security & Architectural Upgrades

Version `v3.4.0` introduces enterprise-grade security hardening, full schema validation with Zod, high-performance data caching with TanStack Query v5, and an automated integration test suite with Vitest.

---

### 1. 🛡️ Security Hardening & Authentication Architecture
- **Helmet HTTP Security Headers:** Integrated `helmet` in `server.js` to enforce strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, DNS prefetch controls, referrer policies).
- **HttpOnly Secure Cookie Authentication:**
  - Upgraded authentication from purely `localStorage` to **HttpOnly Secure Cookies** with `SameSite=lax/none` and `Path=/`.
  - Added access token rotation with short-lived 15-minute access tokens and 7-day refresh tokens.
  - New endpoints:
    - `POST /api/auth/refresh`: Silently refreshes expired access tokens.
    - `POST /api/auth/logout`: Clears both access and refresh cookies safely.
  - Backwards-compatible dual-mode authentication: The backend verifies tokens from either `req.cookies.hotelier_access_token` or `Authorization: Bearer <token>`.
- **Production Secret Enforcement:** The server now strictly requires `JWT_SECRET` in production environments, throwing a fatal startup error if the environment variable is absent.
- **Rate Limiting:** Protects `/api/auth/login` and `/api/auth/register` against brute-force attacks via `express-rate-limit`.

---

### 2. 📋 Input Validation & Schema Enforcement (Zod)
- **Backend Schema Enforcement (`server/src/schemas/index.js` & `validator.js`):**
  - `registerSchema`: Validates username formatting (alphanumeric + underscore, 3-30 chars), password length, and email format.
  - `loginSchema`: Validates presence of credentials.
  - `reservationSchema`: Enforces date constraints ($checkIn < checkOut$), phone number regex, and field length caps.
  - `reviewSchema`: Restricts ratings to 1–5 stars and enforces comment length.
  - `couponApplySchema`: Sanitizes and transforms coupon codes to uppercase, validating positive booking amounts.
  - `hotelSchema` & `roomSchema`: Strict geographic boundaries (latitude $-90$ to $90$, longitude $-180$ to $180$), star rating bounds, and price validation.
- **Client-Side Validation (`client/src/schemas/`):**
  - Pre-validates user registration and login directly in `AuthModal.jsx`.
  - Enforces date ranges, phone numbers, and guest credentials in `BookingModal.jsx` before initiating checkout.

---

### 3. ⚡ Data Fetching & Caching Layer (TanStack Query v5)
- **Automatic Caching & Synchronization (`client/src/hooks/useHotelQueries.js`):**
  - Integrated `@tanstack/react-query` v5 with centralized `QueryClient`.
  - Replaced manual `useEffect` + `fetch` waterfalls across `HomePage.jsx`, `HotelDetailPage.jsx`, `MyBookingsPage.jsx`, and `AdminDashboardPage.jsx`.
  - Instant cache rendering on back/forward navigation with zero layout flicker.
  - Automated cache invalidation on mutations (booking creations, cancellations, reviews, hotel and room inventory changes).

---

### 4. 🧪 Automated Testing Suite (Vitest)
- Added comprehensive integration test suite in `server/test/` with **30 passing tests**:
  - `overlap.test.js`: Validates all double-booking conflict scenarios (exact match, partial start/end overlaps, enclosing ranges, same-day checkout/checkin transitions, cancelled reservation rebooking).
  - `validation.test.js`: Validates Zod schema boundaries and error messaging.
  - `security.test.js`: Validates JWT token generation, expiration math, cookie flags, and dual-mode authentication middleware.
- Added root `npm test` script.
