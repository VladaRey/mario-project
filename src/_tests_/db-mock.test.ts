import { mockEventOperations, mockReservationOperations, resetMockDb } from "~/lib/db.mock";

beforeEach(() => resetMockDb());

test("getAllEvents carries real paid status", async () => {
  await mockEventOperations.updatePlayerPayment("e1", "p1", true);
  const grouped = await mockEventOperations.getAllEvents();
  const e1 = Object.values(grouped).flat().find((e) => e.id === "e1")!;
  expect(e1.players.find((p) => p.id === "p1")!.paid).toBe(true);
  expect(e1.players.find((p) => p.id === "p2")!.paid).toBe(false);
});

test("renameReservationList renames and keeps players", async () => {
  await mockReservationOperations.renameReservationList("r1", "Wtorek");
  const lists = await mockReservationOperations.getAllReservationLists();
  const r1 = lists.find((r) => r.id === "r1")!;
  expect(r1.name).toBe("Wtorek");
  expect(r1.players).toHaveLength(16);
});
