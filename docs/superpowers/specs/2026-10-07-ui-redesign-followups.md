# UI redesign — rulings and deferred follow-ups

Generated from the execution ledger on 2026-10-07. Rulings were taken autonomously during execution; deferred items are minor findings from per-task and final reviews that did not block merge.

## Rulings
- Ruling: work directly on feature/penalty-list, no separate worktree — the user asked for the redesign on this branch; it is not main — cost if wrong: commits need moving to another branch (cheap).
- Ruling: T7 temporarily removes the ✕ from old shadcn sheets until their task rewrites them — keeps the plan order; intermediate builds stay usable via overlay/Esc — cost if wrong: brief UX gap mid-branch only.
- Ruling: subagent commit trailers may carry their own model name instead of 'Claude Opus 5.5' — attribution wording, not code — cost if wrong: cosmetic history only
- Ruling: Task 2 test checks whole class tokens instead of substring 'text-white' (brief test conflicted with brief Button code having disabled:text-white) — intent preserved — cost if wrong: none
- Ruling: Task 18 dispatch carries the leave-guard follow-up (stop resetting dirty in confirmLeave; add a small guard test) since Task 18 is the first dirty-state consumer — cost if wrong: small extra scope in T18
- Ruling: Tasks 15+16 batched into one implementer/review (small, independent, separate commits) — saves a full dispatch cycle — cost if wrong: reviewer attention split across two small diffs
- Ruling: Tasks 19+20 batched (same sheet+Slot+admin-list pattern, separate commits) — cost if wrong: larger single review
- Ruling: accept the empty-state 'New reservation' action (Extra) — empty list was a dead end and handleSave would be dead code — cost if wrong: one redundant button
- Ruling: SHOULD-FIX polish items folded into Task 22 (see task-22-extra.md); Task 22 Step 6 manual pass moved to a separate user-run testing session — cost if wrong: T22 diff larger; manual verification happens later

## Deferred minors (can wait)
- Task 1: minor (deferred): jest.config fileMock mapper points to nonexistent 'test/__ mocks __' path (pre-existing)
- Task 2: minor (deferred): tailwind chart.* colours reference removed --chart vars (dead config); darkMode class + dark: classes inert; geist dep unused
- Task 2: minor (deferred): visual check of Manrope/lilac bg not done (dev server unavailable) — covered by Task 22 manual pass
- Task 3: minor (deferred): plural tests only cover 1/3/5 days; add 0,2,12,22,25,1.5 + common.players
- Task 3: minor (deferred): first render always EN, stored locale applied in effect (brief flash for PL users)
- Task 4: minor (deferred): no direct login() test; stored admin takes precedence over later fame login (brief-mandated)
- Task 5: minor (deferred): getAllEvents map yields {paid:false} for null pe.player (filter would be safer); PR must note RLS update check on reservation_lists
- Task 6: minor (deferred): Segmented uses tab/tablist semantics for a filter (plan-mandated); SkeletonRows aria-busy without label; thin tests for CardTypeChip/ListRow/StatTile clamp
- Task 7: minor (deferred): desktop dialog/alert need sm:rounded-3xl (base sm:rounded-lg wins); SheetContent base gap-4 + pb-safe spacing; title read twice (visible div + sr-only); MoreMenu role=menu w/o arrow keys; no ResponsiveSheet tests
- Task 8: minor (deferred): confirmLeave resets dirty on confirm (stays unguarded if page doesn't unmount); logout bypasses guard; Fame button lacks aria-haspopup; no GuardedLink/useLeaveGuard test; logo duplicated in desktop-top-bar
- Task 9: minor (deferred, SHOULD FIX before merge): adder pickers (selected={[]}) show 'Done · 0 selected' and Clear is meaningless; ArrowDown from search input doesn't reach options; no mobile-branch tests
- Task 10: minor (deferred): earlier-row paid chips hidden below sm; admin/page.tsx hard-coded strings until T17
- Task 11: minor (deferred, SHOULD FIX before merge): mobile payment row is single-line — names/meta truncate at 375px; canvas shows two-line row (name+toggle, meta+stepper)
- Task 11: minor (deferred): messages literal defeats useCallback memo; unused showTrigger prop; fameCleared set before save succeeds / not cleared on discard; decimal point swallowed in price input (pre-existing); discountPerUsage missing from deps (pre-existing)
- Task 12: minor (deferred): 'MS+'/'MS Classic' literals (plan-mandated, brand names); redundant label+aria-label
- Task 13: minor (deferred, SHOULD FIX before merge): waiting-list row at 375px truncates name to 'U…' (penalty chip + Add + ✕ in trailing); MOCK DATA badge overlaps ActionDock (dev-only, consider bottom offset above dock)
- Task 13: minor (deferred, SHOULD FIX): PL 'korty' wrong for 5+ courts in lottery.freeSpots (make plural-aware or neutral 'kort.'); dead addPlayersToEvent prop; handleReset no error handling (pre-existing)
- Task 14: minor (deferred): EN '1 events in 2026' (library-provided count, no singular); onLoaded count only on mount; desktop avatar size via className override
- Task 15/16: minor (deferred): no admin-case test for Manage; login error <p> lacks role=alert
- Task 17: minor (deferred): hub load errors swallowed; initial '0 players' flash before data
- Task 18: minor (deferred, SHOULD FIX): failed save still shows success, resets baseline and drops leave guard (pages swallow errors; pre-existing success toast); date caption not tied to picker; isDeleting unused
- Task 20: minor (deferred, SHOULD FIX): header add doesn't select the new reservation (old Add New did); handleEdit uses activeTab while UI renders fallback active → Edit may silently no-op; empty-state flash before first load; rename failure swallowed
- Task 21: minor (deferred): defaults fetch failure leaves skeleton forever (console only)
- Task 22: minor (deferred): ui/dialog now requires I18nProvider; lottery penalized-row card label truncates 'Me…'; unused radix tabs/separator deps in package.json; payment-row empty auto column on md+ without stepper

## Still open before production deploy
- Supabase RLS: confirm an UPDATE policy on `reservation_lists` for the anon key (renameReservationList now throws and shows an error toast if the update is blocked).
- Polish copy proofread by a native speaker (penalty explanation and all PL strings).
- Manual test pass: docs/superpowers/specs/2026-10-07-ui-redesign-testing-prompt.md
