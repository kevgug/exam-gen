import dotenv from "dotenv";
dotenv.config();

import { readFile, writeFile } from "node:fs/promises";
import { OcrService } from "../core/services/ocr";
import { ExamService } from "../core/services/exam";
import { Exam } from "../../shared/types/exam";

if (!process.send) {
  console.error("error: no IPC. were we forked?");
  process.exit(1);
}

(async () => {
  console.log(`[WORKER#${process.pid}] beginning exam generation workflow`);

  let n: number;
  let exams: Exam[];

  const gen = async () => {
    const exam = await ExamService.generateNew({
      className: "physics",
      classDescription: "IB Physics HL",
      pastExams: exams,
    });

    process.send?.(JSON.stringify(exam));
  };

  process.on("message", (message, _) => {
    if (n === undefined) {
      n = message as number;
      exams = Array(n);
      return;
    }

    exams[--n] = JSON.parse(message as string);

    if (n == 0) gen();
  });
})();
