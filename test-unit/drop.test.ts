import fileSystem from "node:fs/promises";

import {describe, expect, it} from "@jest/globals";

import {Petsdb} from "../lib/export";
import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("drop", () => {
    it("just remove all data", async () => {
        expect.assertions(3);

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(5);

        await petsdb.create(testDataList[0]);
        await petsdb.create(testDataList[1]);
        await petsdb.create(testDataList[2]);

        expect(petsdb.getSize()).toBe(3);

        await petsdb.drop();
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: "utf8"});

        // Check database's content
        expect(petsdb.getSize()).toBe(0);

        // Check file's content
        expect(fileContent).toBe("");
    });
});
