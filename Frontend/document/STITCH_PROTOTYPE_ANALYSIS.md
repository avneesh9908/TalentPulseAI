# Stitch prototype analysis — 2026-08-05

Source: Google Stitch preview `6460829871356169998?node-id=d3f51c43f9d1496fb4a5995f7d2e2b7f`.
The preview is **auth-gated** — it renders inside a cross-origin `app-companion-430619.appspot.com`
iframe and paints nothing for an anonymous viewer, so this analysis is derived from **8 screenshots
supplied by the user**, not from the live DOM. Measurements below are read off the images and are
therefore approximate where noted. A screen recording was also supplied but could not be read
(no video decode, no `ffmpeg` available).

---

## 1. The eight screens

| # | Screen | Shell | Notes |
|---|---|---|---|
| 1 | Developer dashboard | Left sidebar | Our real copy ("Your hub for both sides…"), our real email |
| 2 | Enterprise "Overview" | Left sidebar + topbar | AI-readiness ring, skill heatmap, activity timeline |
| 3 | Jobs / Recommended Jobs | Left sidebar + search topbar | Job cards + "AI Top Picks" rail |
| 4 | Live interview session | Full-bleed session bar | Code pane / video / transcript / AI insights |
| 5 | Tech Stack & Preferences (step 2 of 2) | Minimal top bar | Chip pickers + seniority slider |
| 6/7 | Select your target role | Minimal top bar + 3-step stepper | Role card grid (two zoom levels of one screen) |
| 8 | Resume parse result | **Horizontal top nav** | Document skeleton + extracted-signal cards |

Screens 5–8 are the interview funnel; 1–3 are the logged-in app; 4 is the live session.

---

## 2. Visual language

### Colour
- **Accent is VIOLET, not blue.** Solid controls read ≈ `#6D28D9`–`#7C3AED`; accent type ≈ `#6D28D9`;
  soft fills ≈ `#EDE9FE` / `#F5F3FF`. This is the hue we **retired on 2026-08-05** when the
  wireframes doc moved us to `#2563EB`. See §5 — this is the one blocking conflict.
- **Neutrals are lavender-tinted, not pure grey.** Canvas ≈ `#F8F7FE`, sidebar ≈ `#F7F5FE`,
  surface `#FFFFFF`, border ≈ `#EDEBF5`. Our current neutrals are hue-neutral (`#FAFBFC`, `#EBEDF1`).
- Status: success green (`+12%` chips), danger red (`-5%`, "End Session", live-recording dot),
  amber/orange for the "Suggested Follow-up" insight rail. Same three-status model we already have.
- **Zero gradients** anywhere — flat fills only. Matches our current rule.

### Type
- Single humanist sans throughout — indistinguishable from Inter at these sizes. No second family.
- **Sentence case on every real page heading** ("Select your target role", "Tech Stack & Preferences",
  "Recommended Jobs", "High-Fidelity Signal").
  The one uppercase heading (screen 1, `WELCOME BACK, …`) is our own *retired* BOLD style, which Stitch
  reproduced from an older screenshot of our dashboard. **Do not treat it as a design instruction.**
- 11px uppercase tracked labels used as section overlines (`OVERALL AI READINESS`, `STEP 2 OF 2`,
  `PERFORMANCE INSIGHTS`, `LIVE TRANSCRIPT`, `CONFIDENCE SCORE: 94%`) — identical role to our `.overline`.
- Monospace only for the session timer and the code pane.
- Ladder observed ≈ display 40 / h2 28–30 / h3 20–22 / h4 16–17 / body 14–15 / small 12–13 /
  overline 11. Within ~1–2px of our shipped scale at every step.

### Shape & depth
- Radii: cards ~12px, nested cards ~10px, icon tiles ~10px, buttons ~8–10px, chips/badges pill.
  Consistent with our 6/8/12/16 + pill scale.
- Depth is carried by **1px borders**, not shadow. Only the popover-ish elements lift. The whole
  prototype sits inside a rounded "device" bezel — that is Stitch's presentation frame, **not** a
  component to build.
- Icon tile pattern repeats constantly: ~36–40px rounded square, accent-soft fill, accent glyph.

### Motifs that recur
1. **Icon tile + label + value** — stat cards, launcher cards, panel headers.
2. **Delta badge** top-right of a stat (green up / red down).
3. **Coloured left rail** on an insight/alert card (violet = positive, amber = advisory).
4. **Right-hand rail** ~300px wide beside a main column (Upcoming, AI Top Picks, AI Analysis).
5. **Pill chip as both filter and multi-select option** (tech stack, job tags, difficulty).
6. **Dashed-border card** for a "start something" affordance (the two dashboard launchers).

---

## 3. What we already have

The prototype's component vocabulary maps almost 1:1 onto primitives that are **already built** —
several of them still unwired since 2026-08-05:

