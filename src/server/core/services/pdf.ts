import PdfPrinter from "pdfmake";
import * as fs from "node:fs";
import { Exam } from "../../../shared/types/exam";
import {
  Content,
  ContentTable,
  TDocumentDefinitions,
} from "pdfmake/interfaces";
import { QuestionGroup } from "../../../shared/types/question";

export type ExamOptions = {
  includeAnswers: boolean;
};

const MAX_QUESTION_DEPTH = 5; // (1)(a)(i)(A)(I)

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const romanNumerals = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
];

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

const INDENT_SIZE = 30;
const V_MARGIN = 15;
const V_NEW_QUESTION = 15;
const TEXT_LINE_HEIGHT = 25;

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
        bold: fontFilePath("Bold"),
        italics: fontFilePath("Regular", { isItalic: true }),
        bolditalics: fontFilePath("Bold", { isItalic: true }),
      },
    };

    const renderQuestionNum = ({
      questionNumIdx,
      depth,
    }: {
      depth: number;
      questionNumIdx: number;
    }): string => {
      switch (depth) {
        case 0:
          return `${questionNumIdx + 1}.`;
        case 1:
          return `(${alphabet.at(questionNumIdx) ?? ""})`;
        case 2:
          return `(${romanNumerals.at(questionNumIdx) ?? ""})`;
        case 3:
          return `(${alphabet.at(questionNumIdx)?.toUpperCase() ?? ""})`;
        case 4:
          return `(${romanNumerals.at(questionNumIdx)?.toUpperCase() ?? ""})`;
        default:
          return "";
      }
    };

    const questionGroup = ({
      depth,
      questionNumIdx,
      content,
      options = { isFirst: false },
    }: {
      depth: number;
      questionNumIdx: number;
      content: string;
      options?: { isFirst: boolean };
    }): Content => {
      return {
        columns: [
          {
            width: INDENT_SIZE,
            text: renderQuestionNum({ questionNumIdx, depth }),
            bold: depth === 0,
            alignment: "left",
          },
          {
            width: "*",
            text: content,
            lineHeight: 1.15,
          },
        ],
        marginLeft: INDENT_SIZE * depth,
        marginTop: options.isFirst
          ? 0
          : V_MARGIN + (depth === 0 ? V_NEW_QUESTION : 0),
      };
    };
    const answerBox = ({ numLines }: { numLines: number }): ContentTable => {
      const singleLine = () => [
        { text: "", marginTop: TEXT_LINE_HEIGHT },
        {
          canvas: [
            {
              type: "line",
              x1: TEXT_LINE_HEIGHT,
              y1: 0,
              x2: 510 - TEXT_LINE_HEIGHT,
              y2: 0,
              dash: { length: 2, space: 5 },
            },
          ],
        },
      ];

      return {
        table: {
          widths: ["*"],
          heights: ["auto"],
          body: [
            [
              {
                stack: [
                  ...Array.from({ length: numLines }, singleLine).flat(),
                  { text: "", marginTop: TEXT_LINE_HEIGHT },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: function () {
            return 1;
          },
          vLineWidth: function () {
            return 1;
          },
        },
        marginTop: 10,
      };
    };
    const writtenQuestion = ({
      depth,
      questionNumIdx,
      content,
      pointsAvailable,
      options,
    }: {
      depth: number;
      questionNumIdx: number;
      content: string;
      pointsAvailable: number;
      options?: { showPointsAvailable?: boolean; isFirst?: boolean };
    }): Content => {
      // Set defaults for options
      options = {
        showPointsAvailable: true,
        isFirst: false,
        ...options,
      };

      return {
        stack: [
          {
            columns: [
              {
                width: INDENT_SIZE,
                text: renderQuestionNum({ questionNumIdx, depth }),
                bold: depth === 0,
                alignment: "left",
              },
              {
                width: "*",
                text: content,
                lineHeight: 1.15,
              },
              options.showPointsAvailable
                ? {
                    width: "auto",
                    text: `[${pointsAvailable}]`,
                    marginLeft: 25,
                    alignment: "right",
                  }
                : { text: "" },
            ],
            marginLeft: INDENT_SIZE * depth,
            marginTop: options.isFirst
              ? 0
              : V_MARGIN + (depth === 0 ? V_NEW_QUESTION : 0),
          },
          answerBox({ numLines: pointsAvailable * 2 }),
        ],
      };
    };
    const multipleChoiceQuestion = ({
      depth,
      questionNumIdx,
      content,
      choices,
      pointsAvailable,
      options,
    }: {
      depth: number;
      questionNumIdx: number;
      content: string;
      choices: string[];
      pointsAvailable: number;
      options?: { showPointsAvailable?: boolean; isFirst?: boolean };
    }): Content => {
      // Set defaults for options
      options = {
        showPointsAvailable: true,
        isFirst: false,
        ...options,
      };

      const singleChoice = ({
        content,
        idx,
      }: {
        content: string;
        idx: number;
      }): Content => {
        return {
          columns: [
            {
              width: INDENT_SIZE,
              text: `${alphabet.at(idx)?.toUpperCase() ?? "A"}.`,
              bold: false,
              alignment: "left",
            },
            {
              width: "*",
              text: content,
              lineHeight: 1.15,
            },
          ],
          marginTop: V_MARGIN,
        };
      };

      return {
        stack: [
          {
            columns: [
              {
                width: INDENT_SIZE,
                text: renderQuestionNum({ questionNumIdx, depth }),
                bold: depth === 0,
                alignment: "left",
              },
              {
                width: "*",
                text: content,
                lineHeight: 1.15,
              },
              options.showPointsAvailable
                ? {
                    width: "auto",
                    text: `[${pointsAvailable}]`,
                    marginLeft: 25,
                    alignment: "right",
                  }
                : { text: "" },
            ],
            marginLeft: INDENT_SIZE * depth,
            marginTop: options.isFirst
              ? 0
              : V_MARGIN + (depth === 0 ? V_NEW_QUESTION : 0),
          },
          {
            marginLeft: INDENT_SIZE * (depth + 1),
            stack: choices.map((content, idx) => {
              return singleChoice({ content, idx });
            }),
          },
        ],
      };
    };

    const docDefinition: TDocumentDefinitions = {
      content: [
        questionGroup({
          depth: 0,
          questionNumIdx: 0,
          content: "question group 1",
          options: {
            isFirst: true,
          },
        }),
        questionGroup({
          depth: 1,
          questionNumIdx: 0,
          content: "question group 2",
        }),
        writtenQuestion({
          depth: 2,
          questionNumIdx: 0,
          content: "question 1",
          pointsAvailable: 2,
        }),
        writtenQuestion({
          depth: 2,
          questionNumIdx: 1,
          content: "question 2",
          pointsAvailable: 3,
        }),
        multipleChoiceQuestion({
          depth: 0,
          questionNumIdx: 1,
          content: "question 2",
          choices: ["one", "two", "three"],
          pointsAvailable: 1,
          options: {
            showPointsAvailable: false,
          },
        }),
        multipleChoiceQuestion({
          depth: 0,
          questionNumIdx: 2,
          content: "question 3",
          choices: ["one", "two", "three", "four"],
          pointsAvailable: 1,
          options: {
            showPointsAvailable: false,
          },
        }),
      ],
    };

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
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
