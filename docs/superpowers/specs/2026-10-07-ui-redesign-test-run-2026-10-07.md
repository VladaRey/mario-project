# UI redesign: test run 2026-10-07

Test cases: [2026-10-07-ui-redesign-test-cases.md](2026-10-07-ui-redesign-test-cases.md) · Spec: [2026-10-07-ui-redesign-design.md](2026-10-07-ui-redesign-design.md) · Mockups: https://claude.ai/artifact/93jjTm6AfWB6iE1AA71vCa

- **Build under test:** branch `feature/penalty-list`, commit `d4f9ccf`, `pnpm dev` in mock mode (`NEXT_PUBLIC_USE_MOCK_DB=1`).
- **Baseline (§0):** commit `0ae825f` in a temporary worktree on port 3001 (removed after the run).
- **Browser:** built-in browser of the Claude desktop app. Viewports were emulated with `resize_window`: M 375×812 (mobile UA), T 768×1024, D 1280×800, plus 360, 767, 1024, 1440, 1920 and 640 (≈ zoom 200 % at 1280).
- **Data:** Reset on the MOCK badge before each section that changes data.
- **Language:** EN everywhere, PL on M for all screens, plus a PL smoke test on D.

**Legend.** Each cell is written as `View·Role status`, for example `M·G ✅`.
- ✅ passed.
- ❌ failed; a note and the steps follow below.
- — not applicable, cannot be checked in this environment, or not run separately. The reason is in the note.

Screenshots are in [2026-10-07-ui-redesign-test-run-screens/](2026-10-07-ui-redesign-test-run-screens/). That folder is local and is not part of the commit.

---

## 0. Before the redesign (baseline values)

| ID | Result | Values / note |
|---|---|---|
| 0.1 | ✅ | FFP golden values recorded below (§5.2) |
| 0.2 | ✅ | "Past training", admin. Anna card usage = 1, then Pricing → FAME total = 100 → Apply. **Anna Kowalska 0 PLN; the other 11 players 9.09 PLN each.** Intermediate values: after usage +1 without FAME, Anna 23.5 and the others stay at 38.5; before FAME, Pricing showed To be paid 447.00 |
| 0.3 | ✅ | `pnpm test`: 22 suites, 86 tests, 11 snapshots, all green (incl. golden pricing / `ffp-form` tests) |

Extra baselines taken on `0ae825f`:
- **10.3:** an empty name creates a player with a blank name (card Multisport by default). The sheet stays open.
- **12.4:** the Defaults fields are `type=text` with no `inputMode`. Letters turn into "NaN" in the field, and negative numbers are accepted.

## 1. Shell, navigation, account

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 1.1 | G | M | M·G ✅ | Bottom bar Events (active) · Players · FFP (raised) · Penalties **2** · Log in |
| 1.2 | F | M | M·F ✅ | Last slot "Fame". Its colour matches the inactive tabs, as in the mockup |
| 1.3 | A | M | M·A ✅ | |
| 1.4 | G F A | M | M·G ✅ · M·F ✅ · M·A ✅ | Client-side navigation: a `window` marker survives, so there is no full reload |
| 1.5 | G F A | M | M·G ✅ · M·F — · M·A ✅ | The back control is a link to the parent ("‹ Events", "‹ Players", "‹ Past training"), not `history.back()`. F was not run separately; it is the same component |
| 1.6 | G | D T | D·G ✅ · T·G ❌ | **T 768:** the top nav does not fit. "FFP calculator" wraps onto 2 lines, "Log in" overflows past the right edge, and there is horizontal scroll (scrollWidth 827). See bug B2 |
| 1.7 | A | D | D·A ✅ | Menu: "Logged in as Admin", Admin panel, Log out |
| 1.8 | F | D | D·F ✅ | "Logged in as Fame", Log out; no Admin panel and no Admin in the nav |
| 1.9 | F | M | M·F ✅ | "Logged in as Fame / on this device"; Mark payments / Change card usage / Apply event pricing; Log out |
| 1.10 | A | M | M·A ✅ | Tiles Events / Players / Reservations / Penalties "2 on the list" / Default pricing, "+ New event", "Logged in as Admin", Log out |
| 1.11 | A F | M D | M·A ✅ · M·F ✅ · D·A ✅ · D·F — | After logout: `/`, slot "Log in", localStorage cleared, `/admin` → `/login?redirect=/admin`. D·F not run separately |
| 1.12 | G | M D | M·G ✅ · D·G ✅ | |
| 1.13 | G | M | M·G ✅ | "Wrong password" (PL: "Nieprawidłowe hasło") |
| 1.14 | G | M | M·G ✅ | |
| 1.15 | A | M | M·A ✅ | Pills switch every section. The pills strip scrolls horizontally ("Defaults" is cut off at 375 until you scroll it), but the page itself does not scroll sideways |
| 1.16 | all | M T D | M ✅ · T ❌ · D ✅ | 767 → bottom bar, 768 → top nav: the swap works. No horizontal scroll at 360 or 375 on any screen. **But from 768 to ~980 px the top nav overflows:** guest needs ~860 px, admin ~980 px (account pill and part of EN/PL off-screen). See B2 |
| 1.17 | all | M D | ✅ | `main` gets `animate-in fade-in slide-in-from-bottom-1` per route. The `prefers-reduced-motion` rule exists in `globals.css`, but the OS setting could not be toggled, so reduce motion was checked in CSS only |
| 1.18 | all | M D | M·A ✅ | The badge reaches 4 after navigation (sometimes a moment later), and hides when the list is empty |

