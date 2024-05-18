import type { PetsdbSortDirectionType, PetsdbSortValueType } from "./database-type";
export declare function readFileLineByLine(pathToFile: string): Promise<Array<string>>;
export declare function deepCopy<DataType>(object: DataType): DataType;
export declare function makeRandomString(): string;
export declare function makeRandomNumber(fromInclude: number, toExclude: number): number;
export declare function getIsNotEmptyString(line: string): line is string;
export declare function getIsArrayIncludedByValue(fullArray: ReadonlyArray<unknown>, partialArray: ReadonlyArray<unknown>): boolean;
export declare function getIsArrayIncludedByRegexp(fullArray: ReadonlyArray<unknown>, partialValue: Readonly<RegExp>): boolean;
export declare function getIsIncluded(item: Readonly<Record<string, unknown>>, partial: Readonly<Record<string, unknown>>): boolean;
export interface GetSortByPathResultType {
    direction: PetsdbSortDirectionType;
    value: PetsdbSortValueType;
}
export declare function getSortByPath(itemData: Readonly<Record<string, unknown>>, keyData: Readonly<Record<string, unknown>>): GetSortByPathResultType;
export declare function compareNumber(numberA: number, numberB: number): number;
export declare function compareString(stringA: string, stringB: string): number;
export declare function compareBoolean(booleanA: boolean, booleanB: boolean): number;
export declare function compareObject(itemA: Readonly<Record<string, unknown>>, itemB: Readonly<Record<string, unknown>>, sort: Readonly<Record<string, unknown>>): number;
export declare function getHasAccessToDirectory(...args: ReadonlyArray<string>): Promise<boolean>;
export declare function makeDirectory(...args: ReadonlyArray<string>): Promise<void>;
export declare function makeDatabaseBackup(pathToDatabase: string): Promise<void>;
