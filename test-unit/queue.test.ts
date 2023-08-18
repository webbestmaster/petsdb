import {describe, it, expect} from "@jest/globals";

import {Queue} from "../lib/src/queue";

import {waitForTime} from "./helper/helper";

const defaultTimeOut = 50;

describe("queue", () => {
    it("constructor", () => {
        expect.assertions(1);
        const queue = new Queue();

        expect(queue instanceof Queue).toBe(true);
    });

    it("add task", async () => {
        expect.assertions(1);
        const queue = new Queue();

        let increaseMe = 0;

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        expect(increaseMe).toBe(1);
    });

    it("check queue order", async () => {
        expect.assertions(2);
        const queue = new Queue();

        let increaseMe = 0;

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        await queue.add(async () => {
            expect(increaseMe).toBe(1);

            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        expect(increaseMe).toBe(2);
    });

    it("add task with known/regular Error", async () => {
        expect.assertions(2);
        const queue = new Queue();

        let increaseMe = 0;

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        await expect(
            queue.add(async () => {
                await waitForTime(defaultTimeOut);

                throw new Error("I am the ERROR!");
            })
        ).rejects.toThrow("I am the ERROR!");

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        expect(increaseMe).toBe(2);
    });

    it("add task with unknown Error", async () => {
        expect.assertions(2);
        const queue = new Queue();

        let increaseMe = 0;

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        await expect(
            queue.add(async () => {
                await waitForTime(defaultTimeOut);

                throw new Error("I am an ERROR!");
            })
        ).rejects.toThrow("I am an ERROR!");

        await queue.add(async () => {
            await waitForTime(defaultTimeOut);
            increaseMe += 1;
        });

        expect(increaseMe).toBe(2);
    });
});
