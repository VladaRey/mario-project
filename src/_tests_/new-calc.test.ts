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


describe("calculateEventStatistics - fame evenly distributed", () => {
  it("should correctly apply fame discount with card usage", () => {
    const event = {
      players: [
        { id: "player1" },
        { id: "player2" },
        { id: "player3" },
        { id: "player4" },
      ],
    } as any;

    const params = {
      courts: 1,
      pricePerHour: 80,
      hours: 2,
      fameTotal: 120,
    } as any;

    const playerUsages = {
      player1: 1, 
      player2: 0,
      player3: 0,
      player4: 0,
    };

    const { amounts, statistics } = calculateEventStatistics(
      event,
      params,
      playerUsages,
    );

    // expect total price = 160
    expect(statistics?.totalPrice).toBe("160.00");

    // expect fame discount = 25
    expect(statistics?.fameDiscount).toBe("25.00");

    expect(amounts).toBeDefined();
    expect((amounts as Record<string, number>)["player1"]).toBeCloseTo(18.75, 2);
    expect((amounts as Record<string, number>)["player2"]).toBeCloseTo(33.75, 2);
    expect((amounts as Record<string, number>)["player3"]).toBeCloseTo(33.75, 2);
    expect((amounts as Record<string, number>)["player4"]).toBeCloseTo(33.75, 2);
  });
});

