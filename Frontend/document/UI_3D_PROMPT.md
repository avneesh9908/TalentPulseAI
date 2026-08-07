# The prompt — "add three.js 3D that still reads simple, clean and mature"

Paste everything between the rules into Claude Code. Run it phase by phase; it is
written to stop for approval between phases.

The hard part of this brief is not making 3D. It is making 3D that a serious product
would ship. Almost every "3D website" reads as a demo because the 3D is the point.
Here the 3D has to be in service of one idea, quiet enough that a hiring manager
would trust the product behind it, and cheap enough that it never delays the page.

---

<role>
You are a senior frontend engineer and 3D generalist. You have shipped WebGL on
production marketing sites where conversion and Core Web Vitals were measured, so you
default to restraint: one focal 3D moment, procedural geometry, matte materials, slow
motion, and a static fallback that looks intentional rather than broken. You treat
three.js as a rendering budget to be spent, not a feature to be shown off.
</role>

<context>
## Product
TalentPulseAI — a candidate-facing AI mock-interview and job-search product.
Audience: developers preparing for interviews. They are technically literate and
allergic to marketing theatre. The tone target is Linear / Vercel / Stripe, not an
awwwards submission.

## Stack
React 19.2 · TypeScript 5.9 strict · Vite 7.2 · React Router v7 (all routes lazy) ·
Tailwind 3.4 (`darkMode: ["class"]`) · Framer Motion 12 · Radix primitives.
No 3D library is installed today. `framer-motion` is the house animation library.

## The design system is settled. 3D adapts to it, never the reverse.
Read `src/index.css`, `tailwind.config.js`, and
`Frontend/document/UI_AUDIT_AND_REDESIGN_PLAN.md` before writing any code.

- Tokens: `ink`, `ink-muted`, `ink-subtle`, `canvas`, `surface`, `surface-strong`,
  `border`, `border-strong`, `accent` (+`accent-hover`/`accent-text`/`accent-soft`/`accent-fg`),
  `success`, `warning`, `danger` (+`-soft`). Accent is a single violet:
  `#6D3BF5` light, `#7C4DFF` dark.
- Type: Inter Variable, scale `display/h1/h2/h3/h4/lead/body/small/overline`, **sentence case**.
- Radii: 6 / 8 / 12 / 16 / pill. Elevation: `shadow-e1…e5`, layered micro-shadows.
- **Gradients as decoration are banned. Glows are banned.** A previous "bold" iteration
  of this site — uppercase display type, violet→cyan gradients, marquees, cursor glows,
  card-stack fans — was retired for reading immature. Do not reintroduce that vocabulary
  in 3D form. Neon, bloom, chromatic aberration, iridescence and floating crystals are
  all the same mistake with a Z axis.

## What already exists in the hero slot
`src/components/landing/product-stack.tsx` renders the hero visual today: real DOM
panels layered in **CSS 3D** (`perspective: 1600px`, `rotateX(12deg) rotateY(-20deg)`),
with the panel contents defined in `src/components/landing/product-planes.tsx`. It is
used by `/practice` and `/find-jobs`. It is deliberate, accessible (`role="img"` with a
long label), collapses to a single flat panel below `md`, reserves its height, and costs
0 kB of JavaScript.

**This component is your fallback and your benchmark.** Any three.js treatment must be
demonstrably better than it for a reader, or it should not ship. Do not delete it.
</context>

<the_cost_you_are_spending>
State these numbers back to me before you install anything, and confirm the plan.

| Library | gzip | Notes |
|---|---|---|
| `three` (core, tree-shaken) | ~150–160 kB | the floor for real three.js |
| `@react-three/fiber` v9 | ~50 kB | **v9.5.0+ required** — React 19.2 broke the older reconciler contract |
| `@react-three/drei` (selective imports only) | 10–40 kB | never `import * from 'drei'` |
| `ogl` (alternative) | ~15–29 kB | zero-dep, shader-level, no React binding |
| `@react-spring/three` / `maath` | 5–15 kB | only if actually needed |

Current budget: **initial JS for `/` is ≤ 160 kB gzip and is at ~154 kB.** three.js
cannot go in that chunk. Therefore:

1. Every 3D module is `React.lazy` + `<Suspense>`, imported **only** from the component
   that renders the canvas, so Rollup emits a separate chunk.
2. The 3D chunk is not requested until the canvas is about to be visible
   (`IntersectionObserver`, `rootMargin: "200px"`) **and** the device passes the
   capability gate below.
3. The deferred 3D chunk budget is **≤ 220 kB gzip**. If a treatment cannot fit, it
   is the wrong treatment.
4. The static fallback is what ships in the initial chunk. First paint must be complete
   and correct with zero 3D bytes downloaded.

