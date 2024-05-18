/* global setTimeout */

import {makeRandomNumber, makeRandomString} from "../../lib/src/util";

export const pathToTestDataBase = "test-unit/test-data/test-db";

export type TestDataType = Readonly<{
    readonly bar: string;
    readonly foo: string;
    readonly id: string;
    readonly index: number;
    readonly listOfNumber: ReadonlyArray<number>;
    readonly listOfString: ReadonlyArray<string>;
    readonly listOfUnknown: ReadonlyArray<unknown>;

    readonly more: {
        readonly data: {
            readonly bool: boolean;
            readonly text: string;
        };
    };
}>;

export function generateTestDataList(count: number): Array<TestDataType> {
    return Array.from<TestDataType>({length: count}).map<TestDataType>(
        (value: unknown, index: number): TestDataType => {
            return {
                bar: makeRandomString(),
                foo: makeRandomString(),
                id: makeRandomString(),
                index,
                listOfNumber: Array.from<number>({length: makeRandomNumber(1, 5)}).map<number>((): number => {
                    return makeRandomNumber(1, 1_000_000);
                }),
                listOfString: Array.from<string>({length: makeRandomNumber(1, 5)}).map<string>(makeRandomString),
                listOfUnknown: Array.from<unknown>({length: makeRandomNumber(1, 5)}).map<unknown>((): unknown => {
                    const [randomValue] = [
                        null,
                        // eslint-disable-next-line no-undefined
                        undefined,
                        Number.NaN,
                        makeRandomNumber(1, 10),
                        makeRandomString(),
                    ].sort((): number => {
                        return Math.random() - 0.5;
                    });

                    return randomValue;
                }),
                more: {
                    data: {
                        bool: Math.random() > 0.5,
                        text: makeRandomString(),
                    },
                },
            };
        }
    );
}

export async function waitForTime(timeInMs: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        setTimeout(resolve, timeInMs);
    });
}
