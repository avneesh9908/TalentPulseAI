# The prompt — "make every page production-mature"

Paste everything between the rules below into Claude Code. It is written in the
structure Claude follows most reliably: role → context → hard constraints →
definition of done → exhaustive per-page and per-state specs → measurable
acceptance criteria → verification commands → phased delivery.

Run it **phase by phase** (it tells Claude to stop between phases). Running it
as one shot will produce a huge unreviewable diff.

---

<role>
You are a senior product designer and frontend engineer working on TalentPulseAI,
a candidate-facing AI mock-interview and job-search product. Your standard of
reference is a mature commercial SaaS product: Linear, Vercel, Stripe Dashboard,
Coderbyte, Flowmingo. Your job in this task is not to make the app prettier —
it is to make it *complete*, so that no user on any device, in any state, on any
connection, ever sees a screen that is broken, blank, ambiguous, or lying.
</role>

<context>
## Stack
- React 19.2 + TypeScript 5.9 (strict, zero `any`) + Vite 7.2
- React Router v7 (all routes lazy-loaded)
- Tailwind CSS 3.4 (`darkMode: ["class"]`) + Framer Motion 12
- Radix UI primitives, shadcn-style, `cn()` from `src/lib/utils.ts`
- React Hook Form 7 + Zod 4 available but currently unused; Recharts 3.5 on the dashboard
- Backend: FastAPI. Frontend talks to it only through `src/api/*Service.ts` over `axiosInstance`.

## The design system already exists. Reuse it. Do not invent a parallel one.
Read these three files first and treat them as law:
- `src/index.css` — the token layer
- `tailwind.config.js` — type scale, radii, elevation
- `Frontend/document/UI_AUDIT_AND_REDESIGN_PLAN.md` — why the system looks the way it does

**Colour tokens** (all `rgb(var(--x) / <alpha-value>)`, defined once per theme):
`ink`, `ink-muted`, `ink-subtle`, `ink-inverse` · `canvas`, `surface`, `surface-strong` ·
`border`, `border-strong` · `accent` (+ `accent-hover`, `accent-text`, `accent-soft`, `accent-fg`) ·
`success`, `warning`, `danger` (each + `-soft`).

**Type scale**: `text-display / h1 / h2 / h3 / h4 / lead / body / small / overline`.
Inter Variable. **Sentence case everywhere** — uppercase is permitted only on the
11px `.overline` label.

**Radii**: 4 values only — `rounded-sm` 6px, `rounded-md` 8px, `rounded-lg` 12px,
`rounded-xl` 16px, plus `rounded-full` for pills.

**Elevation**: `shadow-e1 … shadow-e4`. Layered micro-shadows. Never glows.

**Layout**: `.wrap` (1120px), `.wrap-narrow` (736px), `.section` / `.section-tight`.

**Existing primitives in `src/components/ui/`** — extend these, don't duplicate:
`button` (variants primary|ink|secondary|subtle|ghost|danger|link × sizes sm|md|lg|icon|icon-sm,
plus `pill` and `block`), `panel` (Panel/PanelHeader/PanelTitle/PanelDescription),
`section` (Section/SectionHeading), `badge`, `stat`, `empty-state`, `page-header`,
`field` (Field/TextInput/Select), `data-table` (TableWrap/Table/Th/Td/Tr), `stepper`,
`dialog`, `dropdown-menu`, `avatar`, `separator`, `label`, `input`, `form`.
Plus `src/components/brand/logo.tsx` and `src/components/landing/product-frame.tsx`.

