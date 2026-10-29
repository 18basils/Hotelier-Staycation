# Release Notes — Hotelier v3.3.0

**Release Tag:** `v3.3.0`  
**Milestone:** Phase 3 — Admin Portal Upgrades  
**Release Date:** October 2026  
**Live Site:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🌟 Overview

Hotelier v3.3.0 completes **Phase 3: Admin Portal Upgrades**, equipping administrators with enterprise-grade business intelligence, interactive visual charts, comprehensive hotel & room lifecycle management, a dedicated rooms inventory and maintenance manager, and seamless drag-and-drop media uploads.

---

## 🚀 Key Upgrades & Features

### 1. 📊 Visual Analytics & Interactive Charts (`recharts`)
- **Monthly Revenue Trajectory Area Chart**:
  - Visualizes past 6-month gross reservation revenues (in ₹ INR) and customer booking counts.
  - Interactive custom dark-themed financial tooltips and smooth gradient fills.
- **Demand by Destination Bar Chart**:
  - Compares room reservation volumes and demand density across vacation hubs (Munnar, Wayanad, Kochi, Kovalam).
- **Reservation Fulfillment Donut Chart**:
  - Real-time visualization of confirmed, completed, and cancelled reservations.
- **Top-Performing Properties Leaderboard**:
  - Ranked cards showing highest grossing hotels, total stays hosted, and guest review star scores.

---

### 2. ✏️ Property Edit & Full Metadata UI
- **Full Hotel Editing**:
  - Wired up `PUT /api/admin/hotels/:id` to an intuitive "Edit Hotel" modal.
  - Pre-fills all existing hotel data (name, address, star rating, contact phone, description, photo URL, GPS coordinates, featured status, min price).
  - Synchronizes destination names and states automatically upon changing regions.

---

### 3. 🛏️ Dedicated Rooms Inventory & Maintenance Manager
- **Centralized Inventory Tab**:
  - View all rooms across all properties in a single consolidated dashboard.
  - Fast filter dropdown by hotel and live instant search by room number or category.
- **Maintenance Mode Toggle**:
  - Instant toggle button switching room availability between **Available for Booking** (green) and **Under Maintenance / Out of Order** (amber wrench badge).
  - Automatically prevents guest bookings when a room is in maintenance mode.
- **Tariff & Category Updates**:
  - Edit room pricing per night and reassign room categories seamlessly via modal dialogs.
- **Room Deletion**:
  - Remove obsolete or retired room units with safety confirmation prompts.

---

### 4. 🗺️ Destinations & Room Categories Manager
- **Destinations Manager**:
  - Add new travel destinations (`POST /api/admin/places`) with custom photos and regional descriptions.
  - Remove destinations with automatic slug generation.
- **Room Categories Manager**:
  - Add and delete room categories (`POST /api/admin/categories`), configuring bed capacity, AC climate (AC vs Non-AC), and maximum guest limits.

---

### 5. 📤 Direct Drag-and-Drop Image File Uploads (`multer`)
- **Drag-and-Drop Zone**:
  - Built `ImageDropzone.jsx` supporting direct file dragging or file browser selection (PNG, JPG, WebP, GIF up to 5 MB).
- **Server-Side Multer Pipeline**:
  - Added `POST /api/admin/upload` with memory storage and automatic conversion to Base64 data URIs.
  - Guarantees zero-dependency cross-environment portability (works locally, in serverless Cloud Functions, and on Firebase Hosting).
- **Dual Mode**:
  - Admins can freely toggle between drag-and-drop file upload and external URL entry at any time.

---

## 🔒 Verification & Security
- **Production Client Build**: Built in Vite v6.4.5 with 0 errors.
- **Server Code Syntax**: Verified with Node.js `--check` with 0 warnings.
- **Live Deployment**: Deployed live to Firebase Hosting at `https://hotelierstays.web.app`.
- **Security Scans**: 0 CodeQL alerts, GitHub Push Protection active.
