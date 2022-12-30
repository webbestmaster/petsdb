export type PromiseResolveType<Result> = (result: Result) => unknown;
export type QueueRunningTaskType = () => Promise<unknown> | unknown;

type QueueTaskType = {
    reject: PromiseResolveType<Error>;
    resolve: PromiseResolveType<void>;
    task: QueueRunningTaskType;
};

export class Queue {
    private taskList: Array<QueueTaskType> = [];

    private isWorking = false;

    constructor() {
        this.taskList = [];
        this.isWorking = false;
    }

    add(runningTask: QueueRunningTaskType): Promise<void> {
        return new Promise<void>(
            (resolve: PromiseResolveType<void>, reject: PromiseResolveType<Error>): Promise<void> => {
                this.taskList.push({reject, resolve, task: runningTask});

                return this.isWorking ? Promise.resolve() : this.run();
            }
        );
    }

    private async run() {
        this.isWorking = true;
        const [fistTask] = this.taskList;

        if (fistTask) {
            try {
                await fistTask.task();
                fistTask.resolve();
            } catch {
                fistTask.reject(new Error('[Queue]: Task running with error!'));
            }
        }

        this.taskList.splice(0, 1);

        if (this.taskList.length > 0) {
            await this.run();
            return;
        }

        this.isWorking = false;
    }
}
