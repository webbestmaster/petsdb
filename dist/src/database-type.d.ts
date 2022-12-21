export type TsdbItemType<DataType> = Readonly<DataType & {
    _id: string;
}>;
export type TsdbQueryType<ItemType extends Record<string, unknown>> = Partial<{
    [Key in keyof ItemType]: ItemType[Key] extends Array<string> | string ? ItemType[Key] | RegExp : ItemType[Key] extends Record<string, unknown> ? TsdbQueryType<ItemType[Key]> : ItemType[Key];
}>;
export type TsdbSortDirectionType = -1 | 1;
export type TsdbSortValueType = boolean | number | string;
export type TsdbSortType<ItemType extends Record<string, unknown>> = Partial<{
    [Key in keyof ItemType]: ItemType[Key] extends TsdbSortValueType ? TsdbSortDirectionType : ItemType[Key] extends Record<string, unknown> ? TsdbSortType<ItemType[Key]> : never;
}>;
export type TsdbInitialConfigType = {
    dbPath: string;
};
export type TsdbReadPageConfigType<ItemType extends Record<string, unknown>> = {
    pageIndex: number;
    pageSize: number;
    sort: TsdbSortType<ItemType>;
};
export type TsdbReadPageResultType<ItemType extends Record<string, unknown>> = {
    list: Array<TsdbItemType<ItemType>>;
    pageIndex: number;
    pageSize: number;
    sort: TsdbSortType<ItemType>;
    totalItemCount: number;
    totalPageCount: number;
};
export type PromiseResolveType<Result> = (result: Result) => unknown;
