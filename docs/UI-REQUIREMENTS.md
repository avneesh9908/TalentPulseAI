# TalentPulseAI — UI Requirements (Structure Only)

Purpose: a colour-free, theme-free specification of every screen, region, component and
control in the product, so a completely new visual system can be designed from scratch.
This document deliberately contains **no colours, no palette, no typography scale, no
spacing values, no motion style** — only what exists, what it does, and what states it has.

Design language, colour tokens, type ramp, radii, elevation and motion are OPEN — decide
them fresh. Everything below is the functional skeleton the new design must cover.

---

## 1. Global shell

Three shells exist. Every screen lives in exactly one of them (plus the auth shell).

### 1.1 Public shell (marketing)
| Region | Contents |
|---|---|
| Site header | Brand mark → `/`, section links (Practice, Find jobs, How it works, FAQ), theme toggle, "Sign in" link, primary "Get started" button |
| Page body | Section stack (see §3) |
| Site footer | Brand mark, product links, legal line |
| Mobile | Header collapses to brand + hamburger → full-width nav sheet |

### 1.2 App shell (authenticated)
| Region | Contents |
|---|---|
| Left sidebar (persistent, desktop) | Brand block (clickable → dashboard); primary nav: Dashboard, Interviews, Jobs, Profile — icon + label, exactly one active; footer block: theme toggle, current user (avatar/initial + truncated name), Log out |
| Top bar (sticky) | Hamburger (mobile only, opens sidebar drawer), spacer, "Quick interview" shortcut button, notifications bell + popover (panel header + empty message) |
| Content column | Page header + page body, single scroll region, max-width constrained |
| Mobile | Sidebar becomes an overlay drawer with a close button; top bar always visible |

### 1.3 Focus shell (interview wizard)
A stripped app shell: **no sidebar, no top bar**. Only a back control, the step rail, and
the step content. Used by all `/interview/*` steps except the result page.

### 1.4 Auth shell
Centered single-column card on an otherwise empty page. Above the card: brand mark (links
home) + theme toggle. Nothing else.

### 1.5 Cross-cutting shell requirements
- Route-level loading fallback (full-page centered spinner) for lazily loaded pages.
- Global error boundary screen: message + reload / go-home action.
- Theme toggle appears in three places: public header, auth header, app sidebar footer
  (light/dark switching must be supported structurally, whatever the new palette is).

---

## 2. Reusable component inventory

Every item below must exist in the new system. Variants listed are behavioural, not visual.

### 2.1 Primitives
| Component | Required variants / props | Required states |
|---|---|---|
| Button | primary, secondary, ghost, destructive; sizes sm/md/lg/icon; `block` full-width; optional leading + trailing icon | default, hover, focus-visible, active, disabled, loading (spinner + label swap) |
| Icon button | sizes sm/md; always carries an accessible label | same as Button |
| Link | inline text link, nav link, link-styled-as-button | default, hover, focus |
| Text input | optional leading icon, optional trailing action | default, focused, filled, invalid, disabled, read-only |
| Password input | text input + show/hide toggle | + toggle pressed |
| Textarea | optional auto-height, optional counter | as text input |
| Field wrapper | label, required marker, helper text, error text, `htmlFor` wiring | normal, required, error |
| Chips input | token list + free-text entry, Enter/comma commits, per-chip remove, max-count indicator (e.g. 0/12) | empty, filled, at-limit, invalid entry |
| Checkbox / radio | single + grouped | unchecked, checked, indeterminate, disabled, focus |
| Badge / tag | tones: neutral, success, warning, danger, info, outline; sizes sm/md | — |
| Avatar | image or initial fallback; sizes sm/md/lg | — |
| Separator | horizontal, vertical | — |
| Spinner | sizes sm/md/lg; inline and full-page | — |
| Skeleton | line, block, card, table-row shapes | — |
| Kbd | keyboard hint token | — |
| Progress bar | determinate 0–100, optional label | — |
| Score ring | circular 0–100 with centre value + accessible label | — |

