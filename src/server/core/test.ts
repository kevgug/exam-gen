import dotenv from "dotenv";
dotenv.config();
import { OcrService } from "./services/ocr";
import { readFile, writeFile } from "node:fs/promises";
import { QuestionCore } from "./question";
import {
  QuestionGroupNode,
  QuestionNode,
  QuestionTree,
} from "../../shared/types/question";

const PDF_NAME = "4b51c184-b16c-49f2-900a-0f63ce40e443.pdf";
const traverse = (
  tree: QuestionTree,
  fn: (node: QuestionNode | QuestionGroupNode) => void,
) => {
  const toVisit = [...tree.root];
  while (toVisit.length > 0) {
    const current = toVisit.pop();
    if (current) {
      fn(current);
      if ("children" in current && current.children) {
        toVisit.push(...current.children);
      }
    }
  }
};

(async () => {
  // const buffer = await readFile(`./data/file/${PDF_NAME}`);
  // const md = await OcrService.extractTextFromPdf({
  //   pdfName: PDF_NAME,
  //   pdfBuffer: buffer,
  // });

  // await writeFile("tmp.md", await OcrService.mdWithoutImgs(md.toString()));

    const md = await readFile("tmp.md");
    const mdStr = OcrService.mdWithoutImgs(md.toString());
    const questions = await QuestionCore.generateQuestionsFromMd(mdStr);
    await writeFile("tmp.json", JSON.stringify(questions));
})();
