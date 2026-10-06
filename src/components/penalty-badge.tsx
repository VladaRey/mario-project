"use client";
import { Chip } from "~/components/ds/chip";
import { isPenalized } from "~/utils/penalty-util";
import { useT } from "~/i18n/i18n-provider";
import type { Player } from "~/lib/db";

export function PenaltyBadge({ player }: { player: Pick<Player, "penalty_since"> }) {
  const t = useT();
  if (!isPenalized(player)) return null;
  return <Chip tone="danger">{t("penalty.chip")}</Chip>;
}
