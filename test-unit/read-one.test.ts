/* eslint-disable capitalized-comments, jest/no-commented-out-tests */

import {describe, it, expect} from "@jest/globals";

import {Petsdb} from "../lib/export";

import {makeRandomNumber, makeRandomString} from "../lib/src/util";

import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("read one", () => {
    it("read-one by simple selector, get single item", async () => {
        expect.assertions(1);
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToFind = {...generateTestDataList(1)[0], id: idToFind};

        testDataList[makeRandomNumber(10, 40)] = itemToFind;

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({id: idToFind});

        expect(findResult?.id).toBe(itemToFind.id);
    });

    it("read-one by value in array / string", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({listOfString: [randomItem.listOfString[0]]});

        expect(findResult?.id).toBe(randomItem.id);
    });

    it("read-one by value in array / number", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({listOfNumber: [randomItem.listOfNumber[0]]});

        expect(findResult?.id).toBe(randomItem.id);
    });

    it("read-one by Regexp", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({foo: new RegExp(randomItem.foo.slice(2, 12), "u")});

        expect(findResult?.id).toBe(randomItem.id);
    });

    it("read-one by empty object selector", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({more: {data: {}}});

        expect(findResult).not.toBeNull();
    });

    it("read-one in object by regexp", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({
            more: {data: {text: new RegExp(randomItem.more.data.text.slice(2, 12), "u")}},
        });

        expect(findResult?.more.data.text).toBe(randomItem.more.data.text);
    });

    it("read-one in array by regexp", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const randomItem = testDataList[makeRandomNumber(10, 40)];

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({
            listOfString: new RegExp(randomItem.listOfString[0].slice(2, 12), "u"),
        });

        expect(findResult?.id).toBe(randomItem.id);
    });

    /*
    test('Read-one by regexp in array / unsupported type', async () => {
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>((dataItem: TestDataType): Promise<void> => petsdb.create(dataItem))
        );

        const findResult = await petsdb.readOne({listOfUnknown: new RegExp('some text', '')});

        assert.equal(findResult, null);
    });
*/

    it("read-one by non-exists selector - get null", async () => {
        expect.assertions(1);
        const idToFind = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const findResult = await petsdb.readOne({id: idToFind});

        expect(findResult).toBeNull();
    });
});