## 2. Language (PL)

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 2.1 | G | M D | — | The browser language cannot be changed in the built-in browser (`navigator.language` = en-US). The code takes it from `navigator.language` (`i18n-provider.tsx:22`) |
| 2.2 | G | M D | M·G ✅ · D — | First visit with en-US → EN, `lang="en"` |
| 2.3 | all | M D | M ✅ · D ✅ | Switches immediately with no reload (Wydarzenia, Gracze, FFP, Kary, Zaloguj/Admin, Kalkulator FFP) |
| 2.4 | all | M D | M ✅ · D — | After reload: `lang="pl"`, `localStorage.locale=pl` |
| 2.5 | all | M | ❌ | (1) **English leftover:** in PL the default name of a new event is "Wednesday, 07/10/2026". (2) **Truncation at 360 px in PL** (admin): lottery names ("Wiktor Jabłoński", "Zosia Majewska", "Adam Olszewski", "Ula Wieczorek", "Medicover Light"), names in Admin → Gracze ("Celina Wiśniewska", "Filip Lewandowski", "Hubert Szymański"), and the "Rezerwowi · 4" segment in Edit event. No English strings were found on the other screens (automatic text-node and aria-label scan) |
| 2.6 | G | M | ✅ | Polish explanation; "1 dzień", "3 dni" |
| 2.7 | all | M | ✅ | "śr. 30 wrz 2026", "paź", weekdays "pon / śro / pią" |
| 2.8 | all | M | ❌ | Days ✅ (1 dzień / 3 dni / EN 1 day · 3 days · 0 days). Players ✅ (2 gracze, 12 graczy, 15 players). **Wrong:** profile "1 events in 2026" (EN) and "1 wydarzeń w 2026" (PL); toast "Added 2 player(s) to the penalty list" is not pluralized |
| 2.9 | A | M | ✅ | Toast "Zapisano wydarzenie"; delete-player confirm "Na pewno? … Gracz zostanie trwale usunięty." |

## 3. Home: events list

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 3.1 | G | M D | M·G ✅ · D·G ✅ | The seed has one event, so "Earlier" appears only after a second one is created (checked on T: date tile + count) |
| 3.2 | G | M D | ✅ · ✅ | |
| 3.3 | F A | M D | M·F ✅ · M·A ✅ · D·A ✅ · D·F — | A: "2/12 paid · 10 unpaid" after 2 toggles; F: "0/12 paid · 12 unpaid" |
| 3.4 | G F A | M D | ✅ (all) | `/event/e1` and `/event/e1/lottery` |
| 3.5 | A | D | D·A ✅ | Opens `/admin/event` |
| 3.6 | all | M D | M·A ✅ · M·G ✅ · D — | "No events yet / New trainings will appear here." + "New event" for admin only |
| 3.7 | all | M D | — | In mock mode the data lives in localStorage, so network throttling does not affect loading and the skeleton cannot be triggered |

