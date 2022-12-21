"use strict";
/* global setTimeout */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Petsdb = void 0;
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const fs_1 = require("fs");
const util_1 = require("./util");
class Petsdb {
    constructor(initialConfig) {
        this.dbPath = '';
        this.dataList = [];
        const { dbPath } = initialConfig;
        this.dbPath = dbPath;
        return this;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const fullLineList = yield (0, util_1.readFileLineByLine)(this.dbPath);
            const filteredLineList = fullLineList.filter(util_1.getIsNotEmptyString);
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
            yield (0, util_1.makeDatabaseBackup)(this.dbPath);
            yield fs_1.promises.writeFile(this.dbPath, '');
            // eslint-disable-next-line no-loops/no-loops
            for (const dataItem of filteredDataList) {
                yield fs_1.promises.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');
                const dataIndex = filteredDataList.indexOf(dataItem) + 1;
                if (dataIndex % 100 === 0) {
                    console.log(`Petsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
                }
            }
            this.dataList = filteredDataList;
            console.log(`Petsdb has been loaded. DbPath ${this.dbPath}.`);
        });
    }
    drop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.promises.writeFile(this.dbPath, '');
            this.dataList = [];
        });
    }
    getSize() {
        return this.dataList.length;
    }
    create(itemData) {
        return __awaiter(this, void 0, void 0, function* () {
            const tsdbItemData = Object.assign((0, util_1.deepCopy)(itemData), { _id: (0, util_1.makeRandomString)() });
            yield fs_1.promises.appendFile(this.dbPath, JSON.stringify(tsdbItemData) + '\n');
            this.dataList.push(tsdbItemData);
        });
    }
    read(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const itemList = this.dataList.filter((dataItem) => (0, util_1.getIsIncluded)(dataItem, itemSelector));
                setTimeout(() => resolve(itemList), 0);
            });
        });
    }
    readOne(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const item = this.dataList.find((dataItem) => (0, util_1.getIsIncluded)(dataItem, itemSelector)) || null;
                setTimeout(() => resolve(item), 0);
            });
        });
    }
    readPage(itemSelector, readPageConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullList = yield this.read(itemSelector);
            const { pageIndex, pageSize, sort } = readPageConfig;
            const fullSortedList = fullList.sort((itemA, itemB) => (0, util_1.compareObject)(itemA, itemB, sort));
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
        });
    }
    update(itemSelector, newItemData) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemToUpdateList = yield this.read(itemSelector);
            // eslint-disable-next-line no-loops/no-loops
            for (const dataItem of itemToUpdateList) {
                const itemToUpdate = Object.assign(Object.assign({}, newItemData), { _id: dataItem._id });
                const updatedItemIndex = this.dataList.indexOf(dataItem);
                yield fs_1.promises.appendFile(this.dbPath, JSON.stringify(itemToUpdate) + '\n');
                this.dataList[updatedItemIndex] = itemToUpdate;
            }
        });
    }
    delete(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemToRemoveList = yield this.read(itemSelector);
            // eslint-disable-next-line no-loops/no-loops
            for (const dataItem of itemToRemoveList) {
                const itemToDeleteUpdated = Object.assign(Object.assign({}, dataItem), { _id: dataItem._id + Petsdb.deleteIdPostfix });
                yield fs_1.promises.appendFile(this.dbPath, JSON.stringify(itemToDeleteUpdated) + '\n');
            }
            this.dataList = this.dataList.filter((dataItem) => {
                return !(0, util_1.getIsIncluded)(dataItem, itemSelector);
            });
        });
    }
}
exports.Petsdb = Petsdb;
Petsdb.deleteIdPostfix = '-$$delete';
//# sourceMappingURL=database.js.map