# SwapFuser — Build Roadmap

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| **Next.js 14** (App Router) | Framework — routing, SSR, image optimization |
| **Tailwind CSS v3** | Styling — your existing config copies over directly |
| **shadcn/ui** | Accessible component primitives (dialogs, dropdowns, sheets) |
| **Geist + Inter** | Fonts — already in your design |
| **Material Symbols** | Icons — already in your design |
| **Zustand** | Lightweight client-side state (auth user, theme, modals) |
| **React Hook Form + Zod** | Form handling and validation (Create Post, auth forms) |
| **Mapbox GL JS** | Interactive discovery map |
| **date-fns** | Date formatting for posts and messages |

### Backend
| Tool | Purpose |
|---|---|
| **Supabase** | Entire backend — auth, database, realtime, storage |
| **PostgreSQL** (via Supabase) | Main database for users, posts, messages, listings |
| **Supabase Auth** | Email/password + OAuth (Google, GitHub) |
| **Supabase Realtime** | Live messaging (no separate WebSocket server needed) |
| **Supabase Storage** | Image uploads for posts and profile pictures |
| **Supabase Edge Functions** | Serverless logic (notifications, search, moderation) |

### Deployment
| Tool | Purpose |
|---|---|
| **Vercel** | Frontend hosting — one-click Next.js deploy |
| **Supabase Cloud** | Managed backend — free tier is generous |
| **Cloudinary** (optional) | Advanced image transforms (resize, crop, compress on upload) |

---

## Phase 1 — Project Scaffold & Design System
**Goal:** Runnable Next.js app with your exact visual design replicated.

### 1.1 Initialize Project
- [ ] `npx create-next-app@latest swapfuser --typescript --tailwind --app`
- [ ] Copy the full Tailwind config (colors, spacing, borderRadius, fontFamily, fontSize) from your HTML files into `tailwind.config.ts`
- [ ] Install and configure Google Fonts (Geist, Inter) via `next/font`
- [ ] Add Material Symbols via `<link>` in the root `layout.tsx`
- [ ] Set global body background `#f7f9fb` in `globals.css`

### 1.2 Folder Structure
```
src/
  app/                    # Next.js App Router pages
    (auth)/
      login/page.tsx
      signup/page.tsx
    feed/page.tsx
    create/page.tsx
    map/page.tsx
    profile/[username]/page.tsx
    messages/page.tsx
    messages/[id]/page.tsx
  components/
    layout/               # Navbar, BottomNav, Sidebar
    feed/                 # PostCard, PostSkeleton, FeedFilter
    create/               # PostForm, ImageUploader, ToggleSellSwap
    map/                  # MapView, MapMarker, MapSidebar
    messages/             # ConversationList, ChatWindow, MessageBubble
    profile/              # ProfileHeader, ListingGrid, StatsBadge
    ui/                   # Shared: Button, Input, Avatar, Badge, Modal
  lib/
    supabase.ts           # Supabase client
    utils.ts              # cn(), formatDate(), formatPrice()
  hooks/                  # useAuth, usePosts, useMessages, useMap
  store/                  # Zustand stores
  types/                  # TypeScript interfaces
```

### 1.3 Shared UI Components (no data yet)
- [ ] `Button` — primary, secondary, ghost, icon variants
- [ ] `Avatar` — with fallback initials
- [ ] `Badge` — Sell / Swap / Condition tags
- [ ] `Input` + `Textarea` — with label, error state
- [ ] `Modal` / `Sheet` — for mobile drawers
- [ ] `Skeleton` — loading placeholders for feed cards

---

## Phase 2 — Frontend Pages (Static / Mock Data)
**Goal:** Every screen from your HTML design working as a React page with hardcoded mock data.

### 2.1 Layout & Navigation
- [ ] **Top Navbar** — logo, nav links (Feed, Map, Profile), Login + Sign Up buttons
- [ ] **Bottom Navigation Bar** (mobile) — Feed, Map, Create, Messages, Profile icons
- [ ] **Dark mode toggle** — using Tailwind `darkMode: "class"` + Zustand + `localStorage`
- [ ] Responsive layout wrapper — `max-w-[1280px] mx-auto`

### 2.2 Social Feed Page (`/feed`)
Convert `swapfuser_social_feed/code.html` → React components
- [ ] **FeedFilter** tabs — All / Swap / Sell (active state with `bg-primary`)
- [ ] **PostCard** component:
  - User avatar + username + location + timestamp
  - Item image(s) with carousel
  - Item name + description snippet
  - Sell price badge OR Swap-for label
  - Action row: Like (heart), Comment, Share, Save/Bookmark
  - Condition tag (New / Like New / Good / Fair)
