import {expect, test} from "@jest/globals";
import {calculateStatistics, InputDataType, Statistics} from "../services/calculation-service";


test('2h 2ms 2nc 4u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 2,
        medicoverOwners:0,
        medicoverLightOwners:0,
        pricePerHour:80,
        hours:2,
        noCardOwners:2,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:0,
        msCardUsages:4,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '160.00',
        discount: '60.00',
        priceAfterDiscount: '100.00',
        noMs: '40.00',
        msClassic: undefined,
        medicover: undefined,
        medicoverLight: undefined,
        MS: '10.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2h 2ms 1cl 1nc 4u', () => {
    const data:InputDataType = {
        msClassicOwners: 1,
        msOwners: 2,
        medicoverOwners:0,
        medicoverLightOwners:0,
        pricePerHour:80,
        hours:2,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:0,
        msCardUsages:4,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '160.00',
        discount: '60.00',
        priceAfterDiscount: '100.00',
        noMs: '40.00',
        msClassic: '28.00',
        medicover: undefined,
        medicoverLight: undefined,
        MS: '16.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});

test('4c 2h 13ms 3nc 16u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 13,
        medicoverOwners:0,
        medicoverLightOwners:0,
        pricePerHour:80,
        hours:2,
        noCardOwners:3,
        fameTotal:360,
        courts:4,
        medicoverCardUsages:0,
        msCardUsages:16,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '640.00',
        discount: '240.00',
        priceAfterDiscount: '360.00',
        noMs: '37.50',
        msClassic: undefined,
        medicover: undefined,
        medicoverLight: undefined,
        MS: '19.04',
        fameDiscount: '40.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});

test('5c 2h 18ms 1cl 1nc 20u', () => {
    const data:InputDataType = {
        msClassicOwners: 1,
        msOwners: 18,
        medicoverOwners:0,
        medicoverLightOwners:0,
        pricePerHour:55,
        hours:2,
        noCardOwners:1,
        fameTotal:250,
        courts:5,
        medicoverCardUsages:0,
        msCardUsages:20,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '550.00',
        discount: '300.00',
        priceAfterDiscount: '250.00',
        noMs: '27.50',
        msClassic: '19.40',
        medicover: undefined,
        medicoverLight: undefined,
        MS: '11.29',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2h 2ms 2mc 8u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 2,
        medicoverOwners:2,
        medicoverLightOwners:0,
        pricePerHour:80,
        hours:2,
        noCardOwners:0,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:4,
        msCardUsages:4,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '160.00',
        discount: '120.00',
        priceAfterDiscount: '40.00',
        noMs: undefined,
        msClassic: undefined,
        medicover: '10.00',
        medicoverLight: undefined,
        MS: '10.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});

test('2h 3ms 2mc 2cl 1nc 12u', () => {
    const data:InputDataType = {
        msClassicOwners: 2,
        msOwners: 3,
        medicoverOwners:2,
        medicoverLightOwners:0,
        pricePerHour:80,
        hours:2,
        noCardOwners:1,
        fameTotal:0,
        courts:2,
        medicoverCardUsages:4,
        msCardUsages:8,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '320.00',
        discount: '180.00',
        priceAfterDiscount: '140.00',
        noMs: '40.00',
        msClassic: '25.00',
        medicover: '10.00',
        medicoverLight: undefined,
        MS: '10.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});

test('discount distribution #1', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 4,
        medicoverOwners:2,
        medicoverLightOwners:0,
        pricePerHour:60,
        hours:2.5,
        noCardOwners:2,
        fameTotal:0,
        courts:2,
        medicoverCardUsages:6,
        msCardUsages:12,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '300.00',
        discount: '270.00',
        priceAfterDiscount: '30.00',
        noMs: '15.00',
        msClassic: undefined,
        medicover: '0',
        medicoverLight: undefined,
        MS: '0',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('discount distribution #2', () => {
    const data:InputDataType = {
        msClassicOwners: 1,
        msOwners: 0,
        medicoverOwners:2,
        medicoverLightOwners:0,
        pricePerHour:65,
        hours:1.5,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:4,
        msCardUsages:1,
        medicoverLightCardUsages:0
    }

    const expected:Statistics = {
        totalPrice: '97.50',
        discount: '75.00',
        priceAfterDiscount: '22.50',
        noMs: '18.75',
        msClassic: '3.75',
        medicover: '0',
        medicoverLight: undefined,
        MS: undefined,
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('1h 1nc 1ms 1mc 1ml 3u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 1,
        medicoverOwners:1,
        medicoverLightOwners:1,
        pricePerHour:40,
        hours:1,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:1,
        msCardUsages:1,
        medicoverLightCardUsages:1
    }

    const expected:Statistics = {
        totalPrice: '40.00',
        discount: '45.00',
        priceAfterDiscount: '0',
        noMs: '0',
        msClassic: undefined,
        medicover: '0',
        medicoverLight: '0',
        MS: '0',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('1h 1nc 1cl 1mc 1ml 3u', () => {
    const data:InputDataType = {
        msClassicOwners: 1,
        msOwners: 0,
        medicoverOwners:1,
        medicoverLightOwners:1,
        pricePerHour:40,
        hours:1,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:1,
        msCardUsages:1,
        medicoverLightCardUsages:1
    }

    const expected:Statistics = {
        totalPrice: '40.00',
        discount: '45.00',
        priceAfterDiscount: '0',
        noMs: '0',
        msClassic: '0',
        medicover: '0',
        medicoverLight: '0',
        MS: undefined,
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2c 2h 4ms 2ml 2nc 10u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 4,
        medicoverOwners:0,
        medicoverLightOwners:2,
        pricePerHour:60,
        hours:2,
        noCardOwners:2,
        fameTotal:0,
        courts:2,
        medicoverCardUsages:0,
        msCardUsages:8,
        medicoverLightCardUsages:2
    }

    const expected:Statistics = {
        totalPrice: '240.00',
        discount: '150.00',
        priceAfterDiscount: '90.00',
        noMs: '30.00',
        msClassic: undefined,
        medicover: undefined,
        medicoverLight: '15.00',
        MS: '0.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('4c 2h 10ms 4ml 2nc 20u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 10,
        medicoverOwners:0,
        medicoverLightOwners:4,
        pricePerHour:80,
        hours:2,
        noCardOwners:2,
        fameTotal:300,
        courts:4,
        medicoverCardUsages:0,
        msCardUsages:16,
        medicoverLightCardUsages:4
    }

    const expected:Statistics = {
        totalPrice: '640.00',
        discount: '300.00',
        priceAfterDiscount: '300.00',
        noMs: '37.50',
        msClassic: undefined,
        medicover: undefined,
        medicoverLight: '22.50',
        MS: '13.50',
        fameDiscount: '40.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2h 2ml 1nc 1cl 3u', () => {
    const data:InputDataType = {
        msClassicOwners: 1,
        msOwners: 0,
        medicoverOwners:0,
        medicoverLightOwners:2,
        pricePerHour:55,
        hours:2,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:0,
        msCardUsages:1,
        medicoverLightCardUsages:2
    }

    const expected:Statistics = {
        totalPrice: '110.00',
        discount: '45.00',
        priceAfterDiscount: '65.00',
        noMs: '27.50',
        msClassic: '12.50',
        medicover: undefined,
        medicoverLight: '12.50',
        MS: undefined,
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2h 1ml 1nc 2ms 5u', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 2,
        medicoverOwners:0,
        medicoverLightOwners:1,
        pricePerHour:80,
        hours:2,
        noCardOwners:1,
        fameTotal:0,
        courts:1,
        medicoverCardUsages:0,
        msCardUsages:4,
        medicoverLightCardUsages:1
    }

    const expected:Statistics = {
        totalPrice: '160.00',
        discount: '75.00',
        priceAfterDiscount: '85.00',
        noMs: '40.00',
        msClassic: undefined,
        medicover: undefined,
        medicoverLight: '25.00',
        MS: '10.00',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
});


test('2h 2ml 4nc 2ms 7u 2mc', () => {
    const data:InputDataType = {
        msClassicOwners: 0,
        msOwners: 1,
        medicoverOwners:2,
        medicoverLightOwners:1,
        pricePerHour:55,
        hours:2,
        noCardOwners:4,
        fameTotal:0,
        courts:2,
        medicoverCardUsages:4,
        msCardUsages:2,
        medicoverLightCardUsages:1
    }

    const expected:Statistics = {
        totalPrice: '220.00',
        discount: '105.00',
        priceAfterDiscount: '115.00',
        noMs: '26.00',
        msClassic: undefined,
        medicover: '0',
        medicoverLight: '11.00',
        MS: '0',
        fameDiscount: '0.00'
    }

    expect(calculateStatistics(data)).toStrictEqual(expected);
})