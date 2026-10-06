import { translate, detectLocale, daysSince } from "~/i18n/translate";
import { en } from "~/i18n/messages/en";
import { pl } from "~/i18n/messages/pl";

test("pl has exactly the en keys", () => {
  expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort());
});

test("interpolates params", () => {
  expect(translate("en", "account.loggedInAs", { role: "Admin" })).toBe("Logged in as Admin");
});

test("polish plurals for days", () => {
  expect(translate("pl", "penalties.days", { count: 1 })).toBe("1 dzień");
  expect(translate("pl", "penalties.days", { count: 3 })).toBe("3 dni");
  expect(translate("pl", "penalties.days", { count: 5 })).toBe("5 dni");
  expect(translate("en", "penalties.days", { count: 1 })).toBe("1 day");
  expect(translate("en", "penalties.days", { count: 3 })).toBe("3 days");
});

test("detectLocale prefers stored value, then browser language", () => {
  expect(detectLocale("pl", "en-US")).toBe("pl");
  expect(detectLocale(null, "pl-PL")).toBe("pl");
  expect(detectLocale(null, "de-DE")).toBe("en");
  expect(detectLocale("xx", undefined)).toBe("en");
});

test("daysSince counts whole days and never goes negative", () => {
  const now = new Date("2026-10-07T12:00:00Z");
  expect(daysSince("2026-10-04T12:00:00Z", now)).toBe(3);
  expect(daysSince("2026-10-07T08:00:00Z", now)).toBe(0);
  expect(daysSince("2026-10-09T08:00:00Z", now)).toBe(0);
});
