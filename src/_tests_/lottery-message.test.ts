import { buildLotteryMessage } from "../utils/lottery-message";

describe("buildLotteryMessage", () => {
  test("lists winners, then reserve", () => {
    expect(buildLotteryMessage([{ name: "Alex" }, { name: " Inna " }], [{ name: "Deena" }])).toBe(
      "JUTRO GRAJĄ / TOMORROW PLAY\n@Alex\n@Inna\n\nREZERWA:\n@Deena",
    );
  });

  test("omits reserve section when waiting list is empty", () => {
    expect(buildLotteryMessage([{ name: "Alex" }], [])).toBe("JUTRO GRAJĄ / TOMORROW PLAY\n@Alex");
  });
});
