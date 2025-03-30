import { QuestionRoot } from "../../shared/types/question";
import OpenAI from "openai";

const openai = new OpenAI();

export class QuestionCore {
  public static async generateQuestionsFromMd(
    mdStr: string,
  ): Promise<QuestionRoot[]> {
    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content:
            "You are an expert at structured data extraction. You will be given unstructured markdown of an exam and should convert it recursively into an exam question structure.",
        },
        {
          role: "user",
          content: mdStr,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "questionRootSchema",
          description: "Schema for a collection of exam question roots",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    examId: { type: "string" },
                    pointWeighting: {
                      type: "object",
                      properties: {
                        "multiple-choice": { type: "number" },
                        "numerical-response": { type: "number" },
                        "written-response": { type: "number" },
                      },
                      required: [
                        "multiple-choice",
                        "numerical-response",
                        "written-response",
                      ],
                      additionalProperties: false,
                    },
                    parts: {
                      $ref: "#/$defs/Parts",
                    },
                  },
                  required: ["examId", "pointWeighting", "parts"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
            $defs: {
              Parts: {
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
                            "written-response",
                            "numerical-response",
                          ],
                        },
                        content: { type: "string" },
                        children: { $ref: "#/$defs/Parts" },
                        numMultipleChoice: { type: ["number", "null"] },
                        points: { type: "number" },
                      },
                      required: [
                        "type",
                        "content",
                        "children",
                        "numMultipleChoice",
                        "points",
                      ],
                      additionalProperties: false,
                    },
                    {
                      type: "object",
                      properties: {
                        content: { type: "string" },
                        children: { $ref: "#/$defs/Parts" },
                      },
                      required: ["content", "children"],
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
    let questions: QuestionRoot[];
    try {
      questions = JSON.parse(response.output_text) as QuestionRoot[];
    } catch (e: any) {
      throw new Error("failed to parse ocr output into array of questions");
    }

    return questions;
  }
}
