# Website content management plan

Planning document for letting admins edit public website copy and images from the existing staff dashboard — without adding Payload CMS or another external CMS.

**Status:** Planned (not implemented)  
**Last updated:** June 2026

---

## Goal

Allow **Admin** (and optionally **Pharmacist**) users to change text and images on key marketing pages from the dashboard:

| Page / area | Priority |
|-------------|----------|
| Home | High |
| About | High |
| Services | High |
| Contact | High |
| Header & menu | Medium |
| Footer | Medium (partially done) |

Dynamic data (products, blog posts, team profiles, branches) should **stay** on their existing dashboard screens — this plan is for **marketing copy and static section content** only.

---

## Recommendation: extend the current dashboard (not Payload CMS)

### Why not Payload CMS?

Payload is a strong headless CMS, but it is **not recommended** for this project right now:

| Payload pros | Why it hurts this project |
|--------------|---------------------------|
| Rich editor, media library | Second admin UI alongside the pharmacy dashboard |
| Flexible content models | Large integration cost with Next.js 16 + Prisma + NextAuth |
| Mature ecosystem | Duplicates features already built (blog, team, branches, site settings) |
| | Extra hosting and operational complexity |

Staff would manage pharmacy operations in one place and marketing content in another — confusing and harder to train.

### Why extend the existing dashboard?

The app already follows this pattern successfully:

- **Site settings** — footer email, social links, WhatsApp numbers (`/dashboard/settings`)
- **Health blog** — full article CMS (`/dashboard/blog`)
- **Team page** — public pharmacist profiles (`/dashboard/team`)
- **Branches** — locations, hours, phones (`/dashboard/branches`)
- **Inventory** — shop products (`/dashboard/products`)

Adding a **Website content** section fits the same model: one login, one UI, Prisma-backed, role-gated.

---

## What is editable today vs hardcoded

### Already editable from dashboard

| Content | Dashboard path | Notes |
|---------|----------------|-------|
| Footer contact email, social, WhatsApp | `/dashboard/settings` | `SiteSettings` model |
| Blog posts | `/dashboard/blog` | Title, body, cover, tags |
| Team / pharmacists slider | `/dashboard/team` | `TeamProfile` model; CEO block on `/team` stays fixed in code |
| Branch details | `/dashboard/branches` | Feeds contact page, footer help, home “Special” section |
| Shop products | `/dashboard/products` | Not page copy, but dynamic storefront |

### Still hardcoded in components / data files

| Area | Typical location | Examples |
|------|------------------|----------|
| **Home** | `src/components/medizen/sections/*` | Banner, Category, About, Choose, Care, Sponsor, HomeHelpSection |
| **About** | `AboutExtra.tsx`, about page | Hero, values, commitments, images |
| **Services** | `src/data/pharmacy-services.ts`, service sections | Service titles, descriptions, detail copy |
| **Contact** | `ContactPageContent.tsx` | Headings, intro paragraphs |
| **Header menu** | `Header.tsx`, `MobileMenu.tsx` | Nav labels and links |
| **Footer** | `Footer.tsx`, `FooterWidgets.tsx` | Tagline, some widget copy (email/social already from settings) |

---

## Proposed architecture

### 1. Dashboard: “Website content” hub

New admin area listing editable pages:

```
Dashboard → Website content
  ├── Home
  ├── About
  ├── Services
  ├── Contact
  ├── Header & menu
  └── Footer
```

Clicking a row opens an editor for that page’s **sections** (grouped fields, not a full page builder).

**Access control:** Admin only initially; optionally Pharmacist for copy (not layout). Reuse `canAccessDashboardRoute` in `src/lib/dashboard-rbac.ts`.

### 2. Database: `PageContent` (or similar)

Suggested Prisma model:

```prisma
model PageContent {
  id        String   @id @default(cuid())
  slug      String   @unique  // "home" | "about" | "services" | "contact" | "header" | "footer"
  sections  Json     // structured section fields per page
  updatedAt DateTime @updatedAt
  updatedBy String?  // optional staff user id / name
}
```

**`sections` JSON shape** — per slug, define a TypeScript type in e.g. `src/lib/page-content-shared.ts`:

```ts
// Example: home page sections
type HomePageContent = {
  banner: {
    eyebrow: string
    title: string
    subtitle: string
    ctaLabel: string
    ctaHref: string
    image: string | null
  }
  aboutTeaser: { title: string; body: string; image: string | null }
  // ... other home sections as needed
}
```

**Important:** Every public component should **fall back to current hardcoded defaults** when DB row is missing or a field is empty — so deploys never break empty content.

### 3. Server API pattern

Mirror existing patterns:

| Layer | Example in codebase |
|-------|---------------------|
| Shared types + defaults | `src/lib/site-settings-shared.ts` |
| Server loaders | `src/lib/site-settings.ts` |
| Server actions | `src/app/actions/site-settings.ts` |
| Dashboard form | `src/components/dashboard/SiteSettingsForm.tsx` |
| Public read | `getPublicSiteSettings()`, `/api/public/site-settings` |

For page content:

- `src/lib/page-content-shared.ts` — types, defaults, merge helper
- `src/lib/page-content.ts` — `getPageContent(slug)`, `getPublicPageContent(slug)`
- `src/app/dashboard/content/actions.ts` — `updatePageContent(slug, sections)`
- `src/components/dashboard/PageContentEditor.tsx` — per-page or generic section form
- Optional: `GET /api/public/page-content?slug=home` for client components

After saves: `revalidatePath('/')`, `revalidatePath('/about')`, etc.

### 4. Images

Reuse patterns from:

- **Team profiles** — upload with size limit, store URL or data URL in DB
- **Blog covers** — `BlogCoverDisplay`

Prefer **stored paths** under `public/` or blob storage long term; avoid huge base64 in JSON for hero images.

### 5. Menu & footer

| Piece | Approach |
|-------|----------|
| Footer email / social / WhatsApp | Keep in **Site settings** (done) |
| Footer tagline / extra widget text | `PageContent` slug `footer` or extend `SiteSettings` |
| Header nav items | `PageContent` slug `header` as ordered array `{ label, href, children? }` **or** small `NavigationItem` table |
| Branch-driven footer links | Keep reading from branches API; don’t duplicate in CMS |

---

## Phased implementation

### Phase 1 — Quick wins (highest impact, lowest risk)

- [ ] Add `PageContent` model + migration
- [ ] Dashboard hub: list pages + edit form
- [ ] **Home:** banner (title, subtitle, CTA, hero image)
- [ ] **About:** hero title, lead paragraph, hero image
- [ ] Wire `Banner.tsx` and about hero to `getPageContent` with defaults

**Acceptance:** Admin changes home hero text in dashboard → visible on `/` after refresh/revalidate.

### Phase 2 — Core marketing pages

- [ ] **Services:** page intro + optional section images
- [ ] **Contact:** intro headings and body
- [ ] **Home:** additional sections (Choose, Care, Sponsor text blocks)
- [ ] **Footer:** tagline and static widget copy

### Phase 3 — Navigation & polish

- [ ] **Header & menu** — editable labels/order (keep routes validated against known paths)
- [ ] Image upload UX (preview, crop optional)
- [ ] Rich text for long blocks (optional; plain textarea may suffice initially)
- [ ] “Preview on site” link from editor
- [ ] Audit log: who changed what (`updatedBy`, `updatedAt`)

### Out of scope (keep existing features)

- Blog → `/dashboard/blog`
- Team pharmacists → `/dashboard/team`
- Products → `/dashboard/products`
- Branch addresses/hours → `/dashboard/branches`
- Legal pages (Privacy, Terms, Cookie) — can add later as extra slugs if needed

---

## UI sketch (dashboard)

```
┌─────────────────────────────────────────────────────────┐
│ Website content                                         │
│ Edit headlines, images and copy on public pages.        │
├─────────────────────────────────────────────────────────┤
│ Home          Last edited 12 Jun 2026 by Admin    [Edit]│
│ About         Last edited —                       [Edit]│
│ Services      Last edited —                       [Edit]│
│ Contact       Last edited —                       [Edit]│
│ Header & menu Last edited —                       [Edit]│
│ Footer        Last edited 10 Jun 2026 by Admin    [Edit]│
└─────────────────────────────────────────────────────────┘
```

Editor per page: cards per section (Banner, About teaser, …) with labeled fields and image picker.

---

## Technical notes

- **Next.js:** Use Server Components to load content; pass props into existing section components.
- **No Payload dependency** — stays on Prisma + existing auth.
- **pnpm** for scripts (`pnpm run build`, `pnpm dev`).
- **RBAC:** Add `/dashboard/content` to `dashboardNavItems` and `canAccessDashboardRoute` (Admin only recommended).
- **Search:** Add “Website content” to dashboard Ctrl+K search (`src/app/dashboard/search/actions.ts`).

---

## Related files (current codebase)

| Purpose | Path |
|---------|------|
| Site settings (footer/social) | `src/lib/site-settings.ts`, `src/components/dashboard/SiteSettingsForm.tsx` |
| Team profiles pattern | `src/app/dashboard/team/`, `src/components/dashboard/TeamProfilesManager.tsx` |
| Home page assembly | `src/app/page.tsx` |
| About / Services / Contact pages | `src/app/about/page.tsx`, `src/app/service/page.tsx`, `src/app/contact/page.tsx` |
| Header / Footer | `src/components/medizen/Header.tsx`, `Footer.tsx` |
| Services data | `src/data/pharmacy-services.ts` |
| Dashboard nav | `src/lib/dashboard-rbac.ts`, `src/data/dashboard-nav.ts` |

---

## Decision summary

| Option | Verdict |
|--------|---------|
| Install Payload CMS | **No** — too heavy, duplicates existing admin |
| Custom “Website content” in dashboard | **Yes** — consistent, trainable, fits Prisma stack |
| Start with | Home + About heroes, then Services/Contact, then menu/footer |

When implementation starts, begin with Phase 1 and the `PageContent` model; do not block on a full WYSIWYG page builder.
