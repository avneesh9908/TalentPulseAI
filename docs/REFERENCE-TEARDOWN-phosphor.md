# Reference teardown — rubenmarcus.dev (observed live, 2026-09-24)

Observed in Chrome: `/` (full scroll), `/lab` (full scroll), `/skills`, `/ai`, `/portfolio`,
plus computed CSS variables and the accessibility tree.

**What we take:** the design *language* and layout system — black canvas, phosphor-green
terminal accent, mono micro-typography, numbered sections, bordered stat grids, live-canvas
cards, ticker, dotted-grid backdrop, reveal behaviour.
**What we do NOT take:** their copy, their names, their numbers, their images, their badges
(Awwwards), their MCP/agent endpoints, the audio player and the Human/AI mode switch. Per the
standing project rule (🔴 STITCH REVAMP RULE, 2026-09-24) TalentPulse keeps **its own data and
copy** — only the UI changes.

---

## 1. Design tokens (read from `:root` on the live site)

| Token | Value | Note |
|---|---|---|
| `--bg-0` | `#000000` | true black page |
| `--bg-1` | `rgba(134,239,172,.035)` | surface = *green-tinted translucency*, not a grey |
| `--bg-2` | `rgba(134,239,172,.055)` | raised surface |
| `--line` | `rgba(134,239,172,.1)` | hairline |
| `--line-strong` | `rgba(134,239,172,.18)` | card border |
| `--line-bright` | `rgba(134,239,172,.32)` | hover / active border |
| `--text` / `--cream` | `#f5f1ea` | warm off-white, **not** pure white |
| `--muted` | `rgba(245,241,234,.82)` | body |
| `--muted-soft` | `rgba(245,241,234,.55)` | meta / captions |
| `--accent` | `#00ff41` | phosphor green (CRT), used for state + mono labels |
| `--accent-soft` | `#4ade80` | secondary green |
| `--accent-deep` | `#15803d` | deep green (borders, glows) |
| `--focus` | `rgba(0,255,65,.72)` | focus ring |
| `--content-max` | `1200px` | content column |
| `--gutter-x` | `clamp(1.5rem, 5vw, 3.5rem)` | page gutter |
| `--section-y` | `88px` mobile / `160px` desktop | section rhythm |
| `--radius-card` / `--radius-button` / `--radius-pill` | `16px` / `12px` / `9999px` | |
| `--blur-sm/md/lg` | `10 / 16 / 24px` | glass |
| `--ease-default` | `cubic-bezier(.22,1,.36,1)` | |
| `--ease-emphasis` | `cubic-bezier(.16,1,.3,1)` | |
| `--duration-hover` / `--duration-reveal` | `.22s` / `.64s` | |
| `--font-display` | Uncut Sans → Space Grotesk fallback | headlines |
| `--font-sans` | Gabarito → Inter | body |
| `--font-mono` | JetBrains Mono | **all labels, eyebrows, tags, meta** |

Key insight: there are only **two real colours** — black and phosphor green — plus warm cream
text. Every surface, border and glow is the green at low alpha. That is what makes it read as a
terminal instead of a dark theme.

---

## 2. Structural patterns (the actual clone list)

### P1 · Availability ticker (top of every page)
Full-width marquee strip above the header. Mono, uppercase, letter-spaced, accent green, items
separated by a `+` glyph, one item carries a pulsing dot. Pauses on hover/focus (it is labelled
as a live region for a11y).

### P2 · Floating header
Wordmark left · centred text nav (9 links) · right cluster: locale switch (EN/PT) + 4 icon
links. Sits on a blurred translucent bar, no border until scrolled. Active link gets a short
green underline (seen on `/lab`, `/skills`).

### P3 · Hero (split, full-bleed art right)
Left column: small "Hello, I'm …" line with the name in accent green → oversized display h1
(3 lines, clamp-sized, tight leading) → mono line `I BUILD <accent phrase>` → 68ch body
paragraph → CTA row of three pills: solid cream primary, outlined secondary, and a green-bordered
**mono status pill** with a leading dot and a `↗`. Right: full-bleed duotone image bleeding off
the viewport edge.

### P4 · Numbered section head
Every section opens with a mono eyebrow `01 / HIRE ME`, then a two-column band: giant display
headline left, support paragraph + chip row + a CTA pill right.

### P5 · Offer cards (3-up)
Bordered cards on `--bg-1`: small green icon top-left, `01` index top-right, title, body,
tag chips (mono, pill, hairline border), then a mono `VIEW SCOPE →` link at the bottom.

### P6 · Stat band (4 × 2 bordered grid)
A single bordered rectangle divided by hairlines into 8 cells. Before reveal each value renders
as `——— ——— ———` dashes; on scroll into view it **counts up** to the number. Each label carries a
small green diamond bullet. A mono footnote sits under the grid.

### P7 · Logo marquee
"Selected products and teams" — a row of monochrome logos, green-tinted, scrolling.

### P8 · Chip cloud
The stack list: ~45 pill chips in wrapping rows, hairline border, hover = brighter border.
Same pattern reused on `/portfolio` as **filter chips with counts** (`React 6`, `Next.js 7`) and
an `All 16` active chip, with a `16 of 16 projects` count line underneath.

### P9 · Numbered list rows (blog)
`01 / 02 / 03` rows: index gutter, small generative-art thumbnail, title, dek, mono meta line
(`Aug 2026 · 10 min · #tags`), arrow at the far right, full row hoverable. Ends with an
`All writing →` pill.

