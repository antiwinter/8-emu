---
name: Mobile-First UI Redesign
overview: Overhaul the UI for a mobile-first, light-mode experience with animations, improved layout, and avatar integration. Move assets to public folder for access.
todos:
  - id: assets-move
    content: Move avatars from app/avatar to public/avatars
    status: completed
  - id: deps-install
    content: Install framer-motion, lucide-react, clsx, tailwind-merge
    status: completed
  - id: style-global
    content: Update globals.css for light mode and install Tailwind plugins if needed
    status: completed
    dependencies:
      - deps-install
  - id: ui-startscreen
    content: Redesign StartScreen (Grid, Filter ID 4, Avatars, Light Mode)
    status: completed
    dependencies:
      - style-global
      - assets-move
  - id: ui-matcharea
    content: Redesign MatchArea (Vertical Stack, Animations, Avatars)
    status: completed
    dependencies:
      - style-global
      - assets-move
  - id: ui-bracket-leaderboard
    content: Redesign Bracket and Leaderboard for mobile/light mode
    status: completed
    dependencies:
      - style-global
      - assets-move
---

# UI Redesign & Mobile Optimization Plan

## 1. Asset & Dependency Management

- **Move Assets:** Move `app/avatar/*.jpg` to `public/avatars/*.jpg` so they are accessible via URL `/avatars/1.jpg`.
- **Install Libraries:**
    - `framer-motion`: For smooth animations (fighting, transitions).
    - `lucide-react`: For icons (trophy, swords, back arrow).
    - `clsx`, `tailwind-merge`: For clean className logic.

## 2. Global Styling (Light Mode)

- **File:** [`app/globals.css`](app/globals.css)
    - Reset background to `bg-slate-50`.
    - Set default text to `text-slate-900`.
- **File:** [`app/page.tsx`](app/page.tsx)
    - Update container styling for mobile full-height.

## 3. Component Redesign

### A. StartScreen (`app/components/StartScreen.tsx`)

- **Layout:** Responsive Grid (2 cols on mobile, 4 on desktop).
- **Cards:** White cards with large avatars.
- **Logic:** Filter out Player ID '4'. Hide Strength stat.
- **Animation:** Staggered entry animation.

### B. MatchArea (`app/components/MatchArea.tsx`)

- **Layout:** Vertical Stack (P1 Top, VS Middle, P2 Bottom).
- **Avatars:** Large circular or rounded-square avatars.
- **Stats:** "X Wins" badge styled cleanly (Green pill).
- **Animation:**
    - Shake/Bump animation during "Fighting".
    - Winner gets a "Winner" overlay/glow. Loser grays out.
- **Controls:** Floating action bar or bottom-fixed buttons for mobile reachability.

### C. Leaderboard (`app/components/Leaderboard.tsx`)

- **Layout:** Clean list styling.
- **Tabs/Sections:** Use a segmented control or clear headers for sections (Podium, Qualifiers, Standings, History).
- **Avatars:** Small avatars in list rows.

### D. Bracket (`app/components/Bracket.tsx`)

- **Mobile View:** Vertical list of matchup cards instead of a wide tree? Or a horizontal scroll container. Vertical cards are better for mobile.
- **Styling:** Light mode cards.

## 4. Implementation Steps

1.  **Setup:** Move files, install libs.
2.  **Global:** Set light theme.