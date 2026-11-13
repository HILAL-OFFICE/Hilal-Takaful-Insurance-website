# System Architecture: Hilal Takaful Insurance CMS & Web Platform

This document describes the high-level system architecture, data flow, component interactions, and security boundaries for the **Hilal Takaful Insurance Limited** web platform and Content Management System (CMS).

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  +-------------------------------------+   +------------------------------------+ |
|  |       Public Website (Visitors)     |   |       CMS Admin Portal (Staff)     | |
|  |  HTML5 / Bootstrap 5 / Modern CSS   |   |        Modern SPA Dashboard        | |
|  |   Assets: assets/js/cms-client.js   |   |           Path: /admin             | |
|  +------------------+------------------+   +-----------------+------------------+ |
+---------------------|----------------------------------------|--------------------+
                      |                                        |
                      | 1. Read Public Content                 | 2. Auth & Admin CRUD
                      |    (Cached / RLS Read)                 |    (Bearer JWT Token)
                      v                                        v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION LAYER                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                       Node.js + Express.js Backend API                      |  |
|  |                                                                             |  |
|  |   - CORS Middleware: Restricts access to authorized company domains         |  |
|  |   - Auth Middleware: Verifies Supabase Bearer JWT tokens                   |  |
|  |   - Multer Storage: Buffer-based image & PDF file streaming                 |  |
|  |   - Public Read Routes: /api/content/*                                      |  |
|  |   - Protected CMS Routes: /api/admin/*                                      |  |
|  |   - Lead Ingestion: /api/leads (Contact & Quote inquiries)                  |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         | 3. SQL Queries & Storage API
                                         v
+-----------------------------------------------------------------------------------+
|                             SUPABASE INFRASTRUCTURE                               |
|                                                                                   |
|  +----------------------+   +-----------------------+   +-----------------------+ |
|  |    Supabase Auth     |   |   PostgreSQL Database |   |   Supabase Storage    | |
|  |  (Admins & Sessions) |   |  (RLS Protected Rows) |   |  (Public Media & Docs)| |
|  |                      |   |                       |   |                       | |
|  |  - Email / Password  |   |  - site_settings      |   |  - team-avatars       | |
|  |  - Secure JWTs       |   |  - team_members       |   |  - blog-images        | |
|  |  - Role checking     |   |  - products           |   |  - gallery-images     | |
|  |  - Session refresh   |   |  - blog_posts         |   |  - documents (PDFs)   | |
|  |                      |   |  - gallery_events     |   |                       | |
|  |                      |   |  - financial_reports  |   |                       | |
|  |                      |   |  - inquiries          |   |                       | |
|  +----------------------+   +-----------------------+   +-----------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### A. Public Website (`/` root)
- **Tech Stack:** HTML5, Bootstrap 5.3, Vanilla JavaScript, CSS3 variables.
- **Hydration Strategy:** Instant zero-CLS (Cumulative Layout Shift) rendering. The static HTML serves as the guaranteed baseline; a lightweight client script (`assets/js/cms-client.js`) checks for updated Supabase data and smoothly updates text, numbers, bios, and links without page flashing.
- **Security:** Static hosting has near-zero attack surface. No server-side secrets are bundled into client code.

### B. CMS Admin Portal (`/admin`)
- **Location:** Dedicated `/admin` directory with isolated styling and scripts.
- **Authentication:** Direct connection to Supabase Auth (`supabase.auth.signInWithPassword`).
- **Authorization:** Only authenticated users can access the dashboard views and emit management API calls.
- **Capabilities:**
  - Site branding, contact details, social links, and hero text updates.
  - Team members & leadership bios management (Board, Management, Advisory).
  - General & Family Takaful products management.
  - Blog & news article editor.
  - Image gallery manager with drag-and-drop file uploads.
  - Financial reports PDF upload and publishing.
  - Leads inbox (reviewing contact form queries and quote requests).

### C. Backend API Server (`/backend`)
- **Tech Stack:** Node.js, Express.js, Helmet, Multer, Supabase JS SDK.
- **Role:** Centralized business logic, strict CORS enforcement, file upload processing, and secure transaction validation.
- **CORS Policy:** Strict domain whitelist restricting API calls exclusively to `https://hilaltakaful.com.ng`, `https://admin.hilaltakaful.com.ng`, and verified local development origins.

### D. Supabase (Database, Auth, and Storage)
- **PostgreSQL Database:** Enforces Row Level Security (RLS) on all tables.
- **Auth Provider:** Issues cryptographically signed JSON Web Tokens (JWT) for staff logins.
- **Object Storage:** Hosts optimized public images and downloadable policy/annual report PDFs across 4 dedicated public buckets (`team-avatars`, `blog-images`, `gallery-images`, `documents`).

---

## 3. Data Flow & Security Boundaries

1. **Visitor Read Flow:**
   - Visitor loads page ➔ Static HTML renders immediately.
   - Client requests public data from `/api/content/*` or Supabase REST.
   - Public RLS policies allow reading only rows where `is_active = true` and `status = 'published'`.

2. **Admin Mutation Flow:**
   - Admin enters credentials in `/admin` ➔ Supabase Auth validates and returns a JWT session.
   - Admin modifies content or uploads a file.
   - Admin client sends request with `Authorization: Bearer <JWT>`.
   - Backend or Supabase verifies the JWT signature before committing changes to PostgreSQL or Storage.

3. **Lead Ingestion Flow:**
   - Visitor fills out the "Get a Quote" or "Contact Us" form.
   - Form sends `POST /api/leads` payload.
   - Server sanitizes inputs and commits record to `inquiries` table with `status = 'new'`.
   - CMS dashboard alerts admins of new pending inquiries.

