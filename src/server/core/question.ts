import {
  QuestionGroupNode,
  QuestionNode,
  QuestionTree,
} from "../../shared/types/question";
import OpenAI from "openai";

const openai = new OpenAI();

const traverse = (
  tree: QuestionTree,
  fn: (node: QuestionNode | QuestionGroupNode) => void,
) => {
  const toVisit = [...tree.root];
  while (toVisit.length > 0) {
    const current = toVisit.pop();
    if (current) {
      fn(current);
      if ("children" in current && current.children) {
        toVisit.push(...current.children);
      }
    }
  }
};

export class QuestionCore {
  public static async generateQuestionsFromMd(
    mdStr: string,
  ): Promise<QuestionTree[]> {
    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content:
            "You are STEM teacher parsing markdown into structured JSON. Given the unstructured markdown, recursively process each question, building out a tree for each question using the given data structures. Never include the answer in the question content; only for multiple choice make note of number of multiple-choice options in `numMultipleChoice`. You MUST include all questions from the md in the trees.",
        },
        {
          role: "user",
          content: mdStr,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "examSchema",
          description:
            "Schema for questions in a STEM exam. Each question is represented by a tree",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    root: {
                      $ref: "#/$defs/Nodes",
                    },
                  },
                  required: ["root"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
            $defs: {
              Nodes: {
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
                        numMultipleChoice: { type: ["number", "null"] },
                        multipleChoiceOptions: {
                          type: ["array", "null"],
                          items: { type: "string" },
                        },
                        points: { type: "number" },
                      },
                      required: [
                        "type",
                        "content",
                        "numMultipleChoice",
                        "multipleChoiceOptions",
                        "points",
                      ],
                      additionalProperties: false,
                    },
                    {
                      type: "object",
                      properties: {
                        content: { type: "string" },
                        children: { $ref: "#/$defs/Nodes" },
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
    let questions;
    try {
      questions = (
        JSON.parse(response.output_text) as { questions: QuestionTree[] }
      ).questions;
    } catch (e: any) {
      throw new Error("failed to parse ocr output into array of questions");
    }

    return questions.filter((tree) => {
      let invalid = false;

      traverse(tree, (node) => {
        if ("type" in node && !node.numMultipleChoice) {
          invalid = true;
        }
      });

      return !invalid;
    });
  }
}
