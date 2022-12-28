"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDatabaseBackup = exports.makeDirectory = exports.getHasAccessToDirectory = exports.compareObject = exports.compareBoolean = exports.compareString = exports.compareNumber = exports.getSortByPath = exports.getIsIncluded = exports.getIsArrayIncludedByRegexp = exports.getIsArrayIncludedByValue = exports.getIsNotEmptyString = exports.makeRandomNumber = exports.makeRandomString = exports.deepCopy = exports.readFileLineByLine = void 0;
const node_fs_1 = require("node:fs");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_readline_1 = __importDefault(require("node:readline"));
function readFileLineByLine(pathToFile) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const lineList = [];
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in text file as a single line break.
        const lineStream = node_readline_1.default.createInterface({
            crlfDelay: Number.POSITIVE_INFINITY,
            input: (0, node_fs_1.createReadStream)(pathToFile),
        });
        try {
            // eslint-disable-next-line no-loops/no-loops
            for (var _d = true, lineStream_1 = __asyncValues(lineStream), lineStream_1_1; lineStream_1_1 = yield lineStream_1.next(), _a = lineStream_1_1.done, !_a;) {
                _c = lineStream_1_1.value;
                _d = false;
                try {
                    const line = _c;
                    // Each line in text file will be successively available here as `line`.
                    lineList.push(line);
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = lineStream_1.return)) yield _b.call(lineStream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return lineList;
    });
}
exports.readFileLineByLine = readFileLineByLine;
function deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.deepCopy = deepCopy;
function makeRandomString() {
    const requiredLength = 16;
    const fromRandom = Math.random().toString(36).replace('0.', '');
    const fromRandomPadded = Math.random().toString(36).replace('0.', '');
    const fromTime = [...Date.now().toString(36)].reverse().join('');
    return `${fromRandom}${fromTime}`
        .toLowerCase()
        .slice(0, requiredLength)
        .padStart(requiredLength, fromRandomPadded + fromTime);
}
exports.makeRandomString = makeRandomString;
function makeRandomNumber(fromInclude, toExclude) {
    return Math.floor(Math.random() * (toExclude - fromInclude)) + fromInclude;
}
exports.makeRandomNumber = makeRandomNumber;
function getIsNotEmptyString(line) {
    return line.trim() !== '';
}
exports.getIsNotEmptyString = getIsNotEmptyString;
function getIsArrayIncludedByValue(fullArray, partialArray) {
    return partialArray.every((value) => fullArray.includes(value));
}
exports.getIsArrayIncludedByValue = getIsArrayIncludedByValue;
function getIsArrayIncludedByRegexp(fullArray, partialValue) {
    return fullArray.some((itemValueAsItemInList) => {
        if (typeof itemValueAsItemInList === 'string') {
            return partialValue.test(itemValueAsItemInList);
        }
        return false;
    });
}
exports.getIsArrayIncludedByRegexp = getIsArrayIncludedByRegexp;
// eslint-disable-next-line sonarjs/cognitive-complexity
function getIsIncluded(item, partial) {
    const partialKeyList = Object.keys(partial);
    if (partialKeyList.length === 0) {
        return true;
    }
    // eslint-disable-next-line complexity
    return partialKeyList.every((partialKey) => {
        const itemValue = item[partialKey];
        const partialValue = partial[partialKey];
        if (partialValue instanceof RegExp) {
            if (typeof itemValue === 'string') {
                return partialValue.test(itemValue);
            }
            if (Array.isArray(itemValue)) {
                return getIsArrayIncludedByRegexp(itemValue, partialValue);
            }
        }
        // check by value
        if (itemValue === partialValue) {
            return true;
        }
        if (typeof itemValue === 'object' &&
            typeof partialValue === 'object' &&
            itemValue !== null &&
            partialValue !== null) {
            if (Array.isArray(itemValue) && Array.isArray(partialValue)) {
                return getIsArrayIncludedByValue(itemValue, partialValue);
            }
            return getIsIncluded(Object.assign({}, itemValue), Object.assign({}, partialValue));
        }
        return false;
    });
}
exports.getIsIncluded = getIsIncluded;
// eslint-disable-next-line complexity
function getSortByPath(itemData, keyData) {
    // eslint-disable-next-line guard-for-in, no-loops/no-loops
    for (const key in keyData) {
        const itemDataValue = itemData[key];
        const keyDataValue = keyData[key];
        if (typeof itemDataValue === 'boolean' ||
            typeof itemDataValue === 'number' ||
            typeof itemDataValue === 'string') {
            return {
                direction: keyDataValue === -1 ? -1 : 1,
                value: itemDataValue,
            };
        }
        if (typeof itemDataValue === 'object' && typeof keyDataValue === 'object') {
            return getSortByPath(Object.assign({}, itemDataValue), Object.assign({}, keyDataValue));
        }
    }
    throw new Error(`Can not find value by ${JSON.stringify(keyData)}`);
}
exports.getSortByPath = getSortByPath;
function compareNumber(numberA, numberB) {
    return numberA - numberB;
}
exports.compareNumber = compareNumber;
function compareString(stringA, stringB) {
    return stringA.localeCompare(stringB);
}
exports.compareString = compareString;
function compareBoolean(booleanA, booleanB) {
    if (booleanA === booleanB) {
        return 0;
    }
    return booleanA ? 1 : -1;
}
exports.compareBoolean = compareBoolean;
// eslint-disable-next-line complexity
function compareObject(itemA, itemB, sort) {
    const { value: itemValueA, direction: sortDirection } = getSortByPath(itemA, sort);
    const { value: itemValueB } = getSortByPath(itemB, sort);
    if (typeof itemValueA === 'number' && typeof itemValueB === 'number') {
        return compareNumber(itemValueA, itemValueB) * sortDirection;
    }
    if (typeof itemValueA === 'string' && typeof itemValueB === 'string') {
        return compareString(itemValueA, itemValueB) * sortDirection;
    }
    if (typeof itemValueA === 'boolean' && typeof itemValueB === 'boolean') {
        return compareBoolean(itemValueA, itemValueB) * sortDirection;
    }
    return 0;
}
exports.compareObject = compareObject;
function getHasAccessToDirectory(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // eslint-disable-next-line no-bitwise
            yield promises_1.default.access(node_path_1.default.join(...args), node_fs_1.constants.R_OK | node_fs_1.constants.W_OK);
            return true;
            // eslint-disable-next-line no-empty
        }
        catch (_a) { }
        return false;
    });
}
exports.getHasAccessToDirectory = getHasAccessToDirectory;
function makeDirectory(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathToFolder = node_path_1.default.join(...args);
        const hasAccessToDirectory = yield getHasAccessToDirectory(pathToFolder);
        if (!hasAccessToDirectory) {
            yield promises_1.default.mkdir(pathToFolder);
        }
    });
}
exports.makeDirectory = makeDirectory;
function makeDatabaseBackup(pathToDatabase) {
    return __awaiter(this, void 0, void 0, function* () {
        const backupFolder = pathToDatabase + '-backup';
        yield makeDirectory(backupFolder);
        const backUpFilePath = `${node_path_1.default.join(backupFolder, String(pathToDatabase.split('/').pop()))}-${new Date()
            .toISOString()
            .replace(/:/g, '-')}`;
        yield promises_1.default.copyFile(pathToDatabase, backUpFilePath);
        console.log(`[Petsdb]: Backup has been created, path is: ${backUpFilePath}`);
    });
}
exports.makeDatabaseBackup = makeDatabaseBackup;
//# sourceMappingURL=util.js.map