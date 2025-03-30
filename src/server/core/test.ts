import dotenv from "dotenv";
dotenv.config();
import { OcrService } from "./services/ocr";
import { readFile, writeFile } from "node:fs/promises";
import { QuestionCore } from "./question";

const PDF_NAME = "Physics_paper_2__TZ2_HL.pdf";

(async () => {
  //   const buffer = await readFile(`./data/file/${PDF_NAME}`);
  //   const md = await OcrService.extractTextFromPdf({
  //     pdfName: PDF_NAME,
  //     pdfBuffer: buffer,
  //   });
  //
  //   writeFile("tmp.md", md);

  const md = await readFile("tmp.md");
  const mdStr = OcrService.mdWithoutImgs(md.toString());
  const questions = await QuestionCore.generateQuestionsFromMd(mdStr);
  console.log(questions);
})();
