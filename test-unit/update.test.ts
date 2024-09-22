import fileSystem from "node:fs/promises";

import {describe, expect, it} from "@jest/globals";

import {Petsdb} from "../lib/export";
import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("update", () => {
    it("update", async () => {
        expect.assertions(5);

        const databaseSize = 3;

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(databaseSize);

        const idToUpdate = testData2.id;
        const updateItem: TestDataType = {...testData2, bar: "bar", foo: "foo"};

        await petsdb.create(testData1);
        await petsdb.create(testData2);
        await petsdb.create(testData3);

        await petsdb.update({id: idToUpdate}, updateItem);

        const updatedItem = await petsdb.readOne({id: idToUpdate});

        expect(updatedItem?.foo).toStrictEqual(updateItem.foo);
        expect(updatedItem?.bar).toStrictEqual(updateItem.bar);
        expect(petsdb.getSize()).toStrictEqual(databaseSize);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: "utf8"});

        expect(fileContent).toContain('"bar":"bar"');
        expect(fileContent).toContain('"foo":"foo"');
    });
});
