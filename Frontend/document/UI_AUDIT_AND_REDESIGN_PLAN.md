# TalentPulseAI — UI maturity audit & redesign plan

Date: 2026-08-03
Inputs: live teardown of **coderbyte.com** and **flowmingo.ai** (computed styles, DOM, content structure) + full audit of our own frontend.

---

## 1. What the reference sites actually do (measured, not guessed)

### 1.1 Coderbyte — enterprise-credible

| Dimension | Measured value |
|---|---|
| Type | Inter. H2 56px/64px weight 500, ls −0.56px. H3 48px/60px weight 700, ls −0.48px. **Sentence case, never uppercase.** |
| Ink | `#03263B` (deep navy) used as the "black" — not pure #000 |
| Canvas | `#FFFFFF` + one off-white surface `#F6F8FB` (27 uses). That's it. |
| Accent | `#3388FF` / `#44CCFF` — 3 uses each, illustration + highlight only |
| Buttons | Pill (radius 50px), padding 20/24, label **10px / weight 600 / letter-spacing 2px / uppercase**, solid navy fill, no gradient |
| Page length | 17,096px — long, but every section is one claim + one proof |
| Structure | announcement bar → hero w/ rotating keyword → "TRUSTED BY 3,000+" → 5 product pillars (each = eyebrow + 3 bullets + LEARN MORE + real product UI) → 500+ skill logo wall → role previews → challenge-type grid → anti-cheat grid (10 items) → integrations → 4.5★ + named testimonials + case studies → footer |

**Maturity signal:** every claim is backed by a number, a logo, a screenshot, or a named person.

### 1.2 Flowmingo — modern-minimal (Apple grammar)

| Dimension | Measured value |
|---|---|
| Type | SF Pro Display / system stack. Body 16px. Section labels 14px/600. Sentence case. |
| Ink | `#171717` body, `#1D1D1F` headings |
| Canvas | `#FFFFFF` + `#F5F5F5` surface. Saturated colour appears **twice on the whole page**, at 10% alpha. |
| Radius | **8px is the token** (21 uses). Pills reserved for buttons. |
| Buttons | Full pill, `radial-gradient(53% 128% at 36.4% −18.1%, #6D6F73, #04080D)` charcoal, 12/24 padding, 14px/500, **5-stop micro-shadow ramp** (0.557px → 1.7px …) — reads as a physical object |
| Container | max-width **1024px** (860/980 for text) — narrow and readable |
| Page length | 9,480px — half of Coderbyte |
| Nav | Mega-menu grouped under labels (LEARN / TOOLS / TRY IT / INDUSTRIES), each link with a one-line description |
| Trust | announcement bar, "GDPR Compliant" badge, "BACKED BY LEADING INVESTORS", "OUR PARTNERS", pain-empathy section, 20-row SEO footer, 11 "vs competitor" comparison pages |

### 1.3 The seven things both do that we do none of

1. **Restraint.** One ink, one neutral surface, one accent. Colour marks *meaning*, never decoration.
2. **Sentence-case headings** in a neutral grotesque. No uppercase display type.
3. **Real product proof** — screenshots of actual UI in every feature block.
4. **One component vocabulary** — a single button system, one card, one radius.
5. **Trust scaffolding** — logos, ratings, named people, compliance, integrations, comparisons.
6. **Small UI type (13–14px) + large whitespace.** Confidence is shown by restraint, not size.
7. **Section rhythm:** eyebrow → heading → 2-line subhead → 3 bullets → one link. Repeated verbatim.

---

## 2. Audit of our current UI (measured)

```
file                                   isDark?  gradients  radii  arbitrary  slate-*
landing.tsx                              17        17        5       31        15
practice.tsx                             17        16        5       30        16
find-jobs.tsx                            20        12        3       28        22
dashboard.tsx                            87        27        4        1        27
profile.tsx                              21         5        4        9        43
jobs.tsx                                  0         4        5       13        89
select-role.tsx                          32        13        4        9        15
select-profile.tsx                       45        12        4        8        16
quick-setup.tsx                          46         8        4       17        26
interview-now.tsx                        23         2        3       42        46
interview-result.tsx                     31         3        4        5        56
login.tsx / register.tsx                 39         2        3       12        33
header.tsx                               25         4        3        0        36
                                        ────      ────             ────       ────
TOTAL                                    443       125               205       470
```