### 2.2 Composites
| Component | Requirement |
|---|---|
| Panel / Card | padding none/sm/md/lg; tones flat / raised / muted; optional title row + action slot |
| Selectable card | clickable card acting as a radio: icon, title, description, optional tag row, optional meta line; needs selected + disabled states and a visible selection indicator |
| Page header | eyebrow/overline, title, optional subtitle, optional right-side action cluster, optional back control |
| Section header | title + optional description + optional trailing action |
| Stat card | label, large value, delta/sub-label, icon, optional trend indicator |
| Stepper / step rail | ordered steps with labels; completed / current / upcoming; horizontal on desktop, compact on mobile |
| Tab nav | horizontal tabs or segmented control; active / inactive / disabled |
| Filter pill row | single-select pill group, optional counts |
| Data table | column headers, optional sorting, row hover, per-row action cluster, empty row, loading rows, horizontal scroll on narrow screens, mobile card fallback |
| Pagination | prev/next + page numbers + range summary |
| Empty state | icon, title, description, primary action, optional secondary action |
| Error banner | inline dismissible block: icon, title, message, close button |
| Notice / success banner | inline non-blocking block |
| Toast | transient message, optional action, auto-dismiss + manual close |
| Dialog / modal | title, body, footer actions, close button, backdrop, focus trap, Esc close |
| Confirm dialog | destructive variant: icon, question, consequence copy, Cancel + Confirm (with loading) |
| Drawer / sheet | mobile navigation and mobile filters |
| Dropdown menu | trigger + item list, separators, destructive item |
| Popover | anchored panel (used by notifications) |
| Upload drop zone | drag-over state, browse-on-click, selected-file row (name, size, remove), constraint hint line, invalid-file error |
| Breadcrumb | path trail for deeper pages |
| Status strip | thin banner for connection/session-level notices |
| Copy field | read-only value + copy button + copied confirmation |
| Accordion / FAQ item | expand/collapse with chevron |

### 2.3 Behavioural requirements for all components
- Full keyboard operability; a visible focus indicator on every interactive element.
- All icon-only controls carry accessible labels.
- Disabled controls explain why (tooltip or helper text) when the reason is not obvious.
- Loading and empty states are designed, not afterthoughts.
- Motion is optional and must respect reduced-motion.

---

## 3. Public / marketing screens

### 3.1 Landing `/`
Sections in order:
1. **Hero** — headline, sub-paragraph, primary CTA ("Get started"), secondary CTA ("Try the demo"), product visual/frame.
2. **Two-sides split** — two large cards, *Practice interviews* and *Find matching jobs*; each icon, title, description, bullet list, CTA to its product page.
3. **How it works** — 4 steps (Upload once → Pick your lane → Get scored → Walk in ready): icon, title, description.
4. **Feature grid** — 6 items, icon + title + description.
5. **Limits strip** — short "what it does not do" statements.
6. **FAQ** — accordion list.
7. **Closing CTA band** — headline + primary CTA.
8. Footer.

### 3.2 Practice `/practice`
Overline, hero headline + copy, CTA. Then: 4-step how-it-works, "what it does not do" note,
"if speech is unavailable" note, 6-item feature grid, product tour carousel (image, caption,
title, description, prev/next + indicators), track cards, closing CTA. Own section nav in header.

### 3.3 Find jobs `/find-jobs`
Same skeleton as Practice: overline + hero, 3-step agent explanation, limits notes
(assisted-not-automatic, partial coverage, run duration), 6-item feature grid, **example
status table** (Company / Role / Location / Match / Status) marked as a sample, reassurance
cards, closing CTA.

---

## 4. Auth screens

### 4.1 Login `/auth/login`
- Card title "Welcome back", sub-line linking to Register.
- Form-level error banner slot.
- Fields: Email, Password (masked + show/hide).
- Primary submit button, full width, loading state.
- "or" divider + secondary social sign-in button (Google), full width.
- Footer line: no account → create one.
- Validation: inline per-field errors on blur and on submit; credential failures show a
  generic banner message, never a per-field hint.

### 4.2 Register `/auth/register`
Same card skeleton. Fields: Full name, Email, Phone, Password — all required, each with
inline validation. Submit + social button + link to Login.

### 4.3 Route protection
Unauthenticated access to any app route redirects to Login; unknown routes redirect to Login.
Session expiry surfaces a global notice rather than failing silently.

---

## 5. Interview flow (4 steps + result)

