import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Tsdb, TsdbItemType, TsdbReadPageResultType} from '../lib/export';

import {compareBoolean, compareNumber, compareString, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Read page', () => {
    // eslint-disable-next-line max-statements
    test('Read page by simple selector', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        let pageData: TsdbReadPageResultType<TestDataType> = await tsdb.readPage(
            {},
            {pageIndex: 1, pageSize: 10, sort: {id: 1}}
        );

        assert.equal(pageData.list.length, 10);
        assert.equal(pageData.totalPageCount, 5);
        assert.equal(pageData.totalItemCount, 50);

        // check UP sort string
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): string => dataItem.id),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): string => dataItem.id)
                .sort((valueA: string, valueB: string): number => compareString(valueA, valueB))
        );

        pageData = await tsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {id: -1}});

        // check DOWN sort string
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): string => dataItem.id),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): string => dataItem.id)
                .sort((valueA: string, valueB: string): number => -compareString(valueA, valueB))
        );

        pageData = await tsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: 1}});

        // check UP sort number
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): number => dataItem.index),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): number => dataItem.index)
                .sort((valueA: number, valueB: number): number => compareNumber(valueA, valueB))
        );

        pageData = await tsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: -1}});

        // check DOWN sort number
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): number => dataItem.index),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): number => dataItem.index)
                .sort((valueA: number, valueB: number): number => -compareNumber(valueA, valueB))
        );

        pageData = await tsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: 1}}}});

        assert.equal(pageData.totalPageCount, 2);

        // check UP sort bool
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): boolean => dataItem.more.data.bool),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): boolean => dataItem.more.data.bool)
                .sort((valueA: boolean, valueB: boolean): number => compareBoolean(valueA, valueB))
        );

        pageData = await tsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: -1}}}});

        // check DOWN sort bool
        assert.deepEqual(
            pageData.list.map((dataItem: TsdbItemType<TestDataType>): boolean => dataItem.more.data.bool),
            pageData.list
                .map((dataItem: TsdbItemType<TestDataType>): boolean => dataItem.more.data.bool)
                .sort((valueA: boolean, valueB: boolean): number => -compareBoolean(valueA, valueB))
        );

        // check do not throw error if selector is not number or string
        // await tsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {more: {data: {bool: 1}}}});
    });

    test('Read-page by non-exists selector - get empty array of items', async () => {
        const idToFind = makeRandomString();
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const pageData: TsdbReadPageResultType<TestDataType> = await tsdb.readPage(
            {id: idToFind},
            {
                pageIndex: 0,
                pageSize: 10,
                sort: {id: 1},
            }
        );

        assert.deepEqual(pageData, {
            list: [],
            pageIndex: 0,
            pageSize: 10,
            sort: {id: 1},
            totalItemCount: 0,
            totalPageCount: 0,
        });
    });
});
