import { freeSpots } from "~/utils/event-view";
test("freeSpots", () => {
  expect(freeSpots(4, 13)).toBe(3);
  expect(freeSpots(3, 12)).toBe(0);
  expect(freeSpots(2, 12)).toBe(0);
  expect(freeSpots(null, 12)).toBeNull();
  expect(freeSpots(undefined, 12)).toBeNull();
});
