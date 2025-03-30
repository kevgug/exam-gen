import { fork, spawn } from "node:child_process";
import { DATA_DIR, FileMetadata, multistore } from "../config";
import { Id } from "../../shared/types/common";
import { Question, QuestionGroup } from "../../shared/types/question";
import { Exam } from "../../shared/types/exam";
import path from "path";
import { unlink, writeFile } from "node:fs/promises";

export const createMd = async (mdpath: string, exam: Exam, answer = false) => {
  let n = 0;
  const questions = exam.questionGroups
    .flatMap((group) => {
      const collectQuestions = (item: Question | QuestionGroup): string[] => {
        if ("subItems" in item) {
          return item.subItems.flatMap(collectQuestions);
        } else {
          return [item.content + answer ? "\n" + item.answer : ""];
        }
      };
      return ++n + ".\n" + collectQuestions(group);
    })
    .join("\n\n");

  const markdownContent = `# Exam Questions\n\n${questions}`;
  writeFile(mdpath, markdownContent);
};

export const convertMdPdf = async (mdpath: string, pdfpath: string) =>
  spawn("pandoc", ["--pdf-engine=lualatex", mdpath, "-o", pdfpath]);

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
        this.store.obj
          .get(id)
          .then((item) => process.send(JSON.stringify(item))),
      ),
    );

    process.on("message", (message, _) => {
      const exam: Exam = JSON.parse(message.toString()) as Exam;

      exam.generated = true;
      this.store.obj.set(id, exam);

      console.log(`finished exam generation for ${id}. generating pdf...`);

      const mdpath = path.join(DATA_DIR, "tmp", `${id}.md`);

      try {
        createMd(mdpath, exam);
        createMd(mdpath + ".graded", exam, true);
      } catch (e) {
        console.log(
          "pandoc not installed. skipping markdown and pdf generation...",
        );
        return;
      }

      console.log("markdown file generated. converting to pdf...");
      const file: FileMetadata = {
        filename: `${id}.pdf`,
        path: path.join(DATA_DIR, "file", `${id}.pdf`),
      };

      convertMdPdf(mdpath, file.path).then((process) =>
        process.on("exit", async () => {
          console.log("pdf file generated... removing markdown file...");
          await unlink(mdpath);
          console.log(`finished pdf generation for ${id}. exiting worker...`);
        }),
      );
      this.store.file.set(id, file);
    });
  }
}
