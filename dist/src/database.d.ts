import { PetsdbInitialConfigType, PetsdbItemType, PetsdbQueryType, PetsdbReadPageConfigType, PetsdbReadPageResultType } from './database-type';
import { Queue } from './queue';
export declare class Petsdb<ItemType extends Record<string, unknown>> {
    static readonly queueByPath: Record<string, Queue>;
    readonly dbPath: string;
    private dataList;
    static readonly deleteIdPostfix = "-$$delete";
    constructor(initialConfig: PetsdbInitialConfigType);
    private getQueue;
    run(): Promise<void>;
    private innerRun;
    drop(): Promise<void>;
    private dropInner;
    getSize(): number;
    create(itemData: ItemType): Promise<void>;
    private createInner;
    read(itemSelector: PetsdbQueryType<ItemType>): Promise<Array<PetsdbItemType<ItemType>>>;
    readOne(itemSelector: PetsdbQueryType<ItemType>): Promise<PetsdbItemType<ItemType> | null>;
    readPage(itemSelector: PetsdbQueryType<ItemType>, readPageConfig: PetsdbReadPageConfigType<ItemType>): Promise<PetsdbReadPageResultType<ItemType>>;
    update(itemSelector: PetsdbQueryType<ItemType>, newItemData: ItemType): Promise<void>;
    private updateInner;
    delete(itemSelector: PetsdbQueryType<ItemType>): Promise<void>;
    private deleteInner;
}
