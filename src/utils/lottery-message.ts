import type { Player } from "~/lib/db";

type Named = Pick<Player, "name">;

/** Plain-text announcement for the WhatsApp group: who plays and who is in reserve. */
export function buildLotteryMessage(winners: Named[], waiting: Named[]): string {
  const lines = ["JUTRO GRAJĄ / TOMORROW PLAY", ...winners.map((p) => `@${p.name.trim()}`)];
  if (waiting.length > 0) {
    lines.push("", "REZERWA:", ...waiting.map((p) => `@${p.name.trim()}`));
  }
  return lines.join("\n");
}
