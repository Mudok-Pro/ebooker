# PROJECT_MAP.md — MathBook Platform

> Generated: 2026-07-22
> Protocol: Architecture Memory & Tracking

---

## [TECH_STACK]

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2.11 (Active LTS) | App Router, Server Components, Turbopack |
| Language | TypeScript | 7.0 (bundled by Next.js via SWC) | Type safety |
| UI Library | React | 19.x | Server/Client Components |
| Styling | TailwindCSS | 4.3.3 | Utility-first CSS |
| Components | shadcn/ui | 4.13.1 | Accessible UI primitives |
| Backend | Supabase | - | Auth, Database, Storage |
| Database | PostgreSQL | (Supabase managed) | Relational data |
| Auth | Supabase Auth + @supabase/ssr | Latest | SSR-compatible auth with cookie proxy |
| Storage | Supabase Storage | - | Private image storage for book pages |
| Deployment | Vercel | - | Hosting, Edge Functions |
| Runtime | Node.js | 22.x LTS | Required by @supabase/supabase-js 2.110+ |

---

## [SYSTEM_FLOW]

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISITOR                                   │
│                          │                                       │
│                          ▼                                       │
│                   ┌──────────────┐                               │
│                   │ LANDING PAGE │  (Public, no auth)            │
│                   │ /            │                               │
│                   └──────┬───────┘                               │
│                          │                                       │
│              ┌───────────┼───────────┐                          │
│              ▼                       ▼                           │
│     ┌──────────────┐        ┌──────────────┐                    │
│     │  SIGN UP     │        │  LOGIN       │                    │
│     │  /signup     │        │  /login      │                    │
│     └──────┬───────┘        └──────┬───────┘                    │
│            │                       │                             │
│            └───────────┬───────────┘                             │
│                        ▼                                         │
│              ┌──────────────────┐                                │
│              │ PURCHASE BOOK    │  (Creates order: pending)      │
│              │ POST /api/orders │                                │
│              └────────┬─────────┘                                │
│                       │                                          │
│                       ▼                                          │
│              ┌──────────────────┐                                │
│              │ WAIT FOR ADMIN   │  (Order status: pending)       │
│              └────────┬─────────┘                                │
│                       │                                          │
│    ┌──────────────────┼──────────────────┐                      │
│    ▼                                     ▼                       │
│ ┌──────────────┐              ┌──────────────┐                  │
│ │ ADMIN PANEL  │              │ USER LIBRARY │                  │
│ │ /admin       │              │ /library     │                  │
│ │ Approves     │──── grant ──▶│ Shows book   │                  │
│ │ order        │              │ with access  │                  │
│ └──────────────┘              └──────┬───────┘                  │
│                                      │                           │
│                                      ▼                           │
│                             ┌──────────────────┐                │
│                             │ READER           │                │
│                             │ /library/[id]    │                │
│                             │ /reader          │                │
│                             │ - Page images    │                │
│                             │ - Watermark      │                │
│                             │ - Prev/Next      │                │
│                             └──────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Purchase → Access

```
User clicks "Buy"
    │
    ▼
POST /api/orders { book_id }
    │
    ▼
Insert into orders table (status: 'pending')
    │
    ▼
Admin sees order in /admin/orders
    │
    ├──▶ Approve → UPDATE orders SET status='approved'
    │              INSERT INTO user_books (user_id, book_id)
    │
    └──▶ Reject → UPDATE orders SET status='rejected'
                  Notify user (future: email notification)
```

### Data Flow: Reader → Page Load

```
User opens /library/[bookId]/reader
    │
    ▼
Server Component: verify user_books access (RLS)
    │
    ▼
Fetch book_pages for book_id (ordered by page_number)
    │
    ▼
Render PageViewer with current page index
    │
    ├──▶ Page image loaded from Supabase Storage (signed URL)
    ├──▶ WatermarkOverlay renders name + email via CSS
    └──▶ PageNavigation: Prev / Next buttons
```

---

## [ARCHITECTURE]

### Route Groups (Next.js App Router — Implemented)

