import { eventOperations, Player, Event } from "~/lib/db";



export function useLotteryService() {
    
  async function addtoEvent(
    generatedPlayers: string[],
    id: string,
    event: Event | null,
    eventName: string,
    eventDate: string
  ) {
    const currentEventPlayerIds =
      event?.players.map((player) => player.id) || [];

    const updatedPlayerIds = [...currentEventPlayerIds, ...generatedPlayers];
    await eventOperations.updateEvent(
      id,
      eventName,
      eventDate,
      updatedPlayerIds,
    );
  }

  async function addToWaitingList(
    selectedPlayers: string[],
    generatedPlayers: string[],
    availablePlayers: Player[],
    id: string,
  ) {
    const waitingPlayers = selectedPlayers
      .filter((id) => !generatedPlayers.includes(id))
      .map((id) => {
        const player = availablePlayers.find((p) => p.id === id);
        return {
          id: player?.id || "",
          name: player?.name || "",
          cardType: player?.cardType || "No card",
          paid: false,
          amount: 0,
        };
      });

    if (waitingPlayers.length > 0) {
      await eventOperations.updateWaitingList(id, waitingPlayers);
    }
  }


  async function addToWinnersList (availablePlayers: Player[], generatedPlayers: string[], id: string){
   const winners = availablePlayers.filter((player) =>
     generatedPlayers.includes(player.id),
   );
   await eventOperations.updateWinnersList(id, winners);
  }

  return {
    addtoEvent,
    addToWaitingList,
    addToWinnersList,
  };
}
