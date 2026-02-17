# 🏢 Multi-Tenant CMS — Proof of Concept

> **One Admin Panel. Two Websites. Zero Friction.**
>
> A production-grade multi-tenant content management system built with **Payload CMS**, **Next.js 15**, **PostgreSQL**, and **Nginx**. Manage blogs for multiple brands from a single admin interface, each with its own domain, theme, and content — all powered by one codebase.

---

## 📋 Table of Contents

- [What Is This?](#-what-is-this)
- [Why Multi-Tenancy?](#-why-multi-tenancy)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [URL Map](#-url-map)
- [Admin Panel Guide](#-admin-panel-guide)
- [Live Preview & Click-to-Edit](#-live-preview--click-to-edit)
- [Themes](#-themes)
- [Configuration Reference](#-configuration-reference)
- [Scaling to Production](#-scaling-to-production)

---

##  What Is This?

This is a **multi-tenant CMS** that allows a single admin to manage content for **two independent websites** — **Misrut** and **Synrgy** — from one unified admin panel.

| Feature               | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Single Codebase**   | One Next.js + Payload CMS project serves everything                                 |
| **Separate Websites** | Each brand gets its own URL, design, and content                                    |
| **Unified Admin**     | One admin panel with separate **"Misrut Blogs"** and **"Synrgy Blogs"** collections |
| **Live Preview**      | Real-time content preview with click-to-edit field targeting                        |
| **Lexical Rich Text** | Full-featured Lexical editor for blog content                                       |
| **Themed Frontends**  | Misrut (light, serif, elegant) and Synrgy (dark, gradient, modern)                  |

### The Two Websites

| Brand      | URL              | Theme                    | Description                |
| ---------- | ---------------- | ------------------------ | -------------------------- |
| **Misrut** | `localhost:3001` | Light, serif, warm tones | Clean and elegant blog     |
| **Synrgy** | `localhost:3002` | Dark, gradients, modern  | Bold and tech-forward blog |

---

## Why Multi-Tenancy?

Traditional approach: **2 websites = 2 codebases + 2 databases + 2 admin panels + 2× maintenance.**

Our approach: **2 websites = 1 codebase + 1 database + 1 admin panel + 1× maintenance.**


> **Adding a third website (e.g., "Acmeco") takes under an hour** — create a new collection, add a theme CSS file, add an Nginx server block, seed data. No architectural changes needed.

---

## 🏗 Architecture

```
                          ┌─────────────────────────┐
                          │      Admin Panel         │
                          │   localhost:3000/admin    │
                          │  ┌─────────┬───────────┐ │
                          │  │ Misrut  │  Synrgy   │ │
                          │  │ Blogs   │  Blogs    │ │
                          │  └─────────┴───────────┘ │
                          └───────────┬─────────────┘
                                      │
                          ┌───────────▼─────────────┐
                          │    Payload CMS + Next.js │
                          │     localhost:3000        │
                          │                           │
                          │  ┌───────────────────┐    │
                          │  │ Middleware         │    │
                          │  │ Reads X-Tenant     │    │
                          │  │ Rewrites URL       │    │
                          │  └───────────────────┘    │
                          └──────┬────────────┬──────┘
                                 │            │
              ┌──────────────────▼──┐   ┌─────▼──────────────────┐
              │   Nginx :3001       │   │   Nginx :3002          │
              │   X-Tenant: misrut  │   │   X-Tenant: synrgy     │
              │   → Misrut Website  │   │   → Synrgy Website     │
              │   Light/Serif Theme │   │   Dark/Gradient Theme  │
              └─────────────────────┘   └────────────────────────┘
                                 │            │
                          ┌──────▼────────────▼──────┐
                          │     PostgreSQL :5433      │
                          │   multi-tenant-poc DB     │
                          │                           │
                          │  ┌─────────┬───────────┐  │
                          │  │ misrut  │  synrgy   │  │
                          │  │ _blogs  │  _blogs   │  │
                          │  ├─────────┼───────────┤  │
                          │  │ tenants │  users     │  │
                          │  │ media   │           │  │
                          │  └─────────┴───────────┘  │
                          └───────────────────────────┘
```

### Request Flow

1. User visits `localhost:3001` (Misrut) or `localhost:3002` (Synrgy)
2. **Nginx** receives the request and injects an `X-Tenant` header (`misrut` or `synrgy`)
3. Nginx proxies the request to the **Next.js app** on port `3000`
4. **Next.js middleware** reads the `X-Tenant` header and rewrites the URL internally (e.g., `/` → `/misrut`)
5. The **tenant-specific page** renders with the correct theme and content from the matching collection
6. The page queries **only that tenant's blog collection** (`misrut-blogs` or `synrgy-blogs`)

---

## 🛠 Tech Stack

| Layer                | Technology              | Purpose                                                            |
| -------------------- | ----------------------- | ------------------------------------------------------------------ |
| **CMS**              | Payload CMS 3.x         | Admin panel, collections, API, live preview                        |
| **Frontend**         | Next.js 15 (App Router) | Server-rendered pages, middleware routing                          |
| **Database**         | PostgreSQL 16           | Persistent data storage                                            |
| **Reverse Proxy**    | Nginx                   | Tenant routing via `X-Tenant` header injection                     |
| **Rich Text**        | Lexical Editor          | Full-featured content editing (headings, lists, formatting, links) |
| **Containerization** | Docker Compose          | PostgreSQL, Adminer, Nginx orchestration                           |
| **Language**         | TypeScript              | Type-safe throughout                                               |

---

## ⚙ How It Works

### 1. Tenant Routing (Nginx → Middleware)

**Nginx** (`nginx.conf`) runs two server blocks:

- Port `3001` → Injects `X-Tenant: misrut`
- Port `3002` → Injects `X-Tenant: synrgy`

Both proxy to the same Next.js app on port `3000`.

**Next.js Middleware** (`src/middleware.ts`) intercepts every request:

- Reads the `X-Tenant` header
- Rewrites `/` → `/misrut` or `/synrgy` internally
- Skips `/admin`, `/api`, and static files

### 2. Separate Blog Collections

Instead of one shared "Posts" collection, we have:

| Collection     | Admin Sidebar  | Auto-Tenant                | Live Preview URL |
| -------------- | -------------- | -------------------------- | ---------------- |
| `misrut-blogs` | "Misrut Blogs" | Auto-assigns Misrut tenant | `localhost:3001` |
| `synrgy-blogs` | "Synrgy Blogs" | Auto-assigns Synrgy tenant | `localhost:3002` |

Each collection has a `beforeChange` hook that automatically assigns the correct tenant — the admin never needs to select a tenant manually.

### 3. Live Preview with Click-to-Edit

When editing a blog post in the admin panel, a live preview iframe loads the actual website. As you type:

- The **title** updates instantly in the preview
- The **content** (Lexical rich text) renders in real-time
- **Click on any field** in the preview → the admin panel focuses that field
- Hover effects show which fields are editable (dashed outline)

### 4. Themed Frontends

Each tenant has its own CSS theme file:

- `misrut-theme.css` — Light background, Playfair Display serif font, warm brown accents
- `synrgy-theme.css` — Dark background, Inter sans-serif font, purple-to-teal gradients

Themes are applied by wrapping content in a `<div className="misrut">` or `<div className="synrgy">`.

---

## 🗄 Database Design

A single PostgreSQL database (`multi-tenant-poc`) with logical data separation:

```
┌────────────────────────────────────────────────────────┐
│                  multi-tenant-poc                       │
├──────────────┬──────────────┬──────────┬───────────────┤
│ misrut_blogs │ synrgy_blogs │ tenants  │ users         │
├──────────────┼──────────────┼──────────┼───────────────┤
│ id           │ id           │ id       │ id            │
│ title        │ title        │ title    │ email         │
│ slug         │ slug         │ slug     │ password      │
│ content      │ content      │ domain   │ (auth fields) │
│ image        │ image        │          │               │
│ tenant_id →  │ tenant_id →  │          │               │
│ created_at   │ created_at   │          │               │
│ updated_at   │ updated_at   │          │               │
└──────────────┴──────────────┴──────────┴───────────────┘
                                  ↑
                         Foreign key reference
```

### Why Separate Collections (Not Row Filtering)?

| Approach                               | Pros                                                 | Cons                              |
| -------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| **Single "Posts" + filter by tenant**  | Simpler schema                                       | Mixed data in admin, confusing UX |
| **Separate collections per tenant** | Clean admin UX, clear ownership, independent schemas | Slightly more config              |

We chose separate collections because:

- **Admin clarity** — "Misrut Blogs" and "Synrgy Blogs" are clearly separated in the sidebar
- **Schema flexibility** — Each tenant can evolve independently (e.g., add a "category" field only to Synrgy)
- **Auto-tenant assignment** — No risk of assigning content to the wrong tenant

### Database Access (Adminer)

A web-based database browser is included at `localhost:8080`:

| Field    | Value              |
| -------- | ------------------ |
| System   | PostgreSQL         |
| Server   | `postgres`         |
| Username | `postgres`         |
| Password | `password`         |
| Database | `multi-tenant-poc` |

---

## 📁 Project Structure

```
multi-tenant-cms-poc/
├── docker-compose.yml          # PostgreSQL, Adminer, Nginx services
├── nginx.conf                  # Tenant routing (port → X-Tenant header)
├── .env                        # DATABASE_URL, PAYLOAD_SECRET
├── package.json                # Dependencies
├── scripts/
│   └── seed.ts                 # Seeds tenants, admin user, sample blogs
└── src/
    ├── payload.config.ts       # Payload CMS configuration (collections, editor, DB)
    ├── middleware.ts            # Next.js middleware (reads X-Tenant, rewrites URL)
    ├── collections/
    │   ├── Users.ts            # Admin authentication
    │   ├── Tenants.ts          # Tenant registry (Misrut, Synrgy)
    │   ├── MisrutBlogs.ts      # Misrut-specific blog collection
    │   ├── SynrgyBlogs.ts      # Synrgy-specific blog collection
    │   └── Media.ts            # File/image uploads
    ├── components/
    │   └── LivePreviewPost.tsx  # Live preview with click-to-edit + Lexical rendering
    └── app/
        ├── (frontend)/
        │   ├── layout.tsx      # Root layout with Google Fonts
        │   ├── page.tsx        # Home page with tenant cards
        │   ├── styles.css      # Home page styles
        │   ├── themes/
        │   │   ├── misrut-theme.css  # Light/serif theme
        │   │   └── synrgy-theme.css  # Dark/gradient theme
        │   └── [tenant]/
        │       ├── page.tsx         # Blog listing (queries tenant-specific collection)
        │       └── [slug]/
        │           └── page.tsx     # Blog detail with live preview support
        └── (payload)/
            ├── admin/          # Payload admin panel routes
            └── api/            # Payload REST & GraphQL API
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement        | Version | Check                    |
| ------------------ | ------- | ------------------------ |
| **Node.js**        | 20+     | `node --version`         |
| **npm**            | 9+      | `npm --version`          |
| **Docker**         | 20+     | `docker --version`       |
| **Docker Compose** | v2+     | `docker compose version` |

### Step 1: Clone & Install

```bash
cd /path/to/project
git clone <repository-url> multi-tenant-cms-poc
cd multi-tenant-cms-poc
npm install
```

### Step 2: Environment File

The `.env` file should already exist with:

```env
DATABASE_URL=postgres://postgres:password@127.0.0.1:5433/multi-tenant-poc
PAYLOAD_SECRET=d321d5c9cb48e2ece911a67e
```

> **Note:** `5433` is used to avoid conflicts with other PostgreSQL instances. Change if needed.

### Step 3: Start Docker Services

```bash
docker compose up -d
```

This starts **3 containers**:

| Container  | Port           | Service                          |
| ---------- | -------------- | -------------------------------- |
| `postgres` | `5433`         | PostgreSQL 16 database           |
| `adminer`  | `8080`         | Web-based DB management          |
| `nginx`    | `3001`, `3002` | Reverse proxy for tenant routing |

Verify they're running:

```bash
docker compose ps
```

### Step 4: Start the Application

```bash
rm -rf .next && npm run dev
```

Wait for:

```
✓ Ready in Xs
- Local: http://localhost:3000
```

### Step 5: Seed the Database

Open a **new terminal**:

```bash
cd /path/to/multi-tenant-cms-poc
npx tsx scripts/seed.ts
```

This creates:

| Data             | Details                                              |
| ---------------- | ---------------------------------------------------- |
| **Tenants**      | Misrut (`localhost:3001`), Synrgy (`localhost:3002`) |
| **Admin User**   | `admin@example.com` / `admin123`                     |
| **Misrut Blogs** | 3 sample posts                                       |
| **Synrgy Blogs** | 4 sample posts                                       |

### Step 6: Open in Browser 🎉

| URL                               | What You'll See                       |
| --------------------------------- | ------------------------------------- |
| **`http://localhost:3000`**       | Home page with tenant cards           |
| **`http://localhost:3000/admin`** | Admin panel (login first)             |
| **`http://localhost:3001`**       | Misrut Blog — light, elegant theme |
| **`http://localhost:3002`**       | Synrgy Blog — dark, gradient theme |
| **`http://localhost:8080`**       | Database browser (Adminer)            |

---

##  URL Map

```
localhost:3000          →  Home page (links to both blogs)
localhost:3000/admin    →  Payload CMS Admin Panel
localhost:3001          →  Misrut Blog (via Nginx → X-Tenant: misrut)
localhost:3001/slug     →  Misrut Blog Post Detail
localhost:3002          →  Synrgy Blog (via Nginx → X-Tenant: synrgy)
localhost:3002/slug     →  Synrgy Blog Post Detail
localhost:8080          →  Adminer (Database Browser)
```

---

##  Admin Panel Guide

### Admin Sidebar

After login, you'll see:

```
📁 Blogs
  ├── Misrut Blogs    ← Only Misrut posts
  └── Synrgy Blogs    ← Only Synrgy posts
📁 Uploads
  └── Media           ← Shared media library
⚙ Settings
  ├── Tenants         ← Tenant registry
  └── Users           ← Admin accounts
```

### Creating a Blog Post

1. Click **"Misrut Blogs"** or **"Synrgy Blogs"** in the sidebar
2. Click **"Create New"**
3. Fill in **Title**, **Slug**, and **Content** (Lexical rich text editor)
4. Optionally upload a **cover image**
5. The **tenant is auto-assigned** — you don't need to select it
6. Use the **Live Preview** panel to see changes in real-time
7. Click **Save** → the post immediately appears on the respective website

---

## Live Preview & Click-to-Edit

### How Live Preview Works

When editing any blog post, the admin panel shows a **live preview iframe** that loads the actual website:

- **Misrut Blogs** → Preview loads `localhost:3001`
- **Synrgy Blogs** → Preview loads `localhost:3002`

### Real-Time Updates

As you type in the admin editor:

- **Title** updates instantly in the preview
- **Content** (rich text) re-renders in real-time
- **Images** appear immediately when uploaded

### Click-to-Edit

When hovering over content in the live preview:

- A **dashed outline** appears around editable fields
- **Click on any field** → the admin editor scrolls to and focuses that field
- Supported fields: Title, Content, Image

### Responsive Preview

Use the built-in breakpoints to test different screen sizes:

-  Mobile (375×667)
-  Tablet (768×1024)
-  Desktop (1440×900)

---

## Themes

### Misrut — Light & Elegant

| Property       | Value                             |
| -------------- | --------------------------------- |
| **Background** | `#faf8f5` (warm off-white)        |
| **Typography** | Playfair Display (serif)          |
| **Accent**     | `#c4956a` (warm gold)             |
| **Layout**     | Horizontal blog cards             |
| **Mood**       | Professional, editorial, timeless |

### Synrgy — Dark & Modern

| Property       | Value                                         |
| -------------- | --------------------------------------------- |
| **Background** | `#0a0a0f` (near-black)                        |
| **Typography** | Inter (sans-serif)                            |
| **Accent**     | Purple-to-teal gradient                       |
| **Layout**     | Grid blog cards with gradient border on hover |
| **Mood**       | Tech-forward, bold, premium                   |

---

## Configuration Reference

### Environment Variables

| Variable         | Description                  | Default                                                        |
| ---------------- | ---------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgres://postgres:password@127.0.0.1:5433/multi-tenant-poc` |
| `PAYLOAD_SECRET` | JWT signing secret           | (generated)                                                    |

### Docker Ports

| Port   | Service        | Configurable In                     |
| ------ | -------------- | ----------------------------------- |
| `5433` | PostgreSQL     | `docker-compose.yml` + `.env`       |
| `8080` | Adminer        | `docker-compose.yml`                |
| `3000` | Next.js app    | Default Next.js                     |
| `3001` | Misrut website | `docker-compose.yml` + `nginx.conf` |
| `3002` | Synrgy website | `docker-compose.yml` + `nginx.conf` |

### Common Commands

```bash
# Start everything
docker compose up -d && npm run dev

# Stop everything
docker compose down     # Ctrl+C to stop Next.js

# Reset database (nuclear option)
docker compose down -v && docker compose up -d
rm -rf .next && npm run dev
npx tsx scripts/seed.ts   # Re-seed in new terminal

# View database
open http://localhost:8080

# Check Docker status
docker compose ps
docker compose logs -f nginx
```

---

##  Scaling to Production

### Adding a New Tenant

Adding a third brand (e.g., "Acmeco") requires **4 changes**:

1. **New collection** — Copy `MisrutBlogs.ts` → `AcmecoBlogs.ts`, change slug and tenant
2. **Register in config** — Add to `collections` array in `payload.config.ts`
3. **New theme** — Create `acmeco-theme.css`
4. **Nginx block** — Add port `3003` with `X-Tenant: acmeco`

---