## 4. Event: payments, card usage, pricing

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 4.1 | G | M D | M·G ✅ · D·G ✅ | M: tiles Players / Paid / PLN avg; "Unpaid 12" is in the segment (the mockup also has 3 tiles). D: 4 KPI cards incl. Unpaid. Chips Paid/Unpaid, no toggles or steppers |
| 4.2 | F A | M D | M·F ✅ · M·A ✅ · D·F ✅ · D·A ✅ | 12 switches; steppers for 10 players (not for No card) |
| 4.3 | F A | M D | M·F ✅ · M·A ✅ · D·A ✅ | Coral, "1/12", survives reload. No toast (there was none before either) |
| 4.4 | F A | M | M·F ✅ | |
| 4.5 | F A | M D | M·F ✅ · D·A ✅ | Anna 38.5 → 23.5, other amounts unchanged (same as baseline); toast "Card usage updated successfully" |
| 4.6 | F A | M D | ✅ | − disabled at 0 |
| 4.7 | all | M D | M·G ✅ · M·F ✅ · D·A ✅ | Counts correct. With "Paid 0" the list is just empty, with no empty-state text |
| 4.8 | G | M D | M·G ✅ · D — | No Apply; instead "Apply is available to Admin and Fame." The steppers and inputs are still editable for a guest |
| 4.9 | F A | M D | ❌ | "from Defaults" ✅; Apply disabled until a change ✅. **"auto: N players ÷ 4" never appears:** the hint needs `event.courts == null`, but `addEvent`/`updateEvent` always write `courts` (`db.mock.ts:359, 486`, `db.ts:337`). Tested on e1 and on a new event with 15 players. See B5 |
| 4.10 | F A | M D | M·F ✅ | Courts 3 → 4: every player 51.33 (616 / 12), toast, survives reload. The sheet stays open after Apply |
| 4.11 | F A | M D | M·F ✅ | "Discard changes?" → Discard: courts back to 3 |
| 4.12 | F A | M D | M·F ✅ | "FAME total was cleared after a card-usage change. Enter it again if needed." |
| 4.13 | F A | M D | M·F ✅ | |
| 4.14 | A | M | M·A ✅ | **Same as golden:** Anna 0 PLN, the other 11 players 9.09 PLN |
| 4.15 | all | M | ✅ | Event with 15 players: 7 rows fully visible for admin (88 px rows), 9 for guest (72 px). No horizontal scroll. The top bar is not sticky |

## 5. FFP calculator

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 5.0 | G F A | M | M·G ✅ · M·F ✅ · M·A — | Opens from Events / Players / Penalties / Lottery; closing returns to the same screen |
| 5.0d | G F A | D | D·G ✅ | Dialog 860×485; Esc and ✕ close it; focus moves inside |
| 5.1 | G | M D | M ✅ · D ✅ | **Same as golden:** 23.00 / 25.50 / 25.50 / 29.25 / 33.00 / 462.00 / 75.00 / 0.00 / 387.00 |
| 5.1b | G | M D | M ✅ · D ✅ | **Same as golden:** 16.79 / 19.29 / 19.29 / 23.04 / 26.79 / 462.00 / 75.00 / 87.00 / 300.00 |
| 5.1c | G | M D | M ✅ · D ✅ | **Same as golden:** H3 39.50 / 42.00 / 41.31 / 46.80 / 49.50 / 693.00 / 75.00 / 0.00 / 618.00; H4 56.00 / 58.50 / 57.43 / 63.86 / 66.00 / 924.00 / 75.00 / 0.00 / 849.00 |
| 5.2 | — | — | see below | |
| 5.3 | all | M | ✅ | `inputMode`: decimal for price and FAME, numeric for counts. Hours stepper uses 0.5 steps, range 1–4 |
| 5.4 | all | M | ✅ | No NaN or undefined; "—" when there are no owners. Minor: with an empty price the result shows "0 PLN" instead of "0.00 PLN" |
| 5.5 | all | M D | M ✅ · D — | PL: labels in Polish, numbers unchanged (5.1/5.1b identical, currency "zł") |

