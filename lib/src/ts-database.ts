/* global setTimeout */

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import {promises as fileSystem} from 'fs';

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
    TsdbInitialConfigType,
    TsdbItemType,
    TsdbQueryType,
    TsdbReadPageConfigType,
    TsdbReadPageResultType,
} from './ts-database-type';

export class Tsdb<ItemType extends Record<string, unknown>> {
    private dbPath = '';

    private dataList: Array<TsdbItemType<ItemType>> = [];

    static deleteIdPostfix = '-$$delete';

    constructor(initialConfig: TsdbInitialConfigType) {
        const {dbPath} = initialConfig;

        this.dbPath = dbPath;
        return this;
    }

    async run(): Promise<void> {
        const fullLineList: Array<string> = await readFileLineByLine(this.dbPath);
        const filteredLineList: Array<string> = fullLineList.filter<string>(getIsNotEmptyString);

        const fullDataList: Array<TsdbItemType<ItemType>> = filteredLineList.map<TsdbItemType<ItemType>>(
            (line: string): TsdbItemType<ItemType> => JSON.parse(line)
        );

        const fullIdList: Array<string> = fullDataList.map<string>(
            (dataItem: TsdbItemType<ItemType>): string => dataItem._id
        );

        // eslint-disable-next-line unicorn/prefer-set-has
        const toRemoveIdList: Array<string> = fullIdList
            .map<string>((dataItemId: string): string => {
                if (dataItemId.endsWith(Tsdb.deleteIdPostfix)) {
                    return dataItemId.replace(Tsdb.deleteIdPostfix, '');
                }

                return '';
            })
            .filter<string>((itemToRemoveId: string): itemToRemoveId is string => itemToRemoveId !== '');

        const filteredDataList: Array<TsdbItemType<ItemType>> = fullDataList
            // updated
            .filter<TsdbItemType<ItemType>>(
                (dataItem: TsdbItemType<ItemType>, dataItemIndex: number): dataItem is TsdbItemType<ItemType> => {
                    return dataItemIndex === fullIdList.lastIndexOf(dataItem._id);
                }
            )
            // deleted items
            .filter<TsdbItemType<ItemType>>((dataItem: TsdbItemType<ItemType>): dataItem is TsdbItemType<ItemType> => {
                return !toRemoveIdList.includes(dataItem._id.replace(Tsdb.deleteIdPostfix, ''));
            });

        await makeDatabaseBackup(this.dbPath);

        await fileSystem.writeFile(this.dbPath, '');

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of filteredDataList) {
            await fileSystem.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');

            const dataIndex = filteredDataList.indexOf(dataItem) + 1;

            if (dataIndex % 100 === 0) {
                console.log(`Tsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
            }
        }

        this.dataList = filteredDataList;

        console.log(`Tsdb has been loaded. DbPath ${this.dbPath}.`);
    }

    async drop(): Promise<void> {
        await fileSystem.writeFile(this.dbPath, '');

        this.dataList = [];
    }

    getSize(): number {
        return this.dataList.length;
    }

    async create(itemData: ItemType): Promise<void> {
        const tsdbItemData: TsdbItemType<ItemType> = Object.assign<ItemType, {_id: string}>(
            deepCopy<ItemType>(itemData),
            {_id: makeRandomString()}
        );

        await fileSystem.appendFile(this.dbPath, JSON.stringify(tsdbItemData) + '\n');

        this.dataList.push(tsdbItemData);
    }

    async read(itemSelector: TsdbQueryType<ItemType>): Promise<Array<TsdbItemType<ItemType>>> {
        return new Promise((resolve: PromiseResolveType<Array<TsdbItemType<ItemType>>>) => {
            const itemList: Array<TsdbItemType<ItemType>> = this.dataList.filter(
                (dataItem: TsdbItemType<ItemType>): dataItem is TsdbItemType<ItemType> =>
                    getIsIncluded(dataItem, itemSelector)
            );

            setTimeout(() => resolve(itemList), 0);
        });
    }

    async readOne(itemSelector: TsdbQueryType<ItemType>): Promise<TsdbItemType<ItemType> | null> {
        return new Promise((resolve: PromiseResolveType<TsdbItemType<ItemType> | null>) => {
            const item: TsdbItemType<ItemType> | null =
                this.dataList.find((dataItem: TsdbItemType<ItemType>): boolean =>
                    getIsIncluded(dataItem, itemSelector)
                ) || null;

            setTimeout(() => resolve(item), 0);
        });
    }

    async readPage(
        itemSelector: TsdbQueryType<ItemType>,
        readPageConfig: TsdbReadPageConfigType<ItemType>
    ): Promise<TsdbReadPageResultType<ItemType>> {
        const fullList: Array<TsdbItemType<ItemType>> = await this.read(itemSelector);
        const {pageIndex, pageSize, sort} = readPageConfig;

        const fullSortedList: Array<TsdbItemType<ItemType>> = fullList.sort(
            (itemA: TsdbItemType<ItemType>, itemB: TsdbItemType<ItemType>): number => compareObject(itemA, itemB, sort)
        );

        const neededOfList: Array<TsdbItemType<ItemType>> = fullSortedList.slice(
            pageIndex * pageSize,
            pageIndex * pageSize + pageSize
        );

        const readPageResult: TsdbReadPageResultType<ItemType> = {
            list: neededOfList,
            pageIndex,
            pageSize,
            sort,
            totalItemCount: fullList.length,
            totalPageCount: Math.ceil(fullList.length / pageSize),
        };

        return readPageResult;
    }

    async update(itemSelector: TsdbQueryType<ItemType>, newItemData: ItemType): Promise<void> {
        const itemToUpdateList: Array<TsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToUpdateList) {
            const itemToUpdate: TsdbItemType<ItemType> = {...newItemData, _id: dataItem._id};
            const updatedItemIndex = this.dataList.indexOf(dataItem);

            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToUpdate) + '\n');

            this.dataList[updatedItemIndex] = itemToUpdate;
        }
    }

    async delete(itemSelector: TsdbQueryType<ItemType>): Promise<void> {
        const itemToRemoveList: Array<TsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToRemoveList) {
            const itemToDeleteUpdated: TsdbItemType<ItemType> = {...dataItem, _id: dataItem._id + Tsdb.deleteIdPostfix};

            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToDeleteUpdated) + '\n');
        }

        this.dataList = this.dataList.filter<TsdbItemType<ItemType>>(
            (dataItem: TsdbItemType<ItemType>): dataItem is TsdbItemType<ItemType> => {
                return !getIsIncluded(dataItem, itemSelector);
            }
        );
    }
}
