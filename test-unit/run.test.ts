/* eslint-disable jest/max-expects, jest/prefer-expect-resolves */
import fileSystem from "node:fs/promises";

import {describe, it, expect} from "@jest/globals";

import {Petsdb} from "../lib/export";

import {makeRandomNumber, makeRandomString} from "../lib/src/util";

import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("running", () => {
    it("if file exists -> return resolved promise", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        const runResult: undefined = await petsdb.run();

        // eslint-disable-next-line no-undefined
        expect(runResult).toBeUndefined();
    });

    it("if file does not exists -> return rejected promise", async () => {
        expect.assertions(1);
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: "file/do/not/exists"});

        await expect(async () => {
            return petsdb.run();
        }).rejects.toThrow(Error);
    });

    it("remove deleted items from file", async () => {
        expect.assertions(2);
        const idToDelete = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(200);

        testDataList[makeRandomNumber(10, 40)] = {...generateTestDataList(1)[0], id: idToDelete};

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<undefined> => {
                return petsdb.create(dataItem);
            })
        );

        await petsdb.delete({id: idToDelete});

        // Another run
        const tsdbAfterDeleting: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbAfterDeleting.run();

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: "utf8"});

        expect(petsdb.getSize()).toBe(testDataList.length - 1);
        expect(fileContent).not.toContain(idToDelete);
    });

    it("remove updated items from file", async () => {
        expect.assertions(3);
        const databaseSize = 3;

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(databaseSize);

        const idToUpdate = testData2.id;
        const createdItem: TestDataType = {...testData2, bar: "bar", foo: "foo"};

        await petsdb.create(testData1);
        await petsdb.create(testData2);
        await petsdb.create(testData3);

        await petsdb.update({id: idToUpdate}, createdItem);

        const tsdbUpdated: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await tsdbUpdated.run();

        const updatedItem = await tsdbUpdated.readOne({id: idToUpdate});

        expect(updatedItem?.bar).toStrictEqual(createdItem.bar);
        expect(updatedItem?.foo).toStrictEqual(createdItem.foo);
        expect(petsdb.getSize()).toStrictEqual(databaseSize);
    });

    // eslint-disable-next-line max-statements
    it("run several the same data bases simultaneously -> all data base should have the same data", async () => {
        expect.assertions(9);
        const petsdb1: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb2: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb3: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb4: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const petsdb5: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});
        const itemCount = 5;

        await petsdb1.run();
        await petsdb1.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(itemCount);

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb1.create(dataItem);
            })
        );

        const runPromise1 = petsdb1.run();
        const runPromise2 = petsdb2.run();
        const runPromise3 = petsdb3.run();
        const runPromise4 = petsdb4.run();
        const runPromise5 = petsdb5.run();

        await runPromise1;
        await runPromise2;
        await runPromise3;
        await runPromise4;
        await runPromise5;

        expect(petsdb1.getSize()).toBe(itemCount);
        expect(petsdb2.getSize()).toBe(itemCount);
        expect(petsdb3.getSize()).toBe(itemCount);
        expect(petsdb4.getSize()).toBe(itemCount);
        expect(petsdb5.getSize()).toBe(itemCount);

        expect(await petsdb1.read({})).toStrictEqual(await petsdb2.read({}));
        expect(await petsdb2.read({})).toStrictEqual(await petsdb3.read({}));
        expect(await petsdb3.read({})).toStrictEqual(await petsdb4.read({}));
        expect(await petsdb4.read({})).toStrictEqual(await petsdb5.read({}));
    });
});
