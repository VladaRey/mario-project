# UI redesign: design spec

Date: 2026-10-07 · Branch: `feature/penalty-list` · Status: approved concept, ready for planning

Related:
- Design canvas (source of truth for visuals): https://claude.ai/artifact/93jjTm6AfWB6iE1AA71vCa (private; 34 artboards)
- Brief: [2026-10-06-ui-redesign-design-brief.md](2026-10-06-ui-redesign-design-brief.md)
- Test cases: [2026-10-07-ui-redesign-test-cases.md](2026-10-07-ui-redesign-test-cases.md)
- Penalty feature: [2026-10-06-penalty-list-design.md](2026-10-06-penalty-list-design.md)

## 1. Goal

Make every screen of Mario Group look modern, consistent and easy to use on a phone first, with an EN/PL switch and a public penalty list. **Business logic, data and permissions stay the same.** The only new behaviours are listed in §9.

## 2. Business logic the redesign must keep

This is how the app works today. Every screen must keep it.

**Roles.** The role is stored in `localStorage` by `useGetRole` (keys `admin-password`, `fame-password`).

| Role | Can do |
|---|---|
| Guest | view events, payment status (text), lottery results, players, profile, penalty list, FFP calculator, pricing numbers (read only) |
| Fame | Guest + toggle paid, change card usage, **Apply** in Pricing |
| Admin | everything, including `/admin/*` (guarded by `withAdminLayout` / `withAuth`) |

**Event lifecycle.**
1. Admin creates an event. The date defaults to today and the name defaults to the formatted date.
2. Players are added from one or more **reservations** (regular line-ups such as "Tuesday" and "Thursday"), from the **waiting list** (only shown when it is not empty) or **individually**.
3. Changes to the line-up are local until **Save**. "Remove all" only clears the local selection.

**Lottery.**
- Participants are all players who are not in the event yet. **Places** is entered manually.
- **Play** shuffles the participants: the first N become winners and the rest become the waiting list, in order. Both lists are saved (`lottery_results`).
- **Add to event** adds the winners and opens `/admin/event/[id]`.
- If a winner drops out, the admin removes them and adds the next player from the waiting list.
- **Reset** deletes the lottery results.

**Pricing (event).** `calculateEventStatistics`:
1. total = courts × hours × price per hour. Courts default to ⌈players / 4⌉; hours and price default to Defaults.
2. Each player pays an equal share of the total.
3. Each card use takes `discount_per_usage` (Defaults, 15 PLN) off that player's share.
4. Negative shares are redistributed to the others.
5. **FAME total** caps the sum that players pay, and the excess is removed evenly.
6. Changing a card usage sets `fame_total` to null and recalculates the amounts.
7. Opening an event recalculates the amounts and writes them to the database.

**FFP calculator.** `calculateStatistics` is a separate, older calculator that works on card-owner counts and usages. MS Classic's discount scales with hours (1, ½, ⅓, ¼). It writes nothing to the database. **Its fields, results and maths must not change.**

**Penalties.** A penalized player (`penalty_since` not null) cannot be **newly** added to an event: from a reservation, individually, from the waiting list or through the lottery. Players who are already in an event stay there. A penalized player **can** stay in a reservation and is skipped when that reservation is added to an event. Only an admin adds or removes penalties.

## 3. Visual system: Violet 2.0

All values are on the canvas artboard "Tokens & components".

- **Font:** Manrope (400/600/700/800) through `next/font/google`. Remove the unused Roboto, Geist and Inter.
- **Colours** as CSS variables in `src/styles/globals.css`, keeping the shadcn token names (`--primary`, `--background` …) so existing `ui/*` components pick them up. Values:

| Token | Value | Use |
|---|---|---|
| violet-900 | `#3B1F6E` | top bar, primary button |
| violet-700 | `#5B2D8C` | active nav, links |
| violet-50 | `#F1EBFB` | soft fills |
| coral-500 | `#FF7A59` | paid toggle, accent button (ink text on it, never white) |
| bg | `#F6F4FB` | page |
| line | `#E7E2F2` | borders |
| ink | `#1C1530` | text |
| muted | `#6B6384` | secondary text |
| danger | `#DC2626` | destructive actions, badge |
| danger-soft | `#FEE4E2` / `#B42318` | penalty chip |
| warning | `#FFF4ED` / `#FED7AA` / `#7C2D12` | notices |

  Card-type colours (MD/ML/MS/CL/NC) stay as they are, only softer, in `getCardTypeColor`.
