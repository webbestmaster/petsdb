import assert from 'node:assert/strict';

import {describe, it} from '@jest/globals';

import {Petsdb, PetsdbItemType, PetsdbReadPageResultType} from '../lib/export';

import {compareBoolean, compareNumber, compareString, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('read page', () => {
    // eslint-disable-next-line max-statements
    it('read page by simple selector', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        let pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
            {},
            {pageIndex: 1, pageSize: 10, sort: {id: 1}}
        );

        assert.equal(pageData.list.length, 10);
        assert.equal(pageData.totalPageCount, 5);
        assert.equal(pageData.totalItemCount, 50);

        // check UP sort string
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): string => dataItem.id),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): string => dataItem.id)
                .sort((valueA: string, valueB: string): number => compareString(valueA, valueB))
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {id: -1}});

        // check DOWN sort string
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): string => dataItem.id),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): string => dataItem.id)
                .sort((valueA: string, valueB: string): number => -compareString(valueA, valueB))
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: 1}});

        // check UP sort number
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): number => dataItem.index),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): number => dataItem.index)
                .sort((valueA: number, valueB: number): number => compareNumber(valueA, valueB))
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: -1}});

        // check DOWN sort number
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): number => dataItem.index),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): number => dataItem.index)
                .sort((valueA: number, valueB: number): number => -compareNumber(valueA, valueB))
        );

        pageData = await petsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: 1}}}});

        assert.equal(pageData.totalPageCount, 2);

        // check UP sort bool
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): boolean => dataItem.more.data.bool),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): boolean => dataItem.more.data.bool)
                .sort((valueA: boolean, valueB: boolean): number => compareBoolean(valueA, valueB))
        );

        pageData = await petsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: -1}}}});

        // check DOWN sort bool
        assert.deepEqual(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): boolean => dataItem.more.data.bool),
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): boolean => dataItem.more.data.bool)
                .sort((valueA: boolean, valueB: boolean): number => -compareBoolean(valueA, valueB))
        );

        // check do not throw error if selector is not number or string
        // await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {more: {data: {bool: 1}}}});
    });

    // eslint-disable-next-line max-statements
    it('Read page by pageSize = 0, return all items, pageIndex is not matter', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();
        const collectionSize = 50;

        const testDataList: Array<TestDataType> = generateTestDataList(collectionSize);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        // pageSize is negative zero
        let pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
            {},
            {pageIndex: 0, pageSize: 0, sort: {id: 1}}
        );

        assert.equal(pageData.list.length, collectionSize);
        assert.equal(pageData.pageIndex, 0);
        assert.equal(pageData.pageSize, collectionSize);
        assert.equal(pageData.totalPageCount, 1);
        assert.equal(pageData.totalItemCount, collectionSize);
        assert.deepEqual(pageData.sort, {id: 1});

        // pageSize is negative zero
        pageData = await petsdb.readPage({}, {pageIndex: 11, pageSize: 0, sort: {id: 1}});

        assert.equal(pageData.list.length, collectionSize);
        assert.equal(pageData.pageIndex, 11);
        assert.equal(pageData.pageSize, collectionSize);
        assert.equal(pageData.totalPageCount, 1);
        assert.equal(pageData.totalItemCount, collectionSize);
        assert.deepEqual(pageData.sort, {id: 1});

        // pageSize is negative number
        pageData = await petsdb.readPage({}, {pageIndex: 11, pageSize: -22, sort: {id: 1}});

        assert.equal(pageData.list.length, collectionSize);
        assert.equal(pageData.pageIndex, 11);
        assert.equal(pageData.pageSize, collectionSize);
        assert.equal(pageData.totalPageCount, 1);
        assert.equal(pageData.totalItemCount, collectionSize);
        assert.deepEqual(pageData.sort, {id: 1});
    });

    it('Read-page by non-exists selector - get empty array of items', async () => {
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
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
