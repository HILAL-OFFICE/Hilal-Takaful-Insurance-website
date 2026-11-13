# Hilal Takaful CMS Backend API

A production-ready Node.js & Express backend integrated with **Supabase** for managing all dynamic content, media uploads, and lead submissions across the **Hilal Takaful Insurance Limited** website.

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js     # Supabase client setup (Public & Service Role)
│   ├── middleware/
│   │   ├── auth.js         # JWT Token verification for CMS admins
│   │   └── cors.js         # Domain-restricted CORS configuration
│   ├── routes/
│   │   ├── content.js      # Public read endpoints (Settings, Team, Products, Blog, Gallery)
│   │   ├── admin.js        # Protected CRUD endpoints for CMS managers
│   │   ├── uploads.js      # Direct Supabase Storage upload handler
│   │   └── leads.js        # Contact us & quote request inquiry handler
│   └── server.js           # Server initialization & middleware chain
├── schema.sql              # Supabase database migrations, RLS & Storage buckets
├── package.json
└── .env.example
```

---

## 🛠️ Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create or open your project.
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Open [`backend/schema.sql`](./schema.sql), copy its entire contents, paste it into the SQL editor, and click **RUN**.
   - This creates all necessary tables (`site_settings`, `team_members`, `products`, `blog_posts`, `gallery_events`, `financial_reports`, `inquiries`).
   - Enables Row Level Security (RLS) with strict public vs. authenticated rules.
   - Automatically provisions public storage buckets (`team-avatars`, `blog-images`, `gallery-images`, `documents`).

---

## ⚙️ Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory by duplicating `.env.example`:

```bash
cp .env.example .env
```

Populate the credentials from your Supabase Dashboard (**Project Settings** ➔ **API**):

```env
PORT=5000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500,https://hilaltakaful.com.ng,https://admin.hilaltakaful.com.ng

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

---

## 🚀 Step 3: Run the Backend

```bash
cd backend
npm install
npm run dev
```

The API will boot up at `http://localhost:5000`. You can test health at:
`GET http://localhost:5000/health`

---

## 🌐 API Endpoints Reference

### Public Endpoints (No Auth Needed)
- `GET /api/content/settings` — Returns site branding, phone, emails, milestones.
- `GET /api/content/team?category=board|management|advisory` — Team members and directors.
- `GET /api/content/products?category=general|family` — Products & plans.
- `GET /api/content/blog` — Published articles.
- `GET /api/content/gallery` — Photo albums.
- `GET /api/content/reports` — Financial PDFs.
- `POST /api/leads` — Submit contact or quote inquiry.

### CMS Protected Endpoints (Bearer Token Required)
- `PUT /api/admin/settings` — Update branding, contacts, hero text.
- `POST / PUT / DELETE /api/admin/team` — Full team CRUD.
- `POST / PUT / DELETE /api/admin/products` — Full product CRUD.
- `POST / PUT / DELETE /api/admin/blog` — Full blog CRUD.
- `POST /api/upload` — Multipart upload (`file`, `bucket`) to Supabase Storage.
- `GET /api/leads` — Read and manage user contact inquiries.

