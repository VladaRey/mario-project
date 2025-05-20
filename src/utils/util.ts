import { InputDataType } from "~/services/calculation-service";

export interface State {
  courts: string;
  hours: string;
  pricePerHour: string;
  fameTotal: string;
  medicoverLightOwners: string;
  mCoverOwners: string;
  msOwners: string;
  msClassicOwners: string;
  noCard: string;
  medicoverLightUsage: string;
  mCoverUsage: string;
  msUsage: string;
}

export function transformState(state: State): InputDataType {
  return {
    medicoverLightOwners: parseStringOrZero(state.medicoverLightOwners),
    medicoverOwners: parseStringOrZero(state.mCoverOwners),
    msClassicOwners: parseStringOrZero(state.msClassicOwners),
    noCardOwners: parseStringOrZero(state.noCard),
    medicoverLightCardUsages: parseStringOrZero(state.medicoverLightUsage),
    msCardUsages: parseStringOrZero(state.msUsage),
    courts: parseStringOrZero(state.courts),
    pricePerHour: parseStringOrZero(state.pricePerHour),
    fameTotal: parseStringOrZero(state.fameTotal),
    hours: parseStringOrZero(state.hours),
    msOwners: parseStringOrZero(state.msOwners),
    medicoverCardUsages: parseStringOrZero(state.mCoverUsage),
  };
}

function parseStringOrZero(value: string): number {
  if (value === "") {
    return 0;
  }
  return Number(value);
}
