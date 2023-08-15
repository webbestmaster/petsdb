import {describe, it, expect} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {TestDataType} from './helper/helper';

describe('constructor', () => {
    it('return instance of class', () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: '/no/matter/path'});

        expect(petsdb instanceof Petsdb).toBe(true);
    });
});
