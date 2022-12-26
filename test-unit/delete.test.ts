/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import assert from 'node:assert/strict';
import fileSystem from 'node:fs/promises';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Delete', () => {
    test('Delete by simple selector', async () => {
        const idToDelete = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToDelete = {...generateTestDataList(1)[0], id: idToDelete};

        testDataList[makeRandomNumber(10, 40)] = itemToDelete;

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const fullItemToDelete = await petsdb.readOne({id: idToDelete});

        await petsdb.delete({id: idToDelete});
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(petsdb.getSize(), testDataList.length - 1);
        assert.equal(fileContent.includes(`${fullItemToDelete?._id + Petsdb.deleteIdPostfix}`), true);
    });
});