| Prototype element | Our primitive | State |
|---|---|---|
| Stat card + delta badge | `ui/stat` (`delta`/`deltaTone`) | wired |
| 3-step numbered stepper | `ui/stepper` | wired |
| Insight card w/ colour rail | `ui/alert` | **unwired** |
| AI-readiness donut | `ui/score-ring` | **unwired** |
| Skill heatmap bars | `ui/progress` | **unwired** |
| Document skeleton preview | `ui/skeleton` | **unwired** |
| "AI Analysis" loading dots | `ui/spinner` | **unwired** |
| Tech-stack chip pickers | `ui/chips-input` | **unwired** |
| Filter selects | `ui/field` (Select) | wired |
| Job / role cards | `ui/panel` | wired |
| Match %, difficulty, tags | `ui/badge` | wired |
| Buttons (solid/outline/link/danger) | `ui/button` | wired |
| Section overlines | `.overline` | wired |
| Horizontal tabs (screen 8 nav) | `ui/tab-nav` | **unwired** |

**Genuinely missing, would need building:**
- **Sidebar app shell** (§4) — the largest gap.
- **Topbar** with global search + bell + avatar.
- **Activity timeline** (dot rail + timestamp + text).
- **Line chart with a dashed target series** — Recharts is already a dependency; the dashboard chart
  currently has no benchmark line.
- **Growth-trajectory bar chart** (4 bars, increasing accent saturation).
- **Code pane** with line numbers + syntax highlighting (no highlighter dependency today).
- **Video call control dock** (mute / camera / chat / hangup).

So the redesign is **~70% assembly of existing primitives + one new shell**, not a rebuild.

---

## 4. The structural change: sidebar shell

Today logged-in screens use a **sticky top `Header` + `AppNav`** (Home · Dashboard · Interview · Jobs,
sliding pill, `layoutId="app-nav-pill"`), decided 2026-07-17.

The prototype replaces that with a **~230px left sidebar**: brand block (logo tile + product name +
role subtitle), a vertical nav list, and — in screen 2 — a pinned bottom group (Invite Team / Help
Center / API Docs). Screen 4 (live session) uses **no** nav at all, and screen 8 uses a **horizontal**
top nav. So the prototype is internally inconsistent about the shell; it is not one system.

Two further inconsistencies to resolve before building:
- **Active nav state differs between mocks**: screen 1 uses an accent-*soft* pill with accent text;
  screen 3 uses a *solid* accent pill with white text. Pick one (solid reads more decisive and
  survives dark mode better).
- **Sidebar nav items don't match our routes.** Screen 1 lists Dashboard / My Interviews / Schedule /
  Achievements / Notifications; screen 3 lists Dashboard / Interviews / Jobs / Profile / Settings.
  Only screen 3's set is buildable — and only after dropping Settings (no settings page exists).

---

## 5. Conflicts with the shipped design system

Raising these before any code, per the project rule to surface conflicts rather than overwrite.

1. 🔴 **Accent hue.** The prototype is violet. We deliberately moved violet → blue `#2563EB` on
   2026-08-05, retuned every neutral to match, and verified 0 AA failures in both themes. Switching
   back to violet is a one-token change *plus* a re-verification of the three constraints that boxed
   the dark accent in (white label ≥4.5:1; ≥3:1 against both `canvas` and `surface-strong`). It is
   cheap but it is a reversal — needs the user's word.
2. 🟠 **Tinted neutrals.** Lavender-tinted greys are a second token change (canvas/surface/border).
   Coherent with a violet accent; wrong with a blue one. Decide together with #1.
3. 🟠 **Sidebar vs top nav.** Reverses the 2026-07-17 IA decision. Also note `/dashboard`,
   `/profile`, `/jobs` and the 5 interview screens all currently render inside `protected-layout`,
   so the swap is one shell file + a padding change, not 20 page rewrites.
4. 🟡 **Uppercase dashboard heading** (screen 1) is our retired BOLD style echoed back. Keeping our
   sentence case.
5. 🟡 **Dark mode is absent** from the prototype. We ship both themes and audit both. Every value
   above needs a dark counterpart we invent, not copy.

---

## 6. Honesty audit — prototype content with no feature behind it

Standing project rule: only claims the code backs may ship. The prototype invents a lot. Building it
literally would put fabricated capability back on screen 6 weeks after we stripped it out.

**Whole features that do not exist:**
- `€0` credits chip → no billing, no metering.
- **Schedule / Upcoming Interviews / "3 scheduled" / "Join" / "Prepare Now"** → no scheduling anywhere.
  An interview is created and taken in one sitting.
- **Achievements** → no such model.
- **Notifications page** → header has an empty-state popover only.
- **Settings page** → does not exist.
- **Enterprise Tier / Engineering Org / Invite Team / API Docs / Help Center** → no orgs, teams,
  public API, or docs site. (Same recruiter-side fiction as the *rejected* wireframes turn 5.)
- **Global "Search insights…"** → no search endpoint.
- **Code editor + live coding assessment** → not a product feature.
- **Live AI analysis during the interview / "Inject into chat" / interviewer view of "Candidate: Alex Chen"**
  → scoring happens *after* submit, in one batch. There is no live channel and no recruiter seat.
- **Video call UI** → we record locally via MediaRecorder into an object URL for playback; nothing is
  streamed or uploaded, and there is no second participant to mute.