If you conclude that `ogl` (or a pure CSS/canvas2D approach) achieves the chosen
treatment at a fraction of the cost, say so and recommend it. Choosing the cheaper
option that meets the brief is the senior answer, and I would rather hear it than
have you install three.js because I named it.
</the_cost_you_are_spending>

<what_mature_3d_means_here>
Nine rules. Every treatment is judged against all nine.

1. **One 3D moment per page, above the fold, and nothing below it.** The rest of the
   page stays flat DOM. A site with 3D in four sections is a showreel.
2. **Monochrome plus one accent.** Materials sample the existing tokens — ink, canvas,
   surface, border, and the single violet — read from CSS custom properties at mount so
   light/dark switching is automatic. No colour appears in 3D that does not appear in
   the design system.
3. **Matte, not glossy.** `MeshStandardMaterial` with high roughness and low metalness,
   or a flat `MeshBasicMaterial`. No environment maps, no mirror reflections, no glass,
   no `transmission`. One soft directional light plus low ambient. Shadows soft and
   barely there, or faked with a gradient plane.
4. **Motion is ambient and slow.** A drift measured in whole seconds, amplitude small
   enough that a reader mid-sentence is not distracted. Nothing spins. Nothing bounces.
   Nothing follows the cursor across the whole viewport.
5. **The user's scroll is never hijacked.** No pinning, no scroll-driven camera
   sequences, no "scroll to explore". Scroll may drive at most a subtle parallax offset.
6. **Geometry is procedural and meaningful.** Boxes, planes, lines, points, extruded
   rectangles — generated in code, no `.glb`, no textures beyond what you draw. What is
   depicted must relate to the product (interface planes, a ranking, a signal), not be
   an abstract blob.
7. **It is legible at a glance and ignorable at a second glance.** If a first-time
   visitor cannot tell within two seconds what they are looking at, the treatment failed.
8. **It degrades to something a designer would have chosen anyway.** The fallback is not
   an empty box or a spinner. It is the existing `ProductStack`.
9. **60fps on a mid-range Android, or it does not mount there.** Measure, do not assume.
</what_mature_3d_means_here>

<where_3d_is_allowed>
**Allowed — pick exactly one to build first:**
- `/` hero visual (landing)
- `/practice` hero visual
- `/find-jobs` hero visual

**Explicitly banned. Do not propose 3D in any of these:**
- Anything behind the app shell — `/dashboard`, `/profile`, `/jobs`, `/users`
- The interview wizard, and above all `/interview/start`, which already competes for
  GPU and CPU with a live camera stream, `MediaRecorder`, and the Web Speech API
- `/interview/result` — a report page
- `/auth/login`, `/auth/register` — a form that must load instantly
- Page backgrounds, section dividers, buttons, cards, cursors, page transitions,
  loading states, and icons
</where_3d_is_allowed>

<candidate_treatments>
Propose all three with a one-paragraph rationale, a bundle estimate, and a risk, then
recommend one and wait for my choice. Do not build until I pick.

**A. Layered interface planes (three.js port of the current hero)**
Three to four thin extruded rectangles floating in depth, each showing a real
interface fragment — the setup panel, the live question, the feedback panel with a
score. Content rendered as crisp 2D: either `drei/Html` with `transform` and
`occlude`, or canvas-drawn textures at 2× DPR. Camera nudges a few degrees toward the
pointer, damped, small range. Planes drift on a slow sine, out of phase.
*Why it could be the right answer:* it is the existing composition with real depth,
parallax between layers, and correct occlusion — a genuine improvement on the CSS
version rather than a different idea. *Risk:* `Html` inside a canvas is fiddly to keep
accessible and can blur; canvas textures drift from the real UI over time.

**B. The signal field**
A sparse instanced point cloud on a plane — a few hundred points, `InstancedMesh` or
`Points`, most in `ink-subtle` at low opacity, a handful in the accent. They settle
slowly from noise into an ordered grid, then hold, reading as "ranked from noise":
the actual job of both engines. Camera fixed, gentle parallax on pointer.
*Why it could be the right answer:* cheapest by far, dead simple to keep at 60fps,
and it is a metaphor for the product rather than decoration. *Risk:* abstract — it
needs the headline beside it to mean anything, and abstraction is what rule 6 warns about.

**C. The document plane**
A single subtly curved plane standing for the resume, with thin extracted lines lifting
off its surface and resolving into small ranked cards at a shallow angle. One object,
one idea: your resume becomes structured signal.
*Why it could be the right answer:* the most literal illustration of what the product
does, and one object is the easiest thing to make feel expensive. *Risk:* the closest
to "hero illustration", so it lives or dies on execution quality.
</candidate_treatments>

