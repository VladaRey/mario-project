import type { Event, CardType } from "~/lib/db";
import type { InputDataType } from "~/services/calculation-service";

export interface AutoParams {
  courts: number;
  hours: number;
  pricePerHour: number;
  fameTotal: number;
  /** Optional overrides for owner counts; when omitted, derived from event. */
  medicoverOwners?: number;
  medicoverLightOwners?: number;
  msOwners?: number;
  msClassicOwners?: number;
  noCardOwners?: number;
}

/** Initial auto params before event is loaded (used for useState initial value). */
export const DEFAULT_AUTO_PARAMS: AutoParams = {
  courts: 1,
  hours: 2,
  pricePerHour: 77,
  fameTotal: 0,
};

export function getDefaultAutoParams(playersCount: number): AutoParams {
  const courtCount = Math.ceil(playersCount / 4);
  return {
    courts: courtCount,
    hours: 2,
    pricePerHour: 77,
    fameTotal: 0,
  };
}


export function buildInputDataFromEvent(
  event: Event,
  params: AutoParams,
  playerUsages: Record<string, number>
): InputDataType {
  const counts = event.players.reduce(
    (acc, p) => {
      acc[p.cardType] = (acc[p.cardType] || 0) + 1;
      return acc;
    },
    {} as Record<CardType, number>
  );

  let medicoverCardUsages = 0;
  let medicoverLightCardUsages = 0;
  let msCardUsages = 0;

  for (const player of event.players) {
    const usage = playerUsages[player.id] ?? 0;
    switch (player.cardType) {
      case "Medicover":
        medicoverCardUsages += usage;
        break;
      case "Medicover Light":
        medicoverLightCardUsages += usage;
        break;
      case "Multisport":
      case "Classic":
        msCardUsages += usage;
        break;
      case "No card":
        break;
    }
  }

  return {
    msOwners: params.msOwners ?? counts["Multisport"] ?? 0,
    medicoverOwners: params.medicoverOwners ?? counts["Medicover"] ?? 0,
    msClassicOwners: params.msClassicOwners ?? counts["Classic"] ?? 0,
    medicoverLightOwners: params.medicoverLightOwners ?? counts["Medicover Light"] ?? 0,
    noCardOwners: params.noCardOwners ?? counts["No card"] ?? 0,
    msCardUsages,
    medicoverCardUsages,
    medicoverLightCardUsages,
    courts: params.courts,
    pricePerHour: params.pricePerHour,
    hours: params.hours,
    fameTotal: params.fameTotal,
  };
}
