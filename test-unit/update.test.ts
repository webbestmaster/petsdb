import assert from 'node:assert/strict';
import {promises as fileSystem} from 'fs';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Update', () => {
    test('Update', async () => {
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

        const updatedItem = await tsdb.readOne({id: idToUpdate});

        assert.equal(updatedItem?.foo, newItem.foo);
        assert.equal(updatedItem?.bar, newItem.bar);
        assert.equal(tsdb.getSize(), databaseSize);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(fileContent.includes('"bar":"bar"'), true);
        assert.equal(fileContent.includes('"foo":"foo"'), true);
    });
});
