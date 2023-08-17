export type PromiseResolveType<Result> = (result: Result) => unknown;
export type QueueRunningTaskType = () => Promise<unknown>;

interface QueueTaskType {
    reject: PromiseResolveType<Error>;
    resolve: PromiseResolveType<undefined>;
    task: QueueRunningTaskType;
}

export class Queue {
    private readonly taskList: Array<QueueTaskType> = [];

    private isWorking = false;

    public constructor() {
        this.taskList = [];
        this.isWorking = false;
    }

    public async add(runningTask: QueueRunningTaskType): Promise<undefined> {
        return new Promise<undefined>(
            (resolve: PromiseResolveType<undefined>, reject: PromiseResolveType<Error>): undefined => {
                this.taskList.push({reject, resolve, task: runningTask});

                if (!this.isWorking) {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this.run();
                }
            }
        );
    }

    private async run() {
        this.isWorking = true;

        const fistTask = this.taskList.at(0);

        this.taskList.splice(0, 1);

        if (fistTask) {
            try {
                await fistTask.task();
                // eslint-disable-next-line no-undefined, unicorn/no-useless-undefined
                fistTask.resolve(undefined);
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
