# Hotelier Staycation — Release Notes v4.1.0

**Release Tag:** `v4.1.0`  
**Release Title:** `Hotelier v4.1.0`  
**Release Date:** November 2, 2026  
**Live Application:** [https://hotelierstays.web.app](https://hotelierstays.web.app)

---

## 🌟 Overview of Tier 1: Guest Experience & Smart Discovery

Hotelier `v4.1.0` introduces **Tier 1: Guest Experience & Smart Discovery**, delivering high-impact visual features, intelligent travel discovery, interactive stay comparison, and global multi-currency localization.

---

### 1. ⚖️ Side-by-Side Hotel Comparison Drawer
- **Multi-Property Comparison Matrix:** Compare up to 3 hotels side by side across pricing, star ratings, guest review scores, verified amenity checklists, and instant reservation links.
- **Global Floating Dock:** Unobtrusive floating bottom bar displaying selected hotel thumbnails, active rates in the selected currency, and one-click access to the comparison matrix.
- **Full-Screen Modal Matrix:** Clear visual checklist of key property amenities (Free High-Speed Wi-Fi, Infinity Pool, Ayurvedic Spa, Breakfast Buffet, EV Charging, Pet Friendly, Scenic Views, Valet Parking) with indicators for supported features.
- **Ubiquitous Comparison Controls:** Quick "Compare" toggle available across the Home listings grid, split-screen interactive map list, hotel detail header, and saved wishlist.

---

### 2. 📅 Interactive Room Availability Calendar Heatmap
- **Visual Availability Heatmap:** Embedded 30-to-60-day interactive calendar on `HotelDetailPage.jsx` displaying live room pricing per night.
- **Demand & Surge Indicators:** Real-time visual indicators for standard available rates, weekend surges (+18% high-demand surge pricing on Fridays & Saturdays), and fast-selling dates.
- **2-Click Date Selection:** Effortlessly pick check-in and check-out dates with interactive range hovering and instant synchronization with the available rooms inventory.
- **Quick Preset Shortcuts:** Instant 1-click reservation presets including *This Weekend*, *Next Weekend*, *3-Day Getaway*, and *7-Day Staycation*.

---

### 3. ✨ AI Concierge & Smart Trip Planner Widget ("Aria")
- **Floating AI Assistant:** Accessible from anywhere on the platform via a floating bottom-right launcher button with animated sparkles.
- **Conversational Concierge Experience:** Tailored recommendations matching guest preferences, destinations, budgets, and travel themes.
- **Interactive Prompt Chips:** Quick one-tap queries for:
  - 🌿 *Romantic Stays in Munnar*
  - 🏖️ *Beachfront Kovalam with Infinity Pool*
  - 🛶 *Backwater Ayurvedic Retreat in Alleppey*
  - 💰 *Budget Stays Under ₹4,000*
  - 🗺️ *Curated 3-Day Kerala Travel Itinerary*
- **Rich Hotel Recommendation Cards:** Direct embeds within the conversational flow featuring property photos, location, ratings, converted tariffs, and direct booking links.

---

### 4. 🌐 Multi-Currency & Regional Localization Switcher
- **Global Currency Selector:** Seamless dropdown in `Navbar.jsx` with real-time conversion across 5 major currencies:
  - 🇮🇳 **INR (₹)** — Indian Rupee
  - 🇺🇸 **USD ($)** — US Dollar
  - 🇪🇺 **EUR (€)** — Euro
  - 🇬🇧 **GBP (£)** — British Pound
  - 🇦🇪 **AED (AED)** — UAE Dirham
- **Platform-Wide Integration:** Tariffs, taxes, promo discounts, checkout totals, printed PDF tax vouchers, and administrative revenue charts automatically adapt to the user's active currency.
- **Local Preference Persistence:** Automatically remembers currency preferences across sessions via `localStorage`.

---

## 🛠️ Verification & Quality Assurance
- **Unit & Integration Tests:** 30 Vitest backend tests passing (reservation overlaps, Zod schema validation, security headers, rate limiting).
- **Production Client Build:** Fully optimized Vite production bundle with tree-shaken chunks for Leaflet, TanStack Query, and Recharts.
- **Hosting Deployment:** Deployed to Firebase Hosting at `https://hotelierstays.web.app`.
