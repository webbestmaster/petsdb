/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position, multiline-comment-style, jest/no-commented-out-tests */

import {describe, it, expect} from '@jest/globals';

import {Petsdb} from '../lib/export';

import {makeRandomNumber, makeRandomString} from '../lib/src/util';

import {generateTestDataList, pathToTestDataBase, TestDataType} from './helper/helper';

describe('read', () => {
    it('read by simple selector, get array with single item', async () => {
        expect.assertions(2);
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToFind = {...generateTestDataList(1)[0], id: idToFind};

        testDataList[makeRandomNumber(10, 40)] = itemToFind;

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({id: idToFind});

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(itemToFind.id);
    });

    it('read by value in array / string', async () => {
        expect.assertions(2);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({listOfString: [randomItem.listOfString[0]]});

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(randomItem.id);
    });

    it('read by value in array / number', async () => {
        expect.assertions(2);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({listOfNumber: [randomItem.listOfNumber[0]]});

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(randomItem.id);
    });

    it('read by Regexp', async () => {
        expect.assertions(2);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({foo: new RegExp(randomItem.foo.slice(2, 12), 'u')});

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(randomItem.id);
    });

    it('read by empty object selector', async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({more: {data: {}}});

        expect(findResultList).toHaveLength(50);
    });

    it('read in object by regexp', async () => {
        expect.assertions(3);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({
            more: {data: {text: new RegExp(randomItem.more.data.text.slice(2, 12), 'u')}},
        });

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(randomItem.id);
        expect(findResultList[0]?.more.data.text).toBe(randomItem.more.data.text);
    });

    it('read in array by regexp', async () => {
        expect.assertions(2);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({
            listOfString: new RegExp(randomItem.listOfString[0].slice(2, 12), 'u'),
        });

        expect(findResultList).toHaveLength(1);
        expect(findResultList[0].id).toBe(randomItem.id);
    });

    /*
        test('Read by regexp in array / unsupported type', async () => {
            const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

            await petsdb.run();
            await petsdb.drop();

            const testDataList: Array<TestDataType> = generateTestDataList(50);

            await Promise.all(
                testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
            );

            const findResultList = await petsdb.read({listOfUnknown: new RegExp('some text', '')});

            assert.deepEqual(findResultList, []);
    });
    */

    it('read by non-exists selector - get empty array', async () => {
        expect.assertions(1);
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({id: idToFind});

        expect(findResultList).toStrictEqual([]);
    });

    it('read by non-exists regexp - get empty array', async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResultList = await petsdb.read({listOfString: /some-impossible-id/u});

        expect(findResultList).toStrictEqual([]);
    });
});
