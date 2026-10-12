import { saveReservationEdit } from "~/components/reservation-list";

test("renames only when the name changed, always updates players", async () => {
  const ops = { renameReservationList: jest.fn().mockResolvedValue(undefined), updateReservationPlayers: jest.fn().mockResolvedValue(undefined) };
  await saveReservationEdit(ops, { id: "r1", name: "Tuesday" }, { name: "Tuesday", players: ["p1"] });
  expect(ops.renameReservationList).not.toHaveBeenCalled();
  expect(ops.updateReservationPlayers).toHaveBeenCalledWith("r1", ["p1"]);
  await saveReservationEdit(ops, { id: "r1", name: "Tuesday" }, { name: "Wtorek", players: ["p1"] });
  expect(ops.renameReservationList).toHaveBeenCalledWith("r1", "Wtorek");
});