- **Radius:** 12 (rows, inputs), 14–16 (cards), 18 (FFP button), 24 (sheets).
- **Buttons:** primary, accent, secondary, ghost, destructive and disabled, defined as `Button` variants (CVA) in `ui/button.tsx`. Remove the ad-hoc hex classes from pages.
- **Density:** list rows replace big cards. Avatars show initials in the card-type colour.
- **Motion:** CSS View Transitions on route change, guarded by `prefers-reduced-motion`. Skeleton rows replace "Loading…" and the full-page loader inside content areas.
- **Light theme only** for now. Tokens stay ready for dark mode later.

## 4. App shell and navigation

One shell for every role. The current `Navbar`, `AdminNavbar` and `withAdminLayout` shells are replaced; `withAuth` keeps guarding `/admin/*`.

**Mobile (< 768px)**
- **Top bar** (56px, violet-900):
  - root screens show the logo "Mario Group";
  - inner screens show "‹ Back to parent";
  - on the right: a contextual action (for example "Pricing") and the **EN · PL** switch.
- **Bottom tab bar** (72px, fixed), 5 slots: `Events · Players · [FFP] · Penalties · <last>`.
  - **FFP** is a raised centre button that opens the FFP calculator in a bottom sheet.
  - **Penalties** shows a red counter: the number of penalized players.
  - The **last slot** depends on the role:
    - Admin: **Admin**, which opens the Admin hub;
    - Fame: **Fame**, shown muted, which opens the Account sheet;
    - Guest: **Log in**.
- **Sticky action dock** above the tab bar on action-heavy screens (Lottery, Edit event, Defaults): one primary CTA plus a "⋯" menu for rare or destructive actions.
- **Admin sub-nav** (pills) on `/admin/*`: Events · Players · Reservations · Penalties · Defaults.

**Desktop (≥ 768px)**
- **Top bar** (64px, violet-900):
  - logo;
  - nav (Events, Players, Penalties with counter, Admin for admins), the active item underlined in coral;
  - on the right, three controls 40px high: coral **FFP calculator**, EN/PL, and the account pill.
  - The account pill shows "Log in" for a guest. For Admin and Fame it opens a menu with the role, "Admin panel" (admin only) and "Log out".
- **Admin sub-nav** as a tab row under the top bar.
- **Page header** on the light background:
  - breadcrumbs;
  - H1 and meta on the left;
  - actions on the right, all 44px high and in one style.
- Content max-width 1200px with 32px side padding. KPI cards are equal-width cards in a grid.

## 5. Screens

Each screen keeps its route and behaviour. The canvas artboard name is in brackets.

