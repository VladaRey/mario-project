import {
  isPenalized,
  getPenalizedIds,
  partitionNewIds,
  withFreshPenalty,
  settleEach,
} from "../utils/penalty-util";

describe("isPenalized", () => {
  test("null / undefined / empty string → not penalized", () => {
    expect(isPenalized({ penalty_since: null })).toBe(false);
    expect(isPenalized({})).toBe(false);
    expect(isPenalized({ penalty_since: "" })).toBe(false);
  });

  test("timestamp → penalized", () => {
    expect(isPenalized({ penalty_since: "2026-10-06T10:00:00Z" })).toBe(true);
  });
});

describe("getPenalizedIds", () => {
  test("collects only penalized ids", () => {
    const ids = getPenalizedIds([
      { id: "a", penalty_since: "2026-10-06T10:00:00Z" },
      { id: "b", penalty_since: null },
      { id: "c" },
    ]);
    expect([...ids]).toEqual(["a"]);
  });

  test("empty list → empty set", () => {
    expect(getPenalizedIds([]).size).toBe(0);
  });
});

describe("partitionNewIds", () => {
  const penalized = new Set(["p1", "p2"]);

  test("no penalized → everything added", () => {
    expect(partitionNewIds(["a", "b"], [], new Set())).toEqual({
      added: ["a", "b"],
      skipped: [],
    });
  });

  test("mixed: penalized are skipped (16 in reservation, 1 penalized)", () => {
    const ids = Array.from({ length: 15 }, (_, i) => `x${i}`).concat("p1");
    const result = partitionNewIds(ids, [], penalized);
    expect(result.added).toHaveLength(15);
    expect(result.skipped).toEqual(["p1"]);
  });

  test("all penalized → nothing added", () => {
    expect(partitionNewIds(["p1", "p2"], [], penalized)).toEqual({
      added: [],
      skipped: ["p1", "p2"],
    });
  });

  test("duplicates across two reservations are reported once", () => {
    expect(partitionNewIds(["a", "p1", "a", "p1"], [], penalized)).toEqual({
      added: ["a"],
      skipped: ["p1"],
    });
  });

  test("already in event: ignored even if penalized now", () => {
    expect(partitionNewIds(["p1", "a", "b"], ["p1", "a"], penalized)).toEqual({
      added: ["b"],
      skipped: [],
    });
  });
});

describe("withFreshPenalty", () => {
  test("overrides snapshot penalty with fresh player data", () => {
    const snapshots = [
      { id: "a", name: "A", penalty_since: null },
      { id: "b", name: "B" },
    ];
    const fresh = [
      { id: "a", penalty_since: "2026-10-06T10:00:00Z" },
      { id: "b", penalty_since: null },
    ];
    expect(withFreshPenalty(snapshots, fresh)).toEqual([
      { id: "a", name: "A", penalty_since: "2026-10-06T10:00:00Z" },
      { id: "b", name: "B", penalty_since: null },
    ]);
  });

  test("player missing from fresh data → not penalized", () => {
    expect(
      withFreshPenalty([{ id: "x", penalty_since: "2026-01-01" }], []),
    ).toEqual([{ id: "x", penalty_since: null }]);
  });
});

describe("settleEach", () => {
  test("reports succeeded and failed ids without throwing", async () => {
    const result = await settleEach(["a", "b", "c"], async (id) => {
      if (id === "b") throw new Error("boom");
    });
    expect(result).toEqual({ succeeded: ["a", "c"], failed: ["b"] });
  });
});
