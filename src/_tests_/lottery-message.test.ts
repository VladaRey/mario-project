import { buildLotteryMessage } from "../utils/lottery-message";

const event = { name: "środa, 08.10.2026", url: "https://example.com/event/1" };

describe("buildLotteryMessage", () => {
  test("event info, winners, reserve, then penalty list", () => {
    expect(buildLotteryMessage({
      event,
      winners: [{ name: "Alex" }, { name: " Inna " }],
      waiting: [{ name: "Deena" }],
      penalized: [{ name: "Karol" }],
    })).toBe(
      "środa, 08.10.2026\nhttps://example.com/event/1\n\nJUTRO GRAJĄ / TOMORROW PLAY\n@Alex\n@Inna\n\nREZERWA:\n@Deena\n\nLISTA KAR / PENALTY LIST:\n@Karol",
    );
  });

  test("omits empty reserve and penalty sections", () => {
    expect(buildLotteryMessage({ event, winners: [{ name: "Alex" }], waiting: [], penalized: [] })).toBe(
      "środa, 08.10.2026\nhttps://example.com/event/1\n\nJUTRO GRAJĄ / TOMORROW PLAY\n@Alex",
    );
  });
});
