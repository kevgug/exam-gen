import { fork } from "node:child_process";
import { FileMetadata, multistore } from "../config";
import { Id } from "../../shared/types/common";
import { Question } from "../../shared/types/question";
import { Exam } from "../../shared/types/exam";

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

    process.on("message", (message, _) => {
      const exam: Exam = JSON.parse(message.toString()) as Exam;

      this.store.obj.set(id, exam);
      console.log(
        `finished exam processing for ${id} after ${exam.questionGroups.length} questions. exiting worker...`,
      );
    });
  }
}

export class ExamGenerationWorker {
  store: multistore;

  constructor(store: multistore) {
    this.store = store;
  }

  async start(ids: Id[], id: Id) {
    console.log(`starting exam generation worker with ${ids.join(", ")}`);

    // TODO: check to make sure ids were correct
    const process = fork(require.resolve("./generate"));

    process.send(ids.length);

    Promise.all(
      ids.map((id) =>
        this.store.obj.get(id).then((item) => process.send(JSON.stringify(item))),
      ),
    );

    process.on("message", (message, _) => {
      const exam: Exam = JSON.parse(message.toString()) as Exam;

      exam.generated = true;
      this.store.obj.set(id, exam);

      console.log(`finished exam generation for ${id}. exiting worker...`);
    });
  }
}
