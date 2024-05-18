import type { PetsdbInitialConfigType, PetsdbItemType, PetsdbQueryType, PetsdbReadPageConfigType, PetsdbReadPageResultType } from "./database-type";
import { Queue } from "./queue";
export declare class Petsdb<ItemType extends Readonly<Record<string, Readonly<unknown>>>> {
    static readonly queueByPath: Record<string, Queue>;
    static readonly deleteIdPostfix: string;
    readonly dbPath: string;
    private dataList;
    constructor(initialConfig: PetsdbInitialConfigType);
    drop(): Promise<undefined>;
    run(): Promise<undefined>;
    delete(itemSelector: PetsdbQueryType<ItemType>): Promise<undefined>;
    getSize(): number;
    create(itemData: ItemType): Promise<undefined>;
    read(itemSelector: PetsdbQueryType<ItemType>): Promise<Array<PetsdbItemType<ItemType>>>;
    readOne(itemSelector: PetsdbQueryType<ItemType>): Promise<PetsdbItemType<ItemType> | null>;
    readPage(itemSelector: PetsdbQueryType<ItemType>, readPageConfig: PetsdbReadPageConfigType<ItemType>): Promise<PetsdbReadPageResultType<ItemType>>;
    update(itemSelector: PetsdbQueryType<ItemType>, updatedItemData: ItemType): Promise<undefined>;
    private getQueue;
    private innerRun;
    private dropInner;
    private createInner;
    private updateInner;
    private deleteInner;
}
