# Supabase CMS Administration & Setup Guide

This guide explains how to invite administrative staff, configure Row-Level Security, manage Supabase Storage buckets, and run the **Hilal Takaful Insurance Limited** CMS portal.

---

## 1. Setting Up Your Supabase Project

1. Log in to [supabase.com](https://supabase.com) and create a project (e.g. `hilal-takaful`).
2. Go to the **SQL Editor** tab on the left sidebar.
3. Open [`backend/schema.sql`](../backend/schema.sql), copy everything, paste it into the editor, and click **RUN**.
   - This creates all necessary tables (`site_settings`, `team_members`, `products`, `blog_posts`, `gallery_events`, `financial_reports`, `inquiries`).
   - Enables Row Level Security (RLS) on each table.
   - Automatically initializes public storage buckets (`team-avatars`, `blog-images`, `gallery-images`, `documents`).

---

## 2. Inviting & Creating Admin Users

Supabase Auth provides an **invite-only** user system so public visitors cannot register accounts.

### How to Create an Admin Account:
1. In the Supabase Dashboard, go to **Authentication** ➔ **Users**.
2. Click **"Add user"** (top right) ➔ Select **"Create user"**.
3. Enter the staff member's corporate email (e.g. `marketing@hilaltakaful.com.ng`) and a strong temporary password.
4. Toggle **"Auto Confirm User?"** to **ON** (so they don't have to confirm via email first).
5. Click **Create user**.
6. Share the credentials securely with the staff member.

---

## 3. Configuring the CMS Client (`/admin`)

Open [`admin/js/api.js`](./js/api.js) and update the top configuration block with your project credentials:

```javascript
window.CMS_CONFIG = {
  // Found in Supabase Dashboard -> Project Settings -> API
  SUPABASE_URL: 'https://xyzcompany.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',

  // Your deployed backend API URL (or http://localhost:5000/api during development)
  API_BASE_URL: 'http://localhost:5000/api'
};
```

---

## 4. CMS Features & Usage

### A. Site Settings (`/admin` ➔ Site Settings)
- **Company Information**: Change phone numbers, physical address, and contact emails (`enquiries@...`, `hilaltakafulcustomerservice@...`).
- **Hero Banner**: Update the homepage headline and subtext instantly without editing HTML files.

### B. Leadership & Governance (`/admin` ➔ Leadership & Team)
- Manage **Board of Directors**, **Management Team**, and **Advisory Council**.
- Add new executives, update bios, edit honorary titles (`mni`, `FCA`, `MCIHRM`), upload new headshots, or toggle visibility on the live site.

### C. Products & Solutions (`/admin` ➔ Products & Plans)
- Update General Takaful and Family Takaful policies, features, and downloadable brochures.

### D. Blog & Articles (`/admin` ➔ Blog & Insights)
- Draft and publish company announcements, takaful insights, and educational press releases.

### E. Customer Inquiries (`/admin` ➔ Customer Inquiries)
- Real-time inbox showing every customer submission from the "Contact Us" and "Get a Quote" forms with date, service interest, and message.