Step rail on every step: **Role → Resume → Setup → Interview**.
Each step screen has: back control, page header (eyebrow, title, subtitle), step rail,
step body, sticky footer action bar, dismissible error banner.
Step guards send the user back if earlier steps are incomplete. Wizard state survives refresh.

### 5.1 Step 1 — Select role `/interview/select-role`
- Search input (roles or skills) with clear affordance.
- Grid of 8 role cards (Frontend, Backend, ML/AI, …): icon, title, description, tag row of
  technologies, level range line, selected indicator.
- Empty state when the search matches nothing (title + clear-search action).
- Sticky bottom bar: chosen-role summary + "Continue" (disabled until a role is picked,
  loading while the draft saves).

### 5.2 Step 2 — Add resume `/interview/select-profile`
- Two mutually exclusive option cards:
  - **Use existing profile** — description + badge showing whether an indexed resume exists.
  - **Upload a new resume** — reveals the drop zone.
- Drop zone: icon, drop copy, browse action, constraint line ("PDF only · max 5 MB"),
  drag-over state, error state for wrong type/size.
- Selected-file row: file icon, name, size, remove button.
- Continue disabled until "existing" is chosen or a valid file is selected; shows upload/parse progress.

### 5.3 Step 3 — Tune the interview `/interview/quick-setup`
Three grouped panels, each with an icon + section label:
1. **Years of experience** — 5 single-select cards (0–1 fresher/intern, 1–3 junior, 3–5 mid,
   5–8 senior, 8+ lead/staff): label + sublabel.
2. **Difficulty** — 3 single-select cards (Easy / Medium / Hard) with a one-line description.
3. **Key skills** — chips input with suggested-skill chips, `n/12` counter, per-chip remove,
   add via Enter or comma, at-limit state.
Then an **Interview preview** summary panel: Experience / Difficulty / Skills definition list.
Sticky bar: "Start interview", disabled until all three groups are valid.

### 5.4 Step 4 — Live interview `/interview/start`
Two-column, full-height layout (stacks on mobile) with its own compact header.

Header row: back/exit control, question counter "Question X of N", countdown timer badge
(needs an urgent state near zero).

**Left column — Camera panel**
- Panel title "Camera", live video preview area, placeholder when camera is denied/unavailable.
- Record toggle ("Start recording" / "Stop recording", mic on/off icon).
- "Read question aloud" (text-to-speech) button, disabled when there is no question.
- Session meta line: interview id + status.

**Right column — Question & answer panel**
- "Current question" block (label + question text).
- "Your answer" block: transcribing indicator while speech recognition is active, editable
  textarea (placeholder: write or edit your answer here).
- Action row: "Leave", "Next question" (primary) — becomes "Submit interview" on the last
  question, with loading and a terminal "Submitted" state.

States to design: no active session (empty state + start-a-new-interview), microphone
unsupported/denied, camera denied, submit failure, submitted/locked.

### 5.5 Result `/interview/result`
App shell (sidebar returns).
- Page header: eyebrow, title "Interview completed", actions: download/share report (primary),
  back to dashboard (secondary).
- Row 1: **Score panel** ("Final score" label, score ring 0–100, meta list: status, answered
  count, completed timestamp) + **Overall feedback panel** (summary paragraph, strengths list,
  improvements list).
- Row 2: **Question-by-question panel** — collapsible rows: question, your answer,
  per-question score, feedback bullets.
- Row 3: **Next steps panel** — recommended actions list.
- Empty state: "No interview report found" + back-to-dashboard action.

---

## 6. Dashboard `/dashboard`

- Page header: greeting with user name, sub-line, optional range control.
- **Quick-action cards** (2): Interview Practice, Job Search — icon, title, description, CTA.
- **Stat row** (4 stat cards): Total Interviews (+completed), Passed (+pass threshold),
  Failed (+of N scored), Average Score (+best score).
