"use client";

import { useState, useEffect, type FC } from "react";
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
import { PlusCircle } from "lucide-react";
import { MultiSelect } from "./multi-select";
import { playerOperations, type Player, type ReservationList } from "../lib/db";
import { SaveReservationData } from "./reservation-list";

interface AddReservationSheetProps {
  reservation?: ReservationList;
  onSave: (data: SaveReservationData) => Promise<void>;
  trigger?: React.ReactNode;
}

export const AddReservationSheet: FC<AddReservationSheetProps> = ({
  reservation,
  onSave,
  trigger,
}) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    if (!reservationName.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        name: reservationName.trim(),
        players: selectedPlayers,
      };
      console.log("Submitting reservation:", data);

      await onSave(data);

      console.log("Reservation saved successfully");
      setReservationName("");
      setSelectedPlayers([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save reservation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Reservation
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <form className="space-y-4">
          <SheetHeader>
            <SheetTitle>
              {reservation ? "Edit Reservation" : "Add New Reservation"}
            </SheetTitle>
            <SheetDescription>
              {reservation
                ? "Edit the reservation details."
                : "Create a new reservation and add players to it."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reservation Name</Label>
              <Input
                id="name"
                value={reservationName}
                onChange={(e) => setReservationName(e.target.value)}
                placeholder="Enter reservation name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="players">Select Players</Label>
              <MultiSelect
                options={playerOptions}
                selected={selectedPlayers}
                onChange={setSelectedPlayers}
                placeholder="Select players"
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reservationName.trim()}
            >
              {isSubmitting
                ? "Saving..."
                : reservation
                  ? "Save Changes"
                  : "Create Reservation"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
