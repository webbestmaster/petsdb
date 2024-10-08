/* global structuredClone */
import {constants, createReadStream} from "node:fs";
import fileSystem from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

import type {PetsdbSortDirectionType, PetsdbSortValueType} from "./database-type";

export async function readFileLineByLine(pathToFile: string): Promise<Array<string>> {
    const lineList: Array<string> = [];

    // Note: we use the crlfDelay option to recognize all instances of CR LF, ('\r\n') in text file as a single line break.
    const lineStream = readline.createInterface({
        crlfDelay: Number.POSITIVE_INFINITY,
        input: createReadStream(pathToFile),
    });

    for await (const line of lineStream) {
        // Each line in text file will be successively available here as `line`.
        lineList.push(line);
    }

    return lineList;
}

export function deepCopy<DataType>(object: DataType): DataType {
    return structuredClone(object);
}

export function makeRandomString(): string {
    const requiredLength = 16;
    const fromRandom = Math.random().toString(36).replace("0.", "");
    const fromRandomPadded = Math.random().toString(36).replace("0.", "");
    const fromTime = [...Date.now().toString(36)].reverse().join("");

    return `${fromRandom}${fromTime}`
        .toLowerCase()
        .slice(0, requiredLength)
        .padStart(requiredLength, fromRandomPadded + fromTime);
}

export function makeRandomNumber(fromInclude: number, toExclude: number): number {
    return Math.floor(Math.random() * (toExclude - fromInclude)) + fromInclude;
}

export function getIsNotEmptyString(line: string): line is string {
    return line.trim() !== "";
}

export function getIsArrayIncludedByValue(
    fullArray: ReadonlyArray<unknown>,
    partialArray: ReadonlyArray<unknown>
): boolean {
    return partialArray.every((value: unknown): boolean => {
        return fullArray.includes(value);
    });
}

export function getIsArrayIncludedByRegexp(fullArray: ReadonlyArray<unknown>, partialValue: Readonly<RegExp>): boolean {
    return fullArray.some((itemValueAsItemInList: unknown): boolean => {
        if (typeof itemValueAsItemInList === "string") {
            return partialValue.test(itemValueAsItemInList);
        }

        return false;
    });
}

export function getIsIncluded(
    item: Readonly<Record<string, unknown>>,
    partial: Readonly<Record<string, unknown>>
): boolean {
    const partialKeyList: Array<string> = Object.keys(partial);

    if (partialKeyList.length === 0) {
        return true;
    }

    return partialKeyList.every((partialKey: string): boolean => {
        const itemValue = item[partialKey];
        const partialValue = partial[partialKey];

        if (partialValue instanceof RegExp) {
            if (typeof itemValue === "string") {
                return partialValue.test(itemValue);
            }
            if (Array.isArray(itemValue)) {
                return getIsArrayIncludedByRegexp(itemValue, partialValue);
            }
        }

        // Check by value
        if (itemValue === partialValue) {
            return true;
        }

        if (
            typeof itemValue === "object" &&
            typeof partialValue === "object" &&
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

export interface GetSortByPathResultType {
    direction: PetsdbSortDirectionType;
    value: PetsdbSortValueType;
}

export function getSortByPath(
    itemData: Readonly<Record<string, unknown>>,
    keyData: Readonly<Record<string, unknown>>
): GetSortByPathResultType {
    // eslint-disable-next-line guard-for-in
    for (const key in keyData) {
        const itemDataValue = itemData[key];
        const keyDataValue = keyData[key];

        if (
            typeof itemDataValue === "boolean" ||
            typeof itemDataValue === "number" ||
            typeof itemDataValue === "string"
        ) {
            return {
                direction: keyDataValue === -1 ? -1 : 1,
                value: itemDataValue,
            };
        }

        if (typeof itemDataValue === "object" && typeof keyDataValue === "object") {
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

export function compareObject(
    itemA: Readonly<Record<string, unknown>>,
    itemB: Readonly<Record<string, unknown>>,
    sort: Readonly<Record<string, unknown>>
): number {
    const {value: itemValueA, direction: sortDirection} = getSortByPath(itemA, sort);
    const {value: itemValueB} = getSortByPath(itemB, sort);

    if (typeof itemValueA === "number" && typeof itemValueB === "number") {
        return compareNumber(itemValueA, itemValueB) * sortDirection;
    }

    if (typeof itemValueA === "string" && typeof itemValueB === "string") {
        return compareString(itemValueA, itemValueB) * sortDirection;
    }

    if (typeof itemValueA === "boolean" && typeof itemValueB === "boolean") {
        return compareBoolean(itemValueA, itemValueB) * sortDirection;
    }

    return 0;
}

export async function getHasAccessToDirectory(...args: ReadonlyArray<string>): Promise<boolean> {
    try {
        // eslint-disable-next-line no-bitwise
        await fileSystem.access(path.join(...args), constants.R_OK | constants.W_OK);

        return true;
        // eslint-disable-next-line no-empty
    } catch {}

    return false;
}

export async function makeDirectory(...args: ReadonlyArray<string>): Promise<void> {
    const pathToFolder: string = path.join(...args);
    const hasAccessToDirectory = await getHasAccessToDirectory(pathToFolder);

    if (!hasAccessToDirectory) {
        await fileSystem.mkdir(pathToFolder);
    }
}

export async function makeDatabaseBackup(pathToDatabase: string): Promise<void> {
    const backupFolder = `${pathToDatabase}-backup`;

    await makeDirectory(backupFolder);

    const backUpFilePath = `${path.join(backupFolder, String(pathToDatabase.split("/").pop()))}-${new Date()
        .toISOString()
        .replace(/:/gu, "-")}`;

    await fileSystem.copyFile(pathToDatabase, backUpFilePath);

    console.log(`[Petsdb]: Backup has been created, path is: ${backUpFilePath}`);
}
