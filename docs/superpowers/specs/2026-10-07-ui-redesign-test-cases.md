# UI redesign: test cases

Date: 2026-10-07 · Spec: [2026-10-07-ui-redesign-design.md](2026-10-07-ui-redesign-design.md)

Manual test pass for the redesigned app. Run it in **mock mode** (README → "Mock mode", `pnpm dev`). Press **Reset** in the "MOCK DATA" badge before each section that changes data.

## How to run

**Matrix.** Run each case on every applicable cell:

| Code | Viewport | How |
|---|---|---|
| **M** | Mobile 375×812 | DevTools device mode or a phone on the same network |
| **T** | Tablet 768×1024 | Checks the breakpoint (desktop nav starts at 768) |
| **D** | Desktop 1280×800 | Normal browser window |

The **Roles** column uses: **G** guest (no login), **F** Fame (fame password), **A** admin (admin password).

Each section runs in **EN**. Cases marked **PL** also run in Polish.

**Seed data (after Reset).**
- 25 players `p1`–`p25`. Card types cycle: Medicover, Multisport, Classic, No card, Medicover Light.
- Penalized players:
  - **Ewa Kamińska** (`p5`, since 3 days ago), who is in the "Tuesday" reservation;
  - **Ula Wieczorek** (`p20`, since 1 day ago), who is first on the waiting list of the past event.
- Reservations:
  - **Tuesday**: `p1`–`p16`, 16 players including Ewa;
  - **Thursday**: `p10`–`p19`.
- Past event **"Past training"** (`e1`, 7 days ago):
  - players `p1`–`p12`, including Ewa;
  - 3 courts, nobody paid;
  - lottery winners `p17`–`p19` (Radek, Sara, Tomek);
  - waiting list `p20`–`p23` (Ula, Wiktor, Zosia, Adam).

**Result format.** For each case write ✅, ❌ (with a note) or — (not applicable), one per matrix cell.

---

## 0. Before the redesign (one-time)

| ID | Case | Expected |
|---|---|---|
| 0.1 | On the **current** main branch, fill the FFP calculator with the fixed input set from §5.1 and write down every result value | Golden values recorded in §5.1 |
| 0.2 | On the current branch, open "Past training" as admin, set card usage of Anna Kowalska to 1, open Pricing, set FAME total = 100, Apply. Write down every player's amount | Golden amounts recorded in §5.2 |
| 0.3 | `pnpm test` | Passes; the new golden unit tests from plan step 1 pass |

## 1. Shell, navigation, account

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 1.1 | G | M | Open `/` | Top bar with logo and EN·PL. Bottom bar: Events (active), Players, FFP (raised), Penalties with badge **2**, **Log in** |
| 1.2 | F | M | Log in with the fame password | Last slot shows **Fame** in muted style. No Admin slot |
| 1.3 | A | M | Log in with the admin password | Last slot shows **Admin** |
| 1.4 | G F A | M | Tap each tab | Correct page opens, the active tab is highlighted, no full page reload |
| 1.5 | G F A | M | Open an inner screen (event, profile, lottery) | Top bar shows "‹ Back"; back returns to the previous screen |
| 1.6 | G | D T | Open `/` | Top nav: Events, Players, Penalties (2); right side: FFP calculator, EN/PL, **Log in**. No bottom bar |
| 1.7 | A | D | Click the account pill | Menu: "Admin", Admin panel, Log out |
| 1.8 | F | D | Click the account pill | Menu: "Fame", Log out; no Admin panel |
| 1.9 | F | M | Tap **Fame** | Account sheet: "Logged in as Fame", the three things Fame can do, **Log out** |
| 1.10 | A | M | Tap **Admin** | Admin hub with tiles Events, Players, Reservations, Penalties (2 on the list), Default pricing, "+ New event", **Log out** |
| 1.11 | A F | M D | Log out (from the hub, the account sheet or the menu) | Back to `/` as guest; last slot shows **Log in**; `/admin` redirects to login |
| 1.12 | G | M D | Open `/admin` directly | Redirect to `/login?redirect=/admin` |
| 1.13 | G | M | Wrong password on login | Error shown; still guest |
| 1.14 | G | M | "Continue as guest" on login | Opens `/` |
| 1.15 | A | M | Open `/admin/players` | Admin sub-nav pills; Players active; pills switch sections |
| 1.16 | all | M T D | Resize between 767 and 768 px | Bottom bar ↔ top nav swap; no horizontal scroll at any width ≥ 360 |
| 1.17 | all | M D | Navigate between screens | Content fades/slides in briefly; with OS "reduce motion" on, no animation |
| 1.18 | all | M D | Change the penalty count (add one in admin) | Penalties badge updates to 3 after navigation |

