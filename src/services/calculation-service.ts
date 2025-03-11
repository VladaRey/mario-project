export interface InputDataType {
  msOwners: number;
  medicoverOwners: number;
  msClassicOwners: number;
  noCardOwners: number;
  msCardUsages: number;
  medicoverCardUsages: number;
  courts: number;
  pricePerHour: number;
  hours: number;
  fameTotal: number;
}

export interface Statistics {
  totalPrice: string;
  priceAfterDiscount: string;
  discount: string;
  msClassic?: string;
  medicover?: string;
  MS?: string;
  noMs?: string;
  fameDiscount: string;
}

export function calculateStatistics(inputData: InputDataType): Statistics {
  const discount =
    (inputData.medicoverCardUsages + inputData.msCardUsages) * 15;

  const total = inputData.courts * inputData.pricePerHour * inputData.hours;

  const priceAfterDiscount = total - discount;

  const people =
    inputData.msOwners +
    inputData.medicoverOwners +
    inputData.msClassicOwners +
    inputData.noCardOwners;

  const fameDiscount =
    inputData.fameTotal > 0 ? priceAfterDiscount - inputData.fameTotal : 0;

  const realTotal =
    inputData.fameTotal > 0
      ? priceAfterDiscount - fameDiscount
      : priceAfterDiscount;

  let noMs = (total - fameDiscount) / people;

  const medicoverDiscaunt = inputData.medicoverCardUsages * 15;
  const medicoverPrice =
    inputData.medicoverOwners > 0
      ? noMs - medicoverDiscaunt / inputData.medicoverOwners
      : 0;

  let medicoverAdditionalDiscount = 0;
  let msAdditionalDiscount = 0;

  if (medicoverPrice < 0) {
    medicoverAdditionalDiscount =
      (medicoverPrice * inputData.medicoverOwners) /
      (inputData.msOwners + inputData.msClassicOwners + inputData.noCardOwners);
  }

  const totalMsDiscaunt = inputData.msCardUsages * 15;
  const msDiscaunt =
    totalMsDiscaunt /
    (inputData.msOwners +
      inputData.msClassicOwners * msClassicDiscount(inputData.hours));
  const msClassicDiscaunt = msDiscaunt * msClassicDiscount(inputData.hours);

  const msPrice = noMs - msDiscaunt + medicoverAdditionalDiscount;
  if (msPrice < 0) {
    msAdditionalDiscount =
      (msPrice * inputData.msOwners) / inputData.noCardOwners;
  }

  const msClassicPrice =
    inputData.msClassicOwners > 0
      ? noMs -
        msClassicDiscaunt +
        medicoverAdditionalDiscount +
        msAdditionalDiscount
      : 0;

  noMs += msAdditionalDiscount + medicoverAdditionalDiscount;

  return {
    totalPrice: roundUp(total),
    discount: roundUp(discount),
    priceAfterDiscount: roundUp(realTotal),
    fameDiscount: inputData.fameTotal > 0 ? fameDiscount.toFixed(2) : "0.00",
    noMs: inputData.noCardOwners
      ? roundUp(inputData.noCardOwners > 0 ? noMs : 0)
      : undefined,
    MS: inputData.msOwners ? roundUp(msPrice) : undefined,
    medicover: inputData.medicoverOwners ? roundUp(medicoverPrice) : undefined,
    msClassic: inputData.msClassicOwners
      ? roundUp(msClassicPrice > 0 ? msClassicPrice : 0)
      : undefined,
  };
}

function msClassicDiscount(hours: number) {
  if (hours === 1) {
    return 1;
  } else if (hours <= 2) {
    return 0.5;
  } else if (hours <= 3) {
    return 0.33;
  } else if (hours <= 4) {
    return 0.25;
  }
  return 1;
}

const power = Math.pow(10, 2);

function roundUp(num: number) {
  if (num < 0) {
    return "0";
  }

  return (Math.ceil(num * power) / power).toFixed(2);
}
