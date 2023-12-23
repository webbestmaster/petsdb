// eslint-disable-next-line id-match
export type PetsdbItemType<DataType> = Readonly<DataType & {_id: string}>;

export type PetsdbQueryType<ItemType extends Record<string, unknown>> = Readonly<
    Partial<{
        [Key in keyof ItemType]: ItemType[Key] extends Array<string> | ReadonlyArray<string> | string
            ? Readonly<ItemType[Key] | RegExp>
            : ItemType[Key] extends Record<string, unknown>
              ? PetsdbQueryType<ItemType[Key]>
              : Readonly<ItemType[Key]>;
    }>
>;

export type PetsdbSortDirectionType = -1 | 1;
export type PetsdbSortValueType = boolean | number | string;

export type PetsdbSortType<ItemType extends Record<string, unknown>> = Readonly<
    Partial<{
        [Key in keyof ItemType]: ItemType[Key] extends PetsdbSortValueType
            ? Readonly<PetsdbSortDirectionType>
            : ItemType[Key] extends Record<string, unknown>
              ? Readonly<PetsdbSortType<ItemType[Key]>>
              : never;
    }>
>;

export interface PetsdbInitialConfigType {
    readonly dbPath: string;
}

export interface PetsdbReadPageConfigType<ItemType extends Record<string, unknown>> {
    readonly pageIndex: number;
    readonly pageSize: number;
    readonly sort: PetsdbSortType<ItemType>;
}

export interface PetsdbReadPageResultType<ItemType extends Record<string, unknown>> {
    readonly list: ReadonlyArray<PetsdbItemType<ItemType>>;
    readonly pageIndex: number;
    readonly pageSize: number;
    readonly sort: PetsdbSortType<ItemType>;
    readonly totalItemCount: number;
    readonly totalPageCount: number;
}

export type PromiseResolveType<Result> = (result: Result) => unknown;
