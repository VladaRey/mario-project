import { Event, eventOperations, Player } from "~/lib/db";



export function useLotteryService() {

  async function addtoEvent(
    players: Player[],
    id: string,
    event: Event | null,
    eventName: string,
    eventDate: string
  ) {
    const currentEventPlayerIds =
      event?.players.map((player) => player.id) || [];

    const updatedPlayerIds = [...currentEventPlayerIds, ...players.map((player) => player.id)];
    await eventOperations.updateEvent(
      id,
      eventName,
      eventDate,
      updatedPlayerIds,
    );
  }

  async function addToWaitingList(
    waitingPlayers: Player[],
    id: string,
  ) {

    if (waitingPlayers.length > 0) {
      await eventOperations.updateWaitingList(id, waitingPlayers);
    }
  }


  async function addToWinnersList(winners: Player[], id: string) {
    await eventOperations.updateWinnersList(id, winners);
  }


  const generateRandomPlayers = (
    players: Player[],
    places: number,
  ): ShuffleResult => {
    const shuffledPlayers = [...players];
    shuffle(shuffledPlayers);

    const winners = shuffledPlayers.slice(0, places);
    const waitingList = shuffledPlayers.slice(places);

    return { winners, waitingList };
  };

  return {
    addtoEvent,
    addToWaitingList,
    addToWinnersList,
    generateRandomPlayers
  };
}

export interface ShuffleResult {
  winners: Player[];
  waitingList: Player[];
}


function shuffle(array: any[]):any[] {
  const shuffledArray = [...array];
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return shuffledArray;
}