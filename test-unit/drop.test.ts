import assert from 'node:assert/strict';
import {promises as fileSystem} from 'fs';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Drop', () => {
    test('Just remove all data', async () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(5);

        await tsdb.create(testDataList[0]);
        await tsdb.create(testDataList[1]);
        await tsdb.create(testDataList[2]);

        assert.equal(tsdb.getSize(), 3);

        await tsdb.drop();
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        // check database's content
        assert.equal(tsdb.getSize(), 0);

        // check file's content
        assert.equal(fileContent, '');
    });
});