- **Performance Over Time** panel: trend chart, range switcher, empty state ("no scored
  interviews yet"), plus three highlight tiles: Best Score, Improvement, Current Streak.
- **Skill Analysis** panel: per-skill current-vs-previous comparison, sub-line, empty state.
- **Upcoming** panel: list rows with title, meta, status badge, small action; empty state.
- **Recent** panel: recent interviews — role, date, score, status badge, "Open report" per row.
- **AI Suggestions** panel: 3 suggestion rows (title + description + optional action).
- **Achievements** panel: badge grid — icon, title, description, locked / unlocked state.
- Loading: skeletons for the stat row, charts and lists.

---

## 7. Jobs `/jobs`

Two modes on one route.

### 7.1 Setup mode
- Hero block: small "Job Agent" pill, title, description.
- 3-step flow strip: Resume & targets → Agent searches → Review & apply.
- **Resume for job search**: heading + explanation; grid of selectable resume cards
  (file name, role · experience, first few skills, selected check); empty state linking to
  the interview flow to upload one.
- **Target designations**: heading + explanation; suggested chips from the resume, each
  removable; add-designation input; "analyzing your resume…" loading line.
- Primary action: run the agent (state the expected duration), plus error and notice banners.

### 7.2 Table mode
- Filter pill row: All / New / Pending / Applied / Dismissed (with counts).
- Refresh icon button with spin state.
- Table columns: **Company, Role, Location, Match, Status, Action**.
  - Match cell: score, optional "why it fits / gaps" expander.
  - Status cell: badge with 5 states (New, Reviewed, Pending, Applied, Dismissed); Pending
    also shows a reason line.
  - Action cell: "Apply →" (opens external link, marks Reviewed), "Mark Applied", "Dismiss".
- Empty states: no matches at all vs "no matches with this status".
- Mobile: each row collapses into a card with the same fields and actions.

---

## 8. Profile `/profile`

Three vertical partitions, each with a section heading.

1. **Identity** — avatar/initial, name, eyebrow; definition list: Email address, Phone number,
   User ID; "Change password" row.
2. **Interview history** — "Latest" highlight tile; list of past interviews (role, date, score,
   status badge, "Open report"); empty state.
3. **Resumes** — "Add a resume" icon button (routes into the interview setup); resume rows
   (file name, date, meta) with per-row **View extracted content** and **Delete** icon buttons;
   empty state ("No resume on file").
   - **View dialog**: file-name title, scrollable extracted-text region, close button, empty
     message when nothing was stored.
   - **Delete confirm dialog**: warning icon, "Delete this resume?", consequence copy,
     Cancel + Delete with loading.

---

## 9. Users (internal) `/users`
Minimal utility page: title "Users"; **Create User** form (Name, Email, submit); **User List**
with loading, error and empty states; row = name + email. Can stay deliberately plain.

---

## 10. Global states every screen must define

| State | Requirement |
|---|---|
| Loading (initial) | Skeletons matching the final layout; full-page spinner only for route transitions |
| Loading (action) | Button-level spinner + disabled, no layout shift |
| Empty | Icon + title + one-line explanation + primary action |
| Error (inline) | Dismissible banner with title + message, retry where retry is possible |
| Error (fatal) | Boundary screen with reload + go-home |
| Offline / session expired | Persistent strip at the top of the app shell |
| Success | Toast for transient, inline notice for in-context |
| Permission denied (camera/mic) | In-place explanation + retry + fallback (typed answers) |

---

## 11. Responsive rules

| Breakpoint | Behaviour |
|---|---|
| Mobile (<640) | Single column; sidebar → drawer; tables → cards; sticky action bars; step rail compacts to "Step 2 of 4" + progress |
| Tablet (640–1024) | Two columns where content allows; sidebar collapsed or drawer |
| Desktop (≥1024) | Full sidebar; dashboard multi-column grid; interview screen split 2-up |

---

## 12. Accessibility baseline
- Landmarks: header, nav (labelled "Primary"), main, footer.
- One `h1` per screen; heading levels never skip.
- Every input has a programmatic label; errors linked via `aria-describedby`.
- Selectable cards behave as radios (grouped, with pressed/checked semantics).
- Dialogs trap focus, restore focus on close, close on Esc.
- Live regions for the interview transcript, timer warnings and toasts.
- Contrast and focus visibility to be validated against the **new** palette once chosen.

---

## 13. Explicitly out of scope for this document
Colour tokens, light/dark palettes, gradients, typography family and scale, radii, shadows,
iconography style, illustration style, motion curves — all to be designed fresh.
