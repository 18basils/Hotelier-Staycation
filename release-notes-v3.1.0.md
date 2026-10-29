# 🏨 Hotelier v3.1.0 — Core Hospitality & Modern Booking Suite

Phase 1 of the Hotelier modernization roadmap is here! **Version 3.1.0** introduces essential high-impact hospitality features that transform Hotelier from a basic reservation portal into an enterprise-grade booking platform.

---

### 🌐 Live Deployment
- **Live Platform:** [https://hotelierstays.web.app](https://hotelierstays.web.app)
- **Live API Endpoint:** [https://hotelierstays.web.app/api/health](https://hotelierstays.web.app/api/health)
- **Repository:** [https://github.com/18basils/Hotelier-Staycation](https://github.com/18basils/Hotelier-Staycation)

---

### 🚀 Highlights of v3.1.0

#### 1. ⭐ Verified Guest Reviews & Ratings System
- **Fraud Prevention:** Only users with confirmed or completed stays can submit reviews.
- **Dynamic Star Scoring:** Replaces static integers with real-time aggregated averages (e.g., 4.9 ★) and star distribution breakdowns (5★ down to 1★).
- **Interactive Review Submission:** In-page review dialog with dynamic eligibility verification (`GET /api/reviews/check-eligible/:hotelId`).
- **Verified Stay Badges:** Reviews proudly display verified credentials and stay dates.

#### 2. 🏷️ Dynamic Pricing, Taxes & Promo Codes
- **Line-by-Line Price Breakdown:**
  - Base room fare based on night calculation.
  - Hospitality GST (12%) calculated dynamically.
  - Standard convenience & service fee (₹199).
- **Interactive Coupon Engine:**
  - Active coupons: `WELCOME20` (20% off up to ₹2,000), `MONSOON15` (15% off), `FLAT500` (₹500 off), `STAYCATION10` (10% off).
  - 1-click quick apply pills with instant discount recalculation.

#### 3. 💳 Payment Gateway Integration (Test Mode)
- **Multi-Rail Checkout:** Interactive payment options for **UPI (Google Pay / PhonePe / Paytm)**, **Credit / Debit Cards**, and **Net Banking**.
- **Transaction Processing:** Simulates real-time bank capture, records unique Transaction IDs (`PAY-RZP-XXXXX`), and marks booking status as `PAID`.
- **Automated Refund Handling:** Cancelling a reservation immediately initiates a refund state (`REFUNDED`).

#### 4. 📄 Downloadable PDF Invoices & Check-In Vouchers
- **Print-Ready Guest Voucher:** In "My Bookings", guests can click **"Download Invoice (PDF)"** to open a beautifully formatted tax invoice.
- **Reception Check-In QR Code:** Embedded dynamic QR code encodes booking references and guest names for fast physical check-in at the hotel front desk.
- **Complete Itemization:** Contains GST registration details, itemized room charges, taxes, discounts, and payment confirmation stamps.

#### 5. 🏊 Structured Amenities & Price Range Filtering
- **Multi-Select Amenity Pills:** Filter stays by Free Wi-Fi, Swimming Pool, Ayurvedic Spa, Complimentary Breakfast, EV Charging, Pet Friendly, Scenic Views, and Valet Parking.
- **Interactive Budget Slider:** Range filter from ₹1,500 to ₹15,000+/night.
- **Property Amenities Grid:** Hotel detail pages showcase dedicated amenity cards with descriptions and icons.

#### 6. 🛡️ Enterprise Web Security & Threat Defense
- **Multi-Tier Rate Limiting (`express-rate-limit`):** Prevents credential-stuffing attacks on `/api/auth` (25 req/15 min), sensitive action abuse on reservations/reviews (60 req/15 min), and public API flooding (300 req/15 min).
- **Explicit CORS Whitelist:** Replaced permissive configurations with strict origin validation for `hotelierstays.web.app`, `firebaseapp.com`, and localhost.
- **GitHub CodeQL SAST:** Configured automated weekly static application security scans with zero open vulnerabilities.
- **Redesigned WhatsApp & Telegram Open Graph Banner:** Upgraded to high-contrast TrueType typography ($55.4\text{ KB}$) with a central $630\times 630$ px safe zone preventing blurry or cropped link previews on mobile chat platforms.
- **Official Contribution Guidelines:** Added [`CONTRIBUTING.md`](CONTRIBUTING.md) detailing architecture, setup, and conventional commit standards.

---

### 📦 Verification & Quality
- Rebuilt with Vite 6 & React 18 production bundle.
- Deployed live to Firebase Hosting CDN and Cloud Functions v2.
- Verified live at [hotelierstays.web.app](https://hotelierstays.web.app).
