import dotenv from "dotenv";
dotenv.config();

import { PDFService } from "./services/pdf";
import { DATA_DIR, FileMetadata } from "../config";
import path from "node:path";
import { Exam } from "../../shared/types/exam";
import { readFile, writeFile } from "node:fs/promises";
import { OcrService } from "./services/ocr";
import { ExamCore } from "./exam";

const PDF_NAME = "paper2";

(async () => {
  console.log("test.ts start.");

  const inputPdf: FileMetadata = {
    filename: `${PDF_NAME}.pdf`,
    path: path.join(DATA_DIR, "file", `${PDF_NAME}.pdf`),
  };
  const inputCombinedMd = await OcrService.extractTextFromPdf({
    pdfName: inputPdf.filename,
    pdfBuffer: await readFile(inputPdf.path),
  });
  const { mdStr: inputMdStr, imgsById: inputImgsById } = inputCombinedMd;
  await writeFile(path.join(DATA_DIR, "file", "test.md"), inputMdStr);
  const inputExam = await ExamCore.getFromMarkdown(inputMdStr);
  // const inputExam: Exam = {
  //   generated: true,
  //   parts: JSON.parse(
  //     (await readFile(path.join(DATA_DIR, "file", "test.json"))).toString(),
  //   ),
  // };
  await writeFile(
    path.join(DATA_DIR, "file", "test.json"),
    JSON.stringify(inputExam),
  );
  return;

  const generatedPdf: FileMetadata = {
    filename: `${PDF_NAME}-generated.pdf`,
    path: path.join(DATA_DIR, "file", `${PDF_NAME}-generated.pdf`),
  };
  await PDFService.renderExam(generatedPdf.path, inputExam, {
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
