# TalentPulseAI — "Simple 3D" UI Design Prompt

Paste any single phase below into a UI-generation tool (Stitch, v0, Lovable, Figma AI, etc.)
on its own, or paste Phase 0 once as the style system and then each phase after it. Screens,
components and states referenced here are the full functional spec in
[UI-REQUIREMENTS.md](UI-REQUIREMENTS.md) — this document adds the *look*.

Core idea: **simple, not decorated** — one accent colour, one typeface, no illustration
clutter — but every surface reads as a physical, lightly-raised object instead of a flat
rectangle. Depth comes from elevation and light, not from noise.

---

## Phase 0 — Style DNA (paste first, applies to every screen)

> Design a clean, minimal product UI with a soft "3D card" aesthetic — think physical,
> slightly-raised plastic/glass panels floating a few millimetres above a pale lavender
> canvas, lit from the top-left. Keep the palette restrained: a near-white lavender canvas
> (#FBF8FF), a single deep-violet accent (#540DDD light mode / #7C3AED dark mode), and warm
> near-black ink text (#1A1B22) — no gradients except a faint radial glow behind hero
> visuals. Dark mode is a true neutral near-black (#0A0A0B), not violet-tinted; the accent is
> reserved for selection/focus/brand, never smeared across backgrounds.
>
> Elevation system (3 tiers only):
> 1. **Resting** — cards sit 1 level above canvas: soft ink-tinted shadow, 8–12px blur, 2px
>    offset, plus a crisp 1px border one shade darker than the card fill (the border reads
>    as the object's edge, the shadow reads as its lift).
> 2. **Raised (hover/active)** — shadow grows to 16–24px blur, offset increases slightly,
>    element lifts 2px (`translateY(-2px)`) and scales 1.01–1.02. This is the *only* motion
>    cue — no spin, no bounce.
> 3. **Pressed** — shadow tightens back down, element scales to 0.98 for ~100ms — a real
>    button-press feel.
>
> Corners: 16px on cards/panels, 999px (pill) on buttons and chips, 12px on inputs.
> One typeface (Inter), three weights only (regular/medium/semibold). Generous whitespace —
> when in doubt, remove an element rather than add a border to separate it.
>
> 3D accents, used sparingly (never more than one per screen):
> - Hero sections get one isometric/3D-rendered illustration (device + avatar + floating UI
>   chips), built in 3 depth layers (background blurred + desaturated, midground sharp,
>   foreground casts a shadow onto the midground) — not a flat SVG icon blown up.
> - Feature/role/step icons are small 3D-rendered glyphs (soft-shaded, single light source)
>   sitting in a rounded tile with its own resting shadow — not line icons.
> - Selectable cards (role, difficulty, experience) tilt subtly toward the cursor on hover
>   (max 4–6°, CSS 3D `perspective` + `rotateX/Y`) and lift — picking up a physical card.
> - Score ring / progress bar render as a grooved inset track (like a dial cut into the
>   surface) with a glossy accent fill — not a flat stroke.
> - Buttons have a 1px inner top highlight (`inset 0 1px 0 rgba(255,255,255,.4)`) suggesting
>   a bevel, on top of the resting/raised/pressed shadow system above.
>
> Guardrails: respect `prefers-reduced-motion` (disable tilt/lift, keep colour/opacity
> changes only). Never use 3D effects on dense data (tables, lists, forms) — those stay flat
> cards with only the resting elevation, so the depth language highlights *decisions* and
> *moments*, not busywork.

---

## Phase 1 — Public / marketing (`/`, `/practice`, `/find-jobs`)
> Landing hero: two-line headline (semibold, ink), one-line sub-paragraph (ink-muted),
> primary pill button (accent fill, bevel highlight, raised shadow) + secondary ghost button,
> and the signature 3-layer 3D hero illustration on the right (device mockup mid-layer,
> floating "score ring" + "chip" cards in the foreground casting shadows onto the device,
> soft blurred gradient blob in the background). Below: two large equal-height 3D-tile cards
> ("Practice interviews" / "Find matching jobs"), each with a 3D icon tile, title, 2-line
> description, bullet list, ghost CTA. "How it works" as 4 tiles in a row, each a small 3D
> numbered icon + title + description, connected by a faint dotted line (no arrows). Feature
> grid: 6 flat-resting cards (icon tile + title + description) — no tilt here, this section
> is scan-not-interact. FAQ as a flat accordion (no elevation, just a hairline border,
> chevron rotates open). Footer stays flat and quiet.

## Phase 2 — Auth (`/auth/login`, `/auth/register`)
> Centered single card (max 420px) floating on the empty lavender canvas — resting elevation,
> generous internal padding. Brand mark + theme toggle sit above the card, not inside it. No
> hero illustration here — auth should feel calm and fast, not showy. Inputs get a subtle
> inset shadow (the "carved into the surface" look, inverse of the raised cards) so the
> raised/inset contrast visually distinguishes "things you press" from "things you type
> into". Primary submit button is the one 3D-bevelled element on the screen. Social button
> (Google) is a flat outline, not raised — keeps the primary CTA the only thing that pops.

## Phase 3 — App shell (sidebar + top bar, wraps Dashboard/Jobs/Profile)
> Left sidebar is a flat panel (no tilt, it's structural chrome) with a subtly recessed
> background one shade darker than canvas — reads as a permanent slot the content sits next
> to. Active nav item gets a small raised accent-soft pill behind its icon+label (the one
> place elevation appears in the sidebar). Top bar is flat with a 1px bottom hairline, not a
> shadow — shadows are reserved for content cards. "Quick interview" shortcut button is a
> small pill with the standard bevel/raise treatment so it visibly invites a click among the
> otherwise flat chrome.

## Phase 4 — Dashboard (`/dashboard`)
> Two quick-action cards up top get the full 3D treatment (icon tile, hover tilt+lift) since
> they're the primary decision point of the page. Everything below — the 4 stat cards, the
> trend chart panel, skill analysis, upcoming/recent lists, achievements grid — stays at flat
> **resting** elevation only (a card, a border, a quiet shadow) with no hover tilt: this is a
> data-dense screen and constant tilt would feel noisy. Stat card numbers are large and
   > tabular; a tiny icon tile per stat (not a full 3D render) is enough texture. Achievement
> badges are the one place small 3D medallion-style icons return, locked ones rendered flat
> greyscale, unlocked ones in accent with a soft glow.

## Phase 5 — Interview wizard (`/interview/select-role` → `/interview/quick-setup`)
> Focus shell: no sidebar, just a back control + step rail (dots/lines, current step in
> accent, completed steps checked, upcoming steps muted — rendered as a shallow inset track,
> matching the "carved" language from auth inputs) + centered content column. Role cards
> (step 1) and difficulty/experience cards (step 3) are the *signature* 3D moment of the
> whole product: each is a tile with a 3D icon, title, description, tag row; on hover it
> tilts toward the cursor and lifts, on select it locks into a raised state with an accent
> border + small checkmark badge (no tilt once selected — settled, not still animating).
> Resume upload drop zone (step 2) is an inset "slot" (matches input styling) that highlights
> with an accent glow border on drag-over. Sticky bottom action bar is a flat frosted strip
> (slight backdrop blur) so it stays legible over scrolling content without competing for
> depth with the cards above it.

## Phase 6 — Live interview (`/interview/start`)
> Two-column focus layout, deliberately the calmest screen: camera panel and Q&A panel are
> both flat resting cards, no tilt, no hover choreography — the user is mid-task, not
> browsing. The one 3D element is the countdown timer badge, rendered as a small dial (same
> grooved-track language as the score ring) that shifts to a danger-accent glow in its last
> 30 seconds. Record toggle uses the standard button bevel/press system so it's tactile
> without being showy.

## Phase 7 — Result (`/interview/result`)
> Score panel is the hero moment: a large 3D score ring (grooved track, glossy accent fill,
> big tabular number centered) with a soft ambient glow behind it. Overall feedback,
> question-by-question and next-steps panels stay flat resting cards (collapsible rows use a
> simple chevron rotate, no tilt). Keep the page mostly quiet so the score ring is the one
> thing that visually "pops forward" off the canvas.

## Phase 8 — Jobs (`/jobs`)
> Setup mode: hero pill + 3-step flow strip uses small 3D numbered tiles like the landing
> "how it works" section (visual consistency between marketing and product onboarding
> moments). Resume-selection cards get the tilt+lift treatment (it's a decision, like role
> cards). Table mode is intentionally flat and dense — no 3D, no tilt, just clean rows,
> hover-highlight only, so scanning many job rows stays fast and uncluttered.

## Phase 9 — Profile (`/profile`)
> Three flat vertical partition cards (Identity / History / Resumes), resting elevation only.
> "Add a resume" and per-row action icon buttons use the standard button bevel so they read
> as clickable among otherwise static list rows. Dialogs (view/delete) float above a dimmed,
> slightly blurred backdrop — the modal itself sits at the "raised" elevation tier permanently
> (it's already the focused object, no hover state needed).

---

## Non-negotiables (repeat in every phase prompt if the tool truncates context)
- Never more than one 3D hero illustration or icon-tilt moment per screen.
- Tables, forms, and dense lists are always flat — tilt/3D is reserved for decisions
  (choosing a role, a card, a plan) and hero moments (landing, score ring), never for
  scanning data.
- One accent colour, one typeface, three elevation tiers, three shadow tiers — resist adding
  a fourth of any of these.
- Respect `prefers-reduced-motion`; keep dark mode neutral-grey, not violet-tinted.
