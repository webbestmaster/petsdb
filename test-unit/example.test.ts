/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import {describe, test} from '@jest/globals';

import {Tsdb} from '../lib/export';
import type {
    TsdbInitialConfigType,
    TsdbItemType,
    TsdbQueryType,
    TsdbReadPageConfigType,
    TsdbReadPageResultType,
    TsdbSortDirectionType,
    TsdbSortType,
    TsdbSortValueType,
} from '../lib/export';

import {pathToTestDataBase} from './helper/helper';

describe('Example', () => {
    test('Example for readme.md', async () => {
        // ### Creating/loading a database
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

        const tsdb: Tsdb<ExampleDataType> = new Tsdb<ExampleDataType>({dbPath: pathToTestDataBase});

        await tsdb.run();

        // ### Creating documents
        const someDocument: ExampleDataType = {
            listOfNumber: [1, 2, 3],
            listOfString: ['one', 'two', 'three'],
            someData: {
                data: {
                    isExists: false,
                    text: 'lorem ipsum',
                },
            },
            someNumber: 1,
            someString: 'the string',
        };

        // create document into dataBase, use async/await OR Promises
        await tsdb.create(someDocument);

        // ### Reading documents: read\readOne

        // search by key\value
        await tsdb.read({someString: 'the string'});

        // search by nested object
        await tsdb.read({someData: {data: {isExists: false}}});

        // search by value of array
        await tsdb.read({listOfString: ['one']});

        // search by RegExp instead of string
        await tsdb.read({someString: /the/});

        // search by RegExp instead of array of string
        await tsdb.read({listOfString: /thr/});

        // #### Reading documents: readPage
        // get page by index 0, set page's size as 10 and sort by `someNumber`
        await tsdb.readPage({someString: /the/}, {pageIndex: 0, pageSize: 10, sort: {someNumber: 1}});

        // the same, but use for sort nested object
        await tsdb.readPage({someString: /the/}, {pageIndex: 0, pageSize: 10, sort: {someData: {data: {text: -1}}}});

        // #### Updating documents
        const newDocument: ExampleDataType = {
            listOfNumber: [100, 200, 300],
            listOfString: ['not one', 'not two', 'not three'],
            someData: {
                data: {
                    isExists: true,
                    text: 'dolor',
                },
            },
            someNumber: 1,
            someString: 'new string',
        };

        await tsdb.update({someNumber: 1}, newDocument);

        // #### Deleting documents
        await tsdb.delete({someNumber: 1});

        // ##### Basic querying
        const myQuery: TsdbQueryType<ExampleDataType> = {
            someData: {data: {isExists: true}},
            someString: /one/,
        };

        // ##### Basic sort
        const mySortByNumber: TsdbSortType<ExampleDataType> = {
            someString: 1,
        };

        const mySortByNestedObject: TsdbSortType<ExampleDataType> = {
            someData: {data: {text: -1}},
        };
    });
});
