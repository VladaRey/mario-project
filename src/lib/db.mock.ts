/**
 * In-browser mock of the Supabase data layer for local testing without a database.
 * Enabled with NEXT_PUBLIC_USE_MOCK_DB=1 (see README "Mock mode"). Data lives in
 * localStorage under MOCK_DB_KEY; resetMockDb() restores the seed.
 *
 * Only type imports from ./db — db.ts imports this module, so value imports would be circular.
 */
import type {
  CardType,
  DefaultAdminValues,
  Event,
  Player,
  ReservationList,
} from "./db";
import {
  DEFAULT_HOURS,
  DEFAULT_PRICE_PER_HOUR,
  DISCOUNT_PER_USAGE,
  getCourtsFromPlayersCount,
} from "~/constants/event-pricing-defaults";

export const MOCK_DB_KEY = "mario-mock-db";

type PlayerRow = {
  id: string;
  name: string;
  cardType: CardType;
  created_at: string;
  penalty_since: string | null;
};
type ReservationRow = { id: string; name: string; created_at: string; playerIds: string[] };
type EventRow = {
  id: string;
  name: string;
  date: string;
  created_at: string;
  hours: number;
  courts: number | null;
  price_per_hour: number;
  fame_total: number | null;
  is_deleted: boolean;
};
type PlayerEventRow = {
  event_id: string;
  player_id: string;
  paid: boolean;
  amount: number | null;
  card_usage: number;
};
type LotteryRow = { event_id: string; winners: Player[]; waiting_list: Player[] };

type MockDb = {
  players: PlayerRow[];
  reservations: ReservationRow[];
  events: EventRow[];
  playerEvents: PlayerEventRow[];
  lottery: LotteryRow[];
  defaults: DefaultAdminValues;
};

// ---------- seed ----------

const NAMES = [
  "Anna Kowalska", "Bartek Nowak", "Celina Wiśniewska", "Darek Wójcik", "Ewa Kamińska",
  "Filip Lewandowski", "Gosia Zielińska", "Hubert Szymański", "Iga Woźniak", "Jan Dąbrowski",
  "Kasia Kozłowska", "Leon Jankowski", "Marta Mazur", "Nikola Krawczyk", "Olek Piotrowski",
  "Paula Grabowska", "Radek Pawłowski", "Sara Michalska", "Tomek Król", "Ula Wieczorek",
  "Wiktor Jabłoński", "Zosia Majewska", "Adam Olszewski", "Basia Stępień", "Kuba Malinowski",
];
const CARDS: CardType[] = ["Medicover", "Multisport", "Classic", "No card", "Medicover Light"];

function seed(): MockDb {
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

  const players: PlayerRow[] = NAMES.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    cardType: CARDS[i % CARDS.length]!,
    created_at: daysAgo(200 - i),
    penalty_since: null,
  }));
  // p5 is in the Tuesday reservation and p20 is on the past event's waiting list, so both
  // penalty paths (reservation skip, waiting-list promotion) can be tried right away.
  players[4]!.penalty_since = daysAgo(3);
  players[19]!.penalty_since = daysAgo(1);

  const ids = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => `p${from + i}`);

  const pastEvent: EventRow = {
    id: "e1",
    name: "Past training",
    date: daysAgo(7).slice(0, 10),
    created_at: daysAgo(8),
    hours: DEFAULT_HOURS,
    courts: 3,
    price_per_hour: DEFAULT_PRICE_PER_HOUR,
    fame_total: null,
    is_deleted: false,
  };
  const pastPlayers = ids(1, 12);
  const snapshot = (id: string): Player => {
    const p = players.find((x) => x.id === id)!;
    // Snapshots are taken at lottery time, before the penalty existed.
    return { id: p.id, name: p.name, cardType: p.cardType, paid: false, amount: 0 };
  };

  return {
    players,
    reservations: [
      { id: "r1", name: "Tuesday", created_at: daysAgo(30), playerIds: ids(1, 16) },
      { id: "r2", name: "Thursday", created_at: daysAgo(29), playerIds: ids(10, 19) },
    ],
    events: [pastEvent],
    playerEvents: pastPlayers.map((player_id) => ({
      event_id: "e1",
      player_id,
      paid: false,
      amount: null,
      card_usage: 0,
    })),
    lottery: [
      {
        event_id: "e1",
        winners: ["p17", "p18", "p19"].map(snapshot),
        waiting_list: ["p20", "p21", "p22", "p23"].map(snapshot),
      },
    ],
    defaults: {
      id: 1,
      hours: DEFAULT_HOURS,
      price_per_hour: DEFAULT_PRICE_PER_HOUR,
      discount_per_usage: DISCOUNT_PER_USAGE,
    },
  };
}

