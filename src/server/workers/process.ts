import dotenv from "dotenv";
dotenv.config();

import { readFile, writeFile } from "node:fs/promises";
import { OcrService } from "../core/services/ocr";
import { ExamCore } from "../core/exam";

if (!process.send) {
  console.error("error: no IPC. were we forked?");
  process.exit(1);
}

if (process.argv.length < 3) {
  console.error("missing path arg. does the exam exist?");
  process.exit(1);
}

const path = process.argv[2];

(async () => {
  console.log(`[WORKER#${process.pid}] beginning exam processing workflow`);

  const buffer = await readFile(path);
  const md = OcrService.mdWithoutImgs(
    (
      await OcrService.extractTextFromPdf({
        pdfName: crypto.randomUUID() + ".pdf",
        pdfBuffer: buffer,
      })
    ).toString(),
  );

  console.log(`[WORKER#${process.pid}] ocr done. parsing questions...`);
  //   writeFile("tmp.md", md);

  const exam = await ExamCore.getFromMarkdown(md);
  //   writeFile("tmp.json", JSON.stringify(exam));

  console.log(
    `[WORKER#${process.pid}] question parsing done. sending questions to parent...`,
  );

  process.send?.(JSON.stringify(exam));
})();