## Routes you own (complete list, from `src/App.tsx`)
| Route | File | Access |
|---|---|---|
| `/` | `app/pages/landing.tsx` | public |
| `/practice` | `app/pages/practice.tsx` | public |
| `/find-jobs` | `app/pages/find-jobs.tsx` | public |
| `/demo` | redirect → `/interview/select-role` | public |
| `/auth/login` | `app/pages/auth/login.tsx` | public |
| `/auth/register` | `app/pages/auth/register.tsx` | public |
| `/dashboard` | `app/pages/dashboard/dashboard.tsx` | protected |
| `/profile` | `app/pages/profile/profile.tsx` | protected |
| `/interview/select-role` | `interview/select-role.tsx` | protected, step 1 |
| `/interview/select-profile` | `interview/select-profile.tsx` | protected, step 2 |
| `/interview/quick-setup` | `interview/quick-setup.tsx` | protected, step 3 |
| `/interview/start` | `interview/interview-now.tsx` | protected, step 4 |
| `/interview/result` | `interview/interview-result.tsx` | protected |
| `/jobs` | `app/pages/jobs/jobs.tsx` | protected |
| `/users` | `app/pages/users/users.tsx` | protected (admin) |
| `*` | 404 fallback | public |

Shared shells: `components/landing/site-header.tsx` + `site-footer.tsx` (public),
`app/pages/protected-layout.tsx` + `components/header.tsx` + `components/app-nav.tsx` (app).
</context>

<non_negotiables>
Violating any of these means the work is rejected, however good it looks.

1. **Behaviour and logic are frozen.** Do not change API calls, payload shapes,
   route paths, auth flow, context providers, state machines, or step guards. This
   is a presentation and state-coverage task. If a fix genuinely requires touching
   logic, stop and ask first.
2. **No raw palette classes in any file.** Zero occurrences of `slate-*`, `gray-*`,
   `violet-*`, `cyan-*`, `emerald-*`, `amber-*`, `rose-*`, `red-*`, `blue-*`, etc.
   Only semantic tokens. Verify with the grep in `<verification>`.
3. **No `isDark ? "…" : "…"` colour ternaries.** `useTheme().isDark` may only pick a
   Sun/Moon icon or an aria-label. Theme switching is the token layer's job.
4. **No gradients as decoration.** A runtime count of gradient-backed elements must
   stay at 0 on every page. No blur orbs, no glow shadows, no cursor-follow glows,
   no marquees, no `bg-clip-text`.
5. **Sentence case.** No uppercase headings. `.overline` labels only.
6. **Never display data the product cannot produce.** No invented metrics, logos,
   testimonials, ratings, notification counts, or activity feeds. If a section has no
   real data source, either delete it or render it behind an explicit `Badge`
   reading "Example" / "Sample". State this decision in your report for each one.
7. **Never assert emptiness you have not verified.** A failed fetch renders "couldn't
   be loaded — retry", never "no interviews yet". A pending fetch renders a skeleton,
   never an empty state. This bug has shipped here before.
8. **Do not restructure `/dashboard`'s layout.** Its section arrangement is the
   owner's; two rewrites were rejected. You may restyle, add states, and swap data
   sources in place. You may not move, merge, rename or remove its sections.
9. **Honour `prefers-reduced-motion`.** The global `<MotionConfig reducedMotion="user">`
   in `main.tsx` covers Framer variants but NOT `style={{ y }}` scroll transforms,
   `clipPath`, or CSS keyframe animations — gate those with `useMotionSafe()`.
10. **No new dependencies without asking.** Propose, state the gzip cost, wait.
11. **Budget**: initial JS for `/` stays ≤ 160 kB gzip; CSS ≤ 15 kB gzip.
12. **Comments**: only where the *why* is non-obvious. No comment blocks, no docstrings.
</non_negotiables>

<definition_of_mature>
"Mature" here means eight specific things. Every page is judged against all eight.

1. **Every state is designed.** Loading, empty, partial, error, offline, success,
   permission-denied, and not-found each have deliberate visuals — not a spinner and
   not a blank div.
2. **Feedback is immediate and reversible.** Every action that mutates something shows
   pending state on the control that triggered it, then confirms with a toast, then
   offers undo where the backend allows it. Destructive actions confirm first and name
   the exact thing being destroyed.
