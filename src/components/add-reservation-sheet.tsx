"use client";

import { useState, useEffect, type FC } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MultiSelect } from "./multi-select";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { Notice } from "~/components/ds/notice";
import { useT } from "~/i18n/i18n-provider";
import { isPenalized } from "~/utils/penalty-util";
import { playerOperations, type Player, type ReservationList } from "../lib/db";
import type { SaveReservationData } from "./reservation-list";

interface AddReservationSheetProps {
  reservation?: ReservationList;
  onSave: (data: SaveReservationData) => Promise<void>;
  trigger: React.ReactElement;
}

export const AddReservationSheet: FC<AddReservationSheetProps> = ({
  reservation,
  onSave,
  trigger,
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [reservationName, setReservationName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all players from database
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const players = await playerOperations.getAllPlayers();
        setAvailablePlayers(players);
      } catch (error) {
        console.error("Failed to load players:", error);
      }
    };
    loadPlayers();
  }, []);

  // Set initial values when editing
  useEffect(() => {
    if (reservation) {
      setReservationName(reservation.name);
      setSelectedPlayers(reservation.players.map((player) => player.id));
    } else {
      setReservationName("");
      setSelectedPlayers([]);
    }
  }, [reservation]);

  const handleSubmit = async () => {
    if (!reservationName.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: reservationName.trim(),
        players: selectedPlayers,
      });
      if (!reservation) {
        setReservationName("");
        setSelectedPlayers([]);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to save reservation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Penalized players stay selectable (business rule): only a hint chip.
  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
    cardType: player.cardType,
    ...(isPenalized(player) ? { hint: t("penalty.chip") } : {}),
  }));

  const penalizedNames = availablePlayers
    .filter((p) => selectedPlayers.includes(p.id) && isPenalized(p))
    .map((p) => p.name)
    .join(", ");

  return (
    <>
      <Slot onClick={() => setOpen(true)}>{trigger}</Slot>
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        title={t(reservation ? "res.editTitle" : "res.addTitle")}
        footer={
          <Button className="w-full" disabled={isSubmitting || !reservationName.trim()} onClick={handleSubmit}>
            {t("res.save")}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">
            {t("res.name")}
            <Input
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
              placeholder={t("res.namePlaceholder")}
              className="h-12 rounded-xl text-[15px] font-bold"
            />
          </label>
          <MultiSelect
            options={playerOptions}
            selected={selectedPlayers}
            onChange={setSelectedPlayers}
            placeholder={t("res.addPlayers")}
            title={t("res.players", { count: selectedPlayers.length })}
          />
          {penalizedNames ? <Notice>{t("res.penaltyNote", { names: penalizedNames })}</Notice> : null}
        </div>
      </ResponsiveSheet>
    </>
  );
};
