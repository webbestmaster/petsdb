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

export type PetsdbInitialConfigType = {
    dbPath: string;
};

export type PetsdbReadPageConfigType<ItemType extends Record<string, unknown>> = {
    pageIndex: number;
    pageSize: number;
    sort: PetsdbSortType<ItemType>;
};
export type PetsdbReadPageResultType<ItemType extends Record<string, unknown>> = {
    list: Array<PetsdbItemType<ItemType>>;
    pageIndex: number;
    pageSize: number;
    sort: PetsdbSortType<ItemType>;
    totalItemCount: number;
    totalPageCount: number;
};

export type PromiseResolveType<Result> = (result: Result) => unknown;
