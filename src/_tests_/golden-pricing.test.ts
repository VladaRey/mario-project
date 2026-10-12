import { calculateStatistics, type InputDataType } from "~/services/calculation-service";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";
import { DISCOUNT_PER_USAGE } from "~/constants/event-pricing-defaults";
import type { CardType, Event, Player } from "~/lib/db";

const base: InputDataType = {
  courts: 3, hours: 2, pricePerHour: 77, fameTotal: 0,
  medicoverOwners: 3, medicoverCardUsages: 2,
  medicoverLightOwners: 2, medicoverLightCardUsages: 1,
  msOwners: 3, msCardUsages: 2,
  msClassicOwners: 2, noCardOwners: 4,
};

describe("FFP calculator golden values (must not change during the redesign)", () => {
  test.each([
    ["spec 5.1 input", base],
    ["with FAME total 300", { ...base, fameTotal: 300 }],
    ["3 hours (MS Classic 1/3)", { ...base, hours: 3 }],
    ["4 hours (MS Classic 1/4)", { ...base, hours: 4 }],
    ["1 hour", { ...base, hours: 1 }],
    ["only no-card players", { ...base, medicoverOwners: 0, medicoverCardUsages: 0, medicoverLightOwners: 0, medicoverLightCardUsages: 0, msOwners: 0, msCardUsages: 0, msClassicOwners: 0, noCardOwners: 8 }],
    ["discount larger than total", { ...base, courts: 1, hours: 1, pricePerHour: 20, medicoverCardUsages: 6 }],
  ])("%s", (_name, input) => {
    expect(calculateStatistics(input)).toMatchSnapshot();
  });
});

const CARDS: CardType[] = ["Medicover", "Multisport", "Classic", "No card", "Medicover Light"];
const players: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`, name: `P${i + 1}`, cardType: CARDS[i % CARDS.length]!, paid: false, amount: 0,
}));
const event = { id: "e1", name: "Past training", date: "2026-09-29", players } as Event;

describe("Event pricing golden values (must not change during the redesign)", () => {
  test.each([
    ["no usage, no fame", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: null }, {}],
    ["Anna uses card once (spec 0.2)", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: null }, { p1: 1 }],
    ["fame total 100 with usage", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: 100 }, { p1: 1 }],
    ["heavy usage redistributes negatives", { courts: 1, hours: 1, pricePerHour: 40, fameTotal: null }, { p1: 3, p2: 3 }],
  ])("%s", (_name, params, usages: Record<string, number>) => {
    expect(calculateEventStatistics(event, params, usages, DISCOUNT_PER_USAGE)).toMatchSnapshot();
  });
});
