export type PromiseResolveType<Result> = (result: Result) => unknown;
export type QueueRunningTaskType = () => Promise<unknown>;
export declare class Queue {
    private readonly taskList;
    private isWorking;
    constructor();
    add(runningTask: QueueRunningTaskType): Promise<undefined>;
    private run;
}
