"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { CardType, cardTypes, Player } from "../lib/db";

type PlayerSheetProps = {
  player: Player;
  onSave: (player: Player) => void;
  trigger: React.ReactNode;
};

export function PlayerSheet({ player, onSave, trigger }: PlayerSheetProps) {
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState(player.name);
  const [cardType, setCardType] = useState<CardType>(
    player?.cardType || "Multisport",
  );

  useEffect(() => {
    setPlayerName(player.name);
    setCardType(player.cardType);
  }, [player]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving player:", { ...player, name: playerName });
    onSave({ ...player, name: playerName, cardType });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Player</SheetTitle>
          <SheetDescription>
            {`Make changes to the player's information here.`}
          </SheetDescription>
        </SheetHeader>
        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
          <div className="space-y-2">
            <Label>Card Type</Label>
            <div className="flex flex-wrap gap-2">
              {cardTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={cardType === type ? "default" : "outline"}
                  onClick={() => setCardType(type)}
                  className={
                    cardType === type
                      ? "bg-slate-800 text-white"
                      : "border-slate-500 bg-white text-slate-900"
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" onClick={handleSubmit}>
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
