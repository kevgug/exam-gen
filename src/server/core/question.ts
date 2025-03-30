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
          name: "questionRootList",
          description: "Array of exam question root objects",
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                examId: {
                  type: "string",
                  description: "Unique identifier of the exam",
                },
                pointWeighting: {
                  type: "object",
                  description:
                    "Normalized point distribution between question types",
                  properties: {
                    "multiple-choice": {
                      type: "number",
                    },
                    "numerical-response": {
                      type: "number",
                    },
                    "written-response": {
                      type: "number",
                    },
                  },
                  required: [
                    "multiple-choice",
                    "numerical-response",
                    "written-response",
                  ],
                  additionalProperties: false,
                },
                parts: {
                  type: "array",
                  description: "Root-level question parts",
                  items: { $ref: "#/$defs/QuestionOrWrapper" },
                },
              },
              required: ["examId", "pointWeighting", "parts"],
              additionalProperties: false,
            },
            $defs: {
              QuestionOrWrapper: {
                type: "object",
                oneOf: [
                  { $ref: "#/$defs/Question" },
                  { $ref: "#/$defs/QuestionWrapper" },
                ],
              },
              Question: {
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
                  content: {
                    type: "string",
                  },
                  children: {
                    type: "array",
                    items: { $ref: "#/$defs/QuestionOrWrapper" },
                  },
                  numMultipleChoice: {
                    type: ["number", "null"],
                  },
                  points: {
                    type: "number",
                  },
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
              QuestionWrapper: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                  },
                  children: {
                    type: "array",
                    items: { $ref: "#/$defs/QuestionOrWrapper" },
                  },
                },
                required: ["content", "children"],
                additionalProperties: false,
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
