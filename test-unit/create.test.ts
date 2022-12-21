import assert from 'node:assert/strict';
import {promises as fileSystem} from 'fs';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Create', () => {
    test('Add data to database', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(3);

        await tsdb.create(testData1);
        await tsdb.create(testData2);
        await tsdb.create(testData3);

        assert.equal(tsdb.getSize(), 3);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(fileContent.includes(testData1.id), true);
        assert.equal(fileContent.includes(testData2.id), true);
        assert.equal(fileContent.includes(testData3.id), true);
    });
});
