export type PromiseResolveType<Result> = (result: Result) => unknown;
export type QueueRunningTaskType = () => Promise<unknown> | unknown;
export declare class Queue {
    private taskList;
    private isWorking;
    constructor();
    add(runningTask: QueueRunningTaskType): Promise<void>;
    private run;
}
