import { PetsdbInitialConfigType, PetsdbItemType, PetsdbQueryType, PetsdbReadPageConfigType, PetsdbReadPageResultType } from './database-type';
export declare class Petsdb<ItemType extends Record<string, unknown>> {
    static readonly runningPromise: Record<string, Promise<void> | void>;
    readonly dbPath: string;
    private dataList;
    static readonly deleteIdPostfix = "-$$delete";
    constructor(initialConfig: PetsdbInitialConfigType);
    run(): Promise<void>;
    private innerRun;
    drop(): Promise<void>;
    getSize(): number;
    create(itemData: ItemType): Promise<void>;
    read(itemSelector: PetsdbQueryType<ItemType>): Promise<Array<PetsdbItemType<ItemType>>>;
    readOne(itemSelector: PetsdbQueryType<ItemType>): Promise<PetsdbItemType<ItemType> | null>;
    readPage(itemSelector: PetsdbQueryType<ItemType>, readPageConfig: PetsdbReadPageConfigType<ItemType>): Promise<PetsdbReadPageResultType<ItemType>>;
    update(itemSelector: PetsdbQueryType<ItemType>, newItemData: ItemType): Promise<void>;
    delete(itemSelector: PetsdbQueryType<ItemType>): Promise<void>;
}
