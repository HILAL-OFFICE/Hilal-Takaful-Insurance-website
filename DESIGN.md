# Design System & UI Specifications: Hilal Takaful Insurance

This document defines the brand color palette, typography hierarchy, UI tokens, and component guidelines for the public website and the CMS Admin Dashboard.

---

## 1. Brand Color Palette

The visual identity of Hilal Takaful balances institutional stability (Islamic insurance & financial security) with ethical warmth.

| Token Name | Hex Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| `--ht-navy` | `#17123d` | `rgb(23, 18, 61)` | Primary brand color, headers, navbar, footers, card titles |
| `--ht-navy-soft` | `#211a52` | `rgb(33, 26, 82)` | Hover states, secondary buttons, modal headers |
| `--ht-lemon` | `#b5b719` | `rgb(181, 183, 25)` | Brand accent, primary buttons, badges, highlights, crescent logo |
| `--ht-lemon-dark` | `#979914` | `rgb(151, 153, 20)` | Button active states, icon borders on dark backgrounds |
| `--ht-lemon-light`| `#f6f7d4` | `rgb(246, 247, 212)` | Subtle pill badge backgrounds, accent highlights |
| `--ht-bg-light` | `#f8f9fa` | `rgb(248, 249, 250)` | Section backgrounds, card containers |
| `--ht-white` | `#ffffff` | `rgb(255, 255, 255)` | Pure white cards, typography contrast |
| `--ht-text-muted` | `#6c757d` | `rgb(108, 117, 125)` | Meta information, timestamps, secondary snippets |

---

## 2. Typography

- **Primary Font Family:** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- **Arabic / Brand Accent Font:** `'Amiri', serif` (used for ceremonial Bismillah and Arabic headings)

### Hierarchy
- **Hero Title (H1):** `font-size: 3.25rem`, `font-weight: 800`, `line-height: 1.15`
- **Section Heading (H2):** `font-size: 2.25rem`, `font-weight: 700`, `letter-spacing: -0.02em`
- **Card Title (H3/H4):** `font-size: 1.25rem - 1.5rem`, `font-weight: 600`
- **Body Copy:** `font-size: 1rem`, `font-weight: 400`, `line-height: 1.7`
- **Badges & Labels:** `font-size: 0.825rem`, `font-weight: 600`, `text-transform: uppercase`

---

## 3. Team Portrait & Avatar Framing Rules

To maintain visual uniformity across executive leadership profiles (Board of Directors, Management Team, Advisory Council), team cards follow strict circular avatar rules:

- **Circular Wrapper:**
  ```css
  .team-avatar-wrapper {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    margin: 0 auto;
    border: 3px solid var(--ht-lemon);
    box-shadow: 0 4px 16px rgba(33, 26, 82, 0.14);
    overflow: hidden;
  }
  ```
- **Portrait Image Fill:**
  - Standard team avatars use `object-fit: cover` with `object-position: center top`.
  - Specific zoomed portraits are framed using individual scale overrides (e.g. `scale(1.75)` for tighter headshots) so every member fills their frame with balanced facial proportions.

---

## 4. CMS Admin Dashboard UI Standards

The CMS Dashboard (`/admin`) follows a minimalist, distraction-free design:
- **Left Sidebar:** Dark Navy navigation bar (`#17123d`) with subtle active highlights.
- **Main Canvas:** Soft neutral gray background (`#f4f6f9`) with elevated white cards (`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`).
- **Buttons:**
  - Primary Action (Save / Publish): Brand Lemon button with dark navy text (`.btn-lemon`).
  - Secondary Action (Cancel / Back): Soft gray pill outline.
  - Destructive Action (Delete): Crimson red outline (`.btn-outline-danger`).
- **Feedback & Alerts:** Toast notifications at top-right for auto-save, successful publish, or validation errors.

