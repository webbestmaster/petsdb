import assert from 'node:assert/strict';
import fileSystem from 'node:fs/promises';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Drop', () => {
    test('Just remove all data', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(5);

        await petsdb.create(testDataList[0]);
        await petsdb.create(testDataList[1]);
        await petsdb.create(testDataList[2]);

        assert.equal(petsdb.getSize(), 3);

        await petsdb.drop();
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        // check database's content
        assert.equal(petsdb.getSize(), 0);

        // check file's content
        assert.equal(fileContent, '');
    });
});
