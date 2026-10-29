# Release Notes — Hotelier v3.2.0

**Release Tag:** `v3.2.0`  
**Milestone:** Phase 2 — Modern Website & UX Enhancements  
**Release Date:** October 2026  
**Live Site:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🌟 Overview

Hotelier v3.2.0 delivers the complete **Phase 2: Modern Website & UX Enhancements**, upgrading the guest discovery journey into an intuitive, visually rich, and responsive experience on par with premier hospitality platforms (e.g. Airbnb, Booking.com).

---

## 🚀 Key Upgrades & Features

### 1. 🗺️ Interactive Map View (Leaflet / OpenStreetMap)
- **Split-Screen Map Explorer on Home Page**:
  - Users can toggle between **Grid View** and a modern **Split-Screen Map View**.
  - Custom HTML interactive price pins display nightly rates (`₹2,750`, `₹4,500`) directly on the map.
  - Hovering and clicking pins highlights the matching property card and opens interactive popup summaries with thumbnail previews and direct booking links.
- **Embedded Location Map on Hotel Detail Page**:
  - Each hotel detail page features an embedded Leaflet map showing the exact GPS coordinates.
  - Includes a quick **"Get Directions"** link opening Google Maps route navigation.
- **Data Layer & CSP Compliance**:
  - Latitude and longitude attributes added to SQLite (`db.js`) and Google Cloud Firestore.
  - Content Security Policy updated in `firebase.json` to allow OpenStreetMap tile delivery (`https://*.tile.openstreetmap.org`).

---

### 2. 🖼️ Multi-Image Photo Galleries & Fullscreen Lightbox
- **Bento-Grid Hero Gallery**:
  - Replaced the single static image view with an asymmetric 5-image bento-grid layout displaying the property, suites, views, and facilities.
  - Includes a floating **"Show all X photos"** trigger button.
- **Fullscreen Image Lightbox Carousel**:
  - Built-in modal lightbox with smooth slide transitions.
  - Photo counter (e.g. `2 / 5`), caption headers, and interactive thumbnail strip.
  - Full keyboard support: `Escape` to close, `ArrowLeft` / `ArrowRight` to cycle through photos.

---

### 3. ❤️ Wishlist & Saved Stays (`/wishlist`)
- **One-Click Heart Icon**:
  - Bookmark favorite properties from hotel listing cards or the hotel details hero header.
  - Instant visual feedback with filled rose-colored heart.
- **Navbar Saved Stays Badge**:
  - Live count indicator badge on the top navigation bar displaying the current count of saved properties.
- **Dedicated Saved Stays Management Page**:
  - Direct access at `/wishlist` to view bookmarked properties, compare prices, remove items, or proceed directly to checkout.
  - Persistent across page refreshes via client-side `localStorage`.

---

### 4. 🔍 Global Search with Date Availability on Home Page
- **Hero Banner Availability Inputs**:
  - Direct Check-in date, Check-out date, and Guest count selectors integrated into the Home Page hero banner.
- **Backend Real-Time Sold-Out Filtering**:
  - `GET /api/hotels` now performs real-time capacity and reservation interval checks against `reservations` and `rooms` to filter out properties without available inventory for the requested duration.
- **Seamless Checkout Forwarding**:
  - Date and guest query parameters (`?checkIn=...&checkOut=...&guests=...`) are preserved and automatically forwarded into the Hotel Detail page and pre-fill the Booking Modal.

---

### 5. 🌓 Dark Mode & Non-Blocking Toast Notifications
- **Complete Dark / Light Theme System**:
  - System-wide Dark Mode support across all pages, modals, tables, and cards.
  - Sun/Moon icon toggle in the Navbar with user preference stored in `localStorage` and synchronized with the root `<html>` element.
- **Non-Blocking Toast Notification Stack (`ToastContext`)**:
  - Replaced native blocking `window.alert()` calls in `AdminDashboardPage.jsx` and `MyBookingsPage.jsx` with animated `toast.success()`, `toast.error()`, `toast.info()`, and `toast.warning()` notifications.
- **Custom Accessible Confirmation Dialogs**:
  - Replaced native `window.confirm()` calls with a responsive, styled modal dialog supporting destructive action warnings and confirmation callbacks.

---

## 🔒 Security & Code Quality
- **GitHub CodeQL SAST**: 0 alerts across JavaScript and security rules.
- **GitHub Push Protection & Secret Scanning**: Fully active and verified.
- **Production Build**: Clean Vite production bundle (`dist/`) generated with zero warnings.
- **Live Deployment**: Deployed and active on Firebase Hosting at `https://hotelierstays.web.app`.
