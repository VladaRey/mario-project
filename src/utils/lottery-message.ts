import type { Player } from "~/lib/db";

type Named = Pick<Player, "name">;

const mentions = (players: Named[]) => players.map((p) => `@${p.name.trim()}`);

/** Plain-text announcement for the WhatsApp group: event, who plays, reserve and penalty list. */
export function buildLotteryMessage({ event, winners, waiting, penalized }: {
  event: { name: string; url: string };
  winners: Named[];
  waiting: Named[];
  penalized: Named[];
}): string {
  const lines = [event.name, event.url, "", "JUTRO GRAJĄ / TOMORROW PLAY", ...mentions(winners)];
  if (waiting.length > 0) lines.push("", "REZERWA:", ...mentions(waiting));
  if (penalized.length > 0) lines.push("", "LISTA KAR / PENALTY LIST:", ...mentions(penalized));
  return lines.join("\n");
}