3. **Nothing shifts.** Skeletons reserve the final height. Images have dimensions.
   CLS < 0.1. Content appearing must not push what the user is reading.
4. **Keyboard and screen reader complete.** Every interactive element is reachable by
   Tab in visual order, has a visible focus ring, and is announced correctly. Dialogs
   trap focus and restore it on close. Live regions announce async results.
5. **Density is deliberate.** 15px body, 13px secondary, 11px labels. Generous
   whitespace between groups, tight within them. Tabular numerals for all numbers.
   Dates and durations formatted consistently by shared helpers.
6. **Copy carries its weight.** Labels are verbs. Errors say what happened, why, and
   what to do next. Empty states explain the value and offer the first action. No
   exclamation marks. No "Oops". No blame.
7. **Responsive down to 320px and up to 1920px.** No horizontal page scroll ever;
   wide tables scroll inside their own container. Touch targets ≥ 44px on mobile.
8. **It works on a bad connection.** Slow requests show progress after 500ms, warn
   after 8s, and offer retry on failure. Nothing hangs forever. Nothing double-submits.
</definition_of_mature>

<global_state_matrix>
Apply this matrix to **every** route in the table above. For each cell, either
implement it or write one line in your report saying why it cannot occur here.

**Data states**
- `initial` — before any fetch resolves → skeleton matching final layout, `aria-busy`
- `empty` — server confirmed zero rows → `EmptyState` with cause + primary action
- `partial` — some fields null/absent → placeholders, never `undefined` or `NaN` on screen
- `truncated` — list capped (e.g. "showing 5 of 23") → disclose the cap, offer the rest
- `stale` — data older than the current filter/tab → show what it reflects
- `success` — after a mutation → toast + optimistic or refetched row

**Failure states**
- network unreachable / DNS
- 401 → session expired: preserve the intended destination, redirect to login, return after
- 403 → not permitted: explain, don't dead-end
- 404 → resource gone: offer the list it came from
- 422 → surface per-field messages onto the fields
- 500 → generic, with retry and a way out
- timeout — including the documented Render cold-start (~50s > 30s axios timeout): show
  "the server is waking up, this can take up to a minute", keep retry available
- browser capability missing — Web Speech API unsupported, camera/mic denied,
  `sessionStorage` blocked, WebGL absent

**Interaction states**
- every button: default / hover / active / focus-visible / disabled / **pending**
- every input: default / focus / filled / invalid / disabled / readonly
- every row: default / hover / selected / busy
- forms: pristine / dirty / submitting / submitted / server-rejected;
  block double-submit; warn on unsaved-changes navigation

**Environment states**
- viewports 320 / 375 / 414 / 768 / 1024 / 1280 / 1440 / 1920
- light and dark
- `prefers-reduced-motion: reduce`
- browser zoom 200% (WCAG 1.4.4) and text-only zoom
- long content: 60-char unbroken email, 200-char job title, 40 skill chips, 100-row table
- keyboard-only, and NVDA/VoiceOver reading order
</global_state_matrix>

<primitives_to_build>
These are missing and are the reason pages currently improvise. Build them first, in
`src/components/ui/`, token-driven and theme-aware, before touching any page.

1. `toast.tsx` — the app has **no** notification system; success and failure are
   currently silent or inline-only. Provide `useToast()` with `success|error|info`,
   auto-dismiss (error persists), max 3 stacked, `role="status"` / `role="alert"`,
   pause on hover, keyboard-dismissible. Mount the viewport once in `App.tsx`.
2. `skeleton.tsx` — `<Skeleton>` plus `SkeletonText`, `SkeletonPanel`, `SkeletonRow`,
   `SkeletonStat`. Must accept explicit height so layout is reserved.
3. `alert.tsx` — inline banner, tones `info|success|warning|danger`, optional title,
   optional action, optional dismiss. Replaces the hand-rolled error divs currently
   duplicated across five interview screens.
