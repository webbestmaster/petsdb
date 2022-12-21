import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Read', () => {
    test('Read by simple selector, get array with single item', async () => {
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

        const findResultList = await petsdb.read({id: idToFind});

        assert.equal(findResultList.length, 1);
        assert.deepEqual(findResultList[0].id, itemToFind.id);
    });

    test('Read by value in array / string', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({listOfString: [randomItem.listOfString[0]]});

        assert.equal(findResultList.length, 1);
        assert.equal(findResultList[0].id, randomItem.id);
    });

    test('Read by value in array / number', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({listOfNumber: [randomItem.listOfNumber[0]]});

        assert.equal(findResultList.length, 1);
        assert.equal(findResultList[0].id, randomItem.id);
    });

    test('Read by Regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({foo: new RegExp(randomItem.foo.slice(2, 12), '')});

        assert.equal(findResultList.length, 1);
        assert.equal(findResultList[0].id, randomItem.id);
    });

    test('Read by empty object selector', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({more: {data: {}}});

        assert.equal(findResultList.length, 50);
    });

    test('Read in object by regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({
            more: {data: {text: new RegExp(randomItem.more.data.text.slice(2, 12), '')}},
        });

        assert.equal(findResultList.length, 1);
        assert.equal(findResultList[0].id, randomItem.id);
        assert.equal(findResultList[0]?.more.data.text, randomItem.more.data.text);
    });

    test('Read in array by regexp', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({
            listOfString: new RegExp(randomItem.listOfString[0].slice(2, 12), ''),
        });

        assert.equal(findResultList.length, 1);
        assert.equal(findResultList[0].id, randomItem.id);
    });

    /*
        test('Read by regexp in array / unsupported type', async () => {
            const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

            await tsdb.run();
            await tsdb.drop();

            const testDataList: Array<TestDataType> = generateTestDataList(50);

            await Promise.all(
                testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
            );

            const findResultList = await tsdb.read({listOfUnknown: new RegExp('some text', '')});

            assert.deepEqual(findResultList, []);
    });
    */

    test('Read by non-exists selector - get empty array', async () => {
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({id: idToFind});

        assert.deepEqual(findResultList, []);
    });

    test('Read by non-exists regexp - get empty array', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResultList = await petsdb.read({listOfString: /some-impossible-id/});

        assert.deepEqual(findResultList, []);
    });
});
