import OpenAI from "openai";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Exam, ExamPart } from "../../../shared/types/exam";
import { ComputeAnswerService } from "./computeAnswer";
import { PromptService } from "./prompt";

export class ExamService {
  public static async getFromMarkdown(mdStr: string): Promise<Exam> {
    // Invoke LLM
    const schemaInfo = PromptService.schemaInfo("ExamService_markdownToJson");
    const system = await PromptService.system("ExamService_markdownToJson");
    const { object } = await generateObject({
      model: openai("o3-mini"),
      system: system.text,
      ...schemaInfo,
      prompt: mdStr,
    });

    // Parse LLM response as json
    let exam: Exam;
    try {
      exam = object as Exam;
    } catch (e: any) {
      throw new Error("failed to parse ocr output into array of questions");
    }

    console.log("exam", exam);

    return exam;
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
    return { parts: [] };
    /*
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content: `You are teacher for the STEM class <className>${className}</className><classDescription>${classDescription}</classDescription>.\nYou are writing a new exam, based on past exams. The newly generated exam MUST be as close as possible in composition (order of questions, type of questions, weighting of different question types, use of subquestions, etc.) to all past exams. The generated exam may contain past questions exactly, under the condition that all numerical values are different. The generated exam may, and it is strongly encouraged to, contain completely novel questions, under the condition that each question tests the same material as questions in past exams. For each multiple choice question, the answer choices must be set as the multipleChoiceOptions. \nRecursively create the exam, building out a tree for each question using the given data structures.`,
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
                        multipleChoiceOptionCount: {
                          type: ["number", "null"],
                        },
                        multipleChoiceOptions: {
                          type: ["array", "null"],
                          items: { type: "string" },
                        },
                        points: { type: "number" },
                      },
                      required: [
                        "type",
                        "content",
                        "multipleChoiceOptionCount",
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

    console.log("before:\n", JSON.stringify(newExam));

    let prevParts: ExamPart[] = [];
    for (const part of newExam.parts) {
      // Reset previous parts array at root question
      if (part.partLevel === 0) {
        prevParts = [];
      }

      // Generate answers
      if (part.partType === "question") {
        part.answerChunks = await ComputeAnswerService.answer({
          prevParts: prevParts,
          currPart: part,
        });
      }
      prevParts.push(part);
    }

    console.log("with answers:\n", JSON.stringify(newExam));

    return newExam;
    */
  }
}
