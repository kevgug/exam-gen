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

(async () => {
})();
