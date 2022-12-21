import assert from 'node:assert/strict';

import {describe, test} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {TestDataType} from './helper/helper';

describe('Constructor', () => {
    test('Return instance of class', () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: '/no/matter/path'});

        assert.equal(petsdb instanceof Petsdb, true);
    });
});
