# MockMate AI — Full Redesign v2

## Setup

```bash
npm install
cp .env.example .env  # Add VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm run dev
```

## New Features

### Landing Page (`/landing`)
- **Preloader**: Animated SVG logo draws itself, progress bar fills, then smooth fade-into-page transition
- **Hero section**: Parallax on scroll, floating particle field, grid overlay, animated orb blobs, scroll indicator
- **3D Dashboard card**: Mouse-tracking 3D tilt effect, floating animation, animated score ring + progress bars
- **Scroll reveals**: Every section fades/slides up as it enters viewport (Framer Motion `useInView`)
- **Animated counters**: Numbers count up when they scroll into view
- **Feature cards**: Hover lifts + icon rotates + gradient overlay
- **Dark navy theme** throughout

### Sidebar Navigation
- **Collapsible**: Click toggle button to collapse to icon-only (72px) mode
- **Mobile**: Full-screen slide-in with backdrop blur overlay
- **Icon micro-interactions**: Each nav icon bounces/scales on hover via spring physics
- **Active indicator**: Purple left bar + background fill for current route
- **Tooltips**: Show labels when sidebar is collapsed
- **User avatar**: Animated gradient initials, click to go to profile
- **Animated expand/collapse**: All labels fade/slide with Framer Motion AnimatePresence

### Page Transitions
- Every route change does a smooth fade+slide transition
- All major components have entrance animations with stagger delays

### Auth Pages (Login/Register)
- **Split-screen layout**: Dark branded left panel + clean white right form
- **Left panel**: Grid background, orb blobs, decorative feature list
- **Form**: Polished inputs with purple focus rings

## Architecture

```
src/
  pages/
    Landing.tsx      ← New: preloader + hero + scroll sections
    Login.tsx        ← Redesigned: split-screen
    Register.tsx     ← Redesigned: split-screen
    Dashboard.tsx    ← Updated: sidebar-aware layout
    Profile.tsx      ← Updated: cleaner cards
    InterviewRunner.tsx
    SessionReview.tsx
    NotFound.tsx
  components/
    Sidebar.tsx      ← New: collapsible animated sidebar
    AppTopbar.tsx    ← New: top bar for app pages
    SessionCard.tsx  ← Updated: spring animations
    PrivateRoute.tsx
  index.css          ← Complete design system
```

## Routing
- `/` → redirects unauthenticated users to `/landing` (first visit)
- `/landing` → Landing page (public)
- `/login`, `/register` → Auth pages (public)
- `/`, `/profile`, etc. → Protected routes wrapped in sidebar layout
