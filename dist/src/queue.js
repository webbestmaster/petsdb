"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor() {
        this.taskList = [];
        this.isWorking = false;
        this.taskList = [];
        this.isWorking = false;
    }
    add(runningTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.taskList.push({ reject, resolve, task: runningTask });
                if (!this.isWorking) {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this.run();
                }
            });
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isWorking = true;
            const fistTask = this.taskList.at(0);
            this.taskList.splice(0, 1);
            if (fistTask) {
                try {
                    yield fistTask.task();
                    // eslint-disable-next-line no-undefined
                    fistTask.resolve(undefined);
                }
                catch (error) {
                    if (error instanceof Error) {
                        fistTask.reject(error);
                    }
                    else {
                        fistTask.reject(new Error("[Queue]: Task running with error!"));
                    }
                }
            }
            if (this.taskList.length > 0) {
                yield this.run();
                return;
            }
            this.isWorking = false;
        });
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map