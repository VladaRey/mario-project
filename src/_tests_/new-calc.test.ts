import { calculateEventStatistics } from "../services/calculate-event-statistics-service";

test("Event statistics: Medicover / Medicover Light with 2h, 1 court, 2 No Card", () => {
  const event = {
    players: [
      { id: "medicover" },
      { id: "light" },
      { id: "no1" },
      { id: "no2" },
    ],
  } as any; 

  const params = {
    courts: 1,
    pricePerHour: 80,
    hours: 2,
    fameTotal: 0,
  };

  const playerUsages = {
    medicover: 3,
    light: 1,
    no1: 0,
    no2: 0,
  };

  const result = calculateEventStatistics(event, params, playerUsages);

  const expectedStatistics = {
    totalPrice: "160.00",
    priceAfterDiscount: "100.00", 
    totalFromPlayers: "100.00",
    discount: "60.00", 
    fameDiscount: "0.00",
  };

  expect(result.statistics).toStrictEqual(expectedStatistics);

  expect(result.amounts).toEqual({
    medicover: 0,
    light: 23.33,
    no1: 38.33,
    no2: 38.33,
  });
});
