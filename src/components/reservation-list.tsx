"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import { AddReservationSheet } from "./add-reservation-sheet";
import { cn } from "../lib/utils";
import { reservationOperations, type ReservationList as ReservationListType } from "../lib/db";
import { ConfirmDialog } from "./confirmation-dialog";
import { ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { EmptyState } from "~/components/ds/empty-state";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { PenaltyBadge } from "~/components/penalty-badge";
import { useT } from "~/i18n/i18n-provider";

export interface SaveReservationData {
  name: string;
  players: string[];
}

export interface ReservationListProps {
  refreshTrigger?: number;
  /** Id of a reservation created outside the list (page header "New"); selected once it changes. */
  selectId?: string;
}

export async function saveReservationEdit(
  ops: { renameReservationList(id: string, name: string): Promise<void>; updateReservationPlayers(id: string, ids: string[]): Promise<void> },
  current: { id: string; name: string },
  data: { name: string; players: string[] },
) {
  const name = data.name.trim();
  if (name && name !== current.name) await ops.renameReservationList(current.id, name);
  await ops.updateReservationPlayers(current.id, data.players);
}

export function ReservationList({ refreshTrigger = 0, selectId }: ReservationListProps) {
  const t = useT();
  const [reservations, setReservations] = useState<ReservationListType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const refreshReservations = async () => {
    try {
      const dbReservations =
        await reservationOperations.getAllReservationLists();

      setReservations(dbReservations);
      if (!activeTab && dbReservations.length > 0) {
        setActiveTab(dbReservations[0]?.id || "");
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    refreshReservations();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectId) setActiveTab(selectId);
  }, [selectId]);

  const handleSave = async (data: SaveReservationData) => {
    try {
      const newReservation = await reservationOperations.addReservationList(
        data.name,
        data.players,
      );
      setActiveTab(newReservation.id);
      await refreshReservations();
    } catch (error) {
      console.error("Failed to save reservation:", error);
    }
  };

  const handleEdit = async (data: SaveReservationData) => {
    // Same reservation the card shows: the active tab, or the first one as fallback.
    const current = reservations.find((r) => r.id === activeTab) ?? reservations[0];
    if (!current) return;
    try {
      await saveReservationEdit(reservationOperations, current, data);
      await refreshReservations();
    } catch (error) {
      console.error("Failed to update reservation:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await reservationOperations.removeReservationList(id);
      await refreshReservations();
      if (activeTab === id) {
        const remainingReservation = reservations.find((r) => r.id !== id);
        setActiveTab(remainingReservation?.id || "");
      }
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    }
  };

  const handleRemovePlayer = async (
    reservationId: string,
    playerId: string,
  ) => {
    try {
      const reservation = reservations.find((r) => r.id === reservationId);
      if (!reservation) return;

      const updatedPlayers = reservation.players.filter(
        (p) => p.id !== playerId,
      );
      await reservationOperations.updateReservationPlayers(
        reservationId,
        updatedPlayers.map((p) => p.id),
      );
      await refreshReservations();
    } catch (error) {
      console.error("Failed to remove player:", error);
    }
  };

  if (!loaded) return <SkeletonRows />;

  if (reservations.length === 0) {
    return (
      <EmptyState
        title={t("res.empty")}
        action={
          <AddReservationSheet
            onSave={handleSave}
            trigger={<Button size="sm"><Plus />{t("res.newReservation")}</Button>}
          />
        }
      />
    );
  }

  const active = reservations.find((r) => r.id === activeTab) ?? reservations[0]!;

  return (
    <div className="md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:gap-6">
      {/* mobile pills */}
      <div role="tablist" aria-label={t("res.tabs")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {reservations.map((r) => {
          const on = r.id === active.id;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveTab(r.id)}
              className={cn(
                "flex-none whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-extrabold",
                on ? "bg-brand-900 text-white" : "border border-line bg-white text-ink",
              )}
            >
              {r.name} · {r.players.length}
            </button>
          );
        })}
      </div>

      {/* desktop left column */}
      <div className="hidden flex-col gap-3 md:flex">
        <p className="text-[13px] text-muted-foreground">{t("res.intro")}</p>
        <div role="tablist" aria-label={t("res.tabs")} aria-orientation="vertical" className="flex flex-col gap-2">
          {reservations.map((r) => {
            const on = r.id === active.id;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActiveTab(r.id)}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3.5 text-left text-sm font-extrabold",
                  on ? "border-[#D9CCF0] bg-brand-50 text-brand-900" : "border-line bg-white text-ink",
                )}
              >
                <span className="min-w-0 truncate">{r.name}</span>
                <span className="flex-none text-xs font-bold text-muted-foreground">{r.players.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* active reservation card */}
      <div role="tabpanel" className="mt-3 min-w-0 rounded-2xl border border-line bg-white md:mt-0">
        <div className="flex items-center justify-between gap-2 border-b border-[#F0ECF7] px-4 py-2.5 md:px-5">
          <div className="min-w-0 truncate text-[15px] font-extrabold">
            {t("res.header", { name: active.name, players: t("common.players", { count: active.players.length }) })}
          </div>
          <div className="flex flex-none items-center gap-1">
            <AddReservationSheet
              reservation={active}
              onSave={handleEdit}
              trigger={
                <Button size="icon" variant="ghost" aria-label={`${t("common.edit")} ${active.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <ConfirmDialog
              trigger={
                <Button size="icon" variant="ghost" aria-label={`${t("common.delete")} ${active.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              onConfirm={() => handleDelete(active.id)}
              description={t("res.deleteText")}
              confirmLabel={t("common.delete")}
              confirmVariant="destructive"
            />
          </div>
        </div>
        <div className="divide-y divide-[#F0ECF7] px-3 md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0 md:px-5">
          {active.players.map((player) => (
            <ListRow
              key={player.id}
              className="md:border-b md:border-[#F0ECF7]"
              leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
              title={player.name}
              meta={t(`cardType.${player.cardType}`)}
              trailing={
                <span className="flex flex-none items-center gap-1">
                  <PenaltyBadge player={player} />
                  <ConfirmDialog
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    }
                    onConfirm={() => handleRemovePlayer(active.id, player.id)}
                    description={t("res.removePlayerText", { name: player.name })}
                    confirmLabel={t("common.remove")}
                    confirmVariant="destructive"
                  />
                </span>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
