import { groupByLetter } from "~/utils/search";
test("groupByLetter", () => {
  const g = groupByLetter([{ name: "Bartek" }, { name: "anna" }, { name: "Adam" }, { name: "Łucja" }, { name: "Leon" }]);
  expect(g.map((x) => x.letter)).toEqual(["A", "B", "L", "Ł"]);
  expect(g[0]!.items.map((x) => x.name)).toEqual(["Adam", "anna"]);
});