## 2. Language (PL)

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 2.1 | G | M D | First visit with a browser language `pl-PL` (clear `localStorage`) | UI in Polish, `<html lang="pl">` |
| 2.2 | G | M D | First visit with a browser language `en-US` | UI in English |
| 2.3 | all | M D | Switch EN → PL in the top bar | Whole UI switches at once, including tab labels (Wydarzenia, Gracze, FFP, Kary, Admin), buttons, empty states and toasts |
| 2.4 | all | M D | Reload after switching | Language is kept |
| 2.5 | all | M | Go through every screen in PL | No English leftovers; no truncated or overflowing labels (Polish is longer) |
| 2.6 | G | M | Penalty list in PL | Polish explanation text; durations "1 dzień", "3 dni" |
| 2.7 | all | M | Dates in PL | Polish month and day names (date-fns `pl`) |
| 2.8 | all | M | Plurals: 1/2/5 players, 1/2/5 days | Correct forms in both languages |
| 2.9 | A | M | Trigger toasts and confirms in PL (save event, delete player) | Texts in Polish |

## 3. Home: events list

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 3.1 | G | M D | Open `/` | Hero shows the latest event (name, date, players). "Earlier" lists the other events with date tiles and player counts |
| 3.2 | G | M D | Look for paid/unpaid figures on Home | Not shown for guests |
| 3.3 | F A | M D | Same, after marking 2 players paid in "Past training" | Hero or row shows "2/12 paid" and "10 unpaid" |
| 3.4 | G F A | M D | "Open event" and "Lottery" in the hero | Open `/event/[id]` and `/event/[id]/lottery` |
| 3.5 | A | D | "+ New event" | Opens `/admin/event` |
| 3.6 | all | M D | Delete all events (admin), then open `/` | Empty state "No events yet"; "+ New event" for admin only |
| 3.7 | all | M D | Slow network (DevTools "Slow 3G") | Skeleton rows instead of "Loading…" |

## 4. Event: payments, card usage, pricing

Use "Past training" (`e1`).

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 4.1 | G | M D | Open the event | Stats: 12 players, 0/12 paid, unpaid, avg PLN. Card-type chips with counts. Rows show **Paid/Unpaid** text chips; card usage as text; **no** toggles or steppers |
| 4.2 | F A | M D | Open the event | Rows show paid toggle; stepper only for players with a card (not "No card") |
| 4.3 | F A | M D | Toggle paid for Anna | Toggle turns coral; stats "1/12 paid"; reload keeps it |
| 4.4 | F A | M | Toggle paid off again | Back to unpaid, stats update |
| 4.5 | F A | M D | Card usage + for Anna | Her amount drops by 15 PLN (from Defaults); other amounts adjust; toast confirms |
| 4.6 | F A | M D | Card usage − below 0 | Not possible (− disabled at 0) |
| 4.7 | all | M D | Filter **Unpaid** / **Paid** / **All** | List filters; counts in the segment labels are right; data is not changed |
| 4.8 | G | M D | Open **Pricing** | Sheet with the values; **no Apply** button |
| 4.9 | F A | M D | Open Pricing | Courts shows "auto: 12 players ÷ 4" only when courts were not set by hand; hours and price show "from Defaults" when they come from Defaults; Apply disabled until something changes |
| 4.10 | F A | M D | Change Courts and Apply | Amounts recalculated and saved; toast; reload keeps them |
| 4.11 | F A | M D | Change a value, then close the sheet | "Discard changes?" dialog; Discard restores the values |
| 4.12 | F A | M D | Set FAME total, Apply; then change one card usage; open Pricing | FAME total is empty and the hint "FAME total was cleared after a card-usage change" is shown |
| 4.13 | F A | M D | Open Pricing on a fresh event (no card changes) | No FAME-cleared hint |
| 4.14 | A | M | Compare amounts with golden values §5.2 after repeating step 0.2 | Identical |
| 4.15 | all | M | Event with 16+ players | 7–8 rows visible per phone screen; no horizontal scroll |

