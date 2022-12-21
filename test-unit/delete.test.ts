/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import assert from 'node:assert/strict';
import {promises as fileSystem} from 'fs';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('Delete', () => {
    test('Delete by simple selector', async () => {
        const idToDelete = makeRandomString();
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();
        await tsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToDelete = {...generateTestDataList(1)[0], id: idToDelete};

        testDataList[makeRandomNumber(10, 40)] = itemToDelete;

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => tsdb.create(dataItem))
        );

        const fullItemToDelete = await tsdb.readOne({id: idToDelete});

        await tsdb.delete({id: idToDelete});
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: 'utf8'});

        assert.equal(tsdb.getSize(), testDataList.length - 1);
        assert.equal(fileContent.includes(`${fullItemToDelete?._id + Tsdb.deleteIdPostfix}`), true);
    });
});
