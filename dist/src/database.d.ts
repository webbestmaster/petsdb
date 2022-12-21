import { TsdbInitialConfigType, TsdbItemType, TsdbQueryType, TsdbReadPageConfigType, TsdbReadPageResultType } from './database-type';
export declare class Petsdb<ItemType extends Record<string, unknown>> {
    private dbPath;
    private dataList;
    static deleteIdPostfix: string;
    constructor(initialConfig: TsdbInitialConfigType);
    run(): Promise<void>;
    drop(): Promise<void>;
    getSize(): number;
    create(itemData: ItemType): Promise<void>;
    read(itemSelector: TsdbQueryType<ItemType>): Promise<Array<TsdbItemType<ItemType>>>;
    readOne(itemSelector: TsdbQueryType<ItemType>): Promise<TsdbItemType<ItemType> | null>;
    readPage(itemSelector: TsdbQueryType<ItemType>, readPageConfig: TsdbReadPageConfigType<ItemType>): Promise<TsdbReadPageResultType<ItemType>>;
    update(itemSelector: TsdbQueryType<ItemType>, newItemData: ItemType): Promise<void>;
    delete(itemSelector: TsdbQueryType<ItemType>): Promise<void>;
}
