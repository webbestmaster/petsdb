import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Read One', () => {
    test('Read-one by simple selector, get single item', async () => {
        const idToFind = makeRandomString();
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToFind = {...generateTestDataList(1)[0], id: idToFind};

        testDataList[makeRandomNumber(10, 40)] = itemToFind;

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({id: idToFind});

        assert.deepEqual(findResult?.id, itemToFind.id);
    });

    test('Read-one by value in array / string', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({listOfString: [randomItem.listOfString[0]]});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by value in array / number', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({listOfNumber: [randomItem.listOfNumber[0]]});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by Regexp', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({foo: new RegExp(randomItem.foo.slice(2, 12), '')});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by empty object selector', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({more: {data: {}}});

        assert.notEqual(findResult, null);
    });

    test('Read-one in object by regexp', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({
            more: {data: {text: new RegExp(randomItem.more.data.text.slice(2, 12), '')}},
        });

        assert.equal(findResult?.more.data.text, randomItem.more.data.text);
    });

    test('Read-one in array by regexp', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({listOfString: new RegExp(randomItem.listOfString[0].slice(2, 12), '')});

        assert.equal(findResult?.id, randomItem.id);
    });

    /*
    test('Read-one by regexp in array / unsupported type', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({listOfUnknown: new RegExp('some text', '')});

        assert.equal(findResult, null);
    });
*/

    test('Read-one by non-exists selector - get null', async () => {
        const idToFind = makeRandomString();
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const findResult = await tsdb.readOne({id: idToFind});

        assert.deepEqual(findResult, null);
    });
});
