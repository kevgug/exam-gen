import dotenv from "dotenv";
dotenv.config();

import { PDFService } from "./services/pdf";
import { DATA_DIR, FileMetadata } from "../config";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { OcrService } from "./services/ocr";
import { ExamService } from "./services/exam";

const PDF_NAME = "paper2";

(async () => {
  console.log("test.ts start.");

  console.log(0);
  const inputPdf: FileMetadata = {
    filename: `${PDF_NAME}.pdf`,
    path: path.join(DATA_DIR, "file", `${PDF_NAME}.pdf`),
  };
  console.log("await inputMd...");
  const inputMd = await OcrService.extractTextFromPdf({
    pdfName: inputPdf.filename,
    pdfBuffer: await readFile(inputPdf.path),
  });
  console.log("await writeFile test.md...");
  await writeFile(path.join(DATA_DIR, "file", "test.md"), inputMd.str);
  console.log("await writeFile test-imgs.md");
  await writeFile(
    path.join(DATA_DIR, "file", "test-imgs.md"),
    OcrService.fillImagesInMd(inputMd),
  );

  console.log("generating new exam...");
  const newExamMdStr = await ExamService.generateNew({
    classTitle: "IB HL Physics",
    pastExams: [inputMd.str],
  });
  await writeFile(path.join(DATA_DIR, "file", "new-exam.md"), newExamMdStr);

  console.log("done all.");
  return;
})();
