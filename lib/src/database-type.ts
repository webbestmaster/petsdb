// eslint-disable-next-line id-match
export type PetsdbItemType<DataType> = Readonly<DataType & {_id: string}>;

export type PetsdbQueryType<ItemType extends Record<string, unknown>> = Partial<{
    [Key in keyof ItemType]: ItemType[Key] extends Array<string> | string
        ? ItemType[Key] | RegExp
        : ItemType[Key] extends Record<string, unknown>
        ? PetsdbQueryType<ItemType[Key]>
        : ItemType[Key];
}>;

export type PetsdbSortDirectionType = -1 | 1;
export type PetsdbSortValueType = boolean | number | string;

export type PetsdbSortType<ItemType extends Record<string, unknown>> = Partial<{
    [Key in keyof ItemType]: ItemType[Key] extends PetsdbSortValueType
        ? PetsdbSortDirectionType
        : ItemType[Key] extends Record<string, unknown>
        ? PetsdbSortType<ItemType[Key]>
        : never;
}>;

export interface PetsdbInitialConfigType {
    readonly dbPath: string;
}

export interface PetsdbReadPageConfigType<ItemType extends Record<string, unknown>> {
    readonly pageIndex: number;
    readonly pageSize: number;
    readonly sort: PetsdbSortType<ItemType>;
}
export interface PetsdbReadPageResultType<ItemType extends Record<string, unknown>> {
    readonly list: Array<PetsdbItemType<ItemType>>;
    readonly pageIndex: number;
    readonly pageSize: number;
    readonly sort: PetsdbSortType<ItemType>;
    readonly totalItemCount: number;
    readonly totalPageCount: number;
}

export type PromiseResolveType<Result> = (result: Result) => unknown;