- **"DevAssess AI"** branding on screens 2 and 8 → wrong product name.

**Fields/metrics we don't produce:**
- Salary ranges, company logos, "Showing 42 results" → `JobListing`/`JobMatch` carry no salary or logo.
- `CONFIDENCE SCORE: 94%`, `Experience Vector`, `Seniority Level Staff (L6)`, `Total Tenure 8.5 Yrs`,
  `Domain Fit`, `Growth Trajectory`, `Extracted Behavioral Cues` → the parser extracts *text sections*
  (summary/experience/projects/skills/…). None of these scores exist.
- `Skill Assessment Heatmap` per-area percentages → scoring returns one overall score plus per-question
  feedback, not per-skill percentages.
- `Overall AI Readiness 88/100`, `Top 12%`, `Pre-cleared` → no percentile or clearance concept.
- Dashboard stats/chart/upcoming are the **known-mock** dashboard data, still contradicting `/profile`.

**Details that contradict real behaviour:**
- "Select up to **3** core languages" → our cap is **12** skills (`quick-setup.tsx:68`).
- Seniority **slider** Junior→Staff → experience is a discrete enum.
- **5** role cards → we ship **8** roles.
- Screen 8's tab set (Dashboard / Resume / Interviews / Reports) → no Reports section.

**Real and safe to build:** difficulty badges, match %, resume upload + parse, chip skill selection,
role grid, the 3-step wizard, per-question feedback, job status transitions, score + band.

---

## 6b. What was built (2026-08-05)

Decisions taken: **violet + the prototype's colours**, **match it closely**, **leave the fiction out**.

Shipped: P0 tokens (violet accent, lavender neutrals — with `accent-soft` one step lighter than the
prototype's `#EDE9FE`, which failed AA by 0.02, and the dark ring/progress track darkened to
`#1A1826` to fit violet into the three-way dark constraint), P1 the sidebar shell + topbar + a
`chrome="focus"` wizard bar, part of P2 (`score-ring` on the result page, `spinner` on the route
fallback), and P5's in-place dashboard changes — dashed launcher cards, accent-soft icon tiles,
token-driven Recharts, and removal of the dashboard's **duplicate** 256px sidebar (all content
sections kept).

Still open: P4 (jobs table → card list with match badges), and the rest of P2 —
`skeleton` / `alert` / `chips-input` / `tab-nav` / `progress` are still unwired.

Verified live in both themes: 0 AA failures across `/`, `/dashboard`, `/interview/select-role`,
`/profile`, `/jobs`, `/interview/result`; 0 gradients; no overflow at 375 or 1440.

## 7. Recommended build order (no code written yet)

Phased, cheapest-and-safest first, each independently shippable:

- **P0 — token decision.** Violet + tinted neutrals, or keep blue? One `index.css` block either way,
  then re-run the contrast audit in both themes. Blocks nothing else visually.
- **P1 — sidebar shell.** New `components/app-sidebar.tsx` + rework `protected-layout.tsx`; topbar with
  bell + avatar (no search until there is a search). Nav = Dashboard / Interview / Jobs / Profile,
  solid active pill, `layoutId` preserved. Mobile: drawer, since 230px doesn't fit 375px.
- **P2 — wire the eight idle primitives** into the screens that already need them: `score-ring` +
  `progress` on the result page, `skeleton` while the resume parses, `alert` for fetch failures,
  `chips-input` in quick-setup, `spinner` on the loading states, `tab-nav` on profile.
- **P3 — funnel polish** (screens 5–7): role grid selected-state, chip pickers, stepper rail — these
  are close to what we ship already, mostly spacing and the selected-card treatment.
- **P4 — jobs page** table → card list + match badge + tag pills. Right rail **only** if we drop the
  invented "AI Top Picks" copy or back it with real match reasons (we do store `match_reasons`).
- **P5 — dashboard.** ⚠️ Two merge attempts were rejected on look (2026-07-30). Do **not** restructure
  it again without an explicit go-ahead. The dashed launcher cards and delta badges are safe,
  in-place changes.
- **Not planned:** live-session 3-column layout, code pane, video dock, enterprise screens,
  scheduling, achievements — all fiction. Only if the underlying features get built.

---

## 8. Verification notes for whoever builds this

- **Freeze transitions before auditing colour in the Browser pane** — it doesn't composite frames, so
  `transition-colors` elements report the pre-toggle colour forever
  (`*{transition:none!important;animation:none!important}`). This produced 12 phantom dark-mode
  failures last time. Screenshots also time out in this environment; assert via DOM.
- **Home-route budget has 1.3 kB of gzip headroom** (158.7 kB against a 160 kB target). The sidebar
  lands on protected routes, not `/`, so it shouldn't touch that number — confirm after building.
- Any new custom `text-*` scale key must be registered in `lib/utils.ts`'s `extendTailwindMerge`
  fontSize group, or `cn()` will silently drop colour classes.
- Filled danger/status controls take `text-danger-fg`, never `text-white` (dark `danger` is a light red).