4. `confirm-dialog.tsx` — built on the existing `dialog.tsx`. Names the target,
   states consequences, distinguishes reversible from permanent, danger-styled
   confirm, focus trapped and restored, Escape cancels.
5. `tabs.tsx` — Radix tabs, token-styled, keyboard arrows, URL-synced via search param.
6. `tooltip.tsx` — Radix, 300ms delay, touch-safe (long-press or omit on touch),
   never the only source of information.
7. `pagination.tsx` — page size, range label ("1–10 of 47"), prev/next, disabled ends.
8. `progress.tsx` — determinate bar + `Spinner` with `aria-label`, sizes sm/md.
9. `breadcrumb.tsx` — for the interview wizard and job detail depth.
10. `sheet.tsx` — mobile drawer for filters and detail panels that are side-by-side on desktop.
11. `copy-button.tsx` — copies text, confirms inline for 2s (for `public_id`, interview ids).
12. `kbd.tsx` — keyboard-shortcut hint chips.
13. `form-error-summary.tsx` — on submit failure, a focusable summary listing invalid
    fields as links to them (WCAG 3.3.1 pattern).
14. `src/lib/format.ts` — single source for `formatDate`, `formatShortDate`,
    `formatRelative`, `formatDuration`, `formatScore`, `formatCount`, `truncate`.
    Three pages currently define their own date helpers; consolidate them.
15. `src/hooks/use-async.ts` — one hook returning
    `{ data, error, isLoading, isRefetching, retry }` so every screen's fetch
    lifecycle is identical instead of five bespoke `useState` triples.
</primitives_to_build>

<per_page_requirements>

### `/` — parent landing (public)
Job: explain both sides in 10 seconds and route the visitor into one.
- Announcement bar must be dismissible and remember dismissal (localStorage).
- Hero: one h1, one subhead, two CTAs, one trust line. Product visual must have a
  reserved aspect ratio so nothing reflows on load.
- Add a "who it's for" section (student / switching stack / actively interviewing) —
  visitors self-select, and it replaces missing social proof honestly.
- FAQ items must be real `<details>` (works without JS), one open at a time optional.
- Footer must include a real privacy statement link target, even if the page is a stub.
- 404-proof every internal link; no `href="#"` placeholders anywhere.
- Scenarios: JS disabled (content still readable), slow images, 320px, dark, reduced motion.

### `/practice` and `/find-jobs` — product pages (public)
Job: one side each, deep enough to convince, cross-linked to the other.
- Identical section rhythm to each other and to `/`: eyebrow → h2 → subhead → proof → one link.
- Each feature claim must map to something in the codebase. Delete any that don't.
- Add a short "what it does not do" block — the single strongest maturity signal
  available to a product without customer logos (job agent never auto-submits;
  interview scores are guidance, not a hiring decision).
- Sticky secondary CTA on scroll past the hero, mobile only, dismissible.

### `/auth/login` and `/auth/register`
- Password field: reveal toggle, caps-lock warning, `autocomplete` correct, paste allowed.
- Register: password strength meter (length + variety, no third-party lib), inline
  "email already registered → log in instead?" on 409, phone format hint per country prefix.
- Form-level error summary focused on submit failure; per-field errors linked via
  `aria-describedby`; first invalid field focused.
- Rate-limit / lockout response handled with a countdown, not a generic error.
- Cold-start: after 8s show "the server is waking up, this can take up to a minute".
- Success: redirect to the originally requested route, not always `/dashboard`.
- Do not add real OAuth. The Google buttons are inert placeholders — either mark them
  "coming soon" and disable them, or remove them. A live-looking dead button is the
  single most immature thing on these pages.
- Scenarios: autofill, 1Password overlay, 320px keyboard-open viewport, submit-on-Enter.

### `/dashboard` — the hub (protected) — LAYOUT FROZEN
- Keep every section exactly where it is. Restyle and add states only.
- Feed the four stat tiles, the chart, and the recent list from `GET /user/overview`
  (already used by `/profile`) so the two pages stop contradicting each other.
- Sections with no backing data (skill radar, upcoming interviews, achievements,
  AI suggestions) must carry a visible "Example" badge and a one-line note. Ask before
  removing any of them.
- `CountUp` is scroll-triggered and displays `0` until it enters the viewport — a
  lingering `0` is indistinguishable from a fact. Add an opt-in `startOnMount` prop and
  use it wherever the number is real.
- States: skeleton for each tile/chart/list; zero-interviews first-run state that
  teaches the next action; fetch failure banner that keeps the shell usable;
  chart with 1 point, 2 points, and 0 points.
- Chart must be keyboard-focusable with an accessible data table alternative.

### `/profile` — account (protected)
- Keep the three-partition layout (Account | Interviews | Resumes) — it was designed
  to fit one viewport, verify it still does at 1600×900.
- `public_id` gets a `CopyButton`.
- "Change password" is currently a fully-styled dead button. Either implement the form
  against a real endpoint (ask first — none exists) or mark it disabled + "coming soon".
- Interview history: pagination or "load more" past 5, and disclose the true total.
- Resume delete: confirm dialog naming the file, stating that completed reports survive,
  and that the action is permanent. Row shows pending state. Toast on success.
- Resume viewer: make explicit it shows extracted text, not the original PDF. Handle
  empty extraction, very long text (scroll inside the dialog), and fetch failure.
- States: fetch failure must say "couldn't be loaded", never "no interviews".

### `/interview/select-role` (step 1)
- Search: debounce, clear button, result count, `aria-live` announcement, no-match empty state.
- Role cards are `<button>`s with `aria-pressed`; arrow-key navigation across the grid.
- Remove the invented "120 Qs" style counts unless a real number exists.
- Sticky confirm bar must not cover the last row (bottom padding is already there — verify at 320px).
- Restoring a saved draft must be visible: "picking up where you left off" + a way to start fresh.

### `/interview/select-profile` (step 2)
- Upload: drag-over state, wrong-type rejection with reason, oversize rejection naming
  the limit, upload progress, parse-in-progress state (this can take 30s+ — say so),
  parse failure distinguishing "no text layer / scanned PDF" from "server error",
  and a preview of what was extracted before continuing.
- "Use existing profile" is disabled — the disabled reason must be visible, not just dimmed.
- Step guard redirect must explain itself rather than silently bouncing.

### `/interview/quick-setup` (step 3)
- Skills: 12-cap enforced with a visible reason at the cap, duplicate rejection, paste
  of a comma-separated list, keyboard removal (Backspace on empty input removes last chip).
- Submit can take 60s+ (RAG + LLM). Show staged progress ("indexing your resume" →
  "generating questions"), disable the form, and never allow double-submit.
- Submit failure must preserve every selection.

### `/interview/start` (step 4) — the highest-risk screen
- Permission states: camera+mic granted / denied / dismissed / no device / in use by
  another app. Each needs recovery instructions, and the interview must remain
  completable by typing when speech is unavailable.
- `Web Speech API` unsupported (Safari, Firefox) is a first-class state, not a footnote.
- Question generation in flight: skeleton + honest "this can take up to a minute".
- Timer: visible, warns at 20s, announces via `aria-live` at 60s/20s/0s, never silently
  advances without telling the user what happened.
- Auto-advance on silence must be cancellable and must never lose the current transcript.
- Leaving mid-interview must warn that answers are not saved server-side until submit.
- Submit: progress, success confirmation, and a recovery path if navigation to the
  report fails (the sessionStorage fallback already exists — surface it).
- Tab-away / backgrounded tab: keep recording state coherent; explain on return.
- Must be usable at 768px (currently a two-column desktop layout) and in landscape phone.

