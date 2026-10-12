"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Player, playerOperations } from "~/lib/db";
import { matchesQuery, groupByLetter } from "~/utils/search";
import { useT } from "~/i18n/i18n-provider";
import { useIsDesktop } from "~/hooks/use-media-query";
import { ListCard, ListRow } from "~/components/ds/list";
import { CardTypeChip } from "~/components/ds/chip";
import { SectionLabel } from "~/components/ds/section-label";
import { EmptyState } from "~/components/ds/empty-state";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { PenaltyBadge } from "~/components/penalty-badge";

export default function PlayerSearchList({ onLoaded }: { onLoaded?: (count: number) => void }) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    void playerOperations.getAllPlayers().then((p) => {
      if (cancelled) return;
      setPlayers(p);
      setLoaded(true);
      onLoaded?.(p.length);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(
    () => groupByLetter(players.filter((p) => matchesQuery(p.name, searchTerm))),
    [players, searchTerm],
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          aria-label={t("players.search")}
          placeholder={t("players.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
        />
      </div>

      {!loaded ? (
        <SkeletonRows count={8} />
      ) : groups.length === 0 && searchTerm ? (
        <EmptyState title={t("common.noResults")} />
      ) : (
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.letter} className="min-w-0 space-y-1.5">
              <SectionLabel>{g.letter}</SectionLabel>
              <ListCard>
                {g.items.map((p) => (
                  <ListRow
                    key={p.id}
                    href={`/players/player/${p.id}`}
                    title={p.name}
                    trailing={
                      <span className="flex flex-none items-center gap-1.5">
                        <PenaltyBadge player={p} />
                        <CardTypeChip cardType={p.cardType} short={!isDesktop} />
                      </span>
                    }
                  />
                ))}
              </ListCard>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
