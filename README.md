# Hilal Takaful Nigeria Limited - Official Website

This repository contains the complete, production-ready website for **Hilal Takaful Nigeria Limited** (Nigeria's Pioneer Composite Takaful Operator).

---

## 🌟 Key Features

- **100% Shariah-Compliant Corporate Design**: Sleek modern UI built with custom typography, navy/lemon-gold palettes, and verified trustmarks.
- **Composite Product Portfolios**:
  - **General Takaful**: Comprehensive Motor, Fire & Burglary, Marine Cargo, Travel, Engineering, and Liability.
  - **Family Takaful**: Halal Life Protection, Children Education Plans, Mortgage & Credit Takaful, and Ethical Savings.
- **Full Governance & Corporate Leadership**:
  - Company Profile & Mission
  - Board of Directors (with biographical modals)
  - Advisory Council of Experts (ACE)
  - Executive Management Team
- **Interactive Knowledge Hub (Blog)**: Debunking insurance myths, surplus distribution mechanics, and family protection guides.
- **Corporate Image Gallery**: Filterable photo showcase with high-res lightbox previews.
- **Financial & Investor Relations**: Audited 2024 Annual Report download and corporate disclosures.
- **Direct Engagement**: Integrated WhatsApp instant chat, responsive contact form, and active social media links (Facebook, X, Instagram, LinkedIn).
- **Comprehensive SEO Suite**:
  - Page-specific titles, meta descriptions, and keywords
  - OpenGraph & Twitter Cards for social sharing
  - JSON-LD Structured Data (`InsuranceAgency`, `Organization`, `FinancialProduct`)
  - Multi-resolution favicon suite (`favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`)
  - Canonical links, `robots.txt`, and `sitemap.xml`

---

## 🚀 How to Host This Website

### Option 1: GitHub Pages (Free & Instant)
1. Initialize a Git repository inside this folder or upload all files to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Hilal Takaful website"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/hilal-takaful-website.git
   git push -u origin main
   ```
2. On GitHub, go to your repository **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your website will be live in ~1 minute at `https://<YOUR-USERNAME>.github.io/hilal-takaful-website/`.
5. *(Optional)* Add your custom domain `hilaltakaful.com.ng` in the Custom Domain field.

### Option 2: Netlify (Drag-and-Drop)
1. Go to [Netlify](https://app.netlify.com).
2. Simply drag and drop this entire folder onto the Netlify dashboard.
3. Your site is deployed with free SSL in 10 seconds!

### Option 3: Vercel
1. Install Vercel CLI (`npm i -g vercel`) or link your GitHub repo on [vercel.com](https://vercel.com).
2. Run `vercel` and accept the defaults.

### Option 4: Traditional cPanel / Apache / Nginx
1. Upload all contents of this folder into your hosting's `public_html` directory via cPanel File Manager or FTP.

---

## 📁 Project Structure

```
├── index.html                   # Homepage
├── general-takaful.html         # General Takaful products
├── family-takaful.html          # Family Takaful products
├── company-profile.html         # About Us: Company profile
├── board-of-directors.html      # About Us: Board of Directors
├── advisory-council.html        # About Us: Advisory Council of Experts
├── management-team.html         # About Us: Executive Management
├── blog.html                    # Blog & Knowledge Hub
├── our-image-gallery.html       # Corporate Image Gallery
├── contactus.html               # Contact Us & Office Location
├── investors-relation.html      # Financial Reports & 2024 Annual Report
├── favicon.ico                  # 32x32 multi-resolution browser icon
├── favicon.png                  # 512x512 master transparent favicon
├── favicon-32x32.png            # Standard tab icon
├── favicon-16x16.png            # Small bookmark/tab icon
├── apple-touch-icon.png         # iOS / Safari home screen icon
├── robots.txt                   # Search crawler directives
├── sitemap.xml                  # XML sitemap for Google & Bing
├── .gitignore                   # Git ignore file
├── README.md                    # Deployment documentation
└── assets/
    ├── css/style.css            # Site-wide responsive design system
    ├── js/components.js         # Unified navbar, footer, & floating WhatsApp
    ├── js/main.js               # Interactive components & utilities
    └── images/                  # All optimized images, trustmarks, and team portraits
```

---

© 2026 Hilal Takaful Nigeria Limited. Licensed Composite Takaful Operator. All rights reserved.
