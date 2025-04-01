import PdfPrinter from "pdfmake";
import * as fs from "node:fs";
import { Exam } from "../../../shared/types/exam";
import { ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
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
    }): TDocumentDefinitions["content"] => {
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
            text: [content],
            lineHeight: 1.15,
          },
        ],
        marginLeft: INDENT_SIZE * depth,
        marginTop: options.isFirst ? 0 : V_MARGIN,
      };
    };

    const answerBox = ({ numLines }: { numLines: number }): ContentTable => {
      const singleLine = [
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
                  ...Array.from({ length: numLines }, () =>
                    JSON.parse(JSON.stringify(singleLine)),
                  ).flat(),
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
      options = { showPointsAvailable: true, isFirst: false },
    }: {
      depth: number;
      questionNumIdx: number;
      content: string;
      pointsAvailable: number;
      options?: { showPointsAvailable: boolean; isFirst: boolean };
    }): TDocumentDefinitions["content"] => {
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
                text: [content],
                lineHeight: 1.15,
              },
              {
                width: "auto",
                text: `[${pointsAvailable}]`,
                marginLeft: 25,
                alignment: "right",
              },
            ],
            marginLeft: INDENT_SIZE * depth,
            marginTop: options.isFirst ? 0 : V_MARGIN,
          },
          answerBox({ numLines: pointsAvailable * 2 }),
        ],
      };
    };

    const docDefinition: TDocumentDefinitions = {
      content: [
        questionGroup({
          depth: 0,
          questionNumIdx: 0,
          content: "question group 1",
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

        // Question group: 1.
        {
          columns: [
            {
              width: INDENT_SIZE,
              text: "1.",
              bold: true,
              alignment: "left",
            },
            {
              width: "*",
              text: [
                "A ball of mass 0.800 kg is attached to a string. The distance to the centre of the mass of the ball from the point of support is 95.0 cm. The ball is released from rest when the string is horizontal. When the string becomes vertical the ball collides with a block of mass 2.40 kg that is at rest on a horizontal surface.",
              ],
              lineHeight: 1.15,
            },
          ],
          marginLeft: 0,
          marginTop: 0,
        },
        // Question group: (a)
        {
          columns: [
            {
              width: INDENT_SIZE,
              text: "(a)",
              bold: false,
              alignment: "left",
            },
            {
              width: "*",
              text: ["Just before the collision of the ball with the block,"],
              lineHeight: 1.15,
            },
          ],
          marginLeft: INDENT_SIZE,
          marginTop: V_MARGIN,
        },

        // Question: (i)
        {
          columns: [
            {
              width: INDENT_SIZE,
              text: "(i)",
              bold: false,
              alignment: "left",
            },
            {
              width: "*",
              text: ["draw a free-body diagram for the ball."],
              lineHeight: 1.15,
            },
            {
              width: "auto",
              text: "[2]",
              marginLeft: 25,
              alignment: "right",
            },
          ],
          marginLeft: INDENT_SIZE * 2,
          marginTop: V_MARGIN,
        },
        // Answer box: (i)
        {
          table: {
            widths: ["*"],
            heights: ["auto"],
            body: [
              [
                {
                  stack: [
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
        } as ContentTable,
        // Multiple choice question: 1
        {
          columns: [
            {
              width: INDENT_SIZE,
              text: "2.",
              bold: true,
              alignment: "left",
            },
            {
              width: "*",
              text: [
                "The magnitude of the resultant of two forces acting on a body is 12 N. Which pair of forces acting on the body can combine to produce this resultant?",
              ],
              lineHeight: 1.15,
            },
            // {
            //   width: "auto",
            //   text: "[1]",
            //   marginLeft: 25,
            //   alignment: "right",
            // },
          ],
          marginLeft: 0,
          marginTop: 2 * V_MARGIN,
        },
        // Multiple choice options: 1
        {
          stack: [
            {
              columns: [
                {
                  width: INDENT_SIZE,
                  text: "A.",
                  bold: false,
                  alignment: "left",
                },
                {
                  width: "*",
                  text: ["1 N and 2 N"],
                  lineHeight: 1.15,
                },
              ],
              marginLeft: INDENT_SIZE,
              marginTop: V_MARGIN,
            },
            {
              columns: [
                {
                  width: INDENT_SIZE,
                  text: "B.",
                  bold: false,
                  alignment: "left",
                },
                {
                  width: "*",
                  text: ["1 N and 14 N"],
                  lineHeight: 1.15,
                },
              ],
              marginLeft: INDENT_SIZE,
              marginTop: V_MARGIN,
            },
            {
              columns: [
                {
                  width: INDENT_SIZE,
                  text: "C.",
                  bold: false,
                  alignment: "left",
                },
                {
                  width: "*",
                  text: ["5 N and 6 N"],
                  lineHeight: 1.15,
                },
              ],
              marginLeft: INDENT_SIZE,
              marginTop: V_MARGIN,
            },
            {
              columns: [
                {
                  width: INDENT_SIZE,
                  text: "D.",
                  bold: false,
                  alignment: "left",
                },
                {
                  width: "*",
                  text: ["6 N and 7 N"],
                  lineHeight: 1.15,
                },
              ],
              marginLeft: INDENT_SIZE,
              marginTop: V_MARGIN,
            },
          ],
        },
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
