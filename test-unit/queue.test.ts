import assert from 'node:assert/strict';

import {describe, it, expect} from '@jest/globals';

import {Queue} from '../lib/src/queue';

import {waitForTime} from './helper/helper';

const defaultTimeOut = 50;

describe('queue', () => {
    it('constructor', () => {
        expect.assertions(1);
        const queue = new Queue();

        expect(queue instanceof Queue).toBe(true);
    });

    it('add task', async () => {
        const queue = new Queue();

        let increaseMe = 0;

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        assert.equal(increaseMe, 1);
    });

    it('check queue order', async () => {
        const queue = new Queue();

        let increaseMe = 0;

        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        await queue.add(async () => {
            assert.equal(increaseMe, 1);

            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        assert.equal(increaseMe, 2);
    });

    it('add task with known/regular Error', async () => {
        const queue = new Queue();

        let increaseMe = 0;
        let isErrorCaught = false;

        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        try {
            await queue.add(async () => {
                await waitForTime(defaultTimeOut);
                throw new Error('I am the ERROR!');
            });
        } catch (error: unknown) {
            assert.equal(error instanceof Error ? error?.message : '', 'I am the ERROR!');
            isErrorCaught = true;
        }

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        assert.equal(increaseMe, 2);
        assert.equal(isErrorCaught, true);
    });

    it('add task with unknown Error', async () => {
        const queue = new Queue();

        let increaseMe = 0;
        let isErrorCaught = false;

        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        try {
            await queue.add(async () => {
                await waitForTime(defaultTimeOut);
                // eslint-disable-next-line no-throw-literal
                throw 'I am an ERROR!';
            });
        } catch (error: unknown) {
            assert.equal(error instanceof Error && error?.message.toString().startsWith('[Queue]:'), true);
            isErrorCaught = true;
        }

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        assert.equal(increaseMe, 2);
        assert.equal(isErrorCaught, true);
    });
});
