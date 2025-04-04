import dotenv from "dotenv";
dotenv.config();

import { PDFService } from "./services/pdf";
import { DATA_DIR, FileMetadata } from "../config";
import path from "node:path";
import { Exam } from "../../shared/types/exam";

const PDF_NAME = "4b51c184-b16c-49f2-900a-0f63ce40e443.pdf";

(async () => {
  console.log("test.ts start.");

  const id = "test";
  const pdfFileMetadata: FileMetadata = {
    filename: `${id}.pdf`,
    path: path.join(DATA_DIR, "file", `${id}.pdf`),
  };

  const exam: Exam = {
    generated: true,
    questionGroups: [],
  };

  await PDFService.renderExam(pdfFileMetadata.path, exam, {
    includeAnswers: false,
  });

  console.log("test.ts done.");

  // const buffer = await readFile(`./data/file/${PDF_NAME}`);
  // const md = await OcrService.extractTextFromPdf({
  //   pdfName: PDF_NAME,
  //   pdfBuffer: buffer,
  // });

  //   const md = (await readFile("tmp.md")).toString();
  //   const exam = await ExamCore.getFromMarkdown(md);
  //   await writeFile("tmp.json", JSON.stringify(exam));

  //   await writeFile("tmp.md", await OcrService.mdWithoutImgs(md.toString()));

  // const md = await readFile("tmp.md");
  //   const mdStr = OcrService.mdWithoutImgs(md.toString());
})();
