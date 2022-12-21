import { PetsdbSortDirectionType, PetsdbSortValueType } from './database-type';
export declare function readFileLineByLine(pathToFile: string): Promise<Array<string>>;
export declare function deepCopy<DataType>(object: DataType): DataType;
export declare function makeRandomString(): string;
export declare function makeRandomNumber(fromInclude: number, toExclude: number): number;
export declare function getIsNotEmptyString(line: string): line is string;
export declare function getIsArrayIncludedByValue(fullArray: Array<unknown>, partialArray: Array<unknown>): boolean;
export declare function getIsArrayIncludedByRegexp(fullArray: Array<unknown>, partialValue: RegExp): boolean;
export declare function getIsIncluded(item: Record<string, unknown>, partial: Record<string, unknown>): boolean;
export type GetSortByPathResultType = {
    direction: PetsdbSortDirectionType;
    value: PetsdbSortValueType;
};
export declare function getSortByPath(itemData: Record<string, unknown>, keyData: Record<string, unknown>): GetSortByPathResultType;
export declare function compareNumber(numberA: number, numberB: number): number;
export declare function compareString(stringA: string, stringB: string): number;
export declare function compareBoolean(booleanA: boolean, booleanB: boolean): number;
export declare function compareObject(itemA: Record<string, unknown>, itemB: Record<string, unknown>, sort: Record<string, unknown>): number;
export declare function makeDatabaseBackup(pathToDatabase: string): Promise<void>;
