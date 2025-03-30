import OpenAI from "openai";
import { Exam } from "../../shared/types/exam";
import { Question, QuestionGroup } from "../../shared/types/question";

const openai = new OpenAI();

export class ExamCore {
  private static traverse = (
    questionGroup: QuestionGroup,
    fn: (node: Question | QuestionGroup) => void,
  ) => {
    const toVisit = [questionGroup];
    while (toVisit.length > 0) {
      const current = toVisit.pop();
      if (current) {
        fn(current);
        if ("subItems" in current && current.subItems) {
          toVisit.push(...(current.subItems as QuestionGroup[]));
        }
      }
    }
  };

  public static async getFromMarkdown(mdStr: string): Promise<Exam> {
    // const cleanMd = await openai.responses
    //   .create({
    //     model: "chatgpt-4o-latest",
    //     input: [
    //       {
    //         role: "system",
    //         content:
    //           "Remove artifacts from OCR as well as any page references or references to continued questions or physical pages. Output just the md, nothing else.",
    //       },
    //       {
    //         role: "user",
    //         content: mdStr,
    //       },
    //     ],
    //   })
    //   .then((response) => response.output_text);

    // console.log(cleanMd);

    const cleanMd = mdStr;

    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content:
            "You are STEM teacher. Convert the markdown exam into structured JSON. Going from a question number to question letter (a) means introducing a new question subgroup, as does going from a question letter to roman numeral (i), and so on. You must include the relevant question letter and roman numerals at the start of `content`, but never inside `contentGroup`. Question types are: multiple choice, numerical response (question asking for computation), and freeform response (question asking for explanation or reciting knowledge). For each multiple choice question, put the number of multiple choice choice options in the optional `numMultipleChoice` field. You MUST include all questions from the md.",
        },
        {
          role: "user",
          content: cleanMd,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "examSchema",
          description: "Schema for a STEM exam",
          schema: {
            type: "object",
            properties: {
              questionGroups: {
                $ref: "#/$defs/NodeList",
              },
            },
            required: ["questionGroups"],
            additionalProperties: false,
            $defs: {
              NodeList: {
                type: "array",
                items: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: [
                            "multiple-choice",
                            "freeform-response",
                            "numerical-response",
                          ],
                        },
                        content: { type: "string" },
                        multipleChoiceOptions: {
                          type: ["array", "null"],
                          items: { type: "string" },
                        },
                        points: { type: "number" },
                      },
                      required: [
                        "type",
                        "content",
                        "multipleChoiceOptions",
                        "points",
                      ],
                      additionalProperties: false,
                    },
                    {
                      type: "object",
                      properties: {
                        groupContent: { type: "string" },
                        subItems: { $ref: "#/$defs/NodeList" },
                      },
                      required: ["groupContent", "subItems"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
          strict: true,
        },
      },
    });

    // Parse LLM response as json
    let exam: Exam;
    try {
      exam = JSON.parse(response.output_text) as Exam;
    } catch (e: any) {
      throw new Error("failed to parse ocr output into array of questions");
    }

    console.log("exam", exam);

    const validQuestionGroups = exam.questionGroups.filter((questionGroup) => {
      let invalid = false;

      this.traverse(questionGroup, (node) => {
        if (
          "type" in node &&
          node.type === "multiple-choice" &&
          (!node.multipleChoiceOptions ||
            node.multipleChoiceOptions.length === 0)
        ) {
          invalid = true;
        }
      });

      return !invalid;
    });

    return {
      questionGroups: validQuestionGroups,
    } as Exam;
  }

  public static async generateNew({
    className,
    classDescription = "",
    pastExams,
  }: {
    className: string;
    classDescription: string;
    pastExams: Exam[];
  }): Promise<Exam> {
    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content: `You are teacher for the STEM class <className>${className}</className><classDescription>${classDescription}</classDescription>.\nYou are writing a new exam, based on past exams. The newly generated exam MUST be as close as possible in composition (order of questions, type of questions, weighting of different question types, use of subquestions, etc.) to all past exams. The generated exam may contain past questions exactly, under the condition that all numerical values are different. The generated exam may, and it is strongly encouraged to, contain completely novel questions, under the condition that each question tests the same material as questions in past exams.\nRecursively create the exam, building out a tree for each question using the given data structures.`,
        },
        {
          role: "user",
          content: JSON.stringify(pastExams),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "examSchema",
          description: "Schema for a STEM exam",
          schema: {
            type: "object",
            properties: {
              questionGroups: {
                $ref: "#/$defs/NodeList",
              },
            },
            required: ["questionGroups"],
            additionalProperties: false,
            $defs: {
              NodeList: {
                type: "array",
                items: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: [
                            "multiple-choice",
                            "freeform-response",
                            "numerical-response",
                          ],
                        },
                        content: { type: "string" },
                        multipleChoiceOptions: {
                          type: ["array", "null"],
                          items: { type: "string" },
                        },
                        points: { type: "number" },
                      },
                      required: [
                        "type",
                        "content",
                        "multipleChoiceOptions",
                        "points",
                      ],
                      additionalProperties: false,
                    },
                    {
                      type: "object",
                      properties: {
                        groupContent: { type: "string" },
                        subItems: { $ref: "#/$defs/NodeList" },
                      },
                      required: ["groupContent", "subItems"],
                      additionalProperties: false,
                    },
                  ],
                },
              },
            },
          },
          strict: true,
        },
      },
    });
    console.log(response.output_text);

    const newExam = JSON.parse(response.output_text) as Exam;
    return newExam;
  }
}
