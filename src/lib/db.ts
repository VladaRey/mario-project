import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const options = {
  auth: {
    localStorage: true,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

export type CardType = "Medicover" | "Medicover Light" | "Multisport" | "Classic" | "No card";

export const cardTypes: CardType[] = [
  "Medicover",
  "Medicover Light",
  "Multisport",
  "Classic",
  "No card",
];
// Types
export type Player = {
  id: string;
  name: string;
  cardType: CardType;
  created_at?: string;
  paid: boolean;
  amount: number;
};

export type ReservationList = {
  id: string;
  name: string;
  created_at?: string;
  players: Player[];
};

export type Event = {
  id: string;
  name: string;
  date: string;
  created_at?: string;
  players: Player[];
};

// Add these types
export type PlayerPayment = {
  event_id: string;
  player_id: string;
  paid: boolean;
};

// Player operations
export const playerOperations = {
  async getAllPlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async addPlayer(name: string, cardType: CardType): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .insert([{ name, cardType }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async editPlayer(
    id: string,
    name: string,
    cardType: CardType,
  ): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .update({ name, cardType })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removePlayer(id: string): Promise<void> {
    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) throw error;
  },

  async getPlayerEventDates(playerId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("player_events")
      .select("event:events(date)")
      .eq("player_id", playerId);

    if (error) throw error;

    // data = [{ event: { date: "2025-10-01" } }, ...]
    const sortedDates = data
      .map((item: any) => item.event.date) // extract dates
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // sorting by time

    return sortedDates;
  }
};

// Reservation List operations
export const reservationOperations = {
  async getAllReservationLists(): Promise<ReservationList[]> {
    const { data, error } = await supabase
      .from("reservation_lists")
      .select(
        `
        id,
        name,
        created_at,
        players:player_reservations(
          players(id, name, created_at, cardType)
        )
      `,
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Transform the nested data structure
    return data.map((reservation) => ({
      id: reservation.id,
      name: reservation.name,
      created_at: reservation.created_at,
      players: reservation.players.map((pr: any) => pr.players),
    }));
  },

  async addReservationList(
    name: string,
    playerIds: string[],
  ): Promise<ReservationList> {
    console.log("Adding reservation list:", name, playerIds);
    // Start a transaction
    const { data: reservation, error: reservationError } = await supabase
      .from("reservation_lists")
      .insert([{ name }])
      .select()
      .single();

    if (reservationError) throw reservationError;

    // Add players to the reservation
    if (playerIds.length > 0) {
      const playerReservations = playerIds.map((playerId) => ({
        reservation_id: reservation.id,
        player_id: playerId,
      }));

      const { error: playerError } = await supabase
        .from("player_reservations")
        .insert(playerReservations);

      if (playerError) throw playerError;
    }

    // Fetch the complete reservation with players
    const { data: completeReservation, error: fetchError } = await supabase
      .from("reservation_lists")
      .select(
        `
        id,
        name,
        created_at,
        players:player_reservations(
          players(id, name, created_at, cardType)
        )
      `,
      )
      .eq("id", reservation.id)
      .single();

    if (fetchError) throw fetchError;

    return {
      id: completeReservation.id,
      name: completeReservation.name,
      created_at: completeReservation.created_at,
      players: completeReservation.players.map((pr: any) => pr.players),
    };
  },

  async removeReservationList(id: string): Promise<void> {
    const { error } = await supabase
      .from("reservation_lists")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async updateReservationPlayers(
    reservationId: string,
    playerIds: string[],
  ): Promise<void> {
    // First, remove all existing players
    const { error: deleteError } = await supabase
      .from("player_reservations")
      .delete()
      .eq("reservation_id", reservationId);

    if (deleteError) throw deleteError;

    // Then add the new players
    if (playerIds.length > 0) {
      const playerReservations = playerIds.map((playerId) => ({
        reservation_id: reservationId,
        player_id: playerId,
      }));

      const { error: insertError } = await supabase
        .from("player_reservations")
        .insert(playerReservations);

      if (insertError) throw insertError;
    }
  },
};

// Event operations
export const eventOperations = {
  async addEvent(
    name: string,
    date: string,
    playerIds: string[],
  ): Promise<Event> {
    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert([{ name, date }])
      .select()
      .single();

    if (eventError) throw eventError;

    // Add players to the event
    if (playerIds.length > 0) {
      const playerEvents = playerIds.map((playerId) => ({
        event_id: event.id,
        player_id: playerId,
        paid: false,
      }));

      const { error: playerError } = await supabase
        .from("player_events")
        .insert(playerEvents);

      if (playerError) throw playerError;
    }

    // Fetch complete event with players
    const { data: completeEvent, error: fetchError } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        created_at,
        players:player_events(
          players(id, name, created_at, cardType)
        )
      `,
      )
      .eq("id", event.id)
      .single();

    if (fetchError) throw fetchError;

    // Add waiting list and winners list
    const { error: waitingListError } = await supabase
      .from("lottery_results")
      .insert([{ event_id: event.id, waiting_list: [], winners: [] }]);

    if (waitingListError) throw waitingListError;

    return {
      id: completeEvent.id,
      name: completeEvent.name,
      date: completeEvent.date,
      created_at: completeEvent.created_at,
      players: completeEvent.players.map((pe: any) => pe.players),
    };
  },

  async updateWaitingList(eventId: string, players: Player[]): Promise<void> {
    const { error } = await supabase
      .from("lottery_results")
      .update({ waiting_list: players })
      .eq("event_id", eventId);

    if (error) throw error;
  },

  async getWaitingList(eventId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from("lottery_results")
      .select("waiting_list")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    return data?.waiting_list || [];
  },

  async removeFromWaitingList(
    eventId: string,
    playerId: string,
  ): Promise<void> {
    const { data, error } = await supabase
      .from("lottery_results")
      .select("waiting_list")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    const updatedWaitingList = (data?.waiting_list || []).filter(
      (p: Player) => p.id !== playerId,
    );

    const { error: updateError } = await supabase
      .from("lottery_results")
      .update({ waiting_list: updatedWaitingList })
      .eq("event_id", eventId);

    if (updateError) throw updateError;
  },

  async updateWinnersList(eventId: string, winners: Player[]): Promise<void> {
    const { error } = await supabase
      .from("lottery_results")
      .update({ winners: winners })
      .eq("event_id", eventId);

    if (error) throw error;
  },

  async getWinnersList(eventId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from("lottery_results")
      .select("winners")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    return data?.winners || [];
  },

  async addToWinnersList(eventId: string, player: Player): Promise<void> {
    const { data, error } = await supabase
      .from("lottery_results")
      .select("winners, waiting_list")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    const newPlayer = {
      id: player.id || "",
      name: player.name || "",
      cardType: player.cardType || "No card",
      paid: false,
      amount: 0,
    };

    //Add player to winners list and remove from waiting list
    const updatedWinners = [...(data?.winners || []), newPlayer];
    const updatedWaitingList = (data?.waiting_list || []).filter(
      (p: Player) => p.id !== player.id,
    );

    const { error: updateError } = await supabase
      .from("lottery_results")
      .update({ winners: updatedWinners, waiting_list: updatedWaitingList })
      .eq("event_id", eventId);

    if (updateError) throw updateError;
  },

  async removeFromWinnersList(
    eventId: string,
    playerId: string,
  ): Promise<void> {
    const { data, error } = await supabase
      .from("lottery_results")
      .select("winners")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    const updatedWinners = (data?.winners || []).filter(
      (p: Player) => p.id !== playerId,
    );

    const { error: updateError } = await supabase
      .from("lottery_results")
      .update({ winners: updatedWinners })
      .eq("event_id", eventId);

    if (updateError) throw updateError;
  },

  async removeLotteryResults(eventId: string): Promise<void> {
    const { error } = await supabase
      .from("lottery_results")
      .update({ winners: [], waiting_list: [] })
      .eq("event_id", eventId);

    if (error) throw error;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
    .from("events")
    .update({ is_deleted: true })
    .eq("id", id);
    
    if (error) throw error;
  },

  async getAllEvents(): Promise<Record<string, Event[]>> {
  const { data, error } = await supabase
    .from("events")
    .select(
      `id, name, created_at, date, players:player_events(player:players(id, name, created_at, cardType))`,
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const groupedEvents = data.reduce(
    (acc, event) => {
      const eventDate = event.date; 
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push({
        id: event.id,
        name: event.name,
        date: event.date,
        created_at: event.created_at,
        players: event.players.flatMap((pe: any) => pe.player),
      });
      return acc;
    },
    {} as Record<string, Event[]>,
  );

  return groupedEvents;
},
  
  async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        created_at,
        players:player_events(
          paid,
          amount,
          player:players(
            id, name, created_at, cardType
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          name: data.name,
          date: data.date,
          created_at: data.created_at,
          players: data.players.map((pe: any) => ({
            ...pe.player,
            paid: pe.paid,
            amount: pe.amount,
          })),
        }
      : null;
  },

  async getLastEvent(): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        created_at,
        players:player_events(
          players(id, name, created_at, cardType)
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          name: data.name,
          date: data.date,
          created_at: data.created_at,
          players: data.players.map((pe: any) => pe.players),
        }
      : null;
  },

  async updateEvent(
    eventId: string,
    name: string,
    date: string,
    playerIds: string[],
  ): Promise<void> {
    // Update event name
    const { error: updateError } = await supabase
      .from("events")
      .update({ name, date })
      .eq("id", eventId);

    if (updateError) throw updateError;

    // Remove existing players
    const { error: deleteError } = await supabase
      .from("player_events")
      .delete()
      .eq("event_id", eventId);

    if (deleteError) throw deleteError;

    // Add new players
    if (playerIds.length > 0) {
      const playerEvents = playerIds.map((playerId) => ({
        event_id: eventId,
        player_id: playerId,
        paid: false,
      }));

      const { error: insertError } = await supabase
        .from("player_events")
        .insert(playerEvents);

      if (insertError) throw insertError;
    }
  },

  async getEventPayments(eventId: string): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .from("player_events")
      .select("player_id, paid")
      .eq("event_id", eventId);

    if (error) throw error;

    return data.reduce((acc: Record<string, boolean>, payment) => {
      acc[payment.player_id] = payment.paid;
      return acc;
    }, {});
  },

  async updatePlayerPayment(
    eventId: string,
    playerId: string,
    paid: boolean,
  ): Promise<void> {
    const { error } = await supabase.from("player_events").upsert(
      {
        event_id: eventId,
        player_id: playerId,
        paid,
      },
      {
        onConflict: "event_id,player_id",
        ignoreDuplicates: false,
      },
    );

    if (error) throw error;
  },

  async getPlayerPaymentAmount(eventId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("player_events")
      .select("player_id, amount")
      .eq("event_id", eventId);  

    if (error) throw error;

    return data.reduce((acc: Record<string, number>, payment) => {
      acc[payment.player_id] = payment.amount != undefined ? payment.amount : null;  
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching player payment amounts:", error);
    return {}; 
  }
},

  async updatePlayerPaymentAmount(eventId: string, cardType: string, amount: number) {
    try {
      const { data: players, error: selectError } = await supabase
        .from("players")
        .select("id")
        .eq("cardType", cardType);

      if (selectError) {
        throw new Error(`Error fetching players: ${selectError.message}`);
      }

      if (!players || players.length === 0) {
        console.log(`No players found with card type: ${cardType}`);
        return;
      }

      const playerIds = players.map((player) => player.id);

      const { error: updateError } = await supabase
        .from("player_events")
        .update({ amount })
        .eq("event_id", eventId)
        .in("player_id", playerIds);

      if (updateError) {
        throw new Error(
          `Error updating player amounts: ${updateError.message}`,
        );
      }

      console.log("Player amounts updated successfully!");
    } catch (error) {
      console.error("Error updating player payment amount:", error);
      throw error;
    }
  },
}; 