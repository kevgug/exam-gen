import PdfPrinter from "pdfmake";
import * as fs from "node:fs";
import { Exam } from "../../../shared/types/exam";
import { ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";

export type ExamOptions = {
  includeAnswers: boolean;
};

const MAX_QUESTION_DEPTH = 5; // (1)(a)(i)(A)(I)
const TAB_SIZE = 4;

type FontWeight =
  | "Thin"
  | "ExtraLight"
  | "Light"
  | "Regular"
  | "Medium"
  | "SemiBold"
  | "Bold"
  | "ExtraBold"
  | "Black";
type FontOptions = { isItalic: boolean };

export class PDFService {
  public static async renderExam(
    path: string,
    exam: Exam,
    options: ExamOptions = { includeAnswers: false },
  ): Promise<any> {
    const fontsDir = "src/server/core/services/pdfFonts/";
    const fontFamily = "Roboto";
    const fontFilePath = (
      weight: FontWeight,
      options: FontOptions = { isItalic: false },
    ) => {
      if (weight === "Regular" && options.isItalic) {
        // for regular italic, font is only "-Italic"
        return `${fontsDir}${fontFamily}-Italic.ttf`;
      }
      return `${fontsDir}${fontFamily}-${weight}${
        options.isItalic ? "Italic" : ""
      }.ttf`;
    };
    const fonts = {
      Roboto: {
        normal: fontFilePath("Regular"),
        bold: fontFilePath("Medium"),
        italics: fontFilePath("Regular", { isItalic: true }),
        bolditalics: fontFilePath("Medium", { isItalic: true }),
      },
    };
    const printer = new PdfPrinter(fonts);
    console.log("path:", path);
    const docDefinition: TDocumentDefinitions = {
      content: [
        // Properly typed column structure
        {
          columns: [
            {
              width: "auto",
              text: "(a)",
              bold: true,
              alignment: "left",
            },
            {
              width: "*",
              text: [
                "This is multiline text that wraps onto the next few lines. Lorem ipsum dolor ipsumao dolor ipsum dolor ipsum dolor ipsum dolor.",
              ],
              margin: [16, 0, 16, 0],
              lineHeight: 1.5,
            },
            {
              width: "auto",
              text: "[2]",
              alignment: "right",
            },
          ],
        },

        // Properly typed table structure
        {
          margin: [0, 5, 0, 15],
          table: {
            widths: ["*"],
            heights: [100],
            body: [[{ text: "" }]],
          },
          layout: {
            hLineWidth: function () {
              return 1;
            },
            vLineWidth: function () {
              return 1;
            },
          },
        } as ContentTable,
      ],
      // defaultStyle: {
      //   font: "Helvetica",
      // },
    };

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(path));
    pdfDoc.end();
    return;

    /*
    [1, 0, 0, 0, 0] for (1)
    [1, 1, 0, 0, 0] for (1)(a)
    [1, 1, 1, 0, 0] for (1)(a)(i)
    [1, 1, 1, 1, 0] for (1)(a)(i)(A)
    [1, 1, 1, 1, 1] for (1)(a)(i)(A)(I)
  
    [2, 1, 0, 0, 0] for (2)(a)
    [2, 2, 1, 0, 0] for (2)(b)(i)
    [2, 2, 2, 0, 0] for (2)(b)(ii)
    */
    let questionIndices: number[] = [1, 0, 0, 0, 0]; // (1)(a)(i)(A)(I)

    const stepIntoSubquestion = () => {
      if (questionIndices[MAX_QUESTION_DEPTH - 1] !== 0) {
        throw new Error(
          `exceeded max question depth ${MAX_QUESTION_DEPTH}: cannot step into subquestion`,
        );
      }
      for (let depthIdx = 0; depthIdx < MAX_QUESTION_DEPTH; depthIdx++) {
        const questionIdx = questionIndices[depthIdx];
        if (questionIdx === 0) {
          questionIndices[depthIdx] = 1; // set subquestion to first
          return;
        }
      }
    };
    const nextQuestion = () => {};
  }
}
