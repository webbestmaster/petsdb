/* global setTimeout */

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import fileSystem from 'node:fs/promises';

import {
    deepCopy,
    getIsIncluded,
    getIsNotEmptyString,
    makeDatabaseBackup,
    makeRandomString,
    readFileLineByLine,
    compareObject,
} from './util';
import {
    PromiseResolveType,
    PetsdbInitialConfigType,
    PetsdbItemType,
    PetsdbQueryType,
    PetsdbReadPageConfigType,
    PetsdbReadPageResultType,
} from './database-type';

export class Petsdb<ItemType extends Record<string, unknown>> {
    static readonly runningPromise: Record<string, Promise<void> | void> = {};
    readonly dbPath: string = '';

    private dataList: Array<PetsdbItemType<ItemType>> = [];

    static readonly deleteIdPostfix = '-$$delete';

    constructor(initialConfig: PetsdbInitialConfigType) {
        const {dbPath} = initialConfig;

        this.dbPath = dbPath;
        return this;
    }

    run(): Promise<void> {
        const currentRunningPromise: Promise<void> | void = Petsdb.runningPromise[this.dbPath];

        if (currentRunningPromise) {
            return currentRunningPromise;
        }

        // this promise should be removed when this.innerRun() finished
        const newRunning = this.innerRun();

        Petsdb.runningPromise[this.dbPath] = newRunning;

        return newRunning;
    }

    private async innerRun(): Promise<void> {
        const fullLineList: Array<string> = await readFileLineByLine(this.dbPath);
        const filteredLineList: Array<string> = fullLineList.filter<string>(getIsNotEmptyString);

        const fullDataList: Array<PetsdbItemType<ItemType>> = filteredLineList.map<PetsdbItemType<ItemType>>(
            (line: string): PetsdbItemType<ItemType> => JSON.parse(line)
        );

        const fullIdList: Array<string> = fullDataList.map<string>(
            (dataItem: PetsdbItemType<ItemType>): string => dataItem._id
        );

        // eslint-disable-next-line unicorn/prefer-set-has
        const toRemoveIdList: Array<string> = fullIdList
            .map<string>((dataItemId: string): string => {
                if (dataItemId.endsWith(Petsdb.deleteIdPostfix)) {
                    return dataItemId.replace(Petsdb.deleteIdPostfix, '');
                }

                return '';
            })
            .filter<string>((itemToRemoveId: string): itemToRemoveId is string => itemToRemoveId !== '');

        const filteredDataList: Array<PetsdbItemType<ItemType>> = fullDataList
            // updated
            .filter<PetsdbItemType<ItemType>>(
                (dataItem: PetsdbItemType<ItemType>, dataItemIndex: number): dataItem is PetsdbItemType<ItemType> => {
                    return dataItemIndex === fullIdList.lastIndexOf(dataItem._id);
                }
            )
            // deleted items
            .filter<PetsdbItemType<ItemType>>(
                (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> => {
                    return !toRemoveIdList.includes(dataItem._id.replace(Petsdb.deleteIdPostfix, ''));
                }
            );

        await makeDatabaseBackup(this.dbPath);

        await fileSystem.writeFile(this.dbPath, '');

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of filteredDataList) {
            await fileSystem.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');

            const dataIndex = filteredDataList.indexOf(dataItem) + 1;

            if (dataIndex % 100 === 0) {
                console.log(`Petsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
            }
        }

        this.dataList = filteredDataList;

        // remove running promise
        // eslint-disable-next-line no-undefined
        Petsdb.runningPromise[this.dbPath] = undefined;

        console.log(`Petsdb has been loaded. DbPath ${this.dbPath}.`);
    }

    async drop(): Promise<void> {
        await fileSystem.writeFile(this.dbPath, '');

        this.dataList = [];
    }

    getSize(): number {
        return this.dataList.length;
    }

    async create(itemData: ItemType): Promise<void> {
        const tsdbItemData: PetsdbItemType<ItemType> = Object.assign<ItemType, {_id: string}>(
            deepCopy<ItemType>(itemData),
            {_id: makeRandomString()}
        );

        await fileSystem.appendFile(this.dbPath, JSON.stringify(tsdbItemData) + '\n');

        this.dataList.push(tsdbItemData);
    }

    async read(itemSelector: PetsdbQueryType<ItemType>): Promise<Array<PetsdbItemType<ItemType>>> {
        return new Promise((resolve: PromiseResolveType<Array<PetsdbItemType<ItemType>>>) => {
            const itemList: Array<PetsdbItemType<ItemType>> = this.dataList.filter(
                (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> =>
                    getIsIncluded(dataItem, itemSelector)
            );

            setTimeout(() => resolve(itemList), 0);
        });
    }

    async readOne(itemSelector: PetsdbQueryType<ItemType>): Promise<PetsdbItemType<ItemType> | null> {
        return new Promise((resolve: PromiseResolveType<PetsdbItemType<ItemType> | null>) => {
            const item: PetsdbItemType<ItemType> | null =
                this.dataList.find((dataItem: PetsdbItemType<ItemType>): boolean =>
                    getIsIncluded(dataItem, itemSelector)
                ) || null;

            setTimeout(() => resolve(item), 0);
        });
    }

    async readPage(
        itemSelector: PetsdbQueryType<ItemType>,
        readPageConfig: PetsdbReadPageConfigType<ItemType>
    ): Promise<PetsdbReadPageResultType<ItemType>> {
        const fullList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);
        const {pageIndex, pageSize, sort} = readPageConfig;

        const fullSortedList: Array<PetsdbItemType<ItemType>> = fullList.sort(
            (itemA: PetsdbItemType<ItemType>, itemB: PetsdbItemType<ItemType>): number =>
                compareObject(itemA, itemB, sort)
        );

        if (pageSize <= 0) {
            const readPageResultZeroPageSize: PetsdbReadPageResultType<ItemType> = {
                list: fullSortedList,
                pageIndex,
                pageSize: fullList.length,
                sort,
                totalItemCount: fullList.length,
                totalPageCount: 1,
            };

            return readPageResultZeroPageSize;
        }

        const neededOfList: Array<PetsdbItemType<ItemType>> = fullSortedList.slice(
            pageIndex * pageSize,
            pageIndex * pageSize + pageSize
        );

        const readPageResult: PetsdbReadPageResultType<ItemType> = {
            list: neededOfList,
            pageIndex,
            pageSize,
            sort,
            totalItemCount: fullList.length,
            totalPageCount: Math.ceil(fullList.length / pageSize),
        };

        return readPageResult;
    }

    async update(itemSelector: PetsdbQueryType<ItemType>, newItemData: ItemType): Promise<void> {
        const itemToUpdateList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToUpdateList) {
            const itemToUpdate: PetsdbItemType<ItemType> = {...newItemData, _id: dataItem._id};
            const updatedItemIndex = this.dataList.indexOf(dataItem);

            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToUpdate) + '\n');

            this.dataList[updatedItemIndex] = itemToUpdate;
        }
    }

    async delete(itemSelector: PetsdbQueryType<ItemType>): Promise<void> {
        const itemToRemoveList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToRemoveList) {
            const itemToDeleteUpdated: PetsdbItemType<ItemType> = {
                ...dataItem,
                _id: dataItem._id + Petsdb.deleteIdPostfix,
            };

            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToDeleteUpdated) + '\n');
        }

        this.dataList = this.dataList.filter<PetsdbItemType<ItemType>>(
            (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> => {
                return !getIsIncluded(dataItem, itemSelector);
            }
        );
    }
}