| Route | Mobile | Desktop | Notes |
|---|---|---|---|
| `/` | Home · Events | Desktop · home | Hero with the latest event (Open event, Lottery), "Earlier" rows with a date tile; "N unpaid" pill for Admin/Fame only; "+ New event" for Admin |
| `/event/[id]` | Event · admin / Fame, Event · guest | Desktop · event | Stats (players, paid X/N, unpaid, avg); card-type chips; filter All/Unpaid/Paid (client-side); rows with toggle and stepper for Admin/Fame, text chips for Guest |
| Pricing sheet | Event · Pricing sheet | right-side sheet (480 px) | Same fields; source hints; FAME-cleared hint; Apply for Admin/Fame; discard dialog kept |
| `/event/[id]/lottery` | Lottery · admin, Lottery · guest, Lottery · reset confirm | Desktop · lottery | Setup card (participants, Places stepper, free-spots hint); numbered Winners and Waiting list; dock Play / Add N to event / ⋯ Reset |
| `/players` | Players | Desktop · players | Search, letter groups, penalty chip |
| `/players/player/[id]` | Player profile | Desktop · player profile | Profile header, penalty notice, stat tiles, activity calendar with date range |
| **`/penalties`** (new, public) | Penalty list · guest · EN, Lista kar · admin · PL | Desktop · penalty list | Explanation block (§8), list with "since" and duration, empty state, **Manage** for Admin |
| FFP sheet | FFP calculator · sheet | Desktop · FFP dialog | Same fields and results; grouped "Court" and "Cards"; sticky "To be paid" |
| `/login` | Login | (same, centred) | Login, password, Log in, "Continue as guest", EN/PL |
| Account sheet | Fame · account sheet | account menu | Role, what it can do, Log out |
| `/admin` | Admin · hub | same tiles in a 3-column grid under the admin sub-nav | Tiles with counters, "+ New event", "Logged in as Admin", Log out |
| `/admin/events` *(see §6)* | Admin · events | (Desktop · home with Edit) | Rows with Edit / Lottery, "+ New event" |
| `/admin/event`, `/admin/event/[id]` | Admin · edit event | Desktop · admin edit event | Details card; "Add players from" segmented (Reservation / Waiting list / Individual); penalty notice; current players; dock Save with "Unsaved changes"; ⋯ Remove all / Delete event |
| `/admin/players` | Admin · players, Admin · add / edit player | list in two columns; add / edit in a right-side sheet | Search, Edit/Delete per row, sheet with name and card-type radio |
| `/admin/reservations` | Admin · reservations, Admin · add / edit reservation | Desktop · admin reservations | Tabs (mobile) or list (desktop); Edit/Delete; sheet with name and player picker |
| `/admin/penalties` | Admin · manage penalties | (same layout) | Add multi-select, list with **Paid ✓** (confirm), link to public list |
| `/admin/defaults` *(new route, was a sheet)* | Admin · defaults | (same form) | Price per hour, Hours, Discount per card usage, honest hint (§2) |
| Player picker | Player picker · search sheet | popover | §7 |

## 6. Routing changes

- **`/penalties`**: new public page in the `(app)` group. It reads `playerOperations.getAllPlayers()` and filters with `isPenalized`.
- **`/admin`** becomes the **hub**. The current admin events list moves to **`/admin/events`**. Every link that pointed to `/admin` as "events" is updated (`event-form` redirects after save and delete, `AdminNavbar` links).
- **`/admin/defaults`**: new page that reuses `DefaultAdminValuesForm`. The sheet `DefaultValuesAdminSheet` is no longer opened from the nav.
- No other route changes. The lottery's "Add to event" still opens `/admin/event/[id]`.

## 7. Player picker

`MultiSelect` (8 usages) gets a new implementation with the **same props** (`options`, `selected`, `onChange`, `placeholder`) plus optional `meta` per option (card type for the avatar and chip).

- **Mobile:** opens a near-full-height bottom sheet. Search is autofocused at the top, selected players show as removable chips, and the footer is sticky ("Clear", "Done · N selected").
- **Desktop:** a wide popover with the same list.
- **Search:** substring match on the full name, case- and diacritic-insensitive (NFD normalise and strip combining marks, so `wozniak` matches `Woźniak`). The cmdk fuzzy filter is replaced by this predicate (`shouldFilter={false}` plus our own filter).
- **Order:** selected first, then the rest alphabetically; disabled options last.
- **Disabled options** (penalized players in event and lottery pickers) are greyed out, show a "Penalty" chip and cannot be selected. In the reservation picker, penalized players are not disabled and only show the chip (§2).
- **Trigger:** shows the chips of selected players ("+N more" after one line) instead of "N selected".
- The reservation picker in the event form uses the same component without avatars.

## 8. Internationalisation (EN / PL)

- **No library and no locale in the URL.**
  - Dictionaries live in `src/i18n/en.ts` and `src/i18n/pl.ts`. `pl` is typed as `typeof en`, so a missing key fails `tsc`.
  - `I18nProvider` (React context) is mounted in the root layout, and `useT()` returns `t(key, params)`.
  - The chosen locale is stored in `localStorage` (`locale`). On the first visit it comes from `navigator.language` (`pl*` gives PL, anything else EN).
  - `<html lang>` follows the locale.
