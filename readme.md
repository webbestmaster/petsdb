# PeTSDB - Pet's TypeScript DataBase

[![GitHub license](https://img.shields.io/npm/l/petsdb)](https://github.com/webbestmaster/petsdb/blob/master/license)
[![codecov](https://codecov.io/gh/webbestmaster/petsdb/branch/master/graph/badge.svg)](https://codecov.io/gh/webbestmaster/petsdb)
[![npm version](https://img.shields.io/npm/v/petsdb.svg)](https://www.npmjs.com/package/petsdb)
[![Known Vulnerabilities](https://snyk.io/test/github/webbestmaster/petsdb/badge.svg)](https://snyk.io/test/github/webbestmaster/petsdb)
[![Dependency count](https://badgen.net/bundlephobia/dependency-count/petsdb)](https://libraries.io/npm/petsdb)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/petsdb)](https://bundlephobia.com/package/petsdb)
[![nodejs version](https://img.shields.io/node/v/petsdb)](https://nodejs.org/en/docs)
[![Github CI](https://github.com/webbestmaster/petsdb/actions/workflows/github-ci.yml/badge.svg)](https://github.com/webbestmaster/petsdb/actions/workflows/github-ci.yml)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/webbestmaster/petsdb/github-ci.yml)](https://github.com/webbestmaster/petsdb/actions/workflows/github-ci.yml)
[![Type definitions](https://img.shields.io/npm/types/petsdb)](https://www.typescriptlang.org)
[![Website](https://img.shields.io/website?url=https://github.com/webbestmaster/petsdb)](https://github.com/webbestmaster/petsdb)
[![CodeFactor](https://www.codefactor.io/repository/github/webbestmaster/petsdb/badge)](https://www.codefactor.io/repository/github/webbestmaster/petsdb)
[![Package Quality](https://packagequality.com/shield/petsdb.svg)](https://packagequality.com/#?package=petsdb)
[![GitHub stars](https://img.shields.io/github/stars/webbestmaster/petsdb?style=social)](https://github.com/webbestmaster/petsdb)

<!--
[![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/webbestmaster/petsdb)](https://libraries.io/npm/petsdb)
-->

Small database for _prototyping_ and _pet_ projects. Not for production.

**Embedded persistent database for Node.js, 100% TypeScript/JavaScript, no binary dependency.**

## Installation
Module name on npm is `petsdb`.

```shell
$ npm install petsdb --save     # Put latest version in your package.json
$ npm run test:unit             # You'll need the dev dependencies to run tests
```

### Creating/loading a database
You can use `Petsdb` as a persistent datastore. One datastore is the equivalent of a collection\array. The constructor is used as follows `new Petsdb(config)` where `config` is an object with the following fields (actually one field only):

* `dbPath` (required): path to the file where the data is persisted.

```typescript
import {Petsdb} from 'petsdb';

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

// create dataBase
const petsdb: Petsdb<ExampleDataType> = new Petsdb<ExampleDataType>({dbPath: 'path/to/your/file'});

// run dataBase, use async/await OR Promises
await petsdb.run();
```

### Creating documents
Petsdb uses `JSON.stringify` to place document. Also, Petsdb will automatically generate `_id` (a 16-characters alphanumerical string). The `_id` of a document, once set, cannot be modified.

```typescript
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
await petsdb.create(someDocument);
```

### Reading documents
Use `read` to look for multiple documents matching you query.
Or use `readOne` to look for one specific document.
Or use `readPage` to look for multiple documents matching you query by pagination.

You can use regular expressions in basic querying in place of a string and an array of string.

You can sort paginated result (`readPage` only) using `sort`. You can use nested properties to navigate inside nested documents (see below).

#### Reading documents: read\readOne
Method `.read()` read database by query. It returns promise with array of items. Method `.readOne()` works the same as `.read()`, but returns promise with _one_ item or `null`.

```typescript
// search by key\value
await petsdb.read({someString: 'the string'});

// search by nested object
await petsdb.read({someData: {data: {isExists: false}}});

// search by value(s) of array
await petsdb.read({listOfString: ['one']});

// search by RegExp instead of string
await petsdb.read({someString: /the/});

// search by RegExp instead of array of string
await petsdb.read({listOfString: /thr/});
```

#### Reading documents: readPage
Method `.readPage()` read database by query and sort. It returns promise with page of items.
```typescript
// get page by index 0, set page's size as 10 and sort by `someNumber`
await petsdb.readPage({someString: /the/}, {pageIndex: 0, pageSize: 10, sort: {someNumber: 1}});

// the same, but use for sort nested object
await petsdb.readPage({someString: /the/}, {pageIndex: 0, pageSize: 10, sort: {someData: {data: {text: -1}}}});
```

#### Updating documents
Method `.update()` updates documents by query. All data of document needed. No partial update.

```typescript
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

// fully update document, all data needed
await petsdb.update({someNumber: 1}, newDocument);
```

#### Deleting documents
Method `.delete()` delete documents by query.
```typescript
await petsdb.delete({someNumber: 1});
```

#### Basic querying
Basic querying means are looking for documents whose fields match the ones you specify. You can use regular expression to match strings. To check your query use `PetsdbQueryType`.

```typescript
import type {PetsdbQueryType} from 'petsdb';

const myQuery: PetsdbQueryType<ExampleDataType> = {
    someData: {data: {isExists: true}},
    someString: /one/,
};
```

#### Basic sorting
Basic sorting means are sorting for documents whose fields match the ones you specify. You can use `1` or `-1` to sort. You can use only one field to sort. To check your sort use `PetsdbSortType`.

```typescript
import type {PetsdbSortType} from 'petsdb';

const mySortByNumber: PetsdbSortType<ExampleDataType> = {
    someString: 1,
};

const mySortByNestedObject: PetsdbSortType<ExampleDataType> = {
    someData: {data: {text: -1}},
};
```

##### Full export: class and types
```typescript
import {Petsdb} from 'petsdb';
import type {
    PetsdbInitialConfigType,
    PetsdbItemType,
    PetsdbQueryType,
    PetsdbReadPageConfigType,
    PetsdbReadPageResultType,
    PetsdbSortDirectionType,
    PetsdbSortType,
    PetsdbSortValueType,
} from 'petsdb';
```

## License

See [license](license).
