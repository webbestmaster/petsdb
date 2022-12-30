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

import {Queue} from './queue';

export class Petsdb<ItemType extends Record<string, unknown>> {
    static readonly queueByPath: Record<string, Queue> = {};
    readonly dbPath: string = '';
    private dataList: Array<PetsdbItemType<ItemType>> = [];
    static readonly deleteIdPostfix = '-$$delete';

    constructor(initialConfig: PetsdbInitialConfigType) {
        const {dbPath} = initialConfig;

        this.dbPath = dbPath;

        Petsdb.queueByPath[this.dbPath] = Petsdb.queueByPath[this.dbPath] || new Queue();

        return this;
    }

    private getQueue(): Queue {
        return Petsdb.queueByPath[this.dbPath];
    }

    run(): Promise<void> {
        return this.getQueue().add((): Promise<void> => this.innerRun());
    }

    private async innerRun(): Promise<void> {
        await makeDatabaseBackup(this.dbPath);

        console.log('[Petsdb]: Petsdb is reading data base file - BEGIN');
        const fullLineList: Array<string> = await readFileLineByLine(this.dbPath);

        console.log('[Petsdb]: Petsdb is reading data base file - END');
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

        const dataInStringList: Array<string> = [];

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of filteredDataList) {
            dataInStringList.push(JSON.stringify(dataItem));
            // await fileSystem.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');

            const dataIndex = filteredDataList.indexOf(dataItem) + 1;

            if (dataIndex % 100 === 0) {
                console.log(`[Petsdb]: Petsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
            }
        }

        await fileSystem.writeFile(this.dbPath, dataInStringList.join('\n') + '\n', {encoding: 'utf8'});
        console.log('[Petsdb]: Petsdb data base file has been updated');

        this.dataList = filteredDataList;
        console.log(`[Petsdb]: Petsdb has been loaded. DbPath ${this.dbPath}.`);
    }

    async drop(): Promise<void> {
        return this.getQueue().add(() => this.dropInner());
    }

    private async dropInner(): Promise<void> {
        await fileSystem.writeFile(this.dbPath, '');

        this.dataList = [];
    }

    getSize(): number {
        return this.dataList.length;
    }

    async create(itemData: ItemType): Promise<void> {
        return this.getQueue().add(() => this.createInner(itemData));
    }

    private async createInner(itemData: ItemType): Promise<void> {
        // eslint-disable-next-line id-match
        const tsdbItemData: PetsdbItemType<ItemType> = Object.assign<ItemType, {_id: string}>(
            deepCopy<ItemType>(itemData),
            // eslint-disable-next-line id-match
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
        return this.getQueue().add(() => this.updateInner(itemSelector, newItemData));
    }

    private async updateInner(itemSelector: PetsdbQueryType<ItemType>, newItemData: ItemType): Promise<void> {
        const itemToUpdateList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToUpdateList) {
            // eslint-disable-next-line id-match
            const itemToUpdate: PetsdbItemType<ItemType> = {...newItemData, _id: dataItem._id};
            const updatedItemIndex = this.dataList.indexOf(dataItem);

            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToUpdate) + '\n');

            this.dataList[updatedItemIndex] = itemToUpdate;
        }
    }

    async delete(itemSelector: PetsdbQueryType<ItemType>): Promise<void> {
        return this.getQueue().add(() => this.deleteInner(itemSelector));
    }

    private async deleteInner(itemSelector: PetsdbQueryType<ItemType>): Promise<void> {
        const itemToRemoveList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToRemoveList) {
            const itemToDeleteUpdated: PetsdbItemType<ItemType> = {
                ...dataItem,
                // eslint-disable-next-line id-match
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
