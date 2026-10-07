import { pricingHints } from "~/utils/event-view";

test("pricing hints show where values come from", () => {
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 4, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: true, hoursFromDefaults: true, priceFromDefaults: true });
  expect(pricingHints({ eventCourts: 3, playersCount: 16, draft: { courts: 3, hours: 1.5, pricePerHour: 80 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: false, hoursFromDefaults: false, priceFromDefaults: false });
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 5, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }).courtsAuto)
    .toBe(false);
});

test("courts hint: saved courts equal to the auto value count as auto (addEvent/updateEvent always store courts)", () => {
  const base = { playersCount: 15, defaults: { hours: 2, pricePerHour: 77 } };
  const draft = (courts: number) => ({ courts, hours: 2, pricePerHour: 77 });
  // 15 players → ceil(15 / 4) = 4
  expect(pricingHints({ ...base, eventCourts: 4, draft: draft(4) }).courtsAuto).toBe(true);
  // draft changed away from auto
  expect(pricingHints({ ...base, eventCourts: 4, draft: draft(5) }).courtsAuto).toBe(false);
  // saved courts differ from auto (manual value, or player count changed since)
  expect(pricingHints({ ...base, eventCourts: 3, draft: draft(3) }).courtsAuto).toBe(false);
  expect(pricingHints({ ...base, eventCourts: 3, draft: draft(4) }).courtsAuto).toBe(false);
});
