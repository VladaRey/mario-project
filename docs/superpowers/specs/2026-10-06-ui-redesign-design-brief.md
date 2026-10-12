# Mario Group: UI redesign brief (for Claude Design)

Date: 2026-10-06 · Branch: `feature/penalty-list` · Status: concept agreed, needs high-fidelity polish

## 1. Context

Mario Group is a small web app for an amateur sports group. Players sign up for trainings ("events"). When there are too many players, the admin runs a lottery. The admin tracks who has paid. Sport cards (Medicover, Multisport and others) reduce the price. A new penalty list blocks players who cancelled late.

People mostly use it **on a phone, in a sports hall**. Typical cases: the admin ticks payments during training, and players check the lottery result or the penalty list.

**Roles** (unchanged):

| Role | How | Can do |
|---|---|---|
| Guest | no login | view events, payment status (text only), lottery results, players, **penalty list** |
| Fame | fame password | Guest + toggle payment, change card usage |
| Admin | admin password | everything: create and edit events, run the lottery, players, reservations, penalties, defaults |

## 2. Constraints

- **Functionality does not change.** Same data, same calculations, same permissions. Only layout, visual style and navigation change.
- **Lightweight.** Stack stays Next.js + Tailwind + shadcn/Radix + lucide icons. No new UI libraries. Fonts load through `next/font`, self-hosted.
- **Responsive, mobile first.** Design for 375px first, then check 768px and 1280px. No horizontal scrolling, touch targets at least 40px.
- **Two languages: EN and PL.** Polish strings are about 30% longer, so layouts must handle long labels such as "Lista kar" or "Dodaj do wydarzenia".
- **Light theme is the main theme.** A dark theme can come later as an option.
- **FFP calculator is critical.** It must be reachable in one tap from every screen.

## 3. Visual direction: "Violet 2.0"

An evolution of the current purple brand, not a replacement.

| Token | Value | Use |
|---|---|---|
| `violet-900` | `#3B1F6E` | top bar, hero gradient start |
| `violet-600` | `#7A3E9D` | hero gradient end |
| `violet-700` | `#5B2D8C` | active nav, links, accents |
| `violet-50` | `#F1EBFB` | soft fills, date tiles |
| `coral-500` | `#FF7A59` | "paid" toggle on, secondary CTA ("Add to event"), active underline on desktop |
| `bg` | `#F6F4FB` | page background |
| `surface` | `#FFFFFF` | cards, rows |
| `line` | `#E7E2F2` | borders, dividers |
| `ink` | `#1C1530` | main text |
| `muted` | `#7B7393` | secondary text |
| `danger` | `#DC2626` / bg `#FEE4E2` / text `#B42318` | penalty, destructive only |
| `warning` | bg `#FFF4ED` / border `#FED7AA` / text `#7C2D12` | penalty explanation, "skipped" notices |

Card-type colours stay as they are now, only softer. Abbreviations: MD Medicover (blue), ML Medicover Light (violet), MS Multisport (green), CL Classic (amber), NC No card (slate).

- **Font:** Manrope, weights 400, 600 and 800. Headings 800, body text 500 and 600.
- **Radius:** 12px for rows and inputs, 14px for cards, 16px for the FFP button, 30px for the phone frame (mockups only).
- **Density:** compact rows, not big cards. The event screen should show 7–8 players per phone screen.
- **Motion:** short transitions between screens (CSS View Transitions) and skeleton loaders instead of a "Loading…" text.

## 4. App shell and navigation

- **Top bar** (violet-900): on root screens it shows the logo "Mario Group". On inner screens it shows "‹ Back to <parent>". On the right is the **EN · PL** language switcher, plus a screen action where there is one (for example "Pricing ⚙" on an event).
- **Bottom tab bar** (mobile), 5 slots: `Events · Players · [FFP] · Penalties · Admin`.
  - **FFP** is a raised centre button (50×50, violet gradient) that opens the FFP calculator in a bottom sheet.
  - **Penalties** has a red counter badge (number of players on the list).
  - **Admin** is visible only to the admin. For others the tab bar has 4 slots: Events · Players · FFP · Penalties.
- **Desktop (≥ 768px):** the bottom bar becomes a horizontal top nav with the same items. A coral **"FFP calculator"** button sits in the nav, with the language switcher next to it. Content max-width is about 1100px.
- **Admin area** shares the shell and adds a second-level pill nav: `Events · Players · Reservations · Penalties · Defaults`.
- **Sticky bottom action dock** on action-heavy screens (lottery, edit event): one primary CTA plus a "⋯" menu for destructive or rare actions. Each destructive action keeps its confirmation dialog.

## 5. Screens

Each screen needs: mobile 375 and desktop 1280; loading (skeleton) and empty states; Guest and Admin variants where they differ.

### 5.1 Home: events (`/`)
- Hero card for the most recent event: date label ("Latest · Mon 6 Oct"), name, stats (players, paid X/N for Admin/Fame), buttons **Open event** and **Lottery**.
- "Earlier" list: compact rows with a calendar-leaf date tile (day plus month), name, player count, and a "N unpaid" pill (Admin/Fame only).
- Empty state: no events yet.

### 5.2 Event (`/event/[id]`)
- Hero: date, name, stats (players · paid X/N · average PLN).
- Card-type chips row (MD 3 · ML 2 · …), replacing the current dropdown.
- Segmented filter **All / Unpaid / Paid** with counts. This is client-side filtering of the loaded list.
- Player row on two lines: avatar with initials (card-type colour), name, paid toggle (Admin/Fame), and below "card · amount PLN" plus a card-usage stepper (− n +, only for players with a card, Admin/Fame). Guests see "Paid" or "Unpaid" text instead of the controls.
- "Pricing ⚙" in the top bar opens the existing auto-pricing sheet: Courts, Hours, Price per 1h, FAME total → Fame discount, To be paid, Save. The "discard changes?" dialog stays.
- Desktop: hero on one line, players in a 2-column grid.