```
src/app/
├── (marketing)/          # Public: no auth required
│   ├── page.tsx          # Landing page (hero, book info, benefits, CTAs)
│   └── layout.tsx        # Public layout wrapper
│
├── (auth)/               # Auth pages
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── auth/update-password/page.tsx
│   └── layout.tsx        # Centered auth layout
│
├── (dashboard)/          # Protected: auth required
│   ├── library/page.tsx           # User library
│   ├── library/loading.tsx        # Loading state
│   ├── library/error.tsx          # Error boundary
│   ├── library/[bookId]/reader/page.tsx        # Server: access check
│   ├── library/[bookId]/reader/reader-client.tsx  # Client: page nav + watermark
│   └── layout.tsx                 # Dashboard layout with nav
│
├── admin/                # Admin only: role = 'admin'
│   ├── page.tsx                  # Dashboard overview (stats)
│   ├── loading.tsx               # Loading state
│   ├── error.tsx                 # Error boundary
│   ├── books/page.tsx            # Book list
│   ├── books/new/page.tsx        # Create book
│   ├── books/[id]/edit/page.tsx  # Edit book
│   ├── books/[id]/pages/page.tsx # Page upload
│   ├── orders/page.tsx           # Order management
│   ├── users/page.tsx            # User management
│   └── layout.tsx                # Admin layout + role guard
│
├── api/                  # API routes
│   ├── orders/route.ts           # POST: create purchase order
│   ├── pages/route.ts            # GET: signed URL for page image
│   ├── admin/books/route.ts      # POST/PATCH: manage books
│   ├── admin/orders/route.ts     # PATCH: approve/reject orders
│   └── admin/pages/route.ts      # POST: upload page images
│
├── auth/signout/route.ts # POST: sign out
├── layout.tsx            # Root layout (Cairo font, RTL, Sonner)
├── globals.css           # Tailwind v4 + shadcn theme
├── not-found.tsx         # 404 page
└── global-error.tsx      # Global error boundary

src/proxy.ts              # Auth middleware (proxy convention, Next.js 16)
```