## 5. FFP calculator (critical regression)

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 5.0 | G F A | M | Tap the FFP button from every tab | Sheet opens from any screen; close returns to the same screen |
| 5.0d | G F A | D | Click "FFP calculator" in the top nav | Dialog opens; Esc and ✕ close it |
| 5.1 | G | M D | Enter: Courts 3, Hours 2, Price per 1h 77, FAME total empty, Medicover owners 3 / usage 2, Medicover Light owners 2 / usage 1, MS+ owners 3 / Multisport usage 2, MS Classic owners 2, No card 4 | Every result (Medicover, Medicover Light, MS+, MS classic, No card, Total w/o discount, Card discount, Fame discount, To be paid) equals the golden values from 0.1 |
| 5.1b | G | M D | Same input with FAME total = 300 | Equals golden values (record in 0.1 too) |
| 5.1c | G | M D | Hours 3 and 4 with MS Classic owners > 0 | Equals golden values (MS Classic scaling) |
| 5.2 | — | — | Golden values (fill in during 0.1/0.2) | `______` |
| 5.3 | all | M | Numeric keyboard on phone inputs | Decimal keyboard opens |
| 5.4 | all | M | Empty or 0 inputs | No NaN or "undefined"; results show "—" where there are no owners |
| 5.5 | all | M D | PL language | Labels in Polish; numbers unchanged |

## 6. Lottery

Reset the mock data first. Use "Past training".

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 6.1 | G | M D | Open the lottery | Only Winners (Radek, Sara, Tomek, numbered) and Waiting list (Ula with Penalty chip, then Wiktor, Zosia, Adam). No setup, no dock, no remove or add buttons |
| 6.2 | A | M D | Open the lottery | Setup card, Winners with ✕, Waiting list with "Add"; dock with Play, Add N to event, ⋯ |
| 6.3 | A | M D | Look at the free-spots hint | "Free spots: 3 courts × 4 − 12 players = 0", shown because courts are set; Places is still editable |
| 6.4 | A | M D | Open participants picker | Players not in the event; **Ewa** is not offered (she is in the event); **Ula** greyed with Penalty, cannot be selected |
| 6.5 | A | M | Search "stepien", then "zzz" | "stepien" finds **Basia Stępień** (diacritics ignored); "zzz" shows "No players found" |
| 6.6 | A | M D | ⋯ → Reset | Confirm dialog with the consequence text. **Cancel** keeps the results |
| 6.7 | A | M D | ⋯ → Reset → **Reset** | Results deleted; setup is empty; reload shows no results |
| 6.8 | A | M D | Pick 5 participants, Places 3, **Play** | 3 numbered winners, 2 on the waiting list; reload keeps them |
| 6.9 | A | M D | Places greater than participants, or 0 | Play disabled |
| 6.10 | A | M D | Remove a winner with ✕ | The winner disappears; toast |
| 6.11 | A | M D | **Add** the first waiting player | They move to the winners |
| 6.12 | A | M D | Try to add **Ula** (penalized) from the waiting list | Not possible: her "Add" button is disabled and she shows a Penalty chip |
| 6.13 | A | M D | **Add N to event** | Winners added (penalized ones skipped with a warning); opens Edit event; added players are in the list |
| 6.14 | F | M | Open the lottery | Same as guest (results only) |

