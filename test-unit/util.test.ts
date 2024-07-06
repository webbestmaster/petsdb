import {describe, expect,it} from "@jest/globals";

import {
    compareBoolean,
    compareNumber,
    compareObject,
    compareString,
    getIsArrayIncludedByRegexp,
    getSortByPath,
} from "../lib/src/util";

describe("util", () => {
    it("compare strings", () => {
        expect.assertions(2);
        const list: Array<string> = ["и", "з", "а", "в", "г", "ё", "д", "б", "е", "ж"];

        const sortedAbsList: Array<string> = list.sort((itemA: string, itemB: string): number => {
            return compareString(itemA, itemB);
        });

        expect(sortedAbsList).toStrictEqual(["а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и"]);

        const sortedDescList: Array<string> = list.sort((itemA: string, itemB: string): number => {
            return -compareString(itemA, itemB);
        });

        expect(sortedDescList).toStrictEqual(["и", "з", "ж", "ё", "е", "д", "г", "в", "б", "а"]);
    });

    it("compare number", () => {
        expect.assertions(2);
        const list: Array<number> = [1, 4, 3, 2, 5];

        const sortedAbsList: Array<number> = list.sort((itemA: number, itemB: number): number => {
            return compareNumber(itemA, itemB);
        });

        expect(sortedAbsList).toStrictEqual([1, 2, 3, 4, 5]);

        const sortedDescList: Array<number> = list.sort((itemA: number, itemB: number): number => {
            return -compareNumber(itemA, itemB);
        });

        expect(sortedDescList).toStrictEqual([5, 4, 3, 2, 1]);
    });

    it("compare boolean", () => {
        expect.assertions(2);
        const list: Array<boolean> = [false, true, false, true, false];

        const sortedAbsList: Array<boolean> = list.sort((itemA: boolean, itemB: boolean): number => {
            return compareBoolean(itemA, itemB);
        });

        expect(sortedAbsList).toStrictEqual([false, false, false, true, true]);

        const sortedDescList: Array<boolean> = list.sort((itemA: boolean, itemB: boolean): number => {
            return -compareBoolean(itemA, itemB);
        });

        expect(sortedDescList).toStrictEqual([true, true, false, false, false]);
    });

    it("check getIsArrayIncludedByRegexp", () => {
        expect.assertions(2);
        expect(getIsArrayIncludedByRegexp(["I", "am", "the", "test"], /th/u)).toBe(true);
        expect(getIsArrayIncludedByRegexp([1, 2, 3], /4/u)).toBe(false);
    });

    it("check getSortByPath", () => {
        expect.assertions(3);
        expect(getSortByPath({check: {test: {now: "test"}}}, {check: {test: {now: 1}}})).toStrictEqual({
            direction: 1,
            value: "test",
        });
        expect(() => {
            return getSortByPath({check: {test: {now: {test: {more: true}}}}}, {check: {test: {now: 1}}});
        }).toThrow("Can not find value by");
        expect(() => {
            return getSortByPath({check: {small: true}}, {check: {test: {now: 1}}});
        }).toThrow("Can not find value by");
    });

    it("check compareObject", () => {
        expect.assertions(1);
        // Check for non comparing objects
        expect(
            compareObject({check: {test: {now: true}}}, {check: {test: {now: "test"}}}, {check: {test: {now: 1}}})
        ).toBe(0);
    });
});
