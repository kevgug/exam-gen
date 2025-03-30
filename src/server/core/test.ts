import dotenv from "dotenv";
dotenv.config();
import { OcrService } from "./services/ocr";
import { readFile, writeFile } from "node:fs/promises";
import { Question, QuestionGroup } from "../../shared/types/question";
import { ExamCore } from "./exam";

const PDF_NAME = "4b51c184-b16c-49f2-900a-0f63ce40e443.pdf";

(async () => {
  // const buffer = await readFile(`./data/file/${PDF_NAME}`);
  // const md = await OcrService.extractTextFromPdf({
  //   pdfName: PDF_NAME,
  //   pdfBuffer: buffer,
  // });

  const md = (await readFile("tmp.md")).toString();
  const exam = await ExamCore.getFromMarkdown(md);
  await writeFile("tmp.json", JSON.stringify(exam));

  //   await writeFile("tmp.md", await OcrService.mdWithoutImgs(md.toString()));

  // const md = await readFile("tmp.md");
  //   const mdStr = OcrService.mdWithoutImgs(md.toString());
})();