**5.2 Golden values (recorded on `0ae825f`).** Input: Courts 3, Hours 2, Price 77; Medicover 3 / 2, Medicover Light 2 / 1, MS+ 3 / Multisport 2, MS Classic 2, No card 4.

| Set | Medicover | Medicover Light | MS+ | MS classic | No card | Total w/o discount | Card discount | Fame discount | To be paid |
|---|---|---|---|---|---|---|---|---|---|
| 5.1 (FAME empty) | 23.00 | 25.50 | 25.50 | 29.25 | 33.00 | 462.00 | 75.00 | 0.00 | 387.00 |
| 5.1b (FAME 300) | 16.79 | 19.29 | 19.29 | 23.04 | 26.79 | 462.00 | 75.00 | 87.00 | 300.00 |
| 5.1c Hours 3 | 39.50 | 42.00 | 41.31 | 46.80 | 49.50 | 693.00 | 75.00 | 0.00 | 618.00 |
| 5.1c Hours 4 | 56.00 | 58.50 | 57.43 | 63.86 | 66.00 | 924.00 | 75.00 | 0.00 | 849.00 |
| 0.2 event | Anna Kowalska 0 PLN; the other 11 players 9.09 PLN | | | | | | | | |

## 6. Lottery

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 6.1 | G | M D | ✅ · ✅ | |
| 6.2 | A | M D | ✅ · ✅ | M dock: icon-only Play ("Play"/"Play again"), "Add 3 to event", ⋯ |
| 6.3 | A | M D | ✅ · ✅ | "Free spots: 3 courts × 4 − 12 players = 0" |
| 6.4 | A | M D | ✅ · ✅ | 13 players; no Ewa; Ula disabled with Penalty, listed last. M: bottom sheet, D: popover (as wide as the trigger, ~340 px) |
| 6.5 | A | M | ✅ (D ✅) | |
| 6.6 | A | M D | ✅ · ✅ | "Reset lottery results? Winners and the waiting list for Past training will be deleted. Players already added to the event stay in it." |
| 6.7 | A | M D | ✅ · ✅ | |
| 6.8 | A | M D | ✅ · ✅ | 3 numbered winners + 2 on the waiting list; toast; survives reload |
| 6.9 | A | M D | ✅ · ✅ | Places > participants → Play disabled. Places cannot go below 1, so 0 is unreachable |
| 6.10 | A | M D | ✅ · ✅ | Toast "Player removed from winners list successfully!" |
| 6.11 | A | M D | ✅ · ✅ | |
| 6.12 | A | M D | ✅ · ✅ | |
| 6.13 | A | M D | ✅ · ✅ | Opens `/admin/event/e1`, 15 players, saved immediately. The seed has no penalized winner, so the "skipped with a warning" path was not exercised |
| 6.14 | F | M | ✅ | |

## 7. Players and profile

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 7.1 | G | M D | ✅ · ✅ | 25, letter groups, Penalty on Ewa and Ula |
| 7.2 | G | M D | ✅ · ✅ | |
| 7.3 | G | M D | ✅ · ✅ | |
| 7.4 | G | M D | ✅ · ✅ | "Penalty since 04.10" (no year), "Member since Mar 2026", notice + link, tiles. The calendar shows only one week column; see the mockup section |
| 7.5 | G | M D | ✅ · ✅ | |
| 7.6 | G | M D | ✅ · ✅ | 01.10–07.10 → "No activity recorded", Events played 0; Clear restores |
| 7.7 | G | M D | ✅ · ✅ | Minor: "Player not found" appears twice (H1 and the empty-state title) |