<technical_requirements>
**React 19 and R3F**
- `@react-three/fiber` **>= 9.5.0** (earlier majors target React 18; 9.x below .5 hit
  reconciler breakage on React 19.2 — verify the resolved version after install and
  report it).
- StrictMode is on and double-invokes effects. Every `useEffect` that creates GPU
  resources must dispose them on cleanup. Prove no leak by mounting/unmounting the
  canvas ten times and showing `renderer.info.memory` is flat.

**Render loop**
- `frameloop="demand"` for anything that is not continuously animating, with explicit
  `invalidate()`. If the treatment needs a continuous loop, drive it from R3F's
  `useFrame` and pause it when off-screen via `IntersectionObserver`, and when the tab
  is hidden via `document.visibilityState`.
- Clamp `dpr={[1, 1.5]}` — never `window.devicePixelRatio` unbounded.
- `drei/PerformanceMonitor` (or your own frame-time sampler): if the median frame time
  exceeds 20ms for 2 seconds, step DPR down, then drop to the static fallback and stay
  there for the session.
- Target draw calls in single digits. Instance anything repeated.
- Set `ColorManagement` correctly: `outputColorSpace = SRGBColorSpace`, ACES tone
  mapping off unless it demonstrably helps, `antialias` on only if the frame budget allows.

**Theming**
- Read token values from `getComputedStyle(document.documentElement)` at mount and on
  theme change (observe the `class` attribute on `<html>` with a `MutationObserver`),
  then update material colours. No hardcoded hex anywhere in the 3D code.
- The canvas background stays transparent (`gl={{ alpha: true }}`); the section's own
  `bg-canvas` shows through, so light/dark needs no separate scene background.

**Capability gate — mount the canvas only if all of these pass**
1. `matchMedia('(prefers-reduced-motion: reduce)')` does **not** match
2. WebGL2 context creation succeeds (feature-detect, do not sniff user agents)
3. `navigator.hardwareConcurrency >= 4`
4. `navigator.deviceMemory` is absent or `>= 4`
5. `navigator.connection.saveData` is not true, and `effectiveType` is not `2g`/`slow-2g`
6. Viewport width `>= 768px` — the hero on a phone should be one clear flat panel,
   which is also what `ProductStack` already does
7. The canvas has entered the `IntersectionObserver` margin

Failing any gate renders `ProductStack`. This must be a single testable predicate in
`src/lib/webgl.ts` so I can force each branch.

**Accessibility**
- The canvas is wrapped in `role="img"` with the same descriptive `aria-label` the
  `ProductStack` uses. The canvas itself gets `aria-hidden`.
- Nothing inside the 3D scene is the only way to reach information or an action. No
  clickable-only-in-3D affordances.
- WCAG 2.2.2: any ambient animation running longer than 5 seconds needs a visible
  pause control. Provide a small, token-styled pause/play button pinned to the visual —
  it also serves as an honest signal that you thought about this.
- Pointer-driven motion must be gated on `(pointer: fine)` and must never be the only
  cue for anything.
- Keyboard: focus must skip the canvas entirely. Tab order across the hero is unchanged.

**Layout stability**
- The 3D container reserves the exact height of the `ProductStack` fallback at every
  breakpoint, so swapping between them shifts nothing. CLS contribution must be 0.
</technical_requirements>

<fallback_ladder>
Implement and demonstrate all five branches.

1. **Reduced motion** → `ProductStack`, no canvas, no 3D chunk fetched
2. **No WebGL2 / context lost** (`webglcontextlost` listener) → swap to `ProductStack`,
   log once, never retry that session
3. **Below 768px** → `ProductStack`'s existing flat single-panel mobile layout
4. **Weak device or save-data** → `ProductStack`
5. **3D chunk fails to load** (offline mid-session, CDN error) → `ProductStack`,
   silently

Prove each: with `prefers-reduced-motion`, with WebGL disabled in the browser, at
375px, with `saveData` forced, and with the chunk request blocked. Confirm in each case
that the network panel shows **no** three.js request except where expected.
</fallback_ladder>

<non_negotiables>
1. **No behaviour or logic changes.** No route, API, auth, context or state changes.
2. **No raw palette classes** (`slate-*`, `violet-*`, …) and no `isDark ? "…" : "…"`
   colour ternaries anywhere. Tokens only.
3. **No gradient backgrounds, no glow shadows, no `bg-clip-text`** in the DOM around
   the visual.
4. **No `.glb`/`.gltf`/`.hdr`/texture assets.** Procedural geometry and code-drawn
   canvases only. If a treatment needs an asset, it is the wrong treatment.
