import fileSystem from "node:fs/promises";

import {describe, expect, it} from "@jest/globals";

import {Petsdb} from "../lib/export";
import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("create", () => {
    it("add data to database", async () => {
        expect.assertions(4);

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const [testData1, testData2, testData3]: Array<TestDataType> = generateTestDataList(3);

        await petsdb.create(testData1);
        await petsdb.create(testData2);
        await petsdb.create(testData3);

        expect(petsdb.getSize()).toBe(3);

        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: "utf8"});

        expect(fileContent).toContain(testData1.id);
        expect(fileContent).toContain(testData2.id);
        expect(fileContent).toContain(testData3.id);
    });
});
