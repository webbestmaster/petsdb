/* eslint-disable @typescript-eslint/no-unused-vars */
import {describe, expect,it} from "@jest/globals";

import {
    Petsdb,
    type PetsdbInitialConfigType,
    type PetsdbItemType,
    type PetsdbQueryType,
    type PetsdbReadPageConfigType,
    type PetsdbReadPageResultType,
    type PetsdbSortDirectionType,
    type PetsdbSortType,
    type PetsdbSortValueType,
} from "../lib/export";
import {pathToTestDataBase} from "./helper/helper";

// eslint-disable-next-line  @typescript-eslint/consistent-type-definitions
type ExampleDataType = {
    listOfNumber: Array<number>;
    listOfString: Array<string>;
    someData: {
        data: {
            isExists: boolean;
            text: string;
        };
    };
    someNumber: number;
    someString: string;
};
describe("example", () => {
    it("example for readme.md", async () => {
        expect.assertions(0);

        // ### Creating/loading a database
        const petsdb: Petsdb<ExampleDataType> = new Petsdb<ExampleDataType>({dbPath: pathToTestDataBase});

        await petsdb.run();

        // ### Creating documents
        const someDocument: ExampleDataType = {
            listOfNumber: [1, 2, 3],
            listOfString: ["one", "two", "three"],
            someData: {
                data: {
                    isExists: false,
                    text: "lorem ipsum",
                },
            },
            someNumber: 1,
            someString: "the string",
        };

        // Create document into dataBase, use async/await OR Promises
        await petsdb.create(someDocument);

        // ### Reading documents: read\readOne

        // Search by key\value
        await petsdb.read({someString: "the string"});

        // Search by nested object
        await petsdb.read({someData: {data: {isExists: false}}});

        // Search by value of array
        await petsdb.read({listOfString: ["one"]});

        // Search by RegExp instead of string
        await petsdb.read({someString: /the/u});

        // Search by RegExp instead of array of string
        await petsdb.read({listOfString: /thr/u});

        // #### Reading documents: readPage

        // Get page by index 0, set page's size as 10 and sort by `someNumber`
        await petsdb.readPage({someString: /the/u}, {pageIndex: 0, pageSize: 10, sort: {someNumber: 1}});

        // The same, but use for sort nested object
        await petsdb.readPage({someString: /the/u}, {pageIndex: 0, pageSize: 10, sort: {someData: {data: {text: -1}}}});

        // #### Updating documents
        const createdDocument: ExampleDataType = {
            listOfNumber: [100, 200, 300],
            listOfString: ["not one", "not two", "not three"],
            someData: {
                data: {
                    isExists: true,
                    text: "dolor",
                },
            },
            someNumber: 1,
            someString: "new string",
        };

        await petsdb.update({someNumber: 1}, createdDocument);

        // #### Deleting documents
        await petsdb.delete({someNumber: 1});

        // #### Basic querying
        const myQuery: PetsdbQueryType<ExampleDataType> = {
            someData: {data: {isExists: true}},
            someString: /one/u,
        };

        // #### Basic sorting
        const mySortByNumber: PetsdbSortType<ExampleDataType> = {
            someString: 1,
        };

        const mySortByNestedObject: PetsdbSortType<ExampleDataType> = {
            someData: {data: {text: -1}},
        };
    });
});
