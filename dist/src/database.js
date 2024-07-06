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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Petsdb = void 0;
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const promises_1 = __importDefault(require("node:fs/promises"));
const queue_1 = require("./queue");
const util_1 = require("./util");
class Petsdb {
    constructor(initialConfig) {
        var _a, _b;
        this.dbPath = "";
        this.dataList = [];
        const { dbPath } = initialConfig;
        this.dbPath = dbPath;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (_a = Petsdb.queueByPath)[_b = this.dbPath] || (_a[_b] = new queue_1.Queue());
        // eslint-disable-next-line no-constructor-return
        return this;
    }
    drop() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getQueue().add(() => __awaiter(this, void 0, void 0, function* () {
                return this.dropInner();
            }));
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getQueue().add(() => __awaiter(this, void 0, void 0, function* () {
                return this.innerRun();
            }));
        });
    }
    delete(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getQueue().add(() => __awaiter(this, void 0, void 0, function* () {
                return this.deleteInner(itemSelector);
            }));
        });
    }
    getSize() {
        return this.dataList.length;
    }
    create(itemData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getQueue().add(() => __awaiter(this, void 0, void 0, function* () {
                return this.createInner(itemData);
            }));
        });
    }
    read(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const itemList = this.dataList.filter((dataItem) => {
                    return (0, util_1.getIsIncluded)(dataItem, itemSelector);
                });
                setTimeout(() => {
                    return resolve(itemList);
                }, 0);
            });
        });
    }
    readOne(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                var _a;
                const item = (_a = this.dataList.find((dataItem) => {
                    return (0, util_1.getIsIncluded)(dataItem, itemSelector);
                })) !== null && _a !== void 0 ? _a : null;
                setTimeout(() => {
                    return resolve(item);
                }, 0);
            });
        });
    }
    readPage(itemSelector, readPageConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullList = yield this.read(itemSelector);
            const { pageIndex, pageSize, sort } = readPageConfig;
            const fullSortedList = fullList.sort((itemA, itemB) => {
                return (0, util_1.compareObject)(itemA, itemB, sort);
            });
            if (pageSize <= 0) {
                const readPageResultZeroPageSize = {
                    list: fullSortedList,
                    pageIndex,
                    pageSize: fullList.length,
                    sort,
                    totalItemCount: fullList.length,
                    totalPageCount: 1,
                };
                return readPageResultZeroPageSize;
            }
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
    update(itemSelector, updatedItemData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getQueue().add(() => __awaiter(this, void 0, void 0, function* () {
                return this.updateInner(itemSelector, updatedItemData);
            }));
        });
    }
    getQueue() {
        return Petsdb.queueByPath[this.dbPath];
    }
    innerRun() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.makeDatabaseBackup)(this.dbPath);
            console.log("[Petsdb]: Petsdb is reading data base file - BEGIN");
            const fullLineList = yield (0, util_1.readFileLineByLine)(this.dbPath);
            console.log("[Petsdb]: Petsdb is reading data base file - END");
            const filteredLineList = fullLineList.filter(util_1.getIsNotEmptyString);
            const fullDataList = filteredLineList.map((line) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return JSON.parse(line);
            });
            const fullIdList = fullDataList.map((dataItem) => {
                return dataItem._id;
            });
            const toRemoveIdList = fullIdList
                .map((dataItemId) => {
                if (dataItemId.endsWith(Petsdb.deleteIdPostfix)) {
                    return dataItemId.replace(Petsdb.deleteIdPostfix, "");
                }
                return "";
            })
                .filter((itemToRemoveId) => {
                return itemToRemoveId !== "";
            });
            const filteredDataList = fullDataList
                // Updated
                .filter((dataItem, dataItemIndex) => {
                return dataItemIndex === fullIdList.lastIndexOf(dataItem._id);
            })
                // Deleted items
                .filter((dataItem) => {
                return !toRemoveIdList.includes(dataItem._id.replace(Petsdb.deleteIdPostfix, ""));
            });
            const dataInStringList = [];
            for (const dataItem of filteredDataList) {
                dataInStringList.push(JSON.stringify(dataItem));
                // Debug await fileSystem.appendFile(this.dbPath, JSON.stringify(dataItem) + '\n');
                const dataIndex = filteredDataList.indexOf(dataItem) + 1;
                if (dataIndex % 100 === 0) {
                    console.log(`[Petsdb]: Petsdb is loading: ${Math.floor((100 * dataIndex) / filteredDataList.length)}%`);
                }
            }
            yield promises_1.default.writeFile(this.dbPath, `${dataInStringList.join("\n")}\n`, { encoding: "utf8" });
            console.log("[Petsdb]: Petsdb data base file has been updated");
            this.dataList = filteredDataList;
            console.log(`[Petsdb]: Petsdb has been loaded. DbPath ${this.dbPath}.`);
        });
    }
    dropInner() {
        return __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.writeFile(this.dbPath, "");
            this.dataList = [];
        });
    }
    createInner(itemData) {
        return __awaiter(this, void 0, void 0, function* () {
            const tsdbItemData = Object.assign((0, util_1.deepCopy)(itemData), { _id: (0, util_1.makeRandomString)() });
            yield promises_1.default.appendFile(this.dbPath, `${JSON.stringify(tsdbItemData)}\n`);
            this.dataList.push(tsdbItemData);
        });
    }
    updateInner(itemSelector, updatedItemData) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemToUpdateList = yield this.read(itemSelector);
            for (const dataItem of itemToUpdateList) {
                const itemToUpdate = Object.assign(Object.assign({}, updatedItemData), { _id: dataItem._id });
                const updatedItemIndex = this.dataList.indexOf(dataItem);
                // eslint-disable-next-line no-await-in-loop
                yield promises_1.default.appendFile(this.dbPath, `${JSON.stringify(itemToUpdate)}\n`);
                this.dataList[updatedItemIndex] = itemToUpdate;
            }
        });
    }
    deleteInner(itemSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemToRemoveList = yield this.read(itemSelector);
            for (const dataItem of itemToRemoveList) {
                const itemToDeleteUpdated = Object.assign(Object.assign({}, dataItem), { _id: String(dataItem._id) + Petsdb.deleteIdPostfix });
                // eslint-disable-next-line no-await-in-loop
                yield promises_1.default.appendFile(this.dbPath, `${JSON.stringify(itemToDeleteUpdated)}\n`);
            }
            this.dataList = this.dataList.filter((dataItem) => {
                return !(0, util_1.getIsIncluded)(dataItem, itemSelector);
            });
        });
    }
}
exports.Petsdb = Petsdb;
Petsdb.queueByPath = {};
Petsdb.deleteIdPostfix = "-$$delete";
//# sourceMappingURL=database.js.map