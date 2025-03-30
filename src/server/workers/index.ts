import { fork } from "node:child_process";
import { FileMetadata, multistore } from "../config";
import { Id } from "../../shared/types/common";
import { QuestionTree } from "../../shared/types/question";

export class ExamProcessingWorker {
  store: multistore;

  constructor(store: multistore) {
    this.store = store;
  }

  async start(id: Id) {
    console.log(`starting exam processing worker for ${id}`);
    const file: FileMetadata = await this.store.file.get(id);

    if (!file) {
      console.error("no file metadata found for the exam");
      return;
    }

    const process = fork(require.resolve("./process"), [file.path]);

    let n = 0;

    process.on("message", (message, _) => {
      const question: QuestionTree = JSON.parse(message.toString());

      question.examId = id;
      question.pointWeighting = {
        "multiple-choice": 0,
        "numerical-response": 0,
        "written-response": 0,
      };

      this.store.obj.set(crypto.randomUUID(), question);
      n++;
    });

    process.on("exit", (code, _) => {
      console.log(
        `finished exam processing for ${id} after ${n} questions. exiting worker...`,
      );
    });
  }
}

class ExamGenerationWorker {}
