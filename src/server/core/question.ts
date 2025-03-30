import { Question } from "../../shared/types/question";
import OpenAI from "openai";

const openai = new OpenAI();

export class QuestionCore {
  public static async generateQuestionsFromMd(
    mdStr: string,
  ): Promise<Question[]> {
    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content:
            "You are an expert at structured data extraction. You will be given unstructured markdown of an exam and should convert it into the given structure.",
        },
        {
          role: "user",
          content: mdStr,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "question_schemes",
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                examId: { type: "string" },
                content: { type: "string" },
                diagram: { type: "string" },
                points: {
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
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "multiple-choice",
                          "numerical-response",
                          "written-response",
                        ],
                      },
                      strippedContent: { type: "string" },
                      variables: {
                        type: "object",
                        patternProperties: {
                          ".*": {
                            type: "object",
                            properties: {
                              unit: { type: "string" },
                            },
                            required: ["unit"],
                            additionalProperties: false,
                          },
                        },
                        additionalProperties: false,
                      },
                      points: { type: "number" },
                    },
                    required: [
                      "type",
                      "strippedContent",
                      "variables",
                      "points",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["examId", "content", "points", "parts"],
              additionalProperties: false,
            },
          },
        },
      },
    });

    // Parse LLM response as json
    let questions: Question[];
    try {
      questions = JSON.parse(response.output_text) as Question[];
    } catch (e: any) {
      throw new Error("failed to parse ocr output into array of questions");
    }

    return questions;
  }
}
