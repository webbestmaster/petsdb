/* global setTimeout */

import {makeRandomNumber, makeRandomString} from '../../lib/src/util';

export const pathToTestDataBase = 'test-unit/test-data/test-db';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TestDataType = {
    bar: string;
    foo: string;
    id: string;
    index: number;
    listOfNumber: Array<number>;
    listOfString: Array<string>;
    listOfUnknown: Array<unknown>;

    more: {
        data: {
            bool: boolean;
            text: string;
        };
    };
};

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

export function waitForTime(timeInMs: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
        setTimeout(resolve, timeInMs);
    });
}