// ---------- storage ----------

let memory: MockDb | null = null;

function load(): MockDb {
  if (memory) return memory;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MOCK_DB_KEY) : null;
    memory = raw ? (JSON.parse(raw) as MockDb) : seed();
  } catch {
    memory = seed();
  }
  return memory;
}

function save(db: MockDb) {
  memory = db;
  try {
    if (typeof window !== "undefined") localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable: keep the in-memory copy for this page load.
  }
}

/** Mutates the db inside `fn` and persists it. */
function write<T>(fn: (db: MockDb) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

export function resetMockDb() {
  memory = null;
  try {
    localStorage.removeItem(MOCK_DB_KEY);
  } catch {
    // ignore
  }
}

// ---------- helpers ----------

const uid = () => Math.random().toString(36).slice(2, 10);
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const fail = (msg: string) => new Error(`[mock db] ${msg}`);

function toPlayer(row: PlayerRow): Player {
  return { ...row, paid: false, amount: 0 };
}

function playersByIds(db: MockDb, ids: string[]): Player[] {
  return ids
    .map((id) => db.players.find((p) => p.id === id))
    .filter((p): p is PlayerRow => !!p)
    .map(toPlayer);
}

function toReservation(db: MockDb, r: ReservationRow): ReservationList {
  return { id: r.id, name: r.name, created_at: r.created_at, players: playersByIds(db, r.playerIds) };
}

function toEvent(db: MockDb, e: EventRow): Event {
  const ids = db.playerEvents.filter((pe) => pe.event_id === e.id).map((pe) => pe.player_id);
  const { is_deleted: _deleted, ...rest } = e;
  return { ...rest, players: playersByIds(db, ids) };
}

function lotteryRow(db: MockDb, eventId: string): LotteryRow {
  const row = db.lottery.find((l) => l.event_id === eventId);
  if (!row) throw fail(`no lottery_results for event ${eventId}`);
  return row;
}

// ---------- operations (same shape as the Supabase ones in db.ts) ----------

export const mockPlayerOperations = {
  async getAllPlayers(): Promise<Player[]> {
    const db = load();
    return clone(db.players)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toPlayer);
  },

  async addPlayer(name: string, cardType: CardType): Promise<Player> {
    return write((db) => {
      const row: PlayerRow = {
        id: uid(),
        name,
        cardType,
        created_at: new Date().toISOString(),
        penalty_since: null,
      };
      db.players.push(row);
      return toPlayer(row);
    });
  },

  async editPlayer(id: string, name: string, cardType: CardType): Promise<Player> {
    return write((db) => {
      const row = db.players.find((p) => p.id === id);
      if (!row) throw fail(`player ${id} not found`);
      Object.assign(row, { name, cardType });
      return toPlayer(row);
    });
  },

  async removePlayer(id: string): Promise<void> {
    write((db) => {
      db.players = db.players.filter((p) => p.id !== id);
      db.playerEvents = db.playerEvents.filter((pe) => pe.player_id !== id);
      db.reservations.forEach((r) => (r.playerIds = r.playerIds.filter((x) => x !== id)));
    });
  },

  async addPenalty(id: string): Promise<void> {
    write((db) => {
      const row = db.players.find((p) => p.id === id);
      if (!row) throw fail(`player ${id} not found`);
      row.penalty_since = new Date().toISOString();
    });
  },

  async removePenalty(id: string): Promise<void> {
    write((db) => {
      const row = db.players.find((p) => p.id === id);
      if (!row) throw fail(`player ${id} not found`);
      row.penalty_since = null;
    });
  },

  async getPlayerEventDates(playerId: string): Promise<string[]> {
    const db = load();
    return db.playerEvents
      .filter((pe) => pe.player_id === playerId)
      .map((pe) => db.events.find((e) => e.id === pe.event_id)?.date)
      .filter((d): d is string => !!d)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  },
};

export const mockDefaultAdminValuesOperations = {
  async getDefaultAdminValues(): Promise<DefaultAdminValues> {
    return clone(load().defaults);
  },

  async updateDefaultAdminValues(
    _id: number,
    values: Partial<Omit<DefaultAdminValues, "id">>,
  ): Promise<void> {
    write((db) => Object.assign(db.defaults, values));
  },
};