## 8. Penalty list

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 8.1 | G | M D | ✅ · ✅ | |
| 8.2 | F | M D | M ✅ · D — | |
| 8.3 | A | M D | ✅ · ✅ | |
| 8.4 | A | M D | M ✅ · D — | Public list 4, badge 4. The toast "Added 2 player(s)…" is not pluralized (2.8) |
| 8.5 | A | M D | M ✅ · D — | 23 players, no Ewa or Ula |
| 8.6 | A | M D | ✅ · ✅ | "Mark Ewa Kamińska as paid? They will be removed…" |
| 8.7 | A | M D | ✅ · ✅ | Toast "Ewa Kamińska removed from the penalty list"; her profile has no chip |
| 8.8 | A | M D | M ✅ · D — | "No one is on the penalty list / Everyone can play!"; badge hidden |
| 8.9 | A | M | — | Cannot be reproduced in mock mode: the data lives in localStorage, so going offline breaks nothing. A simulated `setItem` failure on the second write gave an inconclusive result |
| 8.10 | G | M | ✅ | "Lista kar", "Od 06.10.2026", "1 dzień" / "3 dni", "2 GRACZE" |

## 9. Admin: events

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 9.1 | A | M D | ✅ · ✅ | |
| 9.2 | A | M D | ✅ · ✅ | Name "Wednesday, 07/10/2026" (stays English in PL: 2.5); ⋯ only has "Remove all players" |
| 9.3 | A | M D | M ✅ · D — | The date popover stays open after you pick a date |
| 9.4 | A | M D | ✅ · ✅ | Toast "Added 15 of 16, 1 skipped (penalty)" + notice with "Everyone else from “Tuesday” was added." |
| 9.5 | A | M D | M ✅ · D — | 18 players, no duplicates. No toast for the Thursday add |
| 9.6 | A | M D | M ✅ · D — | Iga is already in the list after Tuesday, so she is not offered. "woz" → "No players found"; Basia added via "stepien"; Ewa and Ula disabled with Penalty |
| 9.7 | A | M D | ✅ · ✅ | "Unsaved changes" |
| 9.8 | A | M D | ✅ · ✅ | Tab bar, "‹ Events", sub-nav and top nav are all guarded; Cancel keeps you on the page. **Note:** the confirm is the native `window.confirm("You have unsaved changes. Leave without saving?")`, not the app's styled dialog |
| 9.9 | A | M D | M ✅ · D — | |
| 9.10 | A | M D | ✅ · ✅ | "Event created successfully" → `/admin/events`, the event shows 19 / 15 players |
| 9.11 | A | M D | M ✅ · D — | "Waiting list · 4" only for e1 (not on a new event); Ula disabled |
| 9.12 | A | M D | M ✅ · D — | |
| 9.13 | A | M D | M ✅ · D — | |
| 9.14 | A | M D | M ✅ · D — | |
| 9.15 | A | M D | M ✅ · D — | "This action will delete this event." Cancel / Delete → toast + redirect |
| 9.16 | A | M | ❌ | The dock stays above the tab bar ✅, but **the "Save event" / "Create event" button in the mobile dock is only 20 px tall** (should be 44, `h-11`). See B3, [m-edit-event-save-button-20px.jpg](2026-10-07-ui-redesign-test-run-screens/m-edit-event-save-button-20px.jpg) |

## 10. Admin: players

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 10.1 | A | M D | ✅ · ✅ | D: two columns |
| 10.2 | A | M D | ✅ · ✅ | "Test Gracz", MS chip in the public list. No toast |
| 10.3 | A | M D | M ✅ · D — | Same as baseline: a player with a blank name is created (Multisport, shows under "#"). Difference: the sheet now closes, while before it stayed open |
| 10.4 | A | M D | ✅ · ✅ | Chip CL, avatar amber |
| 10.5 | A | M D | ✅ · ✅ | "This action cannot be undone. This will permanently delete the player…". No toast after delete |
| 10.6 | A | M | ✅ | 5 options of 343×48 px; the selected one is highlighted with ✓ |

