/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import fileSystem from "node:fs/promises";

import {describe, it, expect} from "@jest/globals";

import {Petsdb} from "../lib/export";

import {makeRandomNumber, makeRandomString} from "../lib/src/util";

import {generateTestDataList, pathToTestDataBase, type TestDataType} from "./helper/helper";

describe("delete", () => {
    it("delete by simple selector", async () => {
        expect.assertions(2);
        const idToDelete = makeRandomString();
        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();
        await petsdb.drop();

        const testDataList: Array<TestDataType> = generateTestDataList(50);

        const itemToDelete = {...generateTestDataList(1)[0], id: idToDelete};

        testDataList[makeRandomNumber(10, 40)] = itemToDelete;

        await Promise.all(
            testDataList.map<Promise<void>>(async (dataItem: TestDataType): Promise<void> => {
                return petsdb.create(dataItem);
            })
        );

        const fullItemToDelete = await petsdb.readOne({id: idToDelete});

        await petsdb.delete({id: idToDelete});
        const fileContent: string = await fileSystem.readFile(pathToTestDataBase, {encoding: "utf8"});

        expect(petsdb.getSize()).toBe(testDataList.length - 1);
        expect(fileContent).toContain(fullItemToDelete?._id + Petsdb.deleteIdPostfix);
    });
});
