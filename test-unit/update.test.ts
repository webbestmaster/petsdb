import assert from 'node:assert/strict';
import fileSystem from 'node:fs/promises';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Update', () => {
    test('Update', async () => {
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

        const updatedItem = await petsdb.readOne({id: idToUpdate});

        assert.equal(updatedItem?.foo, newItem.foo);
        assert.equal(updatedItem?.bar, newItem.bar);
        assert.equal(petsdb.getSize(), databaseSize);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(fileContent.includes('"bar":"bar"'), true);
        assert.equal(fileContent.includes('"foo":"foo"'), true);
    });
});