## 11. Admin: reservations and player picker

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 11.1 | A | M | ✅ | Tuesday · 16, Thursday · 10 |
| 11.2 | A | D | ✅ | |
| 11.3 | A | M D | ✅ · ✅ | M: bottom sheet 747 px; D: popover; search has focus |
| 11.4 | A | M | ✅ | Ewa can be selected and shows a Penalty chip. Visual: two clear buttons in the search field (B6) |
| 11.5 | A | M | ✅ (D ✅) | |
| 11.6 | A | M | ✅ | "Done · 5 selected" → removing a chip gives "· 4"; the field shows "+1 more" |
| 11.7 | A | M | ✅ | |
| 11.8 | A | M D | ✅ · ✅ | No toast |
| 11.9 | A | M D | ✅ · ✅ | "Wtorek", −Anna +Zosia, survives reload |
| 11.10 | A | M D | ✅ · ✅ | |
| 11.11 | A | M D | ✅ · ✅ | "Remove Bartek Nowak from this reservation?" |
| 11.12 | A | M | — | The emulator has no on-screen keyboard |
| 11.13 | A | D | ❌ | Esc closes ✅. **↑/↓ from the search field do not move the highlight and Enter does not toggle an option** (nothing is selected). Mentioned in the follow-ups as a T9 minor. See B4 |

## 12. Admin: defaults

| ID | Roles | View | Result | Note |
|---|---|---|---|---|
| 12.1 | A | M D | ✅ · ✅ | |
| 12.2 | A | M D | ✅ · ✅ | Toast "Default values successfully updated!"; the Pricing hint reads "takes 10 PLN off" |
| 12.3 | A | M D | ✅ · ✅ | Hours 3 "from Defaults". See P1: the next card-usage change re-prices the existing event with 3 h |
| 12.4 | A | M | ✅ | Same as baseline: letters → "NaN", −2 accepted. New: `inputMode=decimal` |

## 13. Responsive and accessibility

