import { z } from "zod";
import { jsonSchema, Schema, zodSchema } from "ai";
import { readFile } from "fs/promises";
import { PROMPT_DIR } from "../../config";
import path from "path";
import { Exam } from "../../../shared/types/exam";

export type PromptName = "ExamCore_getFromMarkdown";
export type SchemaInfo = {
  schemaName: string;
  schemaDescription: string;
  schema: Schema;
};

export class PromptService {
  public static async sysPrompt(promptName: PromptName): Promise<string> {
    return (
      await readFile(path.join(PROMPT_DIR, `${promptName}.md`))
    ).toString();
  }

  public static schemaInfo(promptName: PromptName): SchemaInfo {
    switch (promptName) {
      case "ExamCore_getFromMarkdown":
        const ExamPartChunk = z.object({
          chunkType: z.enum(["text", "table", "image"]),
          chunkValue: z.string(),
        });
        const Exam = z.object({
          parts: z.array(
            z.object({
              partName: z.string(),
              partLevel: z.number(),
              content: z.object({
                setupChunks: z.array(ExamPartChunk).nullable(),
                task: z.string().nullable(),
              }),
              partType: z.enum(["parent", "question"]),
              questionType: z
                .enum(["write", "multipleChoice", "table", "sketch"])
                .nullable(),
              writeIsComputational: z.boolean().nullable(),
              writeNumAnswersExpected: z.number().nullable(),
              multipleChoiceOptionChunks: z.array(ExamPartChunk).nullable(),
              tableBaseMarkdown: z.string().nullable(),
              sketchBaseImage: z.string().nullable(),
              pointsAvailable: z.number().nullable(),
            }),
          ),
        });

        return {
          schemaName: "structuredExam",
          schemaDescription:
            "Hierarchical exam representation with nested parts.",
          schema: zodSchema(Exam),
        };
      default:
        throw new Error(
          `prompt '${promptName}' does not have an output schema`,
        );
    }
  }
}

/*
jsonSchema<Exam>({
            type: "object",
            properties: {
              parts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    partName: { type: "string" },
                    partLevel: { type: "number" },
                    content: {
                      type: "object",
                      properties: {
                        setupChunks: {
                          anyOf: [
                            { $ref: "#/$defs/ExamPartChunk" },
                            { type: "null" },
                          ],
                        },
                        task: { type: ["string", "null"] },
                      },
                      required: ["setupChunks", "task"],
                      additionalProperties: false,
                    },
                    partType: {
                      type: "string",
                      enum: ["parent", "question"],
                    },
                    questionType: {
                      anyOf: [
                        {
                          type: "string",
                          enum: ["write", "multipleChoice", "table", "sketch"],
                        },
                        { type: "null" },
                      ],
                    },
                    writeIsComputational: { type: ["boolean", "null"] },
                    writeNumAnswersExpected: { type: ["number", "null"] },
                    multipleChoiceOptionChunks: {
                      type: ["array", "null"],
                      items: { $ref: "#/$defs/ExamPartChunk" },
                    },
                    tableBaseMarkdown: { type: ["string", "null"] },
                    sketchBaseImage: { type: ["string", "null"] },
                    pointsAvailable: { type: ["number", "null"] },
                  },
                  required: [
                    "partName",
                    "partLevel",
                    "content",
                    "partType",
                    "questionType",
                    "writeIsComputational",
                    "writeNumAnswersExpected",
                    "multipleChoiceOptionChunks",
                    "tableBaseMarkdown",
                    "sketchBaseImage",
                    "pointsAvailable",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["parts"],
            additionalProperties: false,
            $defs: {
              ExamPartChunk: {
                type: "object",
                properties: {
                  chunkType: {
                    type: "string",
                    enum: ["text", "table", "image"],
                  },
                  chunkValue: { type: "string" },
                },
                required: ["chunkType", "chunkValue"],
                additionalProperties: false,
              },
            },
          })
*/