### Component Architecture (Implemented)

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx           # Public layout wrapper
│   │   └── page.tsx             # Landing page (single-file, all sections)
│   ├── (auth)/
│   │   ├── layout.tsx           # Centered auth layout
│   │   ├── login/page.tsx       # Login form
│   │   ├── signup/page.tsx      # Signup form
│   │   └── auth/update-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Auth-required layout with header
│   │   ├── library/
│   │   │   ├── page.tsx         # User library (books + pending orders)
│   │   │   ├── loading.tsx      # Loading state
│   │   │   ├── error.tsx        # Error boundary
│   │   │   └── [bookId]/reader/
│   │   │       ├── page.tsx     # Server: verify access, fetch pages
│   │   │       └── reader-client.tsx  # Client: page nav, watermark, signed URLs
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout + role guard
│   │   ├── page.tsx             # Dashboard overview (stats cards)
│   │   ├── loading.tsx          # Loading state
│   │   ├── error.tsx            # Error boundary
│   │   ├── books/page.tsx       # Book list
│   │   ├── books/new/page.tsx   # Create book form
│   │   ├── books/[id]/edit/     # Edit book form
│   │   ├── books/[id]/pages/    # Page upload + preview
│   │   ├── orders/page.tsx      # Order list with approve/reject
│   │   ├── orders/approve-reject-buttons.tsx  # Client: action buttons
│   │   └── users/page.tsx       # User list
│   ├── api/
│   │   ├── orders/route.ts      # POST: create order
│   │   ├── pages/route.ts       # GET: signed URL for page image
│   │   └── admin/
│   │       ├── books/route.ts   # POST/PATCH: manage books
│   │       ├── orders/route.ts  # PATCH: approve/reject orders
│   │       └── pages/route.ts   # POST: upload page images
│   ├── auth/signout/route.ts    # POST: sign out
│   ├── layout.tsx               # Root layout (Cairo font, RTL, Toaster)
│   ├── globals.css              # Tailwind + shadcn theme
│   ├── not-found.tsx            # 404 page
│   └── global-error.tsx         # Global error boundary
├── components/ui/               # shadcn/ui (14 components)
├── lib/
│   ├── constants.ts             # Site config, book data, WhatsApp URL
│   ├── logger.ts                # Async structured logging
│   ├── utils.ts                 # cn() helper
│   └── supabase/
│       ├── client.ts            # Browser client (createBrowserClient)
│       └── server.ts            # Server client (createServerClient)
├── types/database.ts            # Supabase table types
└── proxy.ts                     # Auth middleware (token refresh + route protection)
```

### Supabase Client Setup

```
src/lib/supabase/
├── client.ts     # createBrowserClient (Client Components)
└── server.ts     # createServerClient (Server Components, Server Actions)
```

**Middleware (proxy.ts)**: Refreshes auth tokens on every request. Uses `@supabase/ssr` with `getAll`/`setAll` cookie methods. Redirects unauthenticated users to `/login` for protected routes. Redirects authenticated users away from public routes to `/library`. Admin routes check `profiles.role = 'admin'`.

### Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `book-pages` | Private (authenticated + ROL) | Store book page images |
| `book-covers` | Public | Store book cover images for landing page |

### Logging

```
src/lib/logger.ts
```

- Non-blocking via `queueMicrotask`
- Structured JSON output
- Levels: info, warn, error
- Controlled by `LOG_LEVEL` env var
- No PII logged

---

## [ORPHANS & PENDING]

### Pending Items (blocked or deferred)

| Item | Status | Blocker |
|---|---|---|
| Supabase SQL migration | Ready to run | User must run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor |
| Supabase Storage buckets | Auto-created by migration | Will be created when migration runs |
| Book page images | Ready to upload | User uploads via Admin > Books > [Book] > Pages |
| Admin role assignment | Ready | User must manually set `role = 'admin'` in profiles table after first signup |
| Custom domain | Deferred | After MVP launch |
| Email notifications | Deferred | After MVP |
| Payment gateway | Deferred | After MVP validation |
| Cover image for landing page | Optional | Can be added to `book-covers` bucket later |

### Completed Milestones

| Milestone | Status | Files |
|---|---|---|
| M0: Scaffold | ✅ | `package.json`, `tsconfig.json`, `next.config.ts`, `components.json` |
| M1: Auth | ✅ | `src/proxy.ts`, `src/lib/supabase/*`, login/signup/reset-password pages |
| M2: Database | ✅ | `supabase/migrations/001_initial_schema.sql`, `src/types/database.ts` |
| M3: Landing Page | ✅ | `src/app/(marketing)/page.tsx` |
| M4: Purchase Flow | ✅ | `src/app/api/orders/route.ts`, `src/app/api/admin/orders/route.ts` |
| M5: Library | ✅ | `src/app/(dashboard)/library/page.tsx` |
| M6: Reader | ✅ | `src/app/(dashboard)/library/[bookId]/reader/*`, `src/app/api/pages/route.ts` |
| M7: Admin Dashboard | ✅ | `src/app/admin/**`, `src/app/api/admin/*` |
| M8: Polish | ✅ | Error boundaries, loading states, not-found pages |

### Tech Debt Watch

| Risk | Mitigation |
|---|---|
| TypeScript 7.0 lacks stable programmatic API | Next.js bundles its own TS via SWC — no impact |
| shadcn/ui v4 may have breaking changes from v3 docs | Use `npx shadcn@latest init` and `add` commands only |
| Supabase Storage signed URL caching | Set short TTL (15 min), regenerate on demand |
| Watermark bypass via DevTools | Accept risk — watermark is deterrent, not DRM |
| `as unknown as` casts for Supabase join types | Accept for MVP — Supabase TS inference returns arrays for FK joins |

---

## [DECISION_LOG]

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-22 | Image-based pages, not PDF rendering | Simpler, full watermark control, no PDF.js dependency |
| 2026-07-22 | Dynamic watermark overlay, not pre-rendered | Single source image, no storage duplication per user |
| 2026-07-22 | Manual order approval, no payment gateway | MVP simplicity, validate product first |
| 2026-07-22 | @supabase/ssr, not auth-helpers-nextjs | auth-helpers is deprecated, SSR is the standard |
| 2026-07-22 | One page at a time reader | Simplest UX, most predictable performance |
| 2026-07-22 | Route groups for auth/layout separation | Clean Next.js App Router pattern |
| 2026-07-22 | Node.js 22.x required | @supabase/supabase-js 2.110+ dropped Node 20 support |
| 2026-07-22 | Private bucket + signed URLs for book pages | Security: prevents direct file access even if URL is leaked |
| 2026-07-22 | Storage path stored in DB, signed URL at read time | Decouples storage from access; URLs expire, paths don't |
| 2026-07-22 | Next.js 16 proxy.ts convention | middleware.ts is deprecated in Next.js 16.2 |
| 2026-07-22 | Separate queries instead of Supabase FK joins | Avoids TypeScript array-type inference issues with joins |
