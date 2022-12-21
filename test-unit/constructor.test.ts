import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';

import {TestDataType} from './helper/helper';

describe('Constructor', () => {
    test('Return instance of class', () => {
        const tsdb: Tsdb<TestDataType> = new Tsdb<TestDataType>({dbPath: '/no/matter/path'});

        assert.equal(tsdb instanceof Tsdb, true);
    });
});
