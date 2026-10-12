"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ProfileHero } from "~/features/players-page/player-info-cards";
import PlayerHistory from "~/features/players-page/player-history";
import { useGetPlayerData } from "~/hooks/use-get-player-data";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Notice } from "~/components/ds/notice";
import { EmptyState } from "~/components/ds/empty-state";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { isPenalized } from "~/utils/penalty-util";
import { useT } from "~/i18n/i18n-provider";

export default function PlayerDetailPage() {
  const t = useT();
  const params = useParams();
  const playerId = params.id as string;

  const { player, playerEventDates, loading, lotteryResults } = useGetPlayerData({ playerId });

  if (loading) {
    return <PageBody><SkeletonRows count={4} /></PageBody>;
  }

  if (!player) {
    return (
      <>
        <ScreenHeader
          title={t("players.notFoundTitle")}
          back={{ href: "/players", label: t("nav.players") }}
          crumbs={[{ label: t("nav.players"), href: "/players" }]}
        />
        <PageBody>
          <EmptyState
            title={t("players.notFoundText")}
            action={<Button asChild><Link href="/players">{t("players.back")}</Link></Button>}
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title={player.name}
        back={{ href: "/players", label: t("nav.players") }}
        crumbs={[{ label: t("nav.players"), href: "/players" }, { label: player.name }]}
        mobileHero={<ProfileHero player={player} />}
      />
      <PageBody>
        <div className="hidden md:block"><ProfileHero player={player} desktop /></div>
        {isPenalized(player) ? (
          <Notice>{t("profile.penaltyNotice")} <GuardedLink href="/penalties" className="font-extrabold underline">{t("profile.seePenalties")}</GuardedLink></Notice>
        ) : null}
        <PlayerHistory player={player} lotteryResults={lotteryResults} playerEventDates={playerEventDates} />
      </PageBody>
    </>
  );
}
