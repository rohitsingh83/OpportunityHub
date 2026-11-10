# 🎯 OpportunityHub — Internship & Job Listing Portal

A complete, production-grade **full-stack** platform built with **React.js (Vite)**, **Node.js + Express.js (REST API)**, and **MongoDB (via Mongoose)**, styled with an ultra-modern **CabGo Dark Mode Design System**.

Users can **explore, search, filter (by domain, type, location)**, bookmark roles, view comprehensive details with upfront compensation, and **submit applications** with an interactive **confirmation screen**. Administrators can **add, edit, and delete opportunities**, view all candidate applications, screen candidates with a detailed profile modal, export applications to **CSV**, and **dynamically update application review statuses** with instant feedback.

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend** | React 18 (Vite) | React Router v6, CabGo Dark Mode Design System (`#0A0A0A` deep obsidian, `#121212` card surfaces, Electric Blue `#2563EB`, Emerald `#22C55E`, frosted glass header, and theme switcher) |
| **Backend** | Node.js + Express | Express.js REST API, Mongoose ODM, CORS, Dotenv, Comprehensive Test Suite |
| **Database** | MongoDB / Embedded Store | Mongoose ODM with dual-mode zero-config fallback and file persistence |

---

## 🎨 CabGo-Inspired Dark Mode Design System
The frontend has been styled to match the dark aesthetic of the **CabGo** project:
- **Deep Obsidian Surfaces**: `#0A0A0A` background with `#121212` / `#18181b` card surfaces and subtle `#262626` borders.
- **Backdrop Grid**: Precision `44px × 44px` dark grid lines with radial vignette mask.
- **Frosted Glass Navbar**: `rgba(10, 10, 10, 0.85)` with `16px` backdrop blur, sticky navigation, and electric gradient brand icon.
- **Signature Gradient Typography**: Plus Jakarta Sans & Outfit with `text-gradient-green` ("One Click Away").
- **Luminous Badges**: Translucent dark badges with glowing emerald (`#22C55E`), electric blue (`#2563EB`), and royal purple (`#7C3AED`) borders.
- **Tactile Glow Interactions**: Ambient top-right card blur orbs and glowing primary action buttons (`btn-glow`).
- **Theme Switcher**: Integrated Sun (☀️) / Moon (🌙) toggle in the navbar, persisting preferences in `localStorage` and defaulting to Dark Mode.

---

## ✨ Complete Features

### 👤 User Features
- ✅ **Curated Opportunity Grid**: Cards with company initials avatar, type pill (Internship / Job), domain badge, location, experience, and description snippet.
- ✅ **Dynamic Platform Stats**: Hero banner with live counters for Total Listings, Internships, Full-Time Jobs, Domains, and Applications.
- ✅ **Full-Text Search**: Search by title, company, domain, location, or keywords (debounced at 300ms).
- ✅ **Domain & Attribute Filtering**: Filter dropdown + **1-click quick-filter tags** for popular domains (Software Development, Data Science, Design, Marketing, Finance, etc.).
- ✅ **Detailed Role Page**: In-depth role requirements, date posted, employer verification, description, and direct application links.
- ✅ **Application Submission**: Clean form collecting Full Name, Email, Phone, Resume link (Drive, Dropbox, LinkedIn, PDF), and Cover letter.
- ✅ **Interactive Confirmation Screen**: Displays animated celebration badge, application tracking timeline (Submitted → Under Review → Decision), and a **1-click "Copy Application ID" button**.

### 🛠️ Admin Features
- ✅ **Add Opportunity**: Comprehensive form with validation (`/admin/new`).
- ✅ **Edit Opportunity**: Pre-filled update form (`/admin/edit/:id`).
- ✅ **Delete Opportunity**: One-click removal with confirmation and **cascade deletion** of all related applications.
- ✅ **Candidate Applications Dashboard**: Filter submissions by status (`Submitted`, `Under Review`, `Shortlisted`, `Rejected`) or opportunity, and search by applicant name, email, or phone.
- ✅ **Interactive Status Changer**: Update any applicant's review status on the fly with a table dropdown and live toast feedback (`PATCH /api/applications/:id/status`).
- ✅ **Admin Key Header Modal**: Built-in UI modal in the navigation bar to set or clear `ADMIN_KEY` stored in `localStorage` and sent via `x-admin-key`.

### 🧠 Dual-Mode Database Architecture (Zero Setup Required)
- **Live MongoDB / Atlas**: Connects seamlessly when `MONGO_URI` is provided.
- **Embedded Pure-JS Database**: Runs out-of-the-box without requiring MongoDB installation, preventing binary execution policy blocks (Windows Application Control / AppLocker).
- **Auto-Seeding**: Automatically seeds 12 realistic opportunities across 8 domains and sample applications on first boot.
- **Persistent Data**: Stores and loads data automatically from `backend/data/db.json`.

---

## 📸 Screenshots

All 7 views are captured in high resolution inside [`docs/screenshots/`](docs/screenshots/):

1. **Home & Search/Filter**: [`01-home-search-filter.png`](docs/screenshots/01-home-search-filter.png)
2. **Opportunity Details**: [`02-opportunity-details.png`](docs/screenshots/02-opportunity-details.png)
3. **Application Form**: [`03-apply-form.png`](docs/screenshots/03-apply-form.png)
4. **Confirmation Screen**: [`04-confirmation.png`](docs/screenshots/04-confirmation.png)
5. **Admin Opportunities**: [`05-admin-opportunities.png`](docs/screenshots/05-admin-opportunities.png)
6. **Add / Edit Form**: [`06-admin-add-edit.png`](docs/screenshots/06-admin-add-edit.png)
7. **Applications Dashboard**: [`07-admin-applications.png`](docs/screenshots/07-admin-applications.png)

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js 18+** and **npm**

