import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Read One', () => {
    test('Read-one by simple selector, get single item', async () => {
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToFind = {...generateTestDataList(1)[0], id: idToFind};

        testDataList[makeRandomNumber(10, 40)] = itemToFind;

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({id: idToFind});

        assert.deepEqual(findResult?.id, itemToFind.id);
    });

    test('Read-one by value in array / string', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({listOfString: [randomItem.listOfString[0]]});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by value in array / number', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({listOfNumber: [randomItem.listOfNumber[0]]});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by Regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({foo: new RegExp(randomItem.foo.slice(2, 12), '')});

        assert.deepEqual(findResult?.id, randomItem.id);
    });

    test('Read-one by empty object selector', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({more: {data: {}}});

        assert.notEqual(findResult, null);
    });

    test('Read-one in object by regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({
            more: {data: {text: new RegExp(randomItem.more.data.text.slice(2, 12), '')}},
        });

        assert.equal(findResult?.more.data.text, randomItem.more.data.text);
    });

    test('Read-one in array by regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({
            listOfString: new RegExp(randomItem.listOfString[0].slice(2, 12), ''),
        });

        assert.equal(findResult?.id, randomItem.id);
    });

    /*
    test('Read-one by regexp in array / unsupported type', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({listOfUnknown: new RegExp('some text', '')});

        assert.equal(findResult, null);
    });
*/

    test('Read-one by non-exists selector - get null', async () => {
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({id: idToFind});

        assert.deepEqual(findResult, null);
    });
});
