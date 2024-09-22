/* global setTimeout */

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import fileSystem from "node:fs/promises";

import type {
    PetsdbInitialConfigType,
    PetsdbItemType,
    PetsdbQueryType,
    PetsdbReadPageConfigType,
    PetsdbReadPageResultType,
    PromiseResolveType,
} from "./database-type";
import {Queue} from "./queue";
import {
    compareObject,
    deepCopy,
    getIsIncluded,
    getIsNotEmptyString,
    makeDatabaseBackup,
    makeRandomString,
    readFileLineByLine,
} from "./util";

export class Petsdb<ItemType extends Readonly<Record<string, Readonly<unknown>>>> {
    public static readonly queueByPath: Record<string, Queue> = {};
    public static readonly deleteIdPostfix: string = "-$$delete";
    public readonly dbPath: string = "";

    private dataList: Array<PetsdbItemType<ItemType>> = [];

    public constructor(initialConfig: PetsdbInitialConfigType) {
        const {dbPath} = initialConfig;

        this.dbPath = dbPath;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        Petsdb.queueByPath[this.dbPath] ||= new Queue();

        // eslint-disable-next-line no-constructor-return
        return this;
    }

    public async drop(): Promise<undefined> {
        return this.getQueue().add(async () => {
            return this.dropInner();
        });
    }

    public async run(): Promise<undefined> {
        return this.getQueue().add(async (): Promise<undefined> => {
            return this.innerRun();
        });
    }

    public async delete(itemSelector: PetsdbQueryType<ItemType>): Promise<undefined> {
        return this.getQueue().add(async () => {
            return this.deleteInner(itemSelector);
        });
    }

    public getSize(): number {
        return this.dataList.length;
    }

    public async create(itemData: ItemType): Promise<undefined> {
        return this.getQueue().add(async () => {
            return this.createInner(itemData);
        });
    }

