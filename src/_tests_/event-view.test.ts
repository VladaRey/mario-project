import { averageAmount, filterByPaid, flattenEvents, paidSummary } from "~/utils/event-view";
import type { Event } from "~/lib/db";

test("paidSummary", () => {
  expect(paidSummary([{ paid: true }, { paid: false }, {}])).toEqual({ paid: 1, total: 3, unpaid: 2 });
  expect(paidSummary([])).toEqual({ paid: 0, total: 0, unpaid: 0 });
});

test("flattenEvents sorts by date desc", () => {
  const ev = (id: string, date: string) => ({ id, date, name: id, players: [] }) as unknown as Event;
  const out = flattenEvents({ "2026-09-23": [ev("a", "2026-09-23")], "2026-10-06": [ev("b", "2026-10-06"), ev("c", "2026-10-06")] });
  expect(out.map((e) => e.id)).toEqual(["b", "c", "a"]);
});

test("filterByPaid", () => {
  const ps = [{ id: "1" }, { id: "2" }, { id: "3" }];
  const st = { "1": true, "2": false };
  expect(filterByPaid(ps, st, "all").map((p) => p.id)).toEqual(["1", "2", "3"]);
  expect(filterByPaid(ps, st, "paid").map((p) => p.id)).toEqual(["1"]);
  expect(filterByPaid(ps, st, "unpaid").map((p) => p.id)).toEqual(["2", "3"]);
});

test("averageAmount", () => {
  expect(averageAmount({ a: 38.5, b: 30 }, ["a", "b"])).toBe(34.25);
  expect(averageAmount({}, ["a"])).toBeNull();
});