## 7. Players and profile

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 7.1 | G | M D | Open Players | 25 players, grouped by letter; card-type chip; **Penalty** chip on Ewa and Ula |
| 7.2 | G | M D | Search "kam", "KAM", "kaminska" | All find Ewa Kamińska |
| 7.3 | G | M D | Search for something with no results | Empty state "No players found" |
| 7.4 | G | M D | Open Ewa's profile | Header with avatar, card type, "Penalty since …", "Member since …"; notice with a link to the penalty list; tiles Events played, Lottery wins / attempts; activity calendar |
| 7.5 | G | M D | Open a non-penalized player's profile | No penalty chip or notice |
| 7.6 | G | M D | Pick a date range in Activity | Calendar and counts filter; "Clear" resets |
| 7.7 | G | M D | Open `/players/player/unknown` | "Player not found" with "Back to players" |

## 8. Penalty list: public and admin

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 8.1 | G | M D | Open Penalties | "Penalty list"; explanation block (EN text from spec §8); "2 players"; Ula (1 day), Ewa (3 days) with "Since dd.MM.yyyy"; **no Manage** |
| 8.2 | F | M D | Same | Same as guest |
| 8.3 | A | M D | Same | **Manage** button opens `/admin/penalties` |
| 8.4 | A | M D | `/admin/penalties`: add Iga and Tomek | Both added; public list shows 4; tab badge 4 |
| 8.5 | A | M D | Picker on the admin page | Only non-penalized players offered |
| 8.6 | A | M D | **Paid ✓** on Ewa → Cancel | Nothing changes |
| 8.7 | A | M D | **Paid ✓** on Ewa → Mark as paid | Ewa removed; public list updates; her profile has no penalty chip |
| 8.8 | A | M D | Remove all penalties | Public empty state "No one is on the penalty list. Everyone can play!"; badge hidden |
| 8.9 | A | M | Simulate one failure (offline in DevTools while adding 2) | Partial-failure toast "Added X of Y…"; the failed ones stay selected |
| 8.10 | G | M | PL | "Lista kar", Polish explanation, "Od dd.MM.yyyy", "1 dzień" / "3 dni" |

## 9. Admin: events (create, edit, delete)

Reset the mock data first.

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 9.1 | A | M D | Hub → Events | `/admin/events`: rows with Edit and Lottery; "+ New event" |
| 9.2 | A | M D | **+ New event** | Date = today; name = formatted date; Save says **Create event**; no Delete |
| 9.3 | A | M D | Change the date before typing a name | Name follows the date |
| 9.4 | A | M D | Add from reservation **Tuesday** | 15 players added; notice "Not added — unpaid penalty: Ewa Kamińska. Everyone else from "Tuesday" was added."; toast "Added 15 of 16, 1 skipped" |
| 9.5 | A | M D | Then add **Thursday** too | Only players not already in the list are added (no duplicates) |
| 9.6 | A | M D | Switch the source to **Individual**, search "woz", select Iga | Iga added; Ewa and Ula greyed with Penalty |
| 9.7 | A | M D | Look at Save | "Unsaved changes" marker shown |
| 9.8 | A | M D | Try to leave (tab bar, back or close tab) while dirty | Confirm "Leave without saving?" appears; Cancel stays |
| 9.9 | A | M D | Leave when **not** dirty | No confirm |
| 9.10 | A | M D | **Create event** | Toast; redirect to `/admin/events`; the event is listed with the right count |
| 9.11 | A | M D | Edit "Past training": Waiting list source | Shown only when the waiting list is not empty; Ula greyed (penalty) |
| 9.12 | A | M D | Remove a player with ✕ | Removed from the local list; Unsaved marker |
| 9.13 | A | M D | ⋯ → Remove all players → confirm | List empty locally; nothing saved until Save |
| 9.14 | A | M D | ⋯ → Remove all → reload without saving | Original players still there |
| 9.15 | A | M D | ⋯ → Delete event → Cancel / Confirm | Cancel keeps it; Confirm deletes, toast, redirect to `/admin/events` |
| 9.16 | A | M | Long names and 20+ players | Rows don't overflow; dock stays above the tab bar |

