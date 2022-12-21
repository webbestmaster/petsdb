import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {
    compareBoolean,
    compareNumber,
    compareObject,
    compareString,
    getIsArrayIncludedByRegexp,
    getSortByPath,
} from '../lib/src/util';

describe('Util', () => {
    test('Compare strings', () => {
        const list: Array<string> = ['и', 'з', 'а', 'в', 'г', 'ё', 'д', 'б', 'е', 'ж'];

        const sortedAbsList: Array<string> = list.sort((itemA: string, itemB: string): number =>
            compareString(itemA, itemB)
        );

        assert.deepEqual(sortedAbsList, ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и']);

        const sortedDescList: Array<string> = list.sort(
            (itemA: string, itemB: string): number => -compareString(itemA, itemB)
        );

        assert.deepEqual(sortedDescList, ['и', 'з', 'ж', 'ё', 'е', 'д', 'г', 'в', 'б', 'а']);
    });

    test('Compare number', () => {
        const list: Array<number> = [1, 4, 3, 2, 5];

        const sortedAbsList: Array<number> = list.sort((itemA: number, itemB: number): number =>
            compareNumber(itemA, itemB)
        );

        assert.deepEqual(sortedAbsList, [1, 2, 3, 4, 5]);

        const sortedDescList: Array<number> = list.sort(
            (itemA: number, itemB: number): number => -compareNumber(itemA, itemB)
        );

        assert.deepEqual(sortedDescList, [5, 4, 3, 2, 1]);
    });

    test('Compare boolean', () => {
        const list: Array<boolean> = [false, true, false, true, false];

        const sortedAbsList: Array<boolean> = list.sort((itemA: boolean, itemB: boolean): number =>
            compareBoolean(itemA, itemB)
        );

        assert.deepEqual(sortedAbsList, [false, false, false, true, true]);

        const sortedDescList: Array<boolean> = list.sort(
            (itemA: boolean, itemB: boolean): number => -compareBoolean(itemA, itemB)
        );

        assert.deepEqual(sortedDescList, [true, true, false, false, false]);
    });

    test('Check getIsArrayIncludedByRegexp', () => {
        assert.equal(getIsArrayIncludedByRegexp(['I', 'am', 'the', 'test'], /th/), true);
        assert.equal(getIsArrayIncludedByRegexp([1, 2, 3], /4/), false);
    });

    test('Check getSortByPath', () => {
        assert.deepEqual(getSortByPath({check: {test: {now: 'test'}}}, {check: {test: {now: 1}}}), {
            direction: 1,
            value: 'test',
        });
        assert.throws(() => getSortByPath({check: {test: {now: {test: {more: true}}}}}, {check: {test: {now: 1}}}));
        assert.throws(() => getSortByPath({check: {small: true}}, {check: {test: {now: 1}}}));
    });

    test('Check compareObject', () => {
        // check for non comparing objects
        assert.equal(
            compareObject({check: {test: {now: true}}}, {check: {test: {now: 'test'}}}, {check: {test: {now: 1}}}),
            0
        );
    });
});
