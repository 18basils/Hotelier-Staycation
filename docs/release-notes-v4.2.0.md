# Hotelier Staycation — Release Notes v4.2.0

**Release Tag:** `v4.2.0`  
**Release Title:** `Hotelier v4.2.0`  
**Release Date:** November 2, 2026  
**Live Application:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🛎️ Overview of Tier 2: Booking Lifecycle & Hospitality Operations

Hotelier `v4.2.0` introduces **Tier 2: Booking Lifecycle & Hospitality Operations**, unlocking post-booking flexibility for guests, curated hospitality upgrades at checkout, cloud-synchronized wishlists across devices, and a full guest profile with loyalty tier recognition.

---

### 1. 🔁 Booking Modification & Date Rescheduling Flow
- **Self-Service Date Rescheduling:** Confirmed guests can reschedule upcoming stays directly from `MyBookingsPage.jsx` via a dedicated modal.
- **Double-Booking Prevention Engine:** Backend `PATCH /api/reservations/:id/reschedule` endpoint performs atomic conflict verification against existing confirmed bookings for that room, automatically excluding the user's current reservation from self-collision.
- **Dynamic Tariff Recalculation:** Accurately recalculates total stay amounts based on the new duration, applying the room's nightly rate.
- **Contact & Special Request Modification:** Guests can update their contact phone number and add or modify special stay requests via `PATCH /api/reservations/:id/modify`.

---

### 2. 🍽️ Add-On Experiences & Meal Plan Upgrades at Checkout
- **Integrated Meal Plan Selection:** Step 1 of `BookingModal.jsx` provides one-click upgrades:
  - 🛏️ *Room Only* (Included in base rate)
  - 🍳 *Royal Breakfast Buffet* (+₹750 / guest / night)
  - 🍲 *Half Board: Breakfast + Dinner* (+₹1,600 / guest / night)
  - 🥂 *All-Inclusive Luxury Dining* (+₹2,900 / guest / night)
- **Curated Hospitality Experiences:** Guests can attach bespoke activities to their stay:
  - 🌿 *Ayurvedic Rejuvenation Massage (60 min)* (₹2,499)
  - 🚗 *Chauffeured Airport Transfer* (₹1,800)
  - 🕯️ *Beachfront Candlelight Dinner for 2* (₹3,500)
  - ⏰ *Guaranteed Late Check-Out until 4 PM* (₹999)
- **Live Currency Conversion:** Add-ons and meal plans dynamically adapt to the active regional currency selected via `CurrencyContext`.
- **Itemized Tax Invoices & Vouchers:** Meal plans and experiences are stored in the reservation document, rendered on booking cards, and itemized in printable PDF tax invoices.

---

### 3. ☁️ Cloud-Synced Wishlist for Logged-In Users
- **Multi-Device Synchronization:** Created backend routes at `server/src/routes/wishlist.js` (`GET /`, `POST /:hotelId`, `DELETE /:hotelId`, `POST /sync`).
- **Seamless Transition from Anonymous Browsing:** `WishlistContext.jsx` automatically synchronizes offline local bookmarks to the user's Firestore account upon login.
- **Offline Fallback Resilience:** Maintains instant local responsiveness via `localStorage` when guests browse without logging in.
- **Cloud Status Badge:** `WishlistPage.jsx` displays a real-time "Cloud Synced" indicator confirming safe storage across devices.

---

### 4. 👑 Guest Profile & Loyalty Tier Portal (`/profile`)
- **Loyalty Rewards Engine:** Created `GuestProfilePage.jsx` and `GET /api/auth/loyalty` calculating lifetime completed stays, total nights, and rewards points (10 points per ₹100 spent).
- **Dynamic Loyalty Tiers:**
  - 🥈 **Silver Member** (0–2 stays): Complimentary welcome drink, standard checkout.
  - 🥇 **Gold Elite** (3–7 stays): 10% dining discount, priority room upgrade, 12 PM early check-in.
  - 💎 **Platinum Ambassador** (8+ stays): 20% dining discount, complimentary airport transfer, guaranteed 4 PM late check-out.
- **Tier Progress & Milestones:** Visual progress indicator showing nights or spend needed to reach the next elite status tier.
- **Profile Customization:** Interactive modal to update personal details, emergency phone number, and stay preferences (`PATCH /api/auth/profile`).
- **Navbar Integration:** Added direct profile navigation with a royal crown icon and real-time tier indicator in `Navbar.jsx`.

---

### 5. 🧪 Automated Test Suite Expansion
- **40 Automated Vitest Tests:**
  - `overlap.test.js` (11 tests): Interval overlap logic, double-booking prevention, boundary conditions, and reschedule conflict resolution.
  - `security.test.js` (7 tests): Helmet security headers, cookie parsing, JWT verification, and production environment guards.
  - `validation.test.js` (22 tests): Zod schema constraints for authentication, bookings, reschedules, profile edits, and hospitality add-ons.

---

## 🚀 Deployment & Live Verification

- **Production URL:** [https://hotelierstays.web.app](https://hotelierstays.web.app)
- **Build Status:** Vite v6.4.5 production build completed cleanly with vendor code splitting.
- **Testing:** 100% pass rate across all unit and integration test suites (`npm test`).