### 2. Quick Start (Windows)
Double-click `start-all.bat` in the project root — this starts both the backend API (port 5000) and frontend dev server (port 5173) in separate terminal windows.

### 3. Manual Start

**Backend**:
```bash
cd backend
npm install
npm run dev        # Starts API on http://localhost:5000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev        # Starts UI on http://localhost:5173
```
Open **http://localhost:5173** in your browser. The Vite dev server proxies `/api/*` to the backend on port 5000.

### 4. Running Automated Tests
```bash
cd backend
npm test
```
Runs the automated test suite testing health, stats, CRUD, search/filter, status updates, cascade deletes, and validation errors.

---

## 🔌 REST API Documentation

Base URL: `http://localhost:5000/api`

### Opportunities
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/opportunities` | List all (`?search=&domain=&type=&location=`) |
| `GET` | `/opportunities/domains` | Distinct list of domains for filter dropdowns |
| `GET` | `/opportunities/stats` | Platform summary counts (opportunities, internships, jobs, domains, applications) |
| `GET` | `/opportunities/:id` | Full details for one opportunity |
| `POST` | `/opportunities` | Create opportunity (admin) |
| `PUT` | `/opportunities/:id` | Update opportunity (admin) |
| `DELETE` | `/opportunities/:id` | Delete opportunity + cascade delete its applications (admin) |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications` | Submit application (`{ opportunityId, name, email, phone?, resumeLink?, coverLetter? }`) |
| `GET` | `/applications/:id` | One application + populated opportunity (confirmation screen) |
| `GET` | `/applications` | List all applications (`?opportunityId=&status=&search=`) (admin) |
| `PATCH`| `/applications/:id/status` | Update candidate status (`{ status: 'Under Review' }`) (admin) |
| `DELETE`| `/applications/:id` | Delete application (admin) |

---

## 📁 Project Structure

```
Job portal project/
├── README.md                      ← Project documentation
├── start-all.bat                  ← 1-click launcher for Windows
├── start-backend.bat              ← Launch backend server
├── start-frontend.bat             ← Launch frontend server
├── docs/
│   ├── DEVELOPMENT_PROMPT.md      ← Prompt & requirement-to-code mapping
│   ├── PROJECT_REPORT.md          ← Complete 2-week project report
│   └── screenshots/               ← 7 high-resolution screenshots (.png)
├── backend/                       ← Node.js + Express REST API
│   ├── server.js                  ← Express application entry point
│   ├── package.json               ← Dependencies & npm scripts (start, dev, seed, test)
│   ├── config/
│   │   ├── db.js                  ← Intelligent dual-mode database connection
│   │   └── memoryStore.js         ← Embedded Mongoose-compatible pure-JS datastore
│   ├── controllers/
│   │   ├── opportunityController.js
│   │   └── applicationController.js
│   ├── middleware/
│   │   ├── admin.js               ← Admin authorization guard
│   │   └── errorHandler.js        ← Centralized 404 & Mongoose error handling
│   ├── models/
│   │   ├── Opportunity.js         ← Opportunity Mongoose schema & proxy
│   │   └── Application.js         ← Application Mongoose schema & proxy
│   ├── seed/
│   │   └── seed.js                ← 12 opportunities across 8 domains + sample applications
│   ├── data/
│   │   └── db.json                ← Persistent JSON storage
│   └── tests/
│       └── api.test.js            ← Automated test suite (node --test)
└── frontend/                      ← React.js (Vite)
    ├── package.json
    ├── vite.config.js             ← Dev server & /api proxy configuration
    ├── index.html
    └── src/
        ├── main.jsx / App.jsx     ← Main router & layout
        ├── api.js                 ← Fetch helper & localStorage admin key manager
        ├── styles.css             ← Full modern design system
        ├── components/
        │   ├── Navbar.jsx         ← Navigation & Admin Key modal
        │   ├── OpportunityCard.jsx← Opportunity card with dynamic company avatars
        │   ├── SearchFilterBar.jsx← Search, dropdowns, and quick tags
        │   ├── Spinner.jsx        ← Loading indicator
        │   └── ErrorBox.jsx       ← Friendly error display with retry
        └── pages/
            ├── Home.jsx           ← Hero, stats ribbon, filter bar, cards grid
            ├── OpportunityDetails.jsx ← Role details, badges, apply button
            ├── Apply.jsx          ← Candidate application form
            ├── Confirmation.jsx   ← Celebration badge, timeline, copy ID
            ├── Admin.jsx          ← Opportunity table, search, delete
            ├── OpportunityForm.jsx← Add / edit listing form
            ├── Applications.jsx   ← Screening dashboard with status changer
            └── NotFound.jsx       ← 404 fallback page
```

---

## 🧪 Verification & Testing Status

- ✅ **Backend Unit & Integration Tests**: 7 test suites passing cleanly via `npm test`.
- ✅ **Frontend Production Build**: `npm run build` compiles without warnings or errors.
- ✅ **Vite Dev Proxy**: End-to-end integration verified (`/api/*` seamlessly proxied to `:5000`).
- ✅ **Zero-Config Database**: Instant startup verified without requiring external MongoDB binaries.
- ✅ **Cross-browser Screenshots**: All 7 full-fidelity screens captured in `docs/screenshots/`.
