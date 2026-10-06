import { pricingHints } from "~/utils/event-view";

test("pricing hints show where values come from", () => {
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 4, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: true, hoursFromDefaults: true, priceFromDefaults: true });
  expect(pricingHints({ eventCourts: 3, playersCount: 16, draft: { courts: 3, hours: 1.5, pricePerHour: 80 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: false, hoursFromDefaults: false, priceFromDefaults: false });
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 5, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }).courtsAuto)
    .toBe(false);
});