    public async read(itemSelector: PetsdbQueryType<ItemType>): Promise<Array<PetsdbItemType<ItemType>>> {
        return new Promise((resolve: PromiseResolveType<Array<PetsdbItemType<ItemType>>>) => {
            const itemList: Array<PetsdbItemType<ItemType>> = this.dataList.filter(
                (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> => {
                    return getIsIncluded(dataItem, itemSelector);
                }
            );

            setTimeout(() => {
                return resolve(itemList);
            }, 0);
        });
    }

    public async readOne(itemSelector: PetsdbQueryType<ItemType>): Promise<PetsdbItemType<ItemType> | null> {
        return new Promise((resolve: PromiseResolveType<PetsdbItemType<ItemType> | null>) => {
            const item: PetsdbItemType<ItemType> | null =
                this.dataList.find((dataItem: PetsdbItemType<ItemType>): boolean => {
                    return getIsIncluded(dataItem, itemSelector);
                }) ?? null;

            setTimeout(() => {
                return resolve(item);
            }, 0);
        });
    }

    public async readPage(
        itemSelector: PetsdbQueryType<ItemType>,
        readPageConfig: PetsdbReadPageConfigType<ItemType>
    ): Promise<PetsdbReadPageResultType<ItemType>> {
        const fullList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);
        const {pageIndex, pageSize, sort} = readPageConfig;

        const fullSortedList: Array<PetsdbItemType<ItemType>> = fullList.toSorted(
            (itemA: PetsdbItemType<ItemType>, itemB: PetsdbItemType<ItemType>): number => {
                return compareObject(itemA, itemB, sort);
            }
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

    public async update(itemSelector: PetsdbQueryType<ItemType>, updatedItemData: ItemType): Promise<undefined> {
        return this.getQueue().add(async () => {
            return this.updateInner(itemSelector, updatedItemData);
        });
    }

    private getQueue(): Queue {
        return Petsdb.queueByPath[this.dbPath];
    }

    private async innerRun(): Promise<undefined> {
        await makeDatabaseBackup(this.dbPath);

        console.log("[Petsdb]: Petsdb is reading data base file - BEGIN");
        const fullLineList: Array<string> = await readFileLineByLine(this.dbPath);

        console.log("[Petsdb]: Petsdb is reading data base file - END");
        const filteredLineList: Array<string> = fullLineList.filter<string>(getIsNotEmptyString);

        const fullDataList: Array<PetsdbItemType<ItemType>> = filteredLineList.map<PetsdbItemType<ItemType>>(
            (line: string): PetsdbItemType<ItemType> => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return JSON.parse(line);
            }
        );

        const fullIdList: Array<string> = fullDataList.map<string>((dataItem: PetsdbItemType<ItemType>): string => {
            return dataItem._id;
        });

        const toRemoveIdList: Array<string> = fullIdList
            .map<string>((dataItemId: string): string => {
                if (dataItemId.endsWith(Petsdb.deleteIdPostfix)) {
                    return dataItemId.replace(Petsdb.deleteIdPostfix, "");
                }

                return "";
            })
            .filter<string>((itemToRemoveId: string): itemToRemoveId is string => {
                return itemToRemoveId !== "";
            });

        const filteredDataList: Array<PetsdbItemType<ItemType>> = fullDataList
            // Updated
            .filter<PetsdbItemType<ItemType>>(
                (dataItem: PetsdbItemType<ItemType>, dataItemIndex: number): dataItem is PetsdbItemType<ItemType> => {
                    return dataItemIndex === fullIdList.lastIndexOf(dataItem._id);
                }
            )
            // Deleted items
            .filter<PetsdbItemType<ItemType>>(
                (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> => {
                    return !toRemoveIdList.includes(dataItem._id.replace(Petsdb.deleteIdPostfix, ""));
                }
            );

        const dataInStringList: Array<string> = [];

        for (const dataItem of filteredDataList) {
            dataInStringList.push(JSON.stringify(dataItem));
            // Debug await fileSystem.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');

            const dataIndex = filteredDataList.indexOf(dataItem) + 1;

            if (dataIndex % 100 === 0) {
                console.log(`[Petsdb]: Petsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
            }
        }

        await fileSystem.writeFile(this.dbPath, `${dataInStringList.join("\n")}\n`, {encoding: "utf8"});
        console.log("[Petsdb]: Petsdb data base file has been updated");

        this.dataList = filteredDataList;
        console.log(`[Petsdb]: Petsdb has been loaded. DbPath ${this.dbPath}.`);
    }

    private async dropInner(): Promise<undefined> {
        await fileSystem.writeFile(this.dbPath, "");

        this.dataList = [];
    }

    private async createInner(itemData: ItemType): Promise<undefined> {
        const tsdbItemData: PetsdbItemType<ItemType> = Object.assign<ItemType, {_id: string}>(
            deepCopy<ItemType>(itemData),

            {_id: makeRandomString()}
        );

        await fileSystem.appendFile(this.dbPath, `${JSON.stringify(tsdbItemData)}\n`);

        this.dataList.push(tsdbItemData);
    }

    private async updateInner(itemSelector: PetsdbQueryType<ItemType>, updatedItemData: ItemType): Promise<undefined> {
        const itemToUpdateList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        for (const dataItem of itemToUpdateList) {
            const itemToUpdate: PetsdbItemType<ItemType> = {...updatedItemData, _id: dataItem._id};
            const updatedItemIndex = this.dataList.indexOf(dataItem);

            // eslint-disable-next-line no-await-in-loop
            await fileSystem.appendFile(this.dbPath, `${JSON.stringify(itemToUpdate)}\n`);

            this.dataList[updatedItemIndex] = itemToUpdate;
        }
    }

    private async deleteInner(itemSelector: PetsdbQueryType<ItemType>): Promise<undefined> {
        const itemToRemoveList: Array<PetsdbItemType<ItemType>> = await this.read(itemSelector);

        for (const dataItem of itemToRemoveList) {
            const itemToDeleteUpdated: PetsdbItemType<ItemType> = {
                ...dataItem,

                _id: String(dataItem._id) + Petsdb.deleteIdPostfix,
            };

            // eslint-disable-next-line no-await-in-loop
            await fileSystem.appendFile(this.dbPath, `${JSON.stringify(itemToDeleteUpdated)}\n`);
        }

        this.dataList = this.dataList.filter<PetsdbItemType<ItemType>>(
            (dataItem: PetsdbItemType<ItemType>): dataItem is PetsdbItemType<ItemType> => {
                return !getIsIncluded(dataItem, itemSelector);
            }
        );
    }
}