## 10. Admin: players

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 10.1 | A | M D | Open Admin → Players | List with search, Edit and Delete per row; "Add player" |
| 10.2 | A | M D | **Add player**: name "Test Gracz", card Multisport, Save | Added; visible on public Players with the right chip |
| 10.3 | A | M D | Add player with an empty name | Same as before the redesign (no new validation in scope); note the result |
| 10.4 | A | M D | **Edit** Ewa: change the card type to Classic | Saved; chip and avatar colour update |
| 10.5 | A | M D | **Delete** → Cancel / Confirm | Cancel keeps; Confirm removes; confirm text says it can't be undone |
| 10.6 | A | M | Card-type options in the sheet | Five large radio options; selected one highlighted; usable with a thumb (≥ 44 px) |

## 11. Admin: reservations and player picker

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 11.1 | A | M | Open Reservations | Tabs Tuesday (16), Thursday (10); list for the active tab; Edit and Delete in the card header |
| 11.2 | A | D | Open Reservations | Reservation list on the left, players on the right |
| 11.3 | A | M D | **New** reservation: name "Saturday", open **Add players…** | Picker opens (mobile: bottom sheet; desktop: popover), search autofocused |
| 11.4 | A | M | In the picker search "ka" | Matching players, selected first; Ewa selectable but shows a Penalty chip |
| 11.5 | A | M | Search "wozniak" (no Polish letters) | Finds Iga Woźniak |
| 11.6 | A | M | Select 5, remove 1 via its chip, tap **Done · 4 selected** | Picker closes; 4 chips under the field ("+N more" if they don't fit) |
| 11.7 | A | M | **Clear** in the picker | All deselected |
| 11.8 | A | M D | Save "Saturday" | New tab or list item with 4 players |
| 11.9 | A | M D | Edit "Tuesday": rename to "Wtorek", remove a player and add one, Save | Name and players saved; reload keeps both |
| 11.10 | A | M D | Delete a reservation → confirm | Removed; the text says it can't be undone |
| 11.11 | A | M D | Remove a player from a reservation (✕ in the list) → confirm | Removed |
| 11.12 | A | M | Picker with the keyboard open on a phone | List stays visible above the keyboard; footer reachable |
| 11.13 | A | D | Picker keyboard use | ↑/↓ move, Enter toggles, Esc closes |

## 12. Admin: defaults

| ID | Roles | View | Steps | Expected |
|---|---|---|---|---|
| 12.1 | A | M D | Hub → Default pricing | `/admin/defaults` with Price per hour, Hours, Discount per card usage and the hint text |
| 12.2 | A | M D | Change Discount to 10, Save | Toast; open an event: a card use now takes 10 PLN off |
| 12.3 | A | M D | Change Hours, then open Pricing on an event | New hours prefilled, "from Defaults" hint |
| 12.4 | A | M | Invalid input (letters, negative) | Same as before the redesign (no new validation in scope); numeric keyboard on phones; note the result |

## 13. Responsive and accessibility (every screen)

| ID | View | Check | Expected |
|---|---|---|---|
| 13.1 | M (360 and 375) | No horizontal scroll | ✅ on all screens |
| 13.2 | M | Touch targets | ≥ 40 px (tab bar, toggles, steppers, ✕ buttons) |
| 13.3 | M | Content under the fixed bottom bar and dock | Last row is fully visible (bottom padding) |
| 13.4 | M | iPhone safe area | Bottom bar respects `env(safe-area-inset-bottom)` |
| 13.5 | D | Keyboard only | Tab order follows the layout; focus ring visible; sheets and dialogs trap focus; Esc closes |
| 13.6 | all | Screen reader labels | Icon-only buttons have aria-labels (in the current language); toggles are `role="switch"` with the player name |
| 13.7 | all | Contrast | Body text ≥ 4.5:1; no white text on coral |
| 13.8 | all | Zoom 200 % | Layout reflows; nothing cut off |
| 13.9 | D | 1440 and 1920 wide | Content capped at 1200 px and centred |

## 14. Regression checks

| ID | Check | Expected |
|---|---|---|
| 14.1 | `pnpm check` | No lint or type errors |
| 14.2 | `pnpm test` | All tests pass, including the golden pricing tests |
| 14.3 | `pnpm build` | Builds |
| 14.4 | Mock mode badge | Still shown bottom-left; Reset works |
| 14.5 | Production build without the mock flag | No "MOCK DATA" badge; Supabase used |
