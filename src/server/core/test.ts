import dotenv from "dotenv";
dotenv.config();
import { OcrService } from "./services/ocr";
import { readFile, writeFile } from "node:fs/promises";

const PDF_NAME = "4b51c184-b16c-49f2-900a-0f63ce40e443.pdf";

(async () => {
    // const buffer = await readFile(`./data/file/${PDF_NAME}`)
    // const md = await OcrService.extractTextFromPdf({
    //     pdfName: PDF_NAME,
    //     pdfBuffer: buffer
    // });

    // writeFile("tmp.md", md);

    const md = await readFile("tmp.md");
    console.log(md);
})();