### P10 · Terminal / code card
Two columns: prose left; right = a card with a mono filename header (`AGENTS.md`) + `COPY`
button and a monospace body with syntax-dim colouring.

### P11 · FAQ accordion
Rows with a hairline divider and a `+` that rotates; question in display font, answer in body.

### P12 · Closing CTA
Mono eyebrow `05 / CONTACT`, big headline, one line of copy, two CTAs.

### P13 · Decorative bands
Between sections: a band of falling ASCII/glyph "rain" at very low opacity, and a dotted-grid
background layer over the whole page. Headlines render dim and brighten on scroll-in.

### P14 · Lab grid (`/lab`)
2-column grid of **live canvas cards**: index `001` top-right, a live `<canvas>` demo filling the
card, then a mono slug (`flow-field-02`) + ISO date on one line, a 2–3 line description, and two
mono buttons `</> source` and `✦ prompt`. Each canvas is pointer-interactive.

### P15 · Bracketed cards (`/ai`)
Cards whose corners are drawn as four small L-shaped tick marks instead of a full border; inside:
index, title, body, then a mono `proof → …` line.

### P16 · Stat tiles + callout (`/skills`)
A glass callout card with a dotted border and a green status pill, then 4 big-number tiles with
mono captions, then filter chips.

### P17 · Persistent chrome
Sticky side badge (rotated text), bottom-left round icon button, bottom-right segmented toggle.
*(We have no equivalent data for these — skip or repurpose, see §4.)*

---

## 3. Mapping to TalentPulse (UI only, existing copy/data)

| Reference pattern | TalentPulse surface | Data it uses (already exists) |
|---|---|---|
| P1 ticker | Public pages top strip | Real product facts from `landing.tsx` copy (8 roles, 3 difficulty levels, PII stripped, resume-aware) — no invented claims |
| P2 header | `stitch-site-header.tsx` | Same NAV items + auth links |
| P3 hero | Landing hero | Existing beta line, h1, lead, "Get started for free" / "Try the demo" |
| P4 numbered heads | Every landing/practice/find-jobs section | Existing section titles |
| P5 offer cards 3-up | `HERO_POINTS` (3) and the "What you actually get" 6-up | Existing titles/descriptions |
| P6 stat band | **Dashboard** `/user/overview` (total, passed, failed, average, best) | Real API numbers — the count-up we already have (`CountUp`) |
| P7 logo marquee | *Skip* — we have no client logos (honesty) | — |
| P8 chip cloud | Interview **role picker** (8 roles), **skills chips** (n/12), jobs **filters with counts**, profile resume tags | Existing arrays |
| P9 numbered rows | Landing "How it works" 4 steps; dashboard **Recent interviews**; profile **interview history** | Existing rows |
| P10 terminal card | Landing "what it does not do" panel; interview **transcript**; result **per-question feedback** | Existing strings |
| P11 FAQ accordion | Landing FAQ (already `<details>`) | Existing Q/A |
| P12 closing CTA | Existing CTA banner | Existing copy |
| P13 glyph bands | Section dividers on public pages + live interview backdrop | decorative only |
| P14 lab canvas grid | **Product tour** cards on `/practice` (existing tour SVGs in a window frame) — not a fake "lab" | Existing tour items |
| P15 bracketed cards | Dashboard **AI Suggestions**, landing feature grid | Existing items |
| P16 tiles + callout | Profile hero stat pills; jobs setup callout | Real per-user stats |
| P17 side chrome | *Skip* (Awwwards badge, audio, Human/AI switch have no backing) | — |

**Screen-level fit notes**
- `/interview/start` is the strongest fit: a phosphor terminal is exactly right for a live
  transcript feed, waveform, countdown and evaluation-stage list.
- `/jobs` match cards → bracketed cards (P15) with the match % as the big number.
- `/interview/result` → score dial already exists; recolour to phosphor, keep the logic.
- Auth → black card, hairline border, mono field labels.

---

## 4. Things in the reference we must NOT reproduce
- Their copy, headlines, names, portrait and logo wall (theirs, not ours).
- Their numbers (2.85M agent messages, 29 agents, 33K followers…) — TalentPulse has its own
  real numbers and must not borrow social proof.
- Awwwards nominee badge, audio player, Human/AI mode toggle, MCP `/api/hire` endpoint,
  EN/PT locale switch (we ship one language).
- A "Lab" of generative demos: we have no such artefacts. The *card pattern* is reusable; the
  fabricated content is not.

---

## 5. Build order proposed
1. **Tokens** — add a phosphor token set (`--bg-0/1/2`, `--line*`, `--accent*`, cream text,
   mono/display/sans families, radii, easings) next to the existing `st-*` Stitch scale.
2. **Primitives** — extend `src/components/stitch/index.tsx` (same props, new skin) or add a
   parallel `components/phos/` set: Ticker, SectionHead (numbered eyebrow), OfferCard, StatGrid,
   ChipCloud, NumberedRows, TerminalCard, BracketCard, GlyphBand, CanvasCard.
3. **Public pages** — landing → practice → find-jobs (the 1:1 fit with the reference).
4. **Auth** — login/register.
5. **Shell** — sidebar/topbar/focus header.
6. **App screens** — dashboard → jobs → profile → wizard ×3 → live interview → result.

Each step follows the existing method: back up to `docs/backup/<page>-before-phosphor.tsx.txt`,
keep the logic block byte-identical, script-verify every copy string still present, restyle markup
only.
