import assert from 'node:assert/strict';
import fileSystem from 'node:fs/promises';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Create', () => {
    test('Add data to database', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(3);

        await petsdb.create(testData1);
        await petsdb.create(testData2);
        await petsdb.create(testData3);

        assert.equal(petsdb.getSize(), 3);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(fileContent.includes(testData1.id), true);
        assert.equal(fileContent.includes(testData2.id), true);
        assert.equal(fileContent.includes(testData3.id), true);
    });
});
