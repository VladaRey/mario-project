import { Clock, Plus, Trophy, X } from "lucide-react";
import { Player } from "~/lib/db";
import { Button } from "~/components/ui/button";
import { ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { SectionLabel } from "~/components/ds/section-label";
import { PenaltyBadge } from "~/components/penalty-badge";
import { useGetRole } from "~/hooks/use-get-role";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import { isPenalized } from "~/utils/penalty-util";


interface LotteryResultsProps {
  winnersList: Player[];
  waitingList: Player[];
  addPlayersToEvent: (players: Player[]) => void;
  handleAddPlayer: (player: Player) => void;
  handleRemoveWinner: (player: Player) => void;
  handleRemoveFromWaitingList: (player: Player) => void;
}

export function LotteryResults({
  winnersList,
  waitingList,
  handleAddPlayer,
  handleRemoveWinner,
  handleRemoveFromWaitingList
}: LotteryResultsProps) {

  const { role } = useGetRole();
  const t = useT();
  const isAdmin = role === "admin";

  const num = (i: number, muted = false) => (
    <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-lg text-xs font-extrabold",
      muted ? "bg-[#F4F2F8] text-muted-foreground" : "bg-brand-50 text-brand-700")}>{i + 1}</span>
  );
  return (
    <>
      <section className="rounded-2xl border border-line bg-white px-3.5 py-3 md:px-[18px]">
        <div className="mb-1 flex items-center gap-2 text-brand-700"><Trophy className="h-[18px] w-[18px]" /><SectionLabel className="text-brand-700">{t("lottery.winners", { count: winnersList.length })}</SectionLabel></div>
        {winnersList.length === 0 ? <p className="py-3 text-sm text-muted-foreground">{t("lottery.noWinners")}</p> : null}
        {winnersList.map((player, i) => (
          <ListRow key={player.id} leading={<>{num(i)}<PlayerAvatar name={player.name} cardType={player.cardType} size="sm" /></>}
            title={player.name} meta={t(`cardType.${player.cardType}`)}
            trailing={isAdmin ? <Button size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemoveWinner(player)}><X /></Button> : null} />
        ))}
      </section>
      <section className="rounded-2xl border border-line bg-white px-3.5 py-3 md:px-[18px]">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground"><Clock className="h-[18px] w-[18px]" /><SectionLabel>{t("lottery.waiting", { count: waitingList.length })}</SectionLabel></div>
        {waitingList.length === 0 ? <p className="py-3 text-sm text-muted-foreground">{t("lottery.noWaiting")}</p> : null}
        {waitingList.map((player, i) => (
          <ListRow key={player.id} muted={isPenalized(player)}
            leading={<>{num(i, true)}<PlayerAvatar name={player.name} cardType={player.cardType} size="sm" /></>}
            title={player.name}
            meta={<span className="flex min-w-0 items-center gap-1.5"><span className="truncate">{t(`cardType.${player.cardType}`)}</span><PenaltyBadge player={player} /></span>}
            trailing={<>
              {isAdmin ? <>
                <Button size="sm" variant="outline" disabled={isPenalized(player)} onClick={() => handleAddPlayer(player)}><Plus />{t("common.add")}</Button>
                <Button size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemoveFromWaitingList(player)}><X /></Button>
              </> : null}
            </>} />
        ))}
      </section>
    </>
  );
}