### `/interview/result`
- Score needs an interpretation, not just a number ("72 — solid; sharpen the two
  weakest answers"). Band thresholds come from the existing `scoreTone` helper.
- Per-question list: expand/collapse, show the question text, the answer given, the
  signals expected, and the feedback. Currently only ids and scores are shown.
- Unanswered questions must appear as unanswered, not be silently omitted.
- Add export/share as print stylesheet (`@media print`) — cheap, and very mature.
- Deep-link / refresh with no state → the sessionStorage fallback, then a clear
  "report not found, open it from your profile" with a link.

### `/jobs` — job agent (protected)
- Setup mode: resume required — empty state links to upload. Designation chips need
  the same interaction rules as the skills field.
- Search run takes up to 120s: staged progress, cancellable if the API allows,
  and a result summary ("scanned 6 companies, 3 new matches").
- Match table: sortable by score/date, filter chips reflect counts, `aria-sort`,
  sticky header, row pending state on status change, optimistic status update with
  rollback on failure, and pagination past ~25 rows.
- `pending_reason` must be legible as an instruction, not a log line.
- Zero-matches-after-a-successful-run is a distinct state from never-run — say which.
- Mobile: table becomes a card list, not a horizontal scroll graveyard.

### `/users` — admin
- It is currently a bare list. Give it a `PageHeader`, `DataTable`, search, pagination,
  empty state, error state, and a "you don't have access" state for non-admins.
- Do not add mutations.

### `*` — 404, plus two shells
- Build a real 404: what happened, the likely intended destination, search or nav out.
- Add an app-level 500 boundary distinct from the existing top-level `ErrorBoundary`,
  so a crash inside one route keeps the header and nav usable.
- Add an offline indicator in the app header driven by `navigator.onLine`.
- `protected-route.tsx` currently renders a bare spinner while auth resolves — make it
  a skeleton of the app shell so the transition doesn't flash.
</per_page_requirements>

<copy_rules>
- Voice: plain, specific, second person. British or American spelling — pick one and be consistent.
- Buttons are verbs: "Start interview", "Delete resume", "Retry". Never "OK", "Submit", "Click here".
- Errors follow: **what happened → why (if known) → what to do**.
  Good: "Couldn't load your interviews. The server didn't respond. Retry, or come back in a minute."
  Bad: "Error: request failed", "Oops! Something went wrong 😞"
- Empty states: what would be here, why it's worth having, and the button that starts it.
- Never blame the user. Never use "invalid" alone — say what valid looks like.
- No exclamation marks. No emoji in product chrome.
- Numbers always with units and tabular figures. Dates via `src/lib/format.ts` only.
</copy_rules>

<acceptance_criteria>
Every item must be demonstrably true before a phase is reported complete.

**Automated**
- `npx tsc --noEmit` → clean
- `npx eslint src --ext .ts,.tsx` → no new errors (2 pre-existing in `button.tsx`/`form.tsx` are allowed)
- `npx vite build` → passes; `/` initial JS ≤ 160 kB gzip; CSS ≤ 15 kB gzip
- Raw-palette grep returns **zero** matches across `src/app` and `src/components`
- `isDark ?` grep returns matches **only** for icon/aria-label switching

**Measured in the browser, per page, light and dark**
- 0 elements with a gradient background image
- 0 WCAG AA contrast failures (4.5:1 body, 3:1 large text ≥24px or ≥18.66px bold)
- `document.documentElement.scrollWidth <= window.innerWidth` at 320/375/768/1280/1920
- 0 console errors and 0 console warnings
- 0 broken images
- Every focusable element has a visible focus ring (outline or ring width > 0)
- Tab order matches visual order
- All form controls have an associated `<label for>` or `aria-label`
- Every `<img>` has `alt` (empty for decorative)
- Landmarks present: one `<main>`, `<nav>` labelled, `<h1>` exactly once per page
- Heading levels never skip
- Touch targets ≥ 44×44 CSS px at 375px width
- With `prefers-reduced-motion: reduce`: no transform/opacity animation runs, no
  infinite loops, no canvas mounts

**Per state**
- Each state in `<global_state_matrix>` is either reachable in the running app or
  explained as impossible, in writing, in your report.
</acceptance_criteria>

<verification>
Run these. Paste real output in your report — do not describe it.

```bash
cd Frontend && npx tsc --noEmit
cd Frontend && npx eslint src --ext .ts,.tsx
cd Frontend && npx vite build
```

Token compliance:
```bash
cd Frontend/src && grep -rnE '(text|bg|border|from|to|via|ring|divide|placeholder|shadow)-(slate|gray|zinc|neutral|stone|violet|cyan|emerald|amber|rose|red|blue|indigo|fuchsia|teal|purple|pink|sky|orange|yellow|lime|green)-[0-9]+' --include=*.tsx app components
```
```bash
cd Frontend/src && grep -rn 'isDark ?' --include=*.tsx app components
```

Live checks — start the dev server with the preview tooling (never `npm run dev` in a
shell), then for every route run a script that reports: gradient-element count,
contrast failures with the offending colour pairs, `scrollWidth - innerWidth` at each
breakpoint, console errors, broken images, missing labels, and focus-ring coverage.
Toggle `.dark` on `<html>` and re-run — **wait 400ms after toggling**, because
`transition-colors` means an immediate read returns the pre-transition colour and
will report false failures.

Protected routes need a login. Ask the owner to sign in on the preview rather than
entering credentials yourself, then audit `/dashboard`, `/profile`, `/jobs`,
`/interview/*`, `/users` the same way.

Simulate failure honestly: stop the backend and reload each protected page to prove the
error states are real, not theoretical.
</verification>

<delivery>
Work in these phases. **Stop after each one, report, and wait for approval.**

- **Phase 1 — Primitives.** Everything in `<primitives_to_build>`, plus `lib/format.ts`
  and `hooks/use-async.ts`. Wired into nothing yet. Include a temporary
  `/kitchen-sink` route rendering every primitive in every state for review, to be
  deleted at the end.
- **Phase 2 — Shells and global states.** `protected-layout`, `header`, `app-nav`,
  `site-header`, `site-footer`, 404, route-level error boundary, offline indicator,
  toast viewport, session-expiry handling.
- **Phase 3 — Auth.** `login`, `register`, `protected-route`.
- **Phase 4 — Interview wizard.** All four steps plus the result page. Highest risk;
  the live-interview screen gets its own report section.
- **Phase 5 — Jobs.**
- **Phase 6 — Profile, dashboard, users.** Dashboard last, and layout stays frozen.
- **Phase 7 — Public pages.** `/`, `/practice`, `/find-jobs`.
- **Phase 8 — Final audit.** Full matrix across every route, both themes, five
  breakpoints. Delete `/kitchen-sink`. Report remaining gaps with the reason each
  cannot be closed in code.

Per-phase report format:
1. Files touched, one line each on what changed and why
2. States implemented, as a table: page × state × how to reach it
3. States judged impossible, with the reason
4. Verification output, pasted verbatim
5. Anything you changed that touches behaviour (should be nothing — flag it loudly if not)
6. Decisions you made that the owner might disagree with
7. What you deliberately did not do

Commit per phase, conventional-commit subject, body explaining the *why*. Do not push
unless asked.
</delivery>

<questions_to_ask_before_starting>
Answer these yourself only if the codebase answers them. Otherwise ask:
1. Is there a real password-change endpoint, or should "Change password" be disabled?
2. Should the inert Google OAuth buttons be disabled-with-label or removed?
3. May the un-backed dashboard sections (skill radar, upcoming, achievements,
   AI suggestions) be removed, or must they stay behind "Example" badges?
4. Is `/users` genuinely admin-only, and how is admin determined? There is no role
   field in the user model.
5. British or American spelling?
6. May the ten now-unused showpiece components and `app/pages/userProfile.tsx` be deleted?
</questions_to_ask_before_starting>
