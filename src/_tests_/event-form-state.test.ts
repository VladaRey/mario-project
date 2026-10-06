import { isEventFormDirty } from "~/utils/event-form-state";

const base = { name: "Tuesday", date: "2026-10-06", players: ["p1", "p2"] };

test("untouched form is clean", () => {
  expect(isEventFormDirty(base, { ...base })).toBe(false);
});
test("player order does not matter", () => {
  expect(isEventFormDirty(base, { ...base, players: ["p2", "p1"] })).toBe(false);
});
test("reverted change is clean again", () => {
  const changed = { ...base, players: ["p1"] };
  expect(isEventFormDirty(base, changed)).toBe(true);
  expect(isEventFormDirty(base, { ...changed, players: ["p1", "p2"] })).toBe(false);
});
test("name or date change is dirty", () => {
  expect(isEventFormDirty(base, { ...base, name: "Tue" })).toBe(true);
  expect(isEventFormDirty(base, { ...base, date: "2026-10-07" })).toBe(true);
});