Radius vocabulary in use: `rounded-full` ×102, `xl` ×91, `lg` ×75, `2xl` ×65, `md` ×22, `3xl` ×6, `sm` ×5, `[2rem]` ×2 — **8 competing radii**.
Type scale in use: 9 named sizes + **8 different `clamp()` arbitraries** for headings alone.

### Root causes of "looks immature"

| # | Problem | Evidence |
|---|---|---|
| R1 | **Gradient as decoration, not meaning.** 125 `gradient-to-*`. Violet→fuchsia→cyan on buttons, icons, bullets, text, borders, glows. | landing.tsx:251, 261, 294, 550 |
| R2 | **Uppercase display type at 7rem.** Poster energy where the references use 48–56px sentence case. | `text-[clamp(2.75rem,8vw,7rem)] uppercase` |
| R3 | **No token layer in practice.** 470 hardcoded `slate-*` classes + 443 `isDark ? … : …` ternaries bypass the shadcn tokens that already exist in index.css. Theming is copy-pasted per element. | dashboard.tsx (87 ternaries) |
| R4 | **8 radii, 17 type sizes, ad-hoc shadows.** No two pages agree on what a card looks like. | table above |
| R5 | **Fabricated trust.** "50K+ Interviews", "85% Success Rate", "4.9★", 3 invented testimonials. Both references only cite verifiable proof. Fake numbers actively *reduce* credibility. | landing.tsx:78–89 |
| R6 | **No product screenshots.** Abstract SVG art stands in where the references show the real product. | assets/landing/*.svg |
| R7 | **Effects budget spent everywhere.** Cursor-follow glow, scroll progress bar, marquee, card-stack fan, flip ring, parallax, blur orbs — all on one page. Mature sites spend motion on *one* moment. | landing.tsx, practice.tsx |
| R8 | **App screens ≠ marketing screens.** The logged-in product has no dedicated UI language (no page-header, no data-table, no empty-state, no form pattern). Dashboard is still mock data contradicting the real profile page. | dashboard.tsx |

---

## 3. Plan

### Phase 1 — Centralize (the "make UI central" step)

Nothing visual ships until there is one source of truth.

**1a. Token layer** — `src/index.css` + `tailwind.config.js`
- Semantic colours only: `ink`, `ink-muted`, `ink-subtle`, `canvas`, `surface`, `surface-strong`, `border`, `border-strong`, `accent`, `accent-fg`, `success`, `warning`, `danger` — each defined once for light and once for dark. No component may reference `slate-*` again.
- Radius: `--r-sm 6px / --r-md 8px / --r-lg 12px / --r-xl 16px / pill`. Four values, not eight.
- Elevation: `shadow-e1 … e4`, multi-stop ramps in the Flowmingo manner (physical, not glowy).
- Type scale (8 steps): `display / h1 / h2 / h3 / body-lg / body / small / overline`, each with size+leading+tracking locked. Kills all 8 clamp arbitraries.
- Motion: reuse existing `lib/motion.ts` durations; cap decorative motion to one element per page.

**1b. Primitive components** — `src/components/ui/`
- `button.tsx` — rebuild: variants `primary | secondary | ghost | danger | link`, sizes `sm | md | lg`, `pill` flag. One shadow ramp. Replaces ~40 hand-rolled `<motion.button className="...gradient...">`.
- `card.tsx` → `Panel` — one border, one radius, one surface, optional header slot.
- New: `section.tsx` (`Section` + `SectionHeading` with eyebrow/title/subtitle), `badge.tsx`, `stat.tsx`, `empty-state.tsx`, `page-header.tsx`, `field.tsx` (label+input+error, replaces per-page form markup), `data-table.tsx`.
- All theme-aware via `dark:` + tokens. **`isDark` ternaries deleted, not migrated.**

**1c. Guard rails** — an eslint `no-restricted-syntax` rule (or a documented convention) banning raw `slate-*`/`violet-*` in page files, so the system can't erode again.

### Phase 2 — Marketing surfaces
`landing.tsx`, `practice.tsx`, `find-jobs.tsx`, `site-header.tsx`, `site-footer.tsx`
- Rebuild on the Section/Panel/Button vocabulary; sentence-case headings; one accent.
- Nav → grouped mega-menu (Flowmingo pattern) since we already have 6+ destinations.
- Replace fabricated stats/testimonials with honest framing ("Built on your own resume", "Free while in beta") or clearly-labelled sample data.
- Replace abstract SVG art with real product screenshots (captured from our own running app).
- Motion budget: hero entrance + one scroll reveal per section. Delete cursor glow, marquee, flip ring, progress bar.

### Phase 3 — Product surfaces
`auth/*`, `dashboard`, `profile`, `jobs`, `interview/*`
- One app shell: `PageHeader` (title + subtitle + primary action) on every screen.
- Interview wizard → a real stepper component shared by all 3 steps.
- Forms → `Field`; tables → `DataTable`; empty/error → `EmptyState`.
- Dashboard: keep the layout the user approved, change **only** colours/spacing/typography to the new system (per the "don't restructure the dashboard" lesson).

### Phase 4 — Review
- Self-review pass: token compliance grep (0 raw `slate-*` in pages), contrast check (WCAG AA on every text/bg pair), keyboard/focus-visible pass, reduced-motion pass, 375 / 768 / 1440 / 1920 reflow check, bundle budget.
- Live verification on the dev server (DOM + computed styles; screenshots when the browser pane is visible).

### Phase 5 — Final market-standard review
- Side-by-side scoring against Coderbyte and Flowmingo on the seven maturity signals in §1.3, with the gaps that remain listed explicitly.

### Hard constraints (carried from prior sessions)
- Visual layer only — no logic, no API, no routing changes.
- Honour `prefers-reduced-motion`; keep the global `MotionConfig`.
- Don't restructure the dashboard's section layout.
- Initial JS budget ≤ 160 kB gzip for the home route (currently ~161).

---

## 4. Open decision

Direction of the new visual language:

- **A — Enterprise credible (Coderbyte-like):** navy ink `#0B2233`, single blue accent, white + `#F6F8FB`, Inter, pill buttons with tiny uppercase labels. Reads: trusted, sold to companies.
- **B — Modern minimal (Flowmingo-like):** near-black `#171717`, charcoal pill buttons, white + `#F5F5F5`, system/Inter, 8px radius, micro-shadows, 1024px container. Reads: premium consumer product.
**DECIDED 2026-08-03: Direction C**, and fabricated proof replaced with honest claims.

- **C — Synthesis (chosen):** B's restraint and component grammar as the base, with **one** retained brand accent (a single violet, no gradient) so the product is still recognisably ours, plus Coderbyte's proof-driven section rhythm. Our product is candidate-facing (B2C) while both references are recruiter-facing (B2B) — a warmer single accent suits our audience better than pure monochrome.

---

## 5. Result — what shipped (2026-08-03)

### The central system (`src/index.css`, `tailwind.config.js`, `src/lib/utils.ts`)
- **Tokens** as `rgb(var(--x) / <alpha-value>)` so `/50` opacity works (the old `hsl(var(--x))` tokens silently failed on any alpha).
  `ink / ink-muted / ink-subtle / ink-inverse · canvas / surface / surface-strong · border / border-strong · accent(+hover/text/soft/fg) · success / warning / danger (+soft)`, each defined once per theme.
- **Type scale**: `display / h1 / h2 / h3 / h4 / lead / body / small / overline`, sizes + leading + tracking locked. Font is Inter Variable (self-hosted). All 8 heading `clamp()` arbitraries are gone.
- **Radii**: 4 values (6 / 8 / 12 / 16) + pill. `2xl`/`3xl` collapse into the scale so stray usages stay in system.
- **Elevation**: `shadow-e1…e4`, layered micro-shadows in the Flowmingo manner.
- **Layout**: `.wrap` (1120px) / `.wrap-narrow` (736px) / `.section` — two measures, one rhythm.
- **tailwind-merge extended** with our fontSize and shadow groups. Without it `cn()` read `text-small` as a colour and dropped `text-accent-fg` from every button — dark text on a violet fill. This was caught live, not by the compiler.

### Primitives (`src/components/ui/`)
`Button` (5 variants × 5 sizes × pill/block) · `Panel` · `Section`/`SectionHeading` · `Badge` · `Stat` · `EmptyState` · `PageHeader` · `Field`/`TextInput`/`Select` · `TableWrap`/`Table`/`Th`/`Td`/`Tr` · `Stepper` · `Logo` · `ProductFrame`.

### Screens converted
Marketing: `landing`, `practice`, `find-jobs`, `site-header`, `site-footer`.
Product: `auth/layout`, `login`, `register`, `header`, `app-nav`, `protected-layout`, `protected-route`, `error-boundary`, `select-role`, `select-profile`, `quick-setup`, `interview-now`, `interview-result`, `profile`, `jobs`, `users`, `dashboard` (colour/typography only — layout untouched, per the two rejected merges).

### Honesty changes
- Removed "50K+ interviews", "85% success rate", "4.9★", "6 roles per resume", "0 spam applications", "92% top match", and 3 invented testimonials.
- Removed the "advanced cheating detection & behaviour analysis" claim (the product has none).
- The one remaining fabricated block — the job status table on `/find-jobs` — is now labelled **Example**.
- Header notifications no longer show three invented alerts; the empty state says "You're all caught up."
- Added an FAQ with answers that match what the code actually does (pricing, PII stripping, question source, assisted-not-automatic applying).

### Fixed in passing
- `select-profile.tsx` called `useState` **after** a conditional early return (hook-order bug flagged in a prior session). Hooks now run before the step guard.
- `select-role.tsx` "Back to dashboard" was a dead button; it navigates now.
- Dead "Skip for now" / "← Back" buttons removed from the wizard.
- `interview-result.tsx` manual-memoization lint error resolved by dropping a `useMemo` that memoized a date format.

### Verification
| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint src` | 2 errors, both **pre-existing at HEAD** (`button.tsx`, `form.tsx` react-refresh export rule — confirmed by stashing) |
| `vite build` | passes |
| Home route JS | 150.22 + 3.63 = **153.9 kB gzip** (budget 160; was ~146 — shared primitives hoisted into the entry chunk) |
| CSS | 11.68 kB gzip (was 12.16) |
| Gradient elements at runtime | **0** on `/`, `/practice`, `/find-jobs` (was ~17 on `/` alone) |
| WCAG AA contrast | 0 failures across `/`, `/practice`, `/find-jobs`, `/auth/login` (13–15 distinct fg/bg pairs each), light **and** dark |
| Horizontal overflow | none at 375 / 768 / 1280; the wide job table scrolls inside its own container |
| Broken images / console errors | 0 |
| `--ink-subtle` | darkened to `#6A6F79` after it measured 4.40:1 on the surface tone |

## 6. Final review against the reference sites

| Maturity signal (§1.3) | Before | Now |
|---|---|---|
| 1. Restraint — one ink, one surface, one accent | 125 gradients, 4-colour brand | ✅ 0 gradients, single `#6D3BF5` accent |
| 2. Sentence-case headings, neutral grotesque | 7rem uppercase Space Grotesk | ✅ Inter, 64px/600/−0.032em, sentence case (uppercase only on 11px overlines, as Coderbyte does on button labels) |
| 3. Real product proof | abstract SVG art | 🟡 in-app art now framed in an app window, but these are still illustrations, not screenshots |
| 4. One component vocabulary | 8 radii, 17 sizes, ad-hoc buttons | ✅ 4 radii, 9-step scale, 13 shared primitives |
| 5. Trust scaffolding | fabricated | 🟡 fabrications removed, FAQ + privacy statement added — but no logos, ratings, named customers or compliance page exist to cite yet |
| 6. Small UI type + whitespace | 16–20px body, poster type | ✅ 15px body / 13px small / 11px overline; page height 3,793px vs Coderbyte 17,096 and Flowmingo 9,480 |
| 7. Repeated section rhythm | every section different | ✅ eyebrow → heading → subhead → 3 bullets → one link, everywhere |

**Remaining gaps (not fixed — each needs something the code can't invent):**
1. **Real screenshots.** Capture `/dashboard`, `/interview/start` and `/jobs` with real data once logged in, and swap them into `ProductFrame`.
2. **Social proof.** Logos, a rating, a named customer, a security/compliance page and comparison pages are what both references lean on hardest. They need real users.
3. **Dashboard data.** Still mock, and it now visibly contradicts the real `/profile` numbers. The layout is deliberately untouched; only the data source needs changing.
4. **Protected screens are not live-verified.** They pass typecheck, lint, build and the token grep, but nobody logged in — verifying them needs credentials entered by you.
5. **Dead code.** `app/pages/userProfile.tsx` is unrouted and unconverted; ten showpiece components (`card-stack`, `marquee`, `circular-flip-gallery`, `image-swiper`, `image-auto-slider`, `interactive-selector`, `limelight-nav`, `social-icons`, `testimonials`, `arc-gallery-hero`) now have zero importers. They still get scanned by Tailwind. Safe to delete on your say-so.
6. **Two pre-existing eslint errors** in `button.tsx` / `form.tsx` were left alone.
