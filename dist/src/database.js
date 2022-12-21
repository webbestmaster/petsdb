/* global setTimeout */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { promises as fileSystem } from 'fs';
import { deepCopy, getIsIncluded, getIsNotEmptyString, makeDatabaseBackup, makeRandomString, readFileLineByLine, compareObject, } from './util';
export class Petsdb {
    constructor(initialConfig) {
        this.dbPath = '';
        this.dataList = [];
        const { dbPath } = initialConfig;
        this.dbPath = dbPath;
        return this;
    }
    async run() {
        const fullLineList = await readFileLineByLine(this.dbPath);
        const filteredLineList = fullLineList.filter(getIsNotEmptyString);
        const fullDataList = filteredLineList.map((line) => JSON.parse(line));
        const fullIdList = fullDataList.map((dataItem) => dataItem._id);
        // eslint-disable-next-line unicorn/prefer-set-has
        const toRemoveIdList = fullIdList
            .map((dataItemId) => {
            if (dataItemId.endsWith(Petsdb.deleteIdPostfix)) {
                return dataItemId.replace(Petsdb.deleteIdPostfix, '');
            }
            return '';
        })
            .filter((itemToRemoveId) => itemToRemoveId !== '');
        const filteredDataList = fullDataList
            // updated
            .filter((dataItem, dataItemIndex) => {
            return dataItemIndex === fullIdList.lastIndexOf(dataItem._id);
        })
            // deleted items
            .filter((dataItem) => {
            return !toRemoveIdList.includes(dataItem._id.replace(Petsdb.deleteIdPostfix, ''));
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
    async drop() {
        await fileSystem.writeFile(this.dbPath, '');
        this.dataList = [];
    }
    getSize() {
        return this.dataList.length;
    }
    async create(itemData) {
        const tsdbItemData = Object.assign(deepCopy(itemData), { _id: makeRandomString() });
        await fileSystem.appendFile(this.dbPath, JSON.stringify(tsdbItemData) + '\n');
        this.dataList.push(tsdbItemData);
    }
    async read(itemSelector) {
        return new Promise((resolve) => {
            const itemList = this.dataList.filter((dataItem) => getIsIncluded(dataItem, itemSelector));
            setTimeout(() => resolve(itemList), 0);
        });
    }
    async readOne(itemSelector) {
        return new Promise((resolve) => {
            const item = this.dataList.find((dataItem) => getIsIncluded(dataItem, itemSelector)) || null;
            setTimeout(() => resolve(item), 0);
        });
    }
    async readPage(itemSelector, readPageConfig) {
        const fullList = await this.read(itemSelector);
        const { pageIndex, pageSize, sort } = readPageConfig;
        const fullSortedList = fullList.sort((itemA, itemB) => compareObject(itemA, itemB, sort));
        const neededOfList = fullSortedList.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
        const readPageResult = {
            list: neededOfList,
            pageIndex,
            pageSize,
            sort,
            totalItemCount: fullList.length,
            totalPageCount: Math.ceil(fullList.length / pageSize),
        };
        return readPageResult;
    }
    async update(itemSelector, newItemData) {
        const itemToUpdateList = await this.read(itemSelector);
        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToUpdateList) {
            const itemToUpdate = { ...newItemData, _id: dataItem._id };
            const updatedItemIndex = this.dataList.indexOf(dataItem);
            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToUpdate) + '\n');
            this.dataList[updatedItemIndex] = itemToUpdate;
        }
    }
    async delete(itemSelector) {
        const itemToRemoveList = await this.read(itemSelector);
        // eslint-disable-next-line no-loops/no-loops
        for (const dataItem of itemToRemoveList) {
            const itemToDeleteUpdated = {
                ...dataItem,
                _id: dataItem._id + Petsdb.deleteIdPostfix,
            };
            await fileSystem.appendFile(this.dbPath, JSON.stringify(itemToDeleteUpdated) + '\n');
        }
        this.dataList = this.dataList.filter((dataItem) => {
            return !getIsIncluded(dataItem, itemSelector);
        });
    }
}
Petsdb.deleteIdPostfix = '-$$delete';
//# sourceMappingURL=database.js.map