## Admin Management System — Implementation Plan

I'll build a complete admin system on top of your existing photography site. Since the backend (Lovable Cloud) uses email-based auth, I'll map your credentials like this:

- **Login username field**: `Anvithasri` (you type this)
- Internally stored as email: `anvithasri@admin.local`
- **Password**: `Anu@123`
- **Role**: `admin` (stored in a separate `user_roles` table — secure, no privilege escalation)

Anyone visiting `/admin` without admin role is redirected home. Public visitors keep browsing albums normally.

### 1. Database (migration)

- `albums` — id, album_name, album_cover, theme_name, slug, category (month/event), display_order, created_at, updated_at
- `photos` — id, album_id, image_url, thumbnail_url, caption, display_order, created_at
- `videos` — id, title, youtube_url, display_order, created_at
- `user_roles` + `app_role` enum + `has_role()` security-definer function
- Storage bucket `album-photos` (public read, admin write)
- RLS: public can SELECT all content; only admins can INSERT/UPDATE/DELETE
- Seed: 12 monthly albums + 4 event albums with correct themes

### 2. Auth

- Create the admin user via SQL seed (email `anvithasri@admin.local`, password `Anu@123`, role `admin`)
- Disable public signup (single-admin site)
- `/admin/login` page — accepts username "Anvithasri", maps to email behind the scenes
- `useAuth` hook + `AdminGuard` component that checks `has_role(admin)`

### 3. Admin dashboard (`/admin`)

Tabbed responsive layout:
- **Albums** — list, create, edit (title/theme/cover/order), delete, drag-reorder
- **Photos** — pick album → drag-drop upload up to 100 files, live previews, per-file progress, thumbnails grid with caption edit, delete, drag-reorder
- **Videos** — add/edit/delete YouTube links with order

### 4. Image optimization

Client-side before upload using `browser-image-compression`:
- Convert to WebP
- Generate 400px thumbnail + max 1920px full version
- Both uploaded to `album-photos/<album-slug>/...`

### 5. Public site updates

- Albums + photos + videos load from database (replaces hardcoded data)
- Theme switches per album (already wired in your ThemeProvider — just feed DB `theme_name`)
- Masonry/grid, lightbox, zoom, prev/next, lazy load, search, filter — already in your codebase, will continue to work

### 6. Files

**New**: `src/routes/admin.tsx`, `src/routes/admin.login.tsx`, `src/hooks/useAuth.ts`, `src/components/admin/{AlbumsManager,PhotosManager,VideosManager,PhotoUploader}.tsx`, `src/lib/imageOptimizer.ts`, `src/lib/queries.ts`

**Edited**: `src/routes/albums.tsx`, `src/routes/album.$slug.tsx`, `src/routes/videos.tsx`, `src/components/Navbar.tsx` (add admin link when logged in)

### Confirm before I start
- ✅ Username "Anvithasri" stored internally as `anvithasri@admin.local` — OK?
- ✅ Existing hardcoded photos will be replaced by whatever you upload (placeholders shown only when an album is empty) — OK?