export const mockReservationOperations = {
  async getAllReservationLists(): Promise<ReservationList[]> {
    const db = load();
    return clone(
      [...db.reservations]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((r) => toReservation(db, r)),
    );
  },

  async addReservationList(name: string, playerIds: string[]): Promise<ReservationList> {
    return write((db) => {
      const row: ReservationRow = {
        id: uid(),
        name,
        created_at: new Date().toISOString(),
        playerIds: [...playerIds],
      };
      db.reservations.push(row);
      return toReservation(db, row);
    });
  },

  async removeReservationList(id: string): Promise<void> {
    write((db) => (db.reservations = db.reservations.filter((r) => r.id !== id)));
  },

  async updateReservationPlayers(reservationId: string, playerIds: string[]): Promise<void> {
    write((db) => {
      const row = db.reservations.find((r) => r.id === reservationId);
      if (!row) throw fail(`reservation ${reservationId} not found`);
      row.playerIds = [...playerIds];
    });
  },
};

function setEventPlayers(db: MockDb, eventId: string, playerIds: string[]) {
  db.playerEvents = db.playerEvents.filter((pe) => pe.event_id !== eventId);
  db.playerEvents.push(
    ...playerIds.map((player_id) => ({
      event_id: eventId,
      player_id,
      paid: false,
      amount: null,
      card_usage: 0,
    })),
  );
}

