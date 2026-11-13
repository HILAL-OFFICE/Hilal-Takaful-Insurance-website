# Project Changelog: Hilal Takaful Insurance Web Platform

All notable changes, fixes, refactorings, and feature additions for this project are documented in this file.

---

## [Unreleased] - CMS & Backend Integration (Phase 1 & 2)

### Added
- **Backend Architecture (`/backend`)**:
  - Initialized Express.js server with helmet security headers, morgan logging, and modular routing.
  - Implemented domain-restricted CORS middleware supporting local development and production domains (`hilaltakaful.com.ng`, `admin.hilaltakaful.com.ng`).
  - Implemented Supabase JWT authentication middleware (`backend/src/middleware/auth.js`) for administrative routes.
  - Created public content routes (`/api/content/*`) and protected CMS endpoints (`/api/admin/*`).
  - Added direct file streaming route (`/api/upload`) using Multer memory storage and Supabase Object Storage.
  - Created lead ingestion system (`/api/leads`) for capturing customer contact and quote inquiries.
- **Database Schema (`backend/schema.sql`)**:
  - Full relational PostgreSQL schema for `site_settings`, `team_members`, `products`, `blog_posts`, `gallery_events`, `financial_reports`, and `inquiries`.
  - Configured Row Level Security (RLS) policies distinguishing anonymous readers from authenticated staff.
  - Created 4 public storage buckets: `team-avatars`, `blog-images`, `gallery-images`, and `documents`.
- **System Documentation**:
  - Created `ARCHITECTURE.md` detailing system diagrams, data flow, and security boundaries.
  - Created `DESIGN.md` establishing color tokens, typography rules, and avatar framing standards.

---

## [2026-10-19] - SEO, Verification & Route Hardening

### Added
- **Google Search Console**:
  - Uploaded site verification file `google3d778bb44e15f8a0.html`.
  - Added `google-site-verification` meta tag in `index.html`.
- **Apache Web Server Configuration (`.htaccess`)**:
  - Implemented 301 Permanent Redirects for legacy CMS URLs (`/about-us`, `/our-team`, `/board`, `/shariah-board`, `/contact-us`, `/web/login`).
  - Enforced HTTPS rewrite rules and clean extensionless URLs.
- **Sitemap & Robots**:
  - Updated `sitemap.xml` with current lastmod timestamps and XML URL sets.
  - Updated `robots.txt` reflecting official company name and sitemap directive.

### Changed
- Removed obsolete `login.html` and `whistleblowing.html` from Git tracking.
- Cleaned navbar action buttons across all page headers to maintain focus on the "Get Quote" call-to-action.

---

## [2026-10-16] - Branding & Executive Leadership Realignment

### Changed
- **Corporate Identity**:
  - Replaced all instances of "Hilal Takaful Nigeria Limited" with **"Hilal Takaful Insurance Limited"** across all 29 HTML pages, meta tags, schema JSON-LD, and JS components.
  - Standardized customer support email to **`hilaltakafulcustomerservice@hilaltakaful.com.ng`**.
- **Leadership Profiles Updated**:
  - **Abubakar Sadik Adam**: Updated full biography covering his 40-year career across Nigeria Airways, NNDC, and Acting Executive Secretary/CEO of NHIS.
  - **Barr. Muhammad I. Lawal**: Updated profile to reflect his extensive 30+ year Sharia & English legal consultancy, Lagos State Customary Law Panel, and Supreme Council for Sharia.
  - **Ibrahim Jimoh**: Updated to Team Lead Family Business Underwriter with 16+ years of specialized underwriting experience.
  - **Imam Isma’eel Busaeri**: Added comprehensive qualifications (LL.B Islamic Law, B.A., M.A. Islamic Studies) and poverty alleviation background.
  - **Adekoya Shittu Olusegun**: Updated title and detailed qualifications (B.Sc UNILAG, PGD Alhuda CIBE, PCIBF, IIIBF, IIFP).
  - **Prof. Tajudeen Olalekan Yusuf**: Updated credentials (Lecturer UNILAG, PhD Nottingham, Chairman IIFP).
  - **Tajudeen Olusesi**: Updated credentials (M.Sc Risk Management & Insurance UNILAG, Fellow IIFP).
  - **Philip Osuolale (MCIHRM)**: Corrected background to reflect his genuine 10+ year HR practitioner leadership at Flour Mills of Nigeria Plc and Hilal Takaful.
- **Favicon & Iconography**:
  - Created high-resolution transparent crescent icon without black background.

---

## [2026-10-15] - Initial Modernization & Layout Optimization

### Added
- Fully responsive corporate layouts across 29 HTML pages.
- Mobile responsiveness improvements for company milestones row on `company-profile.html`.
- Unified component header, footer, and cookie consent banner via `assets/js/components.js`.

