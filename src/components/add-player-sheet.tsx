"use client";

import { useState, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { type CardType, cardTypes, type Player } from "../lib/db";

type PlayerSheetProps = {
  player: Player;
  onSave: (player: Player) => void;
  trigger: React.ReactElement;
  mode: "add" | "edit";
};

export function PlayerSheet({ player, onSave, trigger, mode }: PlayerSheetProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState(player.name);
  const [cardType, setCardType] = useState<CardType>(
    player?.cardType || "Multisport",
  );

  useEffect(() => {
    setPlayerName(player.name);
    setCardType(player.cardType);
  }, [player]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSave({ ...player, name: playerName, cardType });
    setOpen(false);
  };

  return (
    <>
      <Slot onClick={() => setOpen(true)}>{trigger}</Slot>
      <ResponsiveSheet open={open} onOpenChange={setOpen} title={t(mode === "add" ? "adminPlayers.addTitle" : "adminPlayers.editTitle")}
        footer={<Button className="w-full" onClick={handleSubmit}>{t("adminPlayers.save")}</Button>}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("adminPlayers.name")}
            <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder={t("adminPlayers.namePlaceholder")} className="h-12 rounded-xl text-[15px] font-bold" />
          </label>
          <div role="radiogroup" aria-label={t("adminPlayers.cardType")} className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#4A4361]">{t("adminPlayers.cardType")}</span>
            {cardTypes.map((ct) => {
              const on = ct === cardType;
              const s = CARD_TYPE_STYLE[ct];
              return (
                <button key={ct} type="button" role="radio" aria-checked={on} onClick={() => setCardType(ct)}
                  className={cn("flex min-h-12 items-center justify-between rounded-xl px-3.5 text-sm font-extrabold",
                    on ? cn("border-2", s.soft, s.ink, "border-current") : "border border-line bg-white text-ink")}>
                  <span className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />{t(`cardType.${ct}`)}</span>
                  {on ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{t("adminPlayers.cardHint")}</p>
        </form>
      </ResponsiveSheet>
    </>
  );
}