export const mockEventOperations = {
  async addEvent(name: string, date: string, playerIds: string[]): Promise<Event> {
    return write((db) => {
      const row: EventRow = {
        id: uid(),
        name,
        date,
        created_at: new Date().toISOString(),
        hours: db.defaults.hours,
        courts: getCourtsFromPlayersCount(playerIds.length),
        price_per_hour: db.defaults.price_per_hour,
        fame_total: null,
        is_deleted: false,
      };
      db.events.push(row);
      setEventPlayers(db, row.id, playerIds);
      db.lottery.push({ event_id: row.id, winners: [], waiting_list: [] });
      return toEvent(db, row);
    });
  },

  async updateWaitingList(eventId: string, players: Player[]): Promise<void> {
    write((db) => (lotteryRow(db, eventId).waiting_list = clone(players)));
  },

  async getWaitingList(eventId: string): Promise<Player[]> {
    return clone(lotteryRow(load(), eventId).waiting_list);
  },

  async removeFromWaitingList(eventId: string, playerId: string): Promise<void> {
    write((db) => {
      const row = lotteryRow(db, eventId);
      row.waiting_list = row.waiting_list.filter((p) => p.id !== playerId);
    });
  },

  async updateWinnersList(eventId: string, winners: Player[]): Promise<void> {
    write((db) => (lotteryRow(db, eventId).winners = clone(winners)));
  },

  async getWinnersList(eventId: string): Promise<Player[]> {
    return clone(lotteryRow(load(), eventId).winners);
  },

  async addToWinnersList(eventId: string, player: Player): Promise<void> {
    write((db) => {
      const row = lotteryRow(db, eventId);
      row.winners.push({
        id: player.id || "",
        name: player.name || "",
        cardType: player.cardType || "No card",
        paid: false,
        amount: 0,
      });
      row.waiting_list = row.waiting_list.filter((p) => p.id !== player.id);
    });
  },

  async removeFromWinnersList(eventId: string, playerId: string): Promise<void> {
    write((db) => {
      const row = lotteryRow(db, eventId);
      row.winners = row.winners.filter((p) => p.id !== playerId);
    });
  },

  async removeLotteryResults(eventId: string): Promise<void> {
    write((db) => {
      const row = lotteryRow(db, eventId);
      row.winners = [];
      row.waiting_list = [];
    });
  },

  async getLotteryResultsByPlayerId(playerId: string) {
    const db = load();
    const wins: { eventId: string; date: string }[] = [];
    const played: { eventId: string; date: string }[] = [];
    for (const row of db.lottery) {
      const date = db.events.find((e) => e.id === row.event_id)?.date ?? "";
      if (row.winners.some((p) => p.id === playerId)) {
        wins.push({ eventId: row.event_id, date });
        played.push({ eventId: row.event_id, date });
      } else if (row.waiting_list.some((p) => p.id === playerId)) {
        played.push({ eventId: row.event_id, date });
      }
    }
    return { wins, played };
  },

  async deleteEvent(id: string): Promise<void> {
    write((db) => {
      const row = db.events.find((e) => e.id === id);
      if (row) row.is_deleted = true;
    });
  },

  async getAllEvents(): Promise<Record<string, Event[]>> {
    const db = load();
    const events = db.events
      .filter((e) => !e.is_deleted)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const grouped: Record<string, Event[]> = {};
    for (const e of events) (grouped[e.date] ??= []).push(toEvent(db, e));
    return clone(grouped);
  },

  async getEvent(id: string): Promise<Event | null> {
    const db = load();
    const row = db.events.find((e) => e.id === id);
    if (!row) throw fail(`event ${id} not found`);
    const event = toEvent(db, row);
    event.players = event.players.map((p) => {
      const pe = db.playerEvents.find((x) => x.event_id === id && x.player_id === p.id)!;
      return { ...p, paid: pe.paid, amount: pe.amount ?? 0, cardUsage: pe.card_usage ?? 0 };
    });
    return clone(event);
  },

  async getLastEvent(): Promise<Event | null> {
    const db = load();
    const row = [...db.events].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (!row) throw fail("no events");
    return clone(toEvent(db, row));
  },

  async updateEvent(eventId: string, name: string, date: string, playerIds: string[]): Promise<void> {
    write((db) => {
      const row = db.events.find((e) => e.id === eventId);
      if (!row) throw fail(`event ${eventId} not found`);
      Object.assign(row, { name, date, courts: getCourtsFromPlayersCount(playerIds.length) });
      setEventPlayers(db, eventId, playerIds);
    });
  },

  async updateEventPricing(
    eventId: string,
    payload: { courts: number; hours: number; price_per_hour: number; fame_total: number | null },
  ): Promise<void> {
    write((db) => {
      const row = db.events.find((e) => e.id === eventId);
      if (!row) throw fail(`event ${eventId} not found`);
      Object.assign(row, payload);
    });
  },

  async getEventPayments(eventId: string): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    for (const pe of load().playerEvents) if (pe.event_id === eventId) result[pe.player_id] = pe.paid;
    return result;
  },

  async updatePlayerPayment(eventId: string, playerId: string, paid: boolean): Promise<void> {
    write((db) => {
      const row = db.playerEvents.find((pe) => pe.event_id === eventId && pe.player_id === playerId);
      if (row) row.paid = paid;
      else db.playerEvents.push({ event_id: eventId, player_id: playerId, paid, amount: null, card_usage: 0 });
    });
  },

  async updatePlayerCardUsage(eventId: string, playerId: string, cardUsage: number): Promise<void> {
    write((db) => {
      const row = db.playerEvents.find((pe) => pe.event_id === eventId && pe.player_id === playerId);
      if (row) row.card_usage = cardUsage;
    });
  },

  async updatePlayerPaymentAmountForPlayer(eventId: string, playerId: string, newAmount: number): Promise<void> {
    write((db) => {
      const row = db.playerEvents.find((pe) => pe.event_id === eventId && pe.player_id === playerId);
      if (row) row.amount = newAmount;
    });
  },

  async getPlayerPaymentAmount(eventId: string): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const pe of load().playerEvents)
      if (pe.event_id === eventId) result[pe.player_id] = pe.amount as number;
    return result;
  },

  async updatePlayerPaymentAmount(eventId: string, cardType: string, amount: number) {
    write((db) => {
      const ids = new Set(db.players.filter((p) => p.cardType === cardType).map((p) => p.id));
      db.playerEvents.forEach((pe) => {
        if (pe.event_id === eventId && ids.has(pe.player_id)) pe.amount = amount;
      });
    });
  },

  async updatePlayerPaymentAmountsBatch(
    eventId: string,
    cardTypeToAmount: Record<string, number>,
    playerIdsByCardType: Record<string, string[]>,
  ): Promise<void> {
    write((db) => {
      for (const [cardType, amount] of Object.entries(cardTypeToAmount)) {
        const ids = new Set(playerIdsByCardType[cardType] ?? []);
        db.playerEvents.forEach((pe) => {
          if (pe.event_id === eventId && ids.has(pe.player_id)) pe.amount = amount;
        });
      }
    });
  },

  async updatePlayerPaymentAmountsByPlayerIds(
    eventId: string,
    playerIdToAmount: Record<string, number>,
  ): Promise<void> {
    write((db) => {
      db.playerEvents.forEach((pe) => {
        if (pe.event_id === eventId && pe.player_id in playerIdToAmount)
          pe.amount = playerIdToAmount[pe.player_id]!;
      });
    });
  },
};
