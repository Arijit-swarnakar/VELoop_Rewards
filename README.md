# VELOOP Rewards Games Platform

An interactive, responsive browser-based gaming and rewards ecosystem built with **React**, **Vite**, **Bootstrap grid & utilities**, and **CSS Modules**.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Quickstart: Setup & Commands](#quickstart-setup--commands)
3. [Stitch Screens & Design Source of Truth](#stitch-screens--design-source-of-truth)
4. [Design Conflict & Resolution Note](#design-conflict--resolution-note)
5. [The 13 Game Catalog & Asset Mapping](#the-13-game-catalog--asset-mapping)
6. [Playable Games Selection & Mechanics](#playable-games-selection--mechanics)
7. [Centralized Game Coin Economy & Redemption](#centralized-game-coin-economy--redemption)
8. [Responsive Viewports & Breakpoints](#responsive-viewports--breakpoints)
9. [Accessibility & Reduced Motion](#accessibility--reduced-motion)
10. [Deployment Guide (Vercel & Netlify)](#deployment-guide-vercel--netlify)

---

## Overview & Architecture

The VELOOP Rewards Games platform provides an arcade discovery carousel, dedicated game home and instruction guides for all 13 titles, real canvas-powered gameplay for two selected games, and a centralized Game Coin conversion center.

### Core Tech Stack
- **Framework**: React 18 with Vite 5
- **Styling**: Component-scoped CSS Modules (`*.module.css`) + CSS variables in `src/index.css`
- **Routing**: `react-router-dom` v6
- **Typography & Icons**: Google Fonts (`Outfit`, `Sora`, `Inter`) and Google Material Symbols Outlined
- **Audio**: Web Audio API oscillator synthesis (zero external audio file dependencies)

### Directory Structure
```
d:/Veloop_Rewards/
├── public/
│   └── assets/
│       └── images/               # 13 Game banners + Token & Coin artwork + Redemption icons
├── src/
│   ├── components/
│   │   ├── BladeMasterGame/      # Canvas knife-throwing target engine & HUD
│   │   ├── BlockCrushGame/       # Canvas retro brick breaker engine & HUD
│   │   ├── BottomNav/            # Fixed mobile/desktop bottom navigation
│   │   ├── CarouselDots/         # Accessible dot indicators with ARIA attributes
│   │   ├── GameCard/             # Reusable card with 20-Token cost & Play Now shimmer
│   │   ├── GamesCarousel/        # Horizontal carousel with drag, touch & autoplay pause
│   │   ├── Header/               # Top bar with live Game Coin & Token balances
│   │   ├── PlayNowButton/        # Shimmer button respecting prefers-reduced-motion
│   │   └── TokenCost/            # Token pill with transparent token artwork
│   ├── context/
│   │   └── GameContext.jsx       # Centralized demo wallet, balance state & redemption
│   ├── data/
│   │   └── games.js              # Complete catalog of 13 games and redemption tiers
│   ├── pages/
│   │   ├── ExplorePage.jsx       # Category filtering, search, sorting & interactive daily quests (/explore)
│   │   ├── GameHomePage.jsx      # Game detail & entry page (/games/:gameId)
│   │   ├── GameInstructionsPage.jsx # Stitch dark instructions for Blade Master & light guide for all 13
│   │   ├── GamePlayPage.jsx      # Match session manager, token check, pause, revive & game-over
│   │   ├── GamesPage.jsx         # Discovery page with horizontal carousel
│   │   ├── LeaderboardPage.jsx   # Global & per-game podium, tournament season & rankings (/leaderboard)
│   │   └── RedeemPage.jsx        # Rewards Store, 7-day streak calendar, Lucky Spin & redemption (/rewards, /redeem)
│   ├── App.jsx                   # Route declarations
│   ├── main.jsx                  # Entry point with BrowserRouter & GameProvider
│   └── index.css                 # Global CSS variables, design tokens & reset
├── stitch/                       # Retrieved HTML references and screenshots from Stitch MCP
└── VELOOP_Games_Build_Checklist.md # Master build checklist
```

---

## Quickstart: Setup & Commands

### Prerequisites
- Node.js 18+ (tested on Node v20+)
- npm 9+

### Install Dependencies
```bash
npm install
```

### Run Locally (Development Server)
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```
Build output is generated into the `dist/` directory with optimized bundles.

### Preview Production Build
```bash
npm run preview
```

---

## Stitch Screens & Design Source of Truth

The Stitch project **Veloop Rewards Games Carousel** (`17475145110574708318`) provided 5 visual reference screens, retrieved and saved in `stitch/`:

| Stitch Screen Title | Screen ID | Reference File | Implementation Match |
| :--- | :--- | :--- | :--- |
| **Games - VELOOP Rewards** | `ed19d6ea358c4f0cae3ac474f295cf5c` | `stitch/html/03_games_veloop_rewards.html` | Discovery Page (`/`) at desktop 1440px / 1280px |
| **Games Carousel - Tablet** | `5aac0d58ee9c4350be418c78872a684d` | `stitch/html/01_games_carousel_tablet.html` | Discovery Page (`/`) at tablet 1024px / 768px |
| **Blade Master - Game Instructions & Play (Dark)** | `ac9d9a4fa7604613b0c3842e9edebbc6` | `stitch/html/04_blade_master_dark.html` | `/games/blade-master/instructions` (Desktop) |
| **Blade Master - Game Instructions (Mobile)** | `156fc7cbd3a74086bed60ce6bb8e07ed4` | `stitch/html/05_blade_master_mobile.html` | `/games/blade-master/instructions` (Mobile < 576px) |
| **Blade Master - Game Instructions (Tablet)** | `cffd1dbc9127428eb721ba56f618f1c1` | `stitch/html/06_blade_master_tablet.html` | `/games/blade-master/instructions` (Tablet 768–1024px) |

---

## Design Conflict & Resolution Note

> **Deliberate Design Conflict Handling**:
> - The product specification PDF calls for individual game environments to utilize a light theme.
> - The Stitch visual source screen for **Blade Master** is explicitly titled `Blade Master - Game Instructions & Play (Dark)` and is styled with a deep dark navy theme (`#101221`), glowing accents, tactical briefing cards, and high-tech typography.
> - **Resolution**: As directed by the master implementation prompt, we preserve the supplied Stitch screen appearance **exactly** for all Blade Master screens (Dark Theme). For the other 12 games and unspecified screens, we apply the modern clean styling following the PDF guidelines.

---

## The 13 Game Catalog & Asset Mapping

All 13 supplied game banner images were mapped and integrated without reconstructing artwork in HTML:

| # | Game Title | ID / Route Slug | Genre | Banner Asset Path | Playable? | Instructions Route |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- |
| 1 | **Blade Master!** | `blade-master` | Action Target | `/assets/images/game-01-blade-master.jpeg` | **Yes** (Playable 1) | `/games/blade-master/instructions` |
| 2 | **Nutcraft** | `nutcraft` | Twist Puzzle | `/assets/images/game-02-nutcraft.jpeg` | Preview | `/games/nutcraft/instructions` |
| 3 | **Bowlexa** | `bowlexa` | Sports Arcade | `/assets/images/game-03-bowlexa.jpeg` | Preview | `/games/bowlexa/instructions` |
| 4 | **Block Crush** | `block-crush` | Retro Breaker | `/assets/images/game-04-block-crush.jpeg` | **Yes** (Playable 2) | `/games/block-crush/instructions` |
| 5 | **Slice Storm** | `slice-storm` | Slash Combo | `/assets/images/game-05-slice-storm.jpeg` | Preview | `/games/slice-storm/instructions` |
| 6 | **Cosmo Warrior** | `cosmo-warrior` | Space Defense | `/assets/images/game-06-cosmo-warrior.jpeg` | Preview | `/games/cosmo-warrior/instructions` |
| 7 | **Toilet Tactics** | `toilet-tactics` | Comedic Arcade | `/assets/images/game-07-toilet-tactics.jpeg` | Preview | `/games/toilet-tactics/instructions` |
| 8 | **Word Hunto** | `word-hunto` | Word Search | `/assets/images/game-08-word-hunto.jpeg` | Preview | `/games/word-hunto/instructions` |
| 9 | **Bubble Blast Legend** | `bubble-blast-legend` | Bubble Shooter | `/assets/images/game-09-bubble-blast-legend.jpeg` | Preview | `/games/bubble-blast-legend/instructions` |
| 10 | **Merge Master!** | `merge-master` | Merge Puzzle | `/assets/images/game-10-merge-master.jpeg` | Preview | `/games/merge-master/instructions` |
| 11 | **Wormzy** | `wormzy` | Puzzle Adventure | `/assets/images/game-11-wormzy.jpeg` | Preview | `/games/wormzy/instructions` |
| 12 | **Aqua Fill!** | `aqua-fill` | Draw Puzzle | `/assets/images/game-12-aqua-fill.jpeg` | Preview | `/games/aqua-fill/instructions` |
| 13 | **Realm Clash!** | `realm-clash` | Strategy Battle | `/assets/images/game-13-realm-clash.jpeg` | Preview | `/games/realm-clash/instructions` |

---

## Playable Games Selection & Mechanics

### 1. Blade Master! (`/games/blade-master/play`)
- **Status**: Mandated by Stitch reference screens.
- **Mechanics**:
  - Rotating target wood log with variable angular velocity.
  - Stage progression (Stage 1 requires 5 daggers; Stage 2 requires 7; Stage 3+ introduces dynamic direction and speed reversals).
  - Dagger projectile physics launched via tap, mouse click, or Spacebar.
  - Embedded dagger collision detection: striking an existing blade produces spark particle physics and triggers Game Over.
  - Bonus targets: rotating apples and coin tokens grant bonus multipliers (+50 coins each).
  - Sound synthesis: realistic blade launch, hit, and deflect sound effects via Web Audio API.

### 2. Block Crush (`/games/block-crush/play`)
- **Selection Rationale**: Chosen from the 12 remaining catalog games because retro brick breaker mechanics translate cleanly into high-performance, responsive canvas gameplay across touch and mouse/keyboard without requiring 3D assets.
- **Mechanics**:
  - Interactive paddle controlled via mouse move, touch drag, or Left/Right arrow keys.
  - Numbered prismatic bricks with hitpoint durability (1 to 3 hits). Bricks decrement their counter and flash brightly upon impact.
  - Power-up system: dropped power-ups include Fire Ball (penetrates bricks without deflecting), Multi Ball (spawns 3 balls), Wide Paddle (+50% paddle width), and Coin Drops (+30 coins).
  - 3 Lives system with heart display HUD.
  - Level progression: clearing all bricks advances to faster, more complex brick matrices.

---

## Centralized Game Coin Economy & Redemption

All pages share a unified state store powered by `GameContext.jsx` with persistent `localStorage` synchronization:

### Economy Rules
1. **Match Entry Stake**: Exactly **20 Tokens** deducted once upon entering gameplay.
2. **Double-Deduction Guard**: A `useRef` latch prevents accidental double charges on rapid clicks or re-renders.
3. **Insufficient Token Handling**: When a player has fewer than 20 Tokens, starting a match displays an Insufficient Balance modal with a direct shortcut to the `/redeem` conversion center.
4. **Revive Policy**: 1-time free revive per match session that restores life/stage without charging additional tokens.
5. **No Thanks / Reward Collection**: Ends the match, calculates the game's reward (+ base 200–250 coins + bonus coins collected), calls `addCoins()` once, logs the result to session history, and navigates back to game home with balance immediately updated.

### Conversion Center (`/redeem`)
The redemption page allows players to convert their earned Game Coins into VELOOP ecosystem rewards:

| Reward Item | Illustrative Demo Rate | Conversion Effect |
| :--- | :--- | :--- |
| **VE Coins** | 100 Game Coins = 1 VE | Adds to redemption history |
| **SVE Coins** | 200 Game Coins = 1 SVE | Adds to redemption history |
| **Gems** | 150 Game Coins = 1 Gem | Adds to redemption history |
| **Tokens** | 50 Game Coins = 1 Token | **Directly refills Token wallet** & updates balance |
| **Spin Vouchers** | 300 Game Coins = 1 Spin | Adds to redemption history |

---

## Responsive Viewports & Breakpoints

The application has been verified across the explicit CSS pixel widths required:

| Viewport Width | Target Category | Layout Behavior |
| :--- | :--- | :--- |
| **1920 px & 1600 px** | Large Desktop | Content centered within max-width container (1440px); multiple cards visible. |
| **1440 px & 1280 px** | Standard Desktop | Matches Stitch desktop composition; card widths 330px with 16px gaps. |
| **1366 px** | Laptop | Fluid gutters; no clipped headers or action areas. |
| **1024 px** | Tablet Landscape | Matches `01_games_carousel_tablet.html`; multiple cards with partial preview. |
| **768 px** | Tablet Portrait | Matches `06_blade_master_tablet.html`; comfortable touch targets and visible next-card peek. |
| **430, 390, 375, 360 px**| Mobile Devices | Mobile-first single-card emphasis, stacked token requirements, and responsive HUD. Matches `05_blade_master_mobile.html`. |
| **320 px** | Minimum Mobile | Zero horizontal page overflow; carousel overflow is contained cleanly. |

---

## Accessibility & Reduced Motion

- **Keyboard Navigation**: All carousel cards, buttons, dots, modal dialogs, and controls are reachable and operable via keyboard (`Tab`, `Enter`, `Space`, `ArrowKeys`, `Escape`).
- **Focus Rings**: High-contrast, visible focus indicators on all interactive elements.
- **Carousel Controls**: Autoplay automatically pauses on `:hover`, `:focus`, pointer drag, or touch.
- **`prefers-reduced-motion`**:
  - Carousel continuous autoplay is disabled for users requesting reduced motion.
  - The Play Now button shimmer animation stops, displaying a solid high-contrast metallic gradient.
- **Color Contrast**: All typography adheres to WCAG AA/AAA contrast ratios against deep backgrounds (`#161827` and `#101221`).

---

## Deployment Guide (Vercel & Netlify)

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel` (or connect via GitHub repository in the Vercel Dashboard).
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Single-Page Application (SPA) routing rewrite configuration is pre-configured via `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
4. Run `vercel --prod` to deploy.

### Netlify Deployment
1. Connect repository in Netlify Dashboard.
2. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. For SPA client-side routing, create a `public/_redirects` file:
```
/*    /index.html   200
```
4. Deploy the site.