- [ ] **Stories/Featured strip** at top (horizontal scroll)
- [ ] Feed rendered from a mock array of 6–8 posts
- [ ] Infinite scroll placeholder (load more button for now)

### 2.3 Create Post Page (`/create`)
Convert `swapfuser_create_post/code.html` → React components
- [ ] **Sell / Swap toggle** — animated sliding indicator, switches dynamic field
- [ ] **ImageUploader** — drag-and-drop zone, preview thumbnails, remove button
- [ ] **Form fields** — Item Name, Description, Location (with pin icon), Price (Sell) OR Swap-For (Swap)
- [ ] **Category selector** — dropdown (Electronics, Clothing, Books, Furniture, etc.)
- [ ] **Condition selector** — radio group (New / Like New / Good / Fair)
- [ ] Form validation via React Hook Form + Zod
- [ ] Post / Cancel buttons with hover + active animations

### 2.4 User Profile Page (`/profile/[username]`)
Convert `swapfuser_user_profile/code.html` → React components
- [ ] **ProfileHeader** — cover image, avatar, name, username, bio, location
- [ ] **Stats row** — Listings count, Followers, Following, Swaps completed
- [ ] **Follow / Message / Share** action buttons
- [ ] **Tab navigation** — Active Listings / Sold / Swap History / Reviews
- [ ] **ListingGrid** — responsive grid of PostCards (compact variant)
- [ ] **Ratings & Reviews** section — star rating, reviewer name, comment

### 2.5 Messages Page (`/messages` + `/messages/[id]`)
Convert `swapfuser_messages_updated/code.html` → React components
- [ ] **ConversationList** sidebar — avatar, name, last message preview, unread badge, timestamp
- [ ] **ChatWindow** — message bubbles (sent right / received left), timestamps
- [ ] **MessageInput** bar — text field, emoji button, image attach, send button
- [ ] **Item context card** at top of chat — thumbnail + name + price of the item being discussed
- [ ] Mobile: full-screen chat (ConversationList hidden when chat is open)
- [ ] Empty state illustration when no conversation selected

### 2.6 Discovery Map Page (`/map`)
Convert `swapfuser_interactive_map/code.html` → React components
- [ ] **Mapbox GL JS** integration — centered on a default city
- [ ] Custom map markers — blue dot for Sell items, purple for Swap
- [ ] **MapSidebar** — scrollable list of nearby items (synced with map markers)
- [ ] Clicking a marker opens a **popup card** (item image, name, price, seller avatar)
- [ ] **Filter bar** over the map — category, distance radius, Sell/Swap toggle
- [ ] Geolocation button — "Use my location"
- [ ] Map style toggle — Standard / Satellite (optional)

### 2.7 Auth Pages (`/login`, `/signup`)
- [ ] **Login** — email + password fields, "Forgot password" link, Google OAuth button
- [ ] **Sign Up** — name, username, email, password, confirm password
- [ ] Form validation (Zod schemas)
- [ ] Loading spinner on submit button

---

## Phase 3 — Frontend Polish & Interactivity
**Goal:** All interactions feel real before touching the backend.

- [ ] **Optimistic UI** — like button toggles instantly (no API call yet)
- [ ] **Image carousel** on PostCard — swipe on mobile, arrow buttons on desktop
- [ ] **Toast notifications** — success/error feedback (use `sonner` or `react-hot-toast`)
- [ ] **Skeleton loaders** — show while feed/profile data would be loading
- [ ] **Empty states** — illustrated placeholders for empty feed, no messages, no listings
- [ ] **Animations** — Tailwind `transition`, `hover:scale`, card hover lift effect
- [ ] **Responsive audit** — test every page at 375px, 768px, 1280px
- [ ] **Accessibility** — focus rings, aria labels on icon buttons, keyboard navigation

---

## Phase 4 — Backend Setup (Supabase)
**Goal:** Database, auth, and storage configured before wiring the frontend.

### 4.1 Supabase Project
- [ ] Create project at `supabase.com`
- [ ] Install client: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Create `src/lib/supabase.ts` — browser client and server client (for Server Components)

### 4.2 Database Schema
Run these in the Supabase SQL editor:

```sql
-- Users (extends Supabase Auth)
profiles (id, username, full_name, avatar_url, bio, location, created_at)

-- Listings / Posts
posts (id, user_id, type[sell|swap], title, description, images[], 
       price, swap_for, category, condition, location, lat, lng,
       is_active, created_at)

-- Social
likes        (id, user_id, post_id, created_at)
comments     (id, user_id, post_id, body, created_at)
saves        (id, user_id, post_id, created_at)
follows      (follower_id, following_id, created_at)

-- Messaging
conversations (id, item_id, created_at)
participants  (conversation_id, user_id)
messages      (id, conversation_id, sender_id, body, image_url, created_at, read_at)

-- Transactions
swap_requests (id, post_id, requester_id, offer_description, status, created_at)
reviews       (id, reviewer_id, reviewee_id, post_id, rating, comment, created_at)
```

### 4.3 Row Level Security (RLS)
- [ ] Profiles — public read, owner write
- [ ] Posts — public read, owner write/delete
- [ ] Likes/Saves — authenticated users can insert/delete own rows
- [ ] Messages — only conversation participants can read/write
- [ ] Reviews — authenticated write, public read

### 4.4 Supabase Storage Buckets
- [ ] `avatars` bucket — public read, authenticated write
- [ ] `post-images` bucket — public read, authenticated write
- [ ] Set max file size: 5MB for avatars, 10MB for post images

---

## Phase 5 — Backend Integration (Wiring Frontend to Supabase)
**Goal:** Replace all mock data with real Supabase queries.

### 5.1 Authentication
- [ ] **Sign Up** — `supabase.auth.signUp()` → auto-create profile row via DB trigger
- [ ] **Login** — `supabase.auth.signInWithPassword()`
- [ ] **Google OAuth** — `supabase.auth.signInWithOAuth({ provider: 'google' })`
- [ ] **Session persistence** — middleware in `middleware.ts` using `@supabase/ssr`
- [ ] Protected routes — redirect to `/login` if no session
- [ ] Auth state in Zustand — `useAuthStore` with `user`, `profile`, `loading`

### 5.2 Posts & Feed
- [ ] Fetch paginated feed: `supabase.from('posts').select('*, profiles(*), likes(*)')...`
- [ ] Filter by type (Sell/Swap), category, location radius
- [ ] Create post — form submit → upload images to Storage → insert post row
- [ ] Delete post — soft delete (`is_active = false`) for owner only
- [ ] Like / Unlike — upsert/delete in `likes` table, show count

### 5.3 User Profile
- [ ] Fetch profile + listings by username param
- [ ] Edit profile — avatar upload to Storage + update `profiles` row
- [ ] Follow / Unfollow — insert/delete in `follows` table
- [ ] Followers / Following count via aggregated query

### 5.4 Real-time Messages
- [ ] Create conversation when first message sent to a seller
- [ ] Send message — insert into `messages` table
- [ ] **Supabase Realtime subscription** — `supabase.channel('messages').on('INSERT', ...)`
- [ ] Mark messages as read — update `read_at` on render
- [ ] Unread badge count — count messages where `read_at IS NULL AND sender_id != me`

### 5.5 Discovery Map
- [ ] Fetch posts with `lat` + `lng` within bounding box of current map view
- [ ] Use Mapbox `flyTo()` when clicking a sidebar listing
- [ ] Filter markers by category/type without re-fetching (client-side filter)
- [ ] On "Use my location" — browser Geolocation API → update map center

### 5.6 Search
- [ ] Supabase full-text search on `posts.title` + `posts.description`
- [ ] Search bar in Navbar — debounced input → live results dropdown
- [ ] Dedicated `/search?q=` results page

---

## Phase 6 — Polish, Testing & Deployment
**Goal:** Production-ready app.

### 6.1 Performance
- [ ] `next/image` for all post and avatar images (automatic WebP + lazy load)
- [ ] Supabase query caching with React Query (`@tanstack/react-query`)
- [ ] Dynamic imports for Mapbox (heavy library — load only on `/map`)
- [ ] Lighthouse audit — target 90+ on Performance and Accessibility

### 6.2 Error Handling
- [ ] Global error boundary in `app/error.tsx`
- [ ] 404 page in `app/not-found.tsx`
- [ ] Supabase error messages mapped to user-friendly toasts

### 6.3 Deployment
- [ ] Push to GitHub
- [ ] Connect repo to Vercel — auto-deploy on push to `main`
- [ ] Add environment variables in Vercel dashboard
- [ ] Set Supabase Site URL to your Vercel production URL (for OAuth redirect)
- [ ] Enable Supabase Edge Network for lower latency globally

### 6.4 Post-Launch
- [ ] Supabase Edge Function for email notifications (new message, swap request)
- [ ] Push notifications via Web Push API (PWA)
- [ ] PWA manifest + service worker — installable on mobile
- [ ] Admin dashboard — report/moderate listings

---

## Summary Timeline

| Phase | What Gets Done | Estimated Effort |
|---|---|---|
| Phase 1 | Scaffold + design system | 1–2 days |
| Phase 2 | All 6 pages in React (static) | 4–6 days |
| Phase 3 | Interactions + polish | 2–3 days |
| Phase 4 | Supabase setup + schema | 1 day |
| Phase 5 | Wire everything to backend | 5–7 days |
| Phase 6 | Deploy + performance | 1–2 days |

**Frontend done before any backend work starts — you can see and test the full UI first.**
