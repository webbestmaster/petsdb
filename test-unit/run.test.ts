import assert from 'node:assert/strict';
import fileSystem from 'node:fs/promises';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {
    generateTestDataList,
    pathToTestDataBase,
    pathToTestDataBase2,
    pathToTestDataBase3,
    TestDataType,
} from './helper/helper';

describe('Running', () => {
    test('If file exists -> return resolved promise', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        const runResult: void = await petsdb.run();

        // eslint-disable-next-line no-undefined
        assert.equal(runResult, undefined);
    });

    test('If file does not exists -> return rejected promise', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: 'file/do/not/exists'});

        await assert.rejects(petsdb.run());
    });

    test('Remove deleted items from file', async () => {
        const idToDelete = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(200);

        testDataList[makeRandomNumber(10, 40)] = {...generateTestDataList(1)[0], id: idToDelete};

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        await petsdb.delete({id: idToDelete});

        // another run
        const tsdbAfterDeleting: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbAfterDeleting.run();

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(petsdb.getSize(), testDataList.length - 1);
        assert.equal(fileContent.includes(idToDelete), false);
    });

    test('Remove updated items from file', async () => {
        const databaseSize = 3;

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(databaseSize);

        const idToUpdate = testData2.id;
        const newItem: TestDataType = {...testData2, bar: 'bar', foo: 'foo'};

        await petsdb.create(testData1);
        await petsdb.create(testData2);
        await petsdb.create(testData3);

        await petsdb.update({id: idToUpdate}, newItem);

        const tsdbUpdated: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbUpdated.run();

        const updatedItem = await tsdbUpdated.readOne({id: idToUpdate});

        assert.equal(updatedItem?.bar, newItem.bar);
        assert.equal(updatedItem?.foo, newItem.foo);
        assert.equal(petsdb.getSize(), databaseSize);
    });

    test('Run several the same data bases simultaneously -> get the same promise', async () => {
        const petsdb1: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb2: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb3: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb4: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb5: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb1.run();
        await petsdb1.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(200);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb1.create(dataItem))
        );

        const runPromise1 = petsdb1.run();
        const runPromise2 = petsdb2.run();
        const runPromise3 = petsdb3.run();
        const runPromise4 = petsdb4.run();
        const runPromise5 = petsdb5.run();

        assert.equal(runPromise1 instanceof Promise, true);
        assert.equal(runPromise1, runPromise2);
        assert.equal(runPromise1, runPromise3);
        assert.equal(runPromise1, runPromise4);
        assert.equal(runPromise1, runPromise5);
    });

    test('Run several different data base simultaneously -> get the same promise', async () => {
        const petsdb1: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb2: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase2});
        const petsdb3: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase3});

        await petsdb1.run();
        await petsdb1.drop();
        await petsdb2.run();
        await petsdb2.drop();
        await petsdb3.run();
        await petsdb3.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(20);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb1.create(dataItem))
        );
        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb2.create(dataItem))
        );
        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb3.create(dataItem))
        );

        const runPromise1 = petsdb1.run();
        const runPromise2 = petsdb2.run();
        const runPromise3 = petsdb3.run();

        assert.notEqual(runPromise1, runPromise2);
        assert.notEqual(runPromise2, runPromise3);
        assert.notEqual(runPromise3, runPromise1);
    });

    // eslint-disable-next-line max-statements
    test('Each awaited .run() should return different promise', async () => {
        const petsdb1: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        // Attempt - 1
        const runPromise1 = petsdb1.run();
        const runPromiseBeforeCache1: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        assert.equal(runPromiseBeforeCache1 instanceof Promise, true);
        await runPromise1;
        const runPromiseAfterCache1: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        // eslint-disable-next-line no-undefined
        assert.equal(runPromiseAfterCache1, undefined);

        // Attempt - 2
        const runPromise2 = petsdb1.run();
        const runPromiseBeforeCache2: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        assert.equal(runPromiseBeforeCache2 instanceof Promise, true);
        await runPromise2;
        const runPromiseAfterCache2: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        // eslint-disable-next-line no-undefined
        assert.equal(runPromiseAfterCache2, undefined);

        // Attempt - 3
        const runPromise3 = petsdb1.run();
        const runPromiseBeforeCache3: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        assert.equal(runPromiseBeforeCache3 instanceof Promise, true);
        await runPromise3;
        const runPromiseAfterCache3: Promise<void> | void = Petsdb.runningPromise[pathToTestDataBase];

        // eslint-disable-next-line no-undefined
        assert.equal(runPromiseAfterCache3, undefined);

        assert.notEqual(runPromise1, runPromise2);
        assert.notEqual(runPromise2, runPromise3);
        assert.notEqual(runPromise3, runPromise1);
    });
});