5. **`ProductStack` is not deleted or rewritten.**
6. **Sentence case** everywhere. No uppercase headings.
7. **Comments only where the *why* is non-obvious.** No comment blocks.
8. **Nothing is pushed.** Commit per phase; I will push.
</non_negotiables>

<acceptance_criteria>
**Automated**
- `npx tsc --noEmit` clean
- `npx eslint src --ext .ts,.tsx` — no new errors (2 pre-existing in `button.tsx` and
  `form.tsx` are allowed)
- `npx vite build` passes
- `/` initial JS **≤ 160 kB gzip** — unchanged from today within 2 kB
- 3D chunk emitted separately, **≤ 220 kB gzip**, and named in the build output
- CSS ≤ 15 kB gzip
- Raw-palette grep across `src/app` and `src/components` returns zero matches

**Measured live, light and dark**
- With the canvas mounted: median frame time **≤ 16.7ms** over 5s on desktop; report
  the 95th percentile too
- Draw calls, triangles and programs from `renderer.info` — reported as numbers
- `renderer.info.memory` flat across 10 mount/unmount cycles
- Zero console errors and zero warnings, including three.js's own
- No layout shift when the fallback swaps to the canvas (measure with a
  `PerformanceObserver` on `layout-shift`)
- `document.documentElement.scrollWidth <= window.innerWidth` at 375/768/1280/1920
- 0 gradient-backed elements on the page
- 0 WCAG AA contrast failures on the surrounding text
- Theme toggle updates material colours without a remount
- Tab from the headline lands on the next real control, never the canvas
- The pause control stops all motion and `frameloop` goes idle

**Judgement**
- Screenshot the new hero and the `ProductStack` fallback side by side, light and dark.
  State plainly which is better and why. If the 3D version is not clearly better,
  recommend not shipping it — that is an acceptable and expected outcome.
</acceptance_criteria>

<verification>
```bash
cd Frontend && npx tsc --noEmit
cd Frontend && npx eslint src --ext .ts,.tsx
cd Frontend && npx vite build
```
```bash
cd Frontend/src && grep -rnE '(text|bg|border|from|to|via|ring|shadow)-(slate|gray|violet|cyan|emerald|amber|rose|red|blue|indigo|teal|purple|pink|sky|orange|yellow)-[0-9]+' --include=*.tsx app components
```

Start the dev server with the preview tooling — never `npm run dev` in a shell. Then:
- read the network panel and confirm the 3D chunk is absent on first paint and arrives
  only after the observer fires
- sample `requestAnimationFrame` deltas for 5s and report median / p95
- dump `renderer.info` (calls, triangles, geometries, textures, programs)
- toggle `.dark` on `<html>`, **wait 400ms**, and re-read material colours —
  `transition-colors` means an immediate read returns pre-transition values
- run the whole audit at 375 / 768 / 1280 / 1920
- force every fallback branch and confirm the render and the network behaviour

Paste real output. Do not describe it.
</verification>

<delivery>
Stop after each phase, report, wait for approval.

- **Phase 0 — Proposal, no code.** The three treatments, bundle estimates, risks, your
  recommendation, and whether `ogl` or a non-WebGL approach would do the job cheaper.
  Also tell me if you think the current CSS `ProductStack` is already the right answer.
- **Phase 1 — Infrastructure, no visuals.** `src/lib/webgl.ts` (the capability gate),
  `src/hooks/use-token-colors.ts`, `src/components/three/canvas-shell.tsx` (lazy
  boundary, Suspense, observer, context-loss handling, pause control, fallback swap,
  height reservation). Renders a single untextured box so I can verify gating,
  budgets, disposal and fallbacks before any design work.
- **Phase 2 — The chosen treatment**, on one page only.
- **Phase 3 — Tuning.** Motion, materials, camera, dark mode, and the perf ladder.
- **Phase 4 — Rollout** to the other two hero slots, only if Phase 3 clearly beat the
  fallback.
- **Phase 5 — Final audit** against every acceptance criterion, with the side-by-side
  screenshots and a ship / do-not-ship recommendation.

Per-phase report:
1. Files touched, one line each
2. Bundle numbers before and after, from real build output
3. Perf numbers from a real session
4. Which fallback branches you exercised and what happened
5. Decisions I might disagree with
6. What you deliberately did not do
</delivery>

<questions_to_ask_before_starting>
1. Which treatment — A, B or C?
2. Is the 220 kB deferred chunk acceptable, or should this be `ogl` at ~25 kB?
3. Should the 3D replace the hero visual on all three public pages, or only `/`?
4. Is a visible pause control acceptable in the hero, or should ambient motion stop
   under 5 seconds so it isn't needed?
5. British or American spelling in any new copy?
</questions_to_ask_before_starting>