| ID | View | Result | Note |
|---|---|---|---|
| 13.1 | M 360/375 | ✅ | No horizontal page scroll on 14 routes at 360 (EN and PL) or at 375 |
| 13.2 | M | ❌ | Tab bar 43 px ✅, Defaults radios 48 px ✅. **The paid switch is 44×26 px and the card-usage stepper buttons are 32×32 px**, below 40 (the mockup draws 26 and 28 too) |
| 13.3 | M | ✅ | The last row sits above the dock and the bottom bar (Edit event, Lottery, Defaults, Event, Players) |
| 13.4 | M | ✅ | `env(safe-area-inset-bottom)` is applied to the bottom bar and `pb-tabbar`. Checked in CSS; there is no notch device to test on |
| 13.5 | D | ✅ | Tab order logo → Events → Players → Penalties → Admin → FFP → EN → PL → account; focus ring visible; focus moves into dialogs; Esc closes them. Keyboard in the picker: see 11.13 |
| 13.6 | all | ✅ | Icon buttons have aria-labels in the current language ("Zwiększ Korty", "Usuń: Adam Olszewski", "Więcej akcji"…); switches are `role="switch"` "Paid: Anna Kowalska". Minor: waiting-list "Add" and admin penalty "Paid" have no player name in their label, and both navs are labelled "Main" |
| 13.7 | all | ✅ | No white text on coral (coral surfaces use dark text). Only disabled buttons are low contrast (white on #D8D2E6, 1.47), which WCAG exempts |
| 13.8 | all | ✅ | Emulated at 640 px (≈ 200 % at 1280): mobile layout, no horizontal scroll |
| 13.9 | D | ✅ | 1440: content 120..1320; 1920: 360..1560 (1200 px, centred) |

## 14. Regression checks

| ID | Result | Note |
|---|---|---|
| 14.1 | ❌ | `pnpm check` fails right away: `next lint` → "Invalid project directory provided, no such directory: …/lint". Next 16.1.6 dropped `next lint`; the script in `package.json` is the same as on `0ae825f`, so this predates the redesign. `tsc --noEmit` passes. Running ESLint directly fails too: it picks up `../.eslintrc.cjs` and cannot find `eslint-plugin-react-hooks` |
| 14.2 | ✅ | 86 / 86 |
| 14.3 | ✅ | `pnpm build` succeeds (16 routes) |
| 14.4 | ✅ | |
| 14.5 | — | Not run, because it would use Supabase. In code, the badge renders only when `NEXT_PUBLIC_USE_MOCK_DB === "1"` (`src/app/layout.tsx:25`) |

---

## Bugs (❌ and findings outside the cases)

Sorted by severity.

### A. Broken logic / wrong numbers
No wrong numbers: FFP (5.1, 5.1b, 5.1c) and event amounts (4.14) match the golden values exactly on M and D.

- **B5 — "auto: N players ÷ 4" is never shown (4.9).** The condition is `eventCourts == null`, but both creating and saving an event always write `courts = ceil(players / 4)`.
  - Steps: create an event with 15 players → open it → Pricing. Courts = 4, no hint.
- **B7 — `pnpm check` is broken (14.1).** `next lint` does not exist in Next 16. This predates the redesign, but the CI check is red.

### B. Blocks or hinders the user
- **B2 — top nav overflows between 768 and ~980 px (1.6 T, 1.16 T).** Guest: "Log in" at 752–827 px with horizontal scroll. Admin: the account pill and part of EN/PL are off-screen (needs ~980 px). Screenshot: [t-768-header-overflow.jpg](2026-10-07-ui-redesign-test-run-screens/t-768-header-overflow.jpg).
  - Steps: set the window to 768×1024 → `/` (or log in as admin) → look at the right side of the top bar.
- **B4 — keyboard in the picker on desktop (11.13).** ↓/↑/Enter from the search field do nothing; you can only pick with the mouse.
  - Steps: D → Lottery (admin) → "Add players…" → ↓ ↓ Enter → nothing is selected.
- **B3 — "Save event" / "Create event" in the mobile dock is 20 px tall (9.16).** The button has `flex-1` inside a `flex-col` wrapper (`h-11` stops applying). Hard to hit with a thumb. Screenshot: [m-edit-event-save-button-20px.jpg](2026-10-07-ui-redesign-test-run-screens/m-edit-event-save-button-20px.jpg).
  - Steps: 375 px → Admin → Events → Edit "Past training" (or "+ New event") → bottom dock.

### C. Visual and copy
- **13.2 — touch targets:** switch 44×26 px and stepper 32×32 px (< 40).
- **B6 — two clear buttons in the picker search** (native WebKit `type=search` "×" plus the custom ✕). [m-picker-double-clear.jpg](2026-10-07-ui-redesign-test-run-screens/m-picker-double-clear.jpg)
- **B8 — "To be paid" in the mobile FFP sheet is not sticky**, although spec §5 and the mockup require it. The total is below the first screen. [m-pl-ffp-total-not-sticky.jpg](2026-10-07-ui-redesign-test-run-screens/m-pl-ffp-total-not-sticky.jpg)
- **2.5 — PL:** the default event name is English ("Wednesday, 07/10/2026"); names and the "Rezerwowi · 4" segment are truncated at 360 px.
- **2.8 — plurals:** "1 events in 2026", "1 wydarzeń w 2026", "Added 2 player(s)…".
- **Truncation:**
  - M Admin → Players: "Ewa Ka…" ([m-admin-players-ewa-truncated.jpg](2026-10-07-ui-redesign-test-run-screens/m-admin-players-ewa-truncated.jpg));
  - M lottery waiting list: "Ula Wieczor…" / "Me…" ([m-lottery-waiting-truncated.jpg](2026-10-07-ui-redesign-test-run-screens/m-lottery-waiting-truncated.jpg));
  - D event (admin): "Medicover Light · 38.5 P…" in the 3-column layout ([d-event-admin-meta-truncated.jpg](2026-10-07-ui-redesign-test-run-screens/d-event-admin-meta-truncated.jpg)).
- **Leave confirm** is the native `window.confirm`, not the app's styled dialog (9.8).
- **Hint text in the reservation picker** (Edit event → Reservation) reads "Matches first name or surname, with or without Polish letters.", which does not fit reservations.
- **Minor details:**
  - "Player not found" appears twice (7.7);
  - the date popover in Edit event does not close after you pick a date (9.3);
  - the "Paid 0" filter has no empty-state text (4.7);
  - empty price in FFP shows "0 PLN" instead of "0.00 PLN" (5.4).

### Existing behaviour, not a redesign regression (for information)
- **P1 — new Defaults change existing events.** After you change Hours in Defaults, the next card-usage change on an existing event recalculates its amounts with the Defaults hours, not with the hours the event was priced with. Example: Defaults Hours 2 → 3, then Filip +1 card on e1 gives 41.07 → 51.6 PLN, so the amount goes up despite the discount. `current-event.component.tsx` takes `draftPricingParams.hours` from Defaults, the same as on `0ae825f`.
- **P2 — "To be paid" is the sum of rounded per-player amounts.** On a new event with 15 players, Pricing shows "To be paid 616.01 PLN" where 4 × 2 × 77 = 616.00. This is `calculation-service`, which the redesign did not change.

---

## Differences from the mockups

1. **Home hero:**
   - the mockup has stat tiles ("16 players", "9/16 paid") inside the hero; the app uses small pills;
   - the button order is reversed: mockup "Open event | Lottery", app "Lottery | Open event".
2. **Event row (M):**
   - the mockup row is one block of ~52 px (avatar centred on the name + meta block, stepper and switch on the right);
   - in the app the row is 72 px (guest) or 88 px (admin): the meta line sits on a second grid row below the avatar, and the stepper is under the switch ([m-event-admin-rows.jpg](2026-10-07-ui-redesign-test-run-screens/m-event-admin-rows.jpg)).
3. **Players (M):** the chips show abbreviations (CL / MD / MS / NC / ML), while the mockup has full names ("Classic", "Medicover"…). On D the names are full, as in the mockup.
4. **Profile:**
   - the mockup activity grid is 18 weeks × 7 days, fully drawn; the app draws only the range that has data (one column) ([m-profile-calendar.jpg](2026-10-07-ui-redesign-test-run-screens/m-profile-calendar.jpg));
   - Desktop · player profile: the mockup has a third tile "Last event" and the date "Penalty since 03.10.2026" with the year; the app has 2 tiles and "since 04.10" without the year;
   - the name is repeated (page H1 + profile header).
5. **FFP sheet (M):** the mockup has a pinned dark footer (Total / Card / Fame + coral "To be paid"); in the app the results scroll with the form (B8).
6. **Lottery:**
   - the mockup has a text button "Play again" in the dock; on M the app shows an icon only;
   - on the mockup's waiting list a penalized player has only a Penalty chip, with no "Add" and no ✕ on the rows; the app shows a disabled "Add" and ✕ on every row;
   - Desktop · lottery: the mockup puts "Play again / Add 3 to event" on the right of the page header; the app puts them in the setup card on the left;
   - participants: the mockup shows "9 players selected" + the note "Penalty Ewa Kamińska can't be selected"; the app shows a list of chips without that note.
7. **Desktop · admin edit event:**
   - in the mockup the page header has "Unsaved changes · Delete event · Save event" on the right, and the "Current players" header has "Remove all";
   - in the app, Save is under the left column and Delete and Remove all are in the "⋯" menu.
8. **Player picker:**
   - spec §7 asks for a wide desktop popover; in the app it is as wide as the trigger (~340 px), with no "Clear / Done" footer;
   - the lottery and event adder pickers have no chips or "Done · N selected"; selected players disappear from the list.
9. **Breadcrumbs and actions:** Desktop · event and lottery match (breadcrumbs, KPI cards, card-type chips with full names).
10. **Login, Penalty list (EN/PL), Admin hub, Fame account sheet, Admin players, Defaults** match the mockups in structure and copy (to text and layout accuracy).

---

## Summary

- **Cells checked:** 201 ✅ · 9 ❌ · 28 — (not applicable, cannot be checked here, or not run separately).
- **By case:** 144 cases (0.1–14.5, without 5.2).
  - 130 passed: no ❌ and at least one ✅.
  - 9 failed: 1.6, 1.16, 2.5, 2.8, 4.9, 9.16, 11.13, 13.2, 14.1.
  - 5 are "—" only: 2.1, 3.7, 8.9, 11.12, 14.5.
- **Numbers:** FFP and event amounts match the golden values one to one (5.1, 5.1b, 5.1c on M and D; 4.14).