- **Plurals** use `Intl.PluralRules` (`1 dzień`, `3 dni`, `5 dni`; `1 player`, `2 graczy`).
- **Dates** use `date-fns` with `enGB` or `pl`.
- **Every** user-visible string moves to the dictionaries, including toasts, confirmations, empty states and aria-labels. Player and reservation names stay as data.
- **Penalty explanation** (draft from the organizer's announcement; regulations will follow):
  - EN: *What does it mean?* Cancelling after 12:00 on the day of the draw counts as a no-show and comes with a mandatory administrative fee. Until the fee is paid, you can't sign up for group events or take part in lotteries. Once you've paid the organizer, you'll be removed from the list.
  - PL: *Co to oznacza?* Rezygnacja po godzinie 12:00 w dniu losowania jest traktowana jak nieobecność i wiąże się z obowiązkową opłatą administracyjną. Dopóki opłata nie zostanie uregulowana, nie możesz zapisywać się na wydarzenia grupy ani brać udziału w losowaniach. Po uregulowaniu opłaty u organizatora zostaniesz usunięty z listy.
  - A native speaker proofreads the Polish before release.

## 9. New behaviours (the only ones)

1. **Log out.** It clears `admin-password` and `fame-password`, sets the role to Guest and opens `/`. It is reachable from the Admin hub, the Fame account sheet and the desktop account menu.
2. **Language switch** (§8).
3. **Public `/penalties` page** with a counter in the nav.
4. **Event filter All / Unpaid / Paid.** It filters the loaded list on the client.
5. **Lottery Reset asks for confirmation:** "Reset lottery results? Winners and the waiting list will be deleted. Players already added to the event stay in it."
6. **Quiet hints, no new toasts:**
   - Pricing: "auto: N players ÷ 4", "from Defaults", and "FAME total was cleared after a card-usage change" (shown only when `fame_total` was cleared in this session).
   - Lottery: "Free spots: courts × 4 − players = N", shown only when courts are known. Places stays manual.
   - Edit event: an "Unsaved changes" marker on Save when the line-up, name or date differ from what was loaded. A `beforeunload` / route-leave confirm fires **only** when the form is dirty.
   - The existing "Not added — unpaid penalty" notice also says that the others were added.
7. **Player picker search** (§7).

## 10. Out of scope

- Dark theme, PWA, new data fields (time, venue, fee amount).
- Any change to `calculation-service`, `calculate-event-statistics-service`, `lottery-service` or the db layer.
- "Select all" in pickers.
- Real authentication (passwords stay in `NEXT_PUBLIC_*` env vars).

Known risks to note but leave alone:
- Opening an event writes recalculated amounts for any visitor.
- `FfpSheet` (`src/components/ffp-sheet.component.tsx`) is unused. List it for removal in a separate change.

## 11. Implementation order (for the plan)

1. **Safety net.** Golden tests for `calculateStatistics` and `calculateEventStatistics` with the current outputs (on top of `calc.test.ts` and `new-calc.test.ts`), plus a render test for `FfpForm` inputs → results.
2. Tokens, font and `Button` variants.
3. i18n infrastructure: provider, `useT`, dictionaries, locale switch, date and plural helpers.
4. App shell: top bar, bottom tab bar, desktop nav, account menu, logout, admin sub-nav. Remove the old navbars.
5. Shared components: list row, avatar, chips, stat tile, notice, segmented control, stepper, dock, sheet wrapper, skeleton, empty state, confirm dialog restyle.
6. Player picker (replaces the `MultiSelect` internals).
7. Screens in order: Home → Event (+ Pricing) → FFP → Lottery → Players → Profile → Penalties (public) → Login → Admin hub / events → Edit event → Admin players → Reservations → Admin penalties → Defaults.
8. Polish: View Transitions, skeletons, responsive pass at 375 / 768 / 1280, accessibility pass.
9. Run the full manual test pass from the test-cases document in mock mode, on mobile and desktop, in EN and PL.

Each step must keep `pnpm check` and `pnpm test` green.
