# Contributing to Hotelier Staycation

First off, thank you for taking the time to contribute! 🎉

Hotelier Staycation is a modern, full-stack serverless hotel management and reservation web platform built with **React 18**, **Vite**, **Tailwind CSS**, **Node.js 24**, and **Google Cloud Firestore**, hosted on **Firebase**.

Whether you are fixing a bug, adding new hospitality features, enhancing UI/UX accessibility, or improving documentation, we welcome your contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Code Contributions](#code-contributions)
- [Local Development Setup](#local-development-setup)
- [Project Architecture & Structure](#project-architecture--structure)
- [Coding Guidelines & Standards](#coding-guidelines--standards)
- [Security & Quality Standards](#security--quality-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [License Notice](#license-notice)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please be respectful, constructive, and collaborative in all discussions, issues, and pull requests.

---

## How Can I Contribute?

### Reporting Bugs
If you encounter a bug or unexpected behavior:
1. Search the [existing issues](https://github.com/18basils/Hotelier-Staycation/issues) to verify it hasn't already been reported.
2. Open a new issue with a clear title and descriptive body.
3. Include:
   - Steps to reproduce the problem.
   - Expected vs actual behavior.
   - Browser name, version, and operating system.
   - Screenshots or console log snippets if applicable.

> [!CAUTION]
> **Security Vulnerabilities:** If you discover a security issue or credential exposure, **do NOT open a public issue**. Follow the instructions in [`.github/SECURITY.md`](.github/SECURITY.md) to report it via GitHub Private Vulnerability Reporting.

### Suggesting Enhancements
Feature requests are welcomed! When opening a feature request:
- Explain the practical use case in modern hospitality workflows (e.g. guests, hotel staff, managers).
- Describe the proposed interface and backend data model changes.
- Provide mockups, references, or API payload examples where helpful.

### Code Contributions
Unsure where to begin? Look for open issues or consider extending:
- Amenities filtering & search enhancements.
- Verified guest review scoring algorithms.
- Additional payment rail integrations (Stripe / Razorpay webhooks).
- PDF invoice templating and localization.

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher
- **Git**

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Hotelier-Staycation.git
cd Hotelier-Staycation
```

### 2. Install Dependencies
Install dependencies across root, client, and server:
```bash
# Root orchestrator
npm install

# Client dependencies
npm install --prefix client

# Server dependencies
npm install --prefix server
```

### 3. Environment Configuration
Copy the example environment file if present, or configure your local environment variables:
```bash
# Server runs with local SQLite fallback by default if Firestore service account is omitted
STANDALONE=true
PORT=5000
```

### 4. Start Local Development
Start both the React frontend and Node.js backend simultaneously:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(On the first launch, the local SQLite database `hotel_system.db` will automatically initialize and populate with sample Kerala properties, room inventories, and categories).*

---

## Project Architecture & Structure

```
├── client/                     # React 18 + Vite + Tailwind CSS frontend
│   ├── public/                 # Favicons, webmanifest, robots.txt, sitemap.xml
│   │   └── assets/             # Brand logos & Open Graph social banners
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Navbar, Modals, Filters, Reviews)
│   │   ├── context/            # Global state (AuthContext with JWT persistence)
│   │   ├── pages/              # Primary views (Home, HotelDetail, MyBookings, Admin)
│   │   └── services/           # API client methods
│   ├── index.html              # HTML entry with full SEO & Open Graph tags
│   └── vite.config.js          # Vite build config & proxy
│
├── server/                     # Node.js 24 + Express + Firebase Functions v2
│   ├── src/
│   │   ├── middleware/         # Auth (JWT/RBAC) & Rate Limiting (express-rate-limit)
│   │   ├── routes/             # Auth, Hotels, Rooms, Reservations, Admin, Reviews, Coupons
│   │   ├── firestore.js        # Google Cloud Firestore SDK
│   │   ├── seed-firestore.js   # Cloud Firestore seeder
│   │   ├── db.js               # Zero-config SQLite engine (offline local development)
│   │   └── server.js           # Express app & Cloud Functions entrypoint
│   └── package.json
│
├── scripts/                    # Asset generator (Pillow Open Graph banner builder)
├── .github/                    # Dependabot configuration & SECURITY.md policy
└── firebase.json               # Firebase CDN hosting rules, CSP headers & rewrites
```

---

## Coding Guidelines & Standards

1. **Frontend (React & Tailwind)**:
   - Use functional components with React Hooks (`useState`, `useEffect`, `useContext`, `useMemo`).
   - Use **Tailwind CSS** utility classes; avoid inline styles or separate `.css` files unless absolutely necessary.
   - Use icons from `lucide-react` to keep visual styling uniform.
   - Maintain accessibility (a11y): use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<button>`) and provide descriptive `aria-label` attributes on icon-only buttons.

2. **Backend (Node.js & Express)**:
   - Follow standard ES Module syntax (`import` / `export`).
   - Never mutate sensitive global state.
   - Keep route controllers lightweight; validate input parameters early and return clear JSON error messages (`{ error: '...' }`).
   - Guard state-modifying routes with `authenticateToken` and rate limiters (`sensitiveActionLimiter` or `authLimiter`).
   - Use **bcryptjs** for credential hashing and **jsonwebtoken** for session authorization.

---

## Security & Quality Standards

To maintain high security and code quality:

- **Secret Hygiene:** Never commit `.env` files, Google Service Account keys (`*.json`), private keys (`*.pem`, `*.key`), or session secrets. Pre-receive Push Protection is enabled and will reject any commit containing sensitive credentials.
- **Static Application Security Testing (CodeQL):** All pull requests are analyzed by GitHub CodeQL. Ensure your code introduces no injection flaws, missing rate limits, or permissive CORS configurations.
- **Rate Limiting:** Any new route that handles authentication, authorization, or database writes must be protected by an appropriate rate limiter from [`server/src/middleware/rateLimiter.js`](server/src/middleware/rateLimiter.js).
- **CORS Policy:** Allowed origins are restricted in [`server/src/server.js`](server/src/server.js). Do not set wildcard origins (`*` or `true`).

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

### Common Types:
- `feat`: A new user-facing feature (e.g. `feat(reviews): add star rating distribution chart`)
- `fix`: A bug fix (e.g. `fix(booking): prevent checkout when end date precedes start date`)
- `docs`: Documentation updates (e.g. `docs(readme): document new review API endpoints`)
- `style`: Code formatting, whitespace, or visual styling with no functional changes
- `refactor`: Code restructuring without modifying behavior
- `test`: Adding or updating test cases
- `chore`: Build scripts, dependencies, or repository configurations

---

## Submitting a Pull Request

1. Create a descriptive feature branch from `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and test them locally:
   - Verify frontend functionality in browser across mobile and desktop widths.
   - Test backend API endpoints via curl or Postman.
3. Commit with a meaningful conventional commit message:
   ```bash
   git commit -m "feat(amenities): add outdoor swimming pool and spa filters"
   ```
4. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
5. Navigate to [18basils/Hotelier-Staycation](https://github.com/18basils/Hotelier-Staycation) and click **"Compare & pull request"**.
6. Provide a clear description of your changes, linked issues, and testing steps.
7. A maintainer will review your pull request, verify CodeQL checks, and provide constructive feedback!

---

## License Notice

By contributing to this repository, you acknowledge that your contributions are licensed under the repository's [**Proprietary License**](LICENSE.md) (`UNLICENSED`, All Rights Reserved by Basil Shaji) for educational, evaluation, and non-commercial portfolio inspection purposes.
