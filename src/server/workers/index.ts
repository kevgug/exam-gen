import { fork } from "node:child_process";
import { multistore } from "../config";

export class ExamProcessingWorker {
  store: multistore

  constructor(store: multistore) {
    this.store = store;
  }

  run() {
    const process = fork(require.resolve("./generate"));

    process.on("message", (message, _) => {
    });
  }
}

class ExamGenerationWorker {}
