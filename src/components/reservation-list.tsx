"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddReservationSheet } from "./add-reservation-sheet";
import { cn } from "../lib/utils";
import { reservationOperations, type ReservationList } from "../lib/db";
import { PlayerCard } from "./player-card"
import { ConfirmDialog } from "./confirmation-dialog";

export interface SaveReservationData {
  name: string;
  players: string[];
}

export interface ReservationListProps {
  refreshTrigger?: number;
}

export function ReservationList({ refreshTrigger = 0 }: ReservationListProps) {
  const [reservations, setReservations] = useState<ReservationList[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const refreshReservations = async () => {
    try {
      const dbReservations =
        await reservationOperations.getAllReservationLists();

      console.log("dbReservations", dbReservations);
      setReservations(dbReservations);
      if (!activeTab && dbReservations.length > 0) {
        setActiveTab(dbReservations[0]?.id || "");
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  };

  useEffect(() => {
    refreshReservations();
  }, [refreshTrigger]);

  const handleSave = async (data: SaveReservationData) => {
    try {
      console.log("Handling save in ReservationList:", data);
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
    try {
      await reservationOperations.updateReservationPlayers(
        activeTab,
        data.players,
      );
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <TabsList className="h-auto bg-muted/20 p-1">
          {reservations.map((reservation) => (
            <TabsTrigger
              key={reservation.id}
              value={reservation.id}
              className={cn(
                "cursor-pointer data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground",
                "px-3 py-2 text-sm font-medium transition-all",
              )}
            >
              {reservation.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex gap-2">
          <AddReservationSheet
            onSave={handleSave}
            trigger={
              <Button size="sm" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Button>
            }
          />
          {activeTab && (
            <AddReservationSheet
              reservation={reservations.find((r) => r.id === activeTab)}
              onSave={handleEdit}
              trigger={
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              }
            />
          )}
          {activeTab && (
            <ConfirmDialog
              trigger={<Button size="sm" variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>}
              onConfirm={() => handleDelete(activeTab)}
              description="This action cannot be undone. This will permanently delete this reservation."
              confirmLabel="Delete"
            />
          )}
        </div>
      </div>
      {reservations.map((reservation) => (
        <TabsContent
          key={reservation.id}
          value={reservation.id}
          className="mt-0"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reservation.players.map((player) => (
              <PlayerCard key={player.id} player={player}>
                <ConfirmDialog
                      trigger={<Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove player</span>
                      </Button>}
                      onConfirm={() => handleRemovePlayer(reservation.id, player.id)}
                      description="This action cannot be undone. This will remove the player from this reservation."
                      confirmLabel="Remove"
                    />
              </PlayerCard>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
