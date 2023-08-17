/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position, multiline-comment-style, jest/max-expects */
import {describe, it, expect} from '@jest/globals';

import {Petsdb, type PetsdbItemType, type PetsdbReadPageResultType} from '../lib/export';

import {compareBoolean, compareNumber, compareString, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, type TestDataType} from './helper/helper';

describe('read page', () => {
    // eslint-disable-next-line max-statements
    it('read page by simple selector', async () => {
        expect.assertions(10);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        let pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
            {},
            {pageIndex: 1, pageSize: 10, sort: {id: 1}}
        );

        expect(pageData.list).toHaveLength(10);
        expect(pageData.totalPageCount).toBe(5);
        expect(pageData.totalItemCount).toBe(50);

        // Check UP sort string
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): string => {
                return dataItem.id;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): string => {
                    return dataItem.id;
                })
                .sort((valueA: string, valueB: string): number => {
                    return compareString(valueA, valueB);
                })
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {id: -1}});

        // Check DOWN sort string
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): string => {
                return dataItem.id;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): string => {
                    return dataItem.id;
                })
                .sort((valueA: string, valueB: string): number => {
                    return -compareString(valueA, valueB);
                })
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: 1}});

        // Check UP sort number
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): number => {
                return dataItem.index;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): number => {
                    return dataItem.index;
                })
                .sort((valueA: number, valueB: number): number => {
                    return compareNumber(valueA, valueB);
                })
        );

        pageData = await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {index: -1}});

        // Check DOWN sort number
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): number => {
                return dataItem.index;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): number => {
                    return dataItem.index;
                })
                .sort((valueA: number, valueB: number): number => {
                    return -compareNumber(valueA, valueB);
                })
        );

        pageData = await petsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: 1}}}});

        expect(pageData.totalPageCount).toBe(2);

        // Check UP sort bool
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): boolean => {
                return dataItem.more.data.bool;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): boolean => {
                    return dataItem.more.data.bool;
                })
                .sort((valueA: boolean, valueB: boolean): number => {
                    return compareBoolean(valueA, valueB);
                })
        );

        pageData = await petsdb.readPage({}, {pageIndex: 0, pageSize: 45, sort: {more: {data: {bool: -1}}}});

        // Check DOWN sort bool
        expect(
            pageData.list.map((dataItem: PetsdbItemType<TestDataType>): boolean => {
                return dataItem.more.data.bool;
            })
        ).toStrictEqual(
            pageData.list
                .map((dataItem: PetsdbItemType<TestDataType>): boolean => {
                    return dataItem.more.data.bool;
                })
                .sort((valueA: boolean, valueB: boolean): number => {
                    return -compareBoolean(valueA, valueB);
                })
        );

        // Check do not throw error if selector is not number or string

        // Await petsdb.readPage({}, {pageIndex: 1, pageSize: 10, sort: {more: {data: {bool: 1}}}});
    });

    // eslint-disable-next-line max-statements
    it('read page by pageSize = 0, return all items, pageIndex is not matter', async () => {
        expect.assertions(18);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();
        const collectionSize = 50;

        const testDataList: Array<TestDataType> = generateTestDataList(collectionSize);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        // pageSize is negative zero
        let pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
            {},
            {pageIndex: 0, pageSize: 0, sort: {id: 1}}
        );

        expect(pageData.list).toHaveLength(collectionSize);
        expect(pageData.pageIndex).toBe(0);
        expect(pageData.pageSize).toBe(collectionSize);
        expect(pageData.totalPageCount).toBe(1);
        expect(pageData.totalItemCount).toBe(collectionSize);
        expect(pageData.sort).toStrictEqual({id: 1});

        // The pageSize is negative zero
        pageData = await petsdb.readPage({}, {pageIndex: 11, pageSize: 0, sort: {id: 1}});

        expect(pageData.list).toHaveLength(collectionSize);
        expect(pageData.pageIndex).toBe(11);
        expect(pageData.pageSize).toBe(collectionSize);
        expect(pageData.totalPageCount).toBe(1);
        expect(pageData.totalItemCount).toBe(collectionSize);
        expect(pageData.sort).toStrictEqual({id: 1});

        // The pageSize is negative number
        pageData = await petsdb.readPage({}, {pageIndex: 11, pageSize: -22, sort: {id: 1}});

        expect(pageData.list).toHaveLength(collectionSize);
        expect(pageData.pageIndex).toBe(11);
        expect(pageData.pageSize).toBe(collectionSize);
        expect(pageData.totalPageCount).toBe(1);
        expect(pageData.totalItemCount).toBe(collectionSize);
        expect(pageData.sort).toStrictEqual({id: 1});
    });

    it('read-page by non-exists selector - get empty array of items', async () => {
        expect.assertions(1);
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const pageData: PetsdbReadPageResultType<TestDataType> = await petsdb.readPage(
            {id: idToFind},
            {
                pageIndex: 0,
                pageSize: 10,
                sort: {id: 1},
            }
        );

        expect(pageData).toStrictEqual({
            list: [],
            pageIndex: 0,
            pageSize: 10,
            sort: {id: 1},
            totalItemCount: 0,
            totalPageCount: 0,
        });
    });
});
