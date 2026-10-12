import { matchesQuery, normalizeForSearch, orderOptions } from "~/utils/search";

test("normalizeForSearch strips Polish diacritics including ł", () => {
  expect(normalizeForSearch("Łukasz Michał")).toBe("lukasz michal");
  expect(normalizeForSearch("  Iga   WOŹNIAK ")).toBe("iga wozniak");
  expect(normalizeForSearch("Zażółć gęślą jaźń")).toBe("zazolc gesla jazn");
});

test("matchesQuery", () => {
  expect(matchesQuery("Iga Woźniak", "wozniak")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "WOŹ")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "iga w")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "kowal")).toBe(false);
  expect(matchesQuery("Iga Woźniak", "   ")).toBe(true);
});

test("orderOptions: selected, enabled, disabled; alphabetical inside", () => {
  const opts = [
    { value: "3", label: "Zosia" }, { value: "1", label: "Anna" },
    { value: "2", label: "Ewa", disabled: true }, { value: "4", label: "Łucja" },
  ];
  expect(orderOptions(opts, ["3"]).map((o) => o.label)).toEqual(["Zosia", "Anna", "Łucja", "Ewa"]);
});