### 5.3 Lottery (`/event/[id]/lottery`)
- Header: "Lottery" plus the hint "Choose random players to add to the event".
- Admin setup card: participants multi-select (penalized players greyed out with a "penalty" hint and not selectable), **Places** stepper.
- Winners card (numbered, remove ✕ for Admin) and Waiting list card (numbered, "+ add" for Admin, penalty chip where relevant).
- Admin dock: **Play / Play again** (primary), **Add N to event** (coral), "⋯" → Reset.
- Guest: results only, no setup and no dock.

### 5.4 Players (`/players`)
- Title with count, search field ("Search by name…", same behaviour as now), list grouped by first letter.
- Row: avatar, name, card-type chip, red "Penalty" chip if penalized.

### 5.5 Player profile (`/players/player/[id]`)
- Profile header (gradient): large avatar, name, card-type chip, "Penalty since dd.MM" chip if penalized, "Member since …".
- If penalized: a short warning line linking to the penalty list.
- Stat tiles: **Events**, **Lottery wins / attempts**.
- Activity: date-range picker plus activity calendar (existing component, restyled to violet shades).
- Not found state with "Back to players".

### 5.6 Penalty list, public (`/penalties`, **new route, visible to everyone**)
- Title "Penalty list". **Manage** button for Admin only, linking to `/admin/penalties`.
- Warning explanation block (copy in §7).
- Count label, then rows: avatar, name, "Since dd.MM.yyyy", and duration on the right ("3 days"), with a red left border.
- Empty state: "No one is on the penalty list. Everyone can play!"

### 5.7 Login (`/login`)
- A centred card on the violet gradient background: logo, login and password fields, submit button, language switcher.

### 5.8 FFP calculator (bottom sheet from the tab bar or nav)
- Same fields as now: Courts, Hours, Price per 1h, FAME total, then pairs of owners and usage for Medicover, Medicover Light, MS+ and Multisport, plus MS Classic owners and No card. Results at the bottom.
- Group the fields into sections ("Court", "Cards") with numeric steppers or inputs. The result is a sticky summary at the bottom of the sheet.
- **Do not change the fields or the calculations.** Only the presentation changes.

### 5.9 Admin
- **Events** (`/admin`): the same list as Home plus "+ New event". Rows link to edit.
- **Edit / create event** (`/admin/event`, `/admin/event/[id]`): event name with date picker; an "Add players" card with a segmented source switcher (**Reservation / Waiting list / Individual**) and the matching picker; a warning notice "Not added — unpaid penalty: …"; a "Current players · N" list with remove ✕. Dock: **Save event** / **Create event** plus "⋯" → Remove all players, Delete event (both confirmed).
- **Players** (`/admin/players`): the list plus "+ Add player". Add and edit in a bottom sheet (name, card type).
- **Reservations** (`/admin/reservations`): reservation tabs (Tuesday, Thursday…), the list of players with remove; "+" adds a reservation, "⋯" holds Edit and Delete.
- **Penalties** (`/admin/penalties`): "View public list ↗"; an "Add to penalty list" card (multi-select plus button); an "On the list · N" list with "since" date and a **Paid ✓** button (confirmed; this removes the penalty).
- **Defaults** (`/admin/defaults`, was a sheet): Price per hour, Hours, Discount per card usage, Save.

## 6. Components to design (component sheet)

Top bar (root / inner) · bottom tab bar with FFP button and badge · desktop nav · admin sub-nav pills · language switcher · hero card · event row with date tile · player row (event variant with toggle and stepper, list variant with chips) · card-type chips · penalty chip · warning / notice block · stat tile · segmented control · stepper · multi-select with disabled option and hint · primary / coral / secondary / ghost / destructive buttons · sticky action dock with "⋯" menu · bottom sheet · confirm dialog · toast · skeletons · empty states.

## 7. Penalty copy (draft; final regulations are coming from the organizer)

Source (organizer announcement): cancellations after 12:00 on the day of the draw count as a no-show and incur a mandatory administrative fee.

**EN.** *What does it mean?* Cancelling after 12:00 on the day of the draw counts as a no-show and comes with a mandatory administrative fee. Until the fee is paid, you can't sign up for group events or take part in lotteries. Once you've paid the organizer, you'll be removed from the list.

**PL.** *Co to oznacza?* Rezygnacja po godzinie 12:00 w dniu losowania jest traktowana jak nieobecność i wiąże się z obowiązkową opłatą administracyjną. Dopóki opłata nie zostanie uregulowana, nie możesz zapisywać się na wydarzenia grupy ani brać udziału w losowaniach. Po uregulowaniu opłaty u organizatora zostaniesz usunięty z listy.

A native speaker should proofread the Polish. Both texts live in the i18n dictionaries so they can change when the regulations are published.

## 8. Expected output from Claude Design

1. A token sheet (colours, type scale, spacing, radii, shadows) that matches §3 or improves on it with a reason.
2. A component sheet (§6).
3. Every screen in §5, mobile and desktop, in EN, plus at least the Event and Penalty list screens in PL to check string length.
4. Notes on anything that should differ from this brief, and why.

## 9. Out of scope

New features or data fields (time, venue, fee amount), changes to calculations or permissions, dark theme (later option), PWA or native app.
