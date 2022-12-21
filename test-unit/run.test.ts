import assert from 'node:assert/strict';
import {promises as fileSystem} from 'fs';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Running', () => {
    test('If file exists -> return resolved promise', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        const runResult: void = await tsdb.run();

        // eslint-disable-next-line no-undefined
        assert.equal(runResult, undefined);
    });

    test('If file does not exists -> return rejected promise', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: 'file/do/not/exists'});

        await assert.rejects(tsdb.run());
    });

    test('Remove deleted items from file', async () => {
        const idToDelete = makeRandomString();
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(200);

        testDataList[makeRandomNumber(10, 40)] = {...generateTestDataList(1)[0], id: idToDelete};

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        await tsdb.delete({id: idToDelete});

        // another run
        const tsdbAfterDeleting: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbAfterDeleting.run();

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(tsdb.getSize(), testDataList.length - 1);
        assert.equal(fileContent.includes(idToDelete), false);
    });

    test('Remove updated items from file', async () => {
        const databaseSize = 3;

        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(databaseSize);

        const idToUpdate = testData2.id;
        const newItem: TestDataType = {...testData2, bar: 'bar', foo: 'foo'};

        await tsdb.create(testData1);
        await tsdb.create(testData2);
        await tsdb.create(testData3);

        await tsdb.update({id: idToUpdate}, newItem);

        const tsdbUpdated: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbUpdated.run();

        const updatedItem = await tsdbUpdated.readOne({id: idToUpdate});

        assert.equal(updatedItem?.bar, newItem.bar);
        assert.equal(updatedItem?.foo, newItem.foo);
        assert.equal(tsdb.getSize(), databaseSize);
    });
});
