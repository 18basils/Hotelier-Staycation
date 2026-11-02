# Hotelier Staycation — Release Notes v4.3.0

**Release Tag:** `v4.3.0`  
**Release Title:** `Hotelier v4.3.0`  
**Release Date:** November 2, 2026  
**Live Application:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🚀 Overview of Tier 3: Admin Operations & DevOps Automation

Hotelier `v4.3.0` introduces **Tier 3: Admin Operations & DevOps Automation**, equipping administrators with robust financial CSV reporting and promo code management, while establishing end-to-end continuous integration with Playwright browser tests and GitHub Actions.

---

### 1. 📈 Financial CSV / Excel Report Export
- **RFC 4180 Compliant Ledger Export:** Added backend endpoint `GET /api/admin/reports/financial/export` with UTF-8 BOM (`\uFEFF`) ensuring out-of-the-box formatting when opened in Microsoft Excel.
- **23 Comprehensive Accounting Columns:**
  - `Reservation ID`, `Booking Date`, `Guest Name`, `Guest Contact`
  - `Hotel Name`, `Destination`, `Room Number`, `Room Category`
  - `Check-In Date`, `Check-Out Date`, `Nights`
  - `Base Room Tariff (INR)`, `Meal Plan`, `Meal Plan Cost (INR)`
  - `Add-On Experiences`, `Add-Ons Total (INR)`
  - `Applied Coupon`, `Discount (INR)`
  - `GST / Taxes 18% (INR)`, `Grand Total (INR)`
  - `Booking Status`, `Payment Method`, `Special Requests`
- **Dynamic Filter Controls:** Interactive Export Modal in `AdminDashboardPage.jsx` allows filtering exports by date range, specific property, and booking status (`CONFIRMED`, `COMPLETED`, `CANCELLED`), along with a 1-click "Quick Export View" for currently active searches.

---

### 2. 🏷️ Promo Code & Campaign Manager
- **Complete Administrative CRUD:** Added admin routes in `server/src/routes/admin.js`:
  - `GET /api/admin/coupons` — Lists all campaign promo codes, discount values, minimum booking thresholds, and active statuses.
  - `POST /api/admin/coupons` — Creates new promo codes with strict Zod validation (`couponCreateSchema`).
  - `PATCH /api/admin/coupons/:id/toggle` — Instantly activates or deactivates codes.
  - `DELETE /api/admin/coupons/:id` — Permanently removes codes.
- **Dedicated Dashboard Tab:** New "Promo Codes" Tab 5 in `AdminDashboardPage.jsx` featuring:
  - Promotional discount cards with percentage and flat rate badges.
  - 1-click clipboard copy button.
  - Status toggle switch (Active vs Disabled vs Expired).
  - Modal with intelligent Random Code Generator (`Sparkles`) and configurable discount limits.

---

### 3. 🤖 DevOps Automation: GitHub Actions CI/CD Pipeline
- **Continuous Integration Workflow (`.github/workflows/ci.yml`):**
  - Triggers automatically on all code pushes and pull requests to `master`.
  - Multi-stage pipeline:
    1. Dependency setup and cache configuration (`node-version: 22`).
    2. Vitest backend unit, security, and schema constraint tests (`npm test`).
    3. Production client asset compilation (`npm run build`).
    4. Playwright headless browser setup and execution (`npm run test:e2e`).
    5. Artifact archiving for Playwright test reports.

---

### 4. 🎭 Playwright E2E Browser Smoke Tests
- **Automated Browser Test Suite (`e2e/smoke.spec.js`):**
  - `1. Guest Homepage Smoke Test` — Validates navigation, branding, hero search, and hotel card rendering.
  - `2. Multi-Currency Switcher` — Verifies live tariff recalculation across regional currencies (INR, USD, EUR, GBP, AED).
  - `3. AI Concierge ("Aria")` — Validates floating assistant launcher, prompt chip delivery, and conversational response rendering.
  - `4. Side-by-Side Comparison Drawer` — Tests property comparison tray addition and live dock counter.
  - `5. Auth Modal` — Verifies login dialog rendering and client-side Zod validation feedback.

---

### 5. 🧪 44 Vitest Unit & Integration Tests
- 100% pass rate across backend validation, double-booking prevention, reschedule conflict resolution, security headers, cookie authentication, and coupon schema enforcement.
