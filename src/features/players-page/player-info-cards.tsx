"use client";
import { Player } from "~/lib/db";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { CardTypeChip, Chip } from "~/components/ds/chip";
import { isPenalized } from "~/utils/penalty-util";
import { useI18n } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

export function ProfileHero({ player, desktop = false }: { player: Player; desktop?: boolean }) {
  const { t, fmt } = useI18n();
  const penalized = isPenalized(player);
  const member = player.created_at ? t("profile.memberSince", { date: fmt(player.created_at, "LLL yyyy") }) : null;

  return (
    <section className={cn(desktop ? "flex items-center gap-5" : "bg-brand-900 px-4 pb-6 pt-3 text-white")}>
      <div className={cn("flex items-center gap-4", desktop && "gap-5")}>
        <PlayerAvatar
          name={player.name}
          cardType={player.cardType}
          size="lg"
          className={cn(!desktop && "bg-white/15 text-white", desktop && "h-20 w-20 text-2xl")}
        />
        <div className="min-w-0">
          {desktop ? (
            <div className="text-[26px] font-extrabold tracking-tight">{player.name}</div>
          ) : (
            <h1 className="break-words text-2xl font-extrabold tracking-tight">{player.name}</h1>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CardTypeChip cardType={player.cardType} />
            {penalized ? (
              <Chip tone="danger">{t("profile.penaltySince", { date: fmt(player.penalty_since as string, "dd.MM") })}</Chip>
            ) : null}
          </div>
          {member ? (
            <div className={cn("mt-1.5 text-[13px]", desktop ? "text-muted-foreground" : "text-[#D9CCF0]")}>{member}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
