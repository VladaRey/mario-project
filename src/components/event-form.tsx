import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { MultiSelect } from "./multi-select";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import {
  playerOperations,
  reservationOperations,
  eventOperations,
  type Player,
  type ReservationList,
  type Event,
} from "../lib/db";
import { PlayerCard } from "./player-card";
import { format } from "date-fns";
import { EventDatePicker } from "./event-date-picker.component";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventFormProps = {
  initialEvent?: Event;
  onSave: (event: { id: string; name: string; date: string; players: string[] }) => void;
  mode: "create" | "edit";
};

export function EventForm({ initialEvent, onSave, mode }: EventFormProps) {
  const router = useRouter();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    initialEvent?.players?.map((p) => p.id) || [],
  );
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [reservations, setReservations] = useState<ReservationList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [date, setDate] = useState<Date | undefined>(initialEvent?.date ? new Date(initialEvent.date) : new Date());

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const [eventName, setEventName] = useState(initialEvent?.name || formatDate(new Date()));

  const [waitingListPlayers, setWaitingListPlayers] = useState<Player[]>([]);

  const handleSetDate = (date: Date | undefined) => {
    setDate(date);
    if(!initialEvent?.name && date) {
      setEventName(formatDate(date));
    }
  };

  // Load players, reservations and waiting list
  useEffect(() => {
    const loadData = async () => {
      try {
        const [players, reservationLists, waitingListPlayers] =
          await Promise.all([
            playerOperations.getAllPlayers(),
            reservationOperations.getAllReservationLists(),
            initialEvent?.id
              ? eventOperations.getWaitingList(initialEvent.id)
              : Promise.resolve([]),
          ]);
        setAvailablePlayers(players);
        setReservations(reservationLists);
        setWaitingListPlayers(waitingListPlayers);

        console.log("reservations", reservationLists);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      id: initialEvent?.id || "",
      name: eventName,
      date: format(date!, "yyyy-MM-dd"),
      players: selectedPlayers,
    });
    toast.success(mode === "create" ? "Event created successfully" : "Event updated successfully");
    setLoading(false);
    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  };

  const handleRemoveAllPlayers = () => {
    setSelectedPlayers([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.filter((id) => id !== playerId),
    );
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    await eventOperations.deleteEvent(initialEvent?.id || "");
    toast.success("Event deleted successfully");
    setIsDeleting(false);
    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  };

  const reservationOptions = reservations.map((reservation) => ({
    value: reservation.id,
    label: reservation.name,
  }));

  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
  }));

  const waitingListOptions = waitingListPlayers.map((player) => ({
    label: player.name,
    value: player.id,
  }));

  if (isLoading) {
    return <div>Loading form data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EventDatePicker date={date!} setDate={handleSetDate} />
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name</Label>
        <Input
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Enter event name"
          required
        />
      </div>
      <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
        <div className="flex-1 space-y-2">
          <Label>Add Players from Reservations</Label>
          <MultiSelect
            options={reservationOptions}
            selected={[]}
            onChange={(selectedReservations) => {
              const newPlayers = reservations
                .filter((r) => selectedReservations.includes(r.id))
                .flatMap((r) => r.players.map((p) => p.id));
              setSelectedPlayers((prevPlayers) => [
                ...new Set([...prevPlayers, ...newPlayers]),
              ]);
            }}
            placeholder="Select reservations"
          />
        </div>
        {waitingListPlayers.length > 0 && (
          <div className="flex-1 space-y-2">
            <Label>Add Players from Waiting List</Label>
            <MultiSelect
            options={waitingListOptions}
            selected={[]}
            onChange={(newPlayers) => {
              setSelectedPlayers((prevPlayers) => [
                ...new Set([...prevPlayers, ...newPlayers]),
              ]);
            }}
            placeholder="Select players from waiting list"
          />
        </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Add Individual Players</Label>
        <MultiSelect
          options={playerOptions.filter(
            (option) => !selectedPlayers.includes(option.value),
          )}
          selected={[]}
          onChange={(newPlayers) => {
            setSelectedPlayers((prevPlayers) => [
              ...prevPlayers,
              ...newPlayers,
            ]);
          }}
          placeholder="Select players"
        />
      </div>
      <div className="space-y-2">
        {selectedPlayers.length > 0 ? (
          <Label>Current Players</Label>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectedPlayers.map((playerId) => {
            const player = availablePlayers.find((p) => p.id === playerId);
            return player ? (
              <Card key={player.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <PlayerCard player={player}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove {player.name}</span>
                    </Button>
                  </PlayerCard>
                </CardContent>
              </Card>
            ) : null;
          })}
        </div>
      </div>
      <div className="flex flex-col md:justify-between md:flex-row gap-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" disabled={selectedPlayers.length === 0}>
              Remove All Players
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all players from the event. You can add
                them back individually or from reservations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveAllPlayers}>
                Remove All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex justify-between gap-4">
        {mode === "edit" && (
          <AlertDialog>
          <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            ) : null}
            Delete Event
          </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete this event.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEvent}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
          ) : null}
          {mode === "create" ? "Create Event" : "Save Event"}
          </Button>
        </div>
      </div>
    </form>
  );
}
