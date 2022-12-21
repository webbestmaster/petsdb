import {createReadStream, promises as fileSystem} from 'fs';
import path from 'path';

import readline from 'readline';

import {PetsdbSortDirectionType, PetsdbSortValueType} from './database-type';

export async function readFileLineByLine(pathToFile: string): Promise<Array<string>> {
    const lineList: Array<string> = [];

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in text file as a single line break.
    const lineStream = readline.createInterface({
        crlfDelay: Number.POSITIVE_INFINITY,
        input: createReadStream(pathToFile),
    });

    // eslint-disable-next-line no-loops/no-loops
    for await (const line of lineStream) {
        // Each line in text file will be successively available here as `line`.
        lineList.push(line);
    }

    return lineList;
}

export function deepCopy<DataType>(object: DataType): DataType {
    return JSON.parse(JSON.stringify(object));
}

export function makeRandomString(): string {
    const requiredLength = 16;
    const fromRandom = Math.random().toString(36).replace('0.', '');
    const fromRandomPadded = Math.random().toString(36).replace('0.', '');
    const fromTime = [...Date.now().toString(36)].reverse().join('');

    return `${fromRandom}${fromTime}`
        .toLowerCase()
        .slice(0, requiredLength)
        .padStart(requiredLength, fromRandomPadded + fromTime);
}

export function makeRandomNumber(fromInclude: number, toExclude: number): number {
    return Math.floor(Math.random() * (toExclude - fromInclude)) + fromInclude;
}

export function getIsNotEmptyString(line: string): line is string {
    return line.trim() !== '';
}

export function getIsArrayIncludedByValue(fullArray: Array<unknown>, partialArray: Array<unknown>): boolean {
    return partialArray.every((value: unknown): boolean => fullArray.includes(value));
}

export function getIsArrayIncludedByRegexp(fullArray: Array<unknown>, partialValue: RegExp): boolean {
    return fullArray.some((itemValueAsItemInList: unknown): boolean => {
        if (typeof itemValueAsItemInList === 'string') {
            return partialValue.test(itemValueAsItemInList);
        }

        return false;
    });
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getIsIncluded(item: Record<string, unknown>, partial: Record<string, unknown>): boolean {
    const partialKeyList: Array<string> = Object.keys(partial);

    if (partialKeyList.length === 0) {
        return true;
    }

    // eslint-disable-next-line complexity
    return partialKeyList.every((partialKey: string): boolean => {
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

        if (
            typeof itemValue === 'object' &&
            typeof partialValue === 'object' &&
            itemValue !== null &&
            partialValue !== null
        ) {
            if (Array.isArray(itemValue) && Array.isArray(partialValue)) {
                return getIsArrayIncludedByValue(itemValue, partialValue);
            }

            return getIsIncluded({...itemValue}, {...partialValue});
        }

        return false;
    });
}

export type GetSortByPathResultType = {direction: PetsdbSortDirectionType; value: PetsdbSortValueType};

// eslint-disable-next-line complexity
export function getSortByPath(
    itemData: Record<string, unknown>,
    keyData: Record<string, unknown>
): GetSortByPathResultType {
    // eslint-disable-next-line guard-for-in, no-loops/no-loops
    for (const key in keyData) {
        const itemDataValue = itemData[key];
        const keyDataValue = keyData[key];

        if (
            typeof itemDataValue === 'boolean' ||
            typeof itemDataValue === 'number' ||
            typeof itemDataValue === 'string'
        ) {
            return {
                direction: keyDataValue === -1 ? -1 : 1,
                value: itemDataValue,
            };
        }

        if (typeof itemDataValue === 'object' && typeof keyDataValue === 'object') {
            return getSortByPath({...itemDataValue}, {...keyDataValue});
        }
    }

    throw new Error(`Can not find value by ${JSON.stringify(keyData)}`);
}

export function compareNumber(numberA: number, numberB: number): number {
    return numberA - numberB;
}

export function compareString(stringA: string, stringB: string): number {
    return stringA.localeCompare(stringB);
}

export function compareBoolean(booleanA: boolean, booleanB: boolean): number {
    if (booleanA === booleanB) {
        return 0;
    }

    return booleanA ? 1 : -1;
}

// eslint-disable-next-line complexity
export function compareObject(
    itemA: Record<string, unknown>,
    itemB: Record<string, unknown>,
    sort: Record<string, unknown>
): number {
    const {value: itemValueA, direction: sortDirection} = getSortByPath(itemA, sort);
    const {value: itemValueB} = getSortByPath(itemB, sort);

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

export async function makeDatabaseBackup(pathToDatabase: string): Promise<void> {
    const backupFolder: string = pathToDatabase + '-backup';

    try {
        await fileSystem.mkdir(backupFolder);
    } catch {
        console.error(`Can not make folder! Path: ${backupFolder}`);
    }

    await fileSystem.copyFile(
        pathToDatabase,
        `${path.join(backupFolder, String(pathToDatabase.split('/').pop()))}-${new Date()
            .toISOString()
            .replace(/:/g, '-')}`
    );
}
