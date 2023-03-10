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
        return new Promise<void>((resolve: PromiseResolveType<void>, reject: PromiseResolveType<Error>): void => {
            this.taskList.push({reject, resolve, task: runningTask});

            if (!this.isWorking) {
                this.run();
            }
        });
    }

    private async run() {
        this.isWorking = true;

        const [fistTask] = this.taskList;

        this.taskList.splice(0, 1);

        if (fistTask) {
            try {
                await fistTask.task();
                fistTask.resolve();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    fistTask.reject(error);
                } else {
                    fistTask.reject(new Error('[Queue]: Task running with error!'));
                }
            }
        }

        if (this.taskList.length > 0) {
            await this.run();
            return;
        }

        this.isWorking = false;
    }
}
