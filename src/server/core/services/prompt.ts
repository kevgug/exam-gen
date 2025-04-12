import { z } from "zod";
import { Schema, zodSchema } from "ai";
import { readFile } from "fs/promises";
import { PROMPT_DIR } from "../../config";
import path from "path";

export type PromptName =
  | "ExamCore_getFromMarkdown"
  | "OcrService_reviseCombinedMd";
export type SchemaInfo = {
  schemaName: string;
  schemaDescription: string;
  schema: Schema;
};

export class Prompt {
  private _text: string;

  constructor(text: string) {
    this._text = text;
  }

  get text() {
    return this._text;
  }

  fillVar(varName: string, fillValue: string): Prompt {
    return new Prompt(this.text.replace(`{{${varName}\\}}`, fillValue));
  }
}

export class PromptService {
  public static async system(promptName: PromptName): Promise<Prompt> {
    return new Prompt(
      (await readFile(path.join(PROMPT_DIR, `${promptName}.md`))).toString(),
    );
  }

  public static schemaInfo(promptName: PromptName): SchemaInfo {
    switch (promptName) {
      case "ExamCore_getFromMarkdown":
        const ExamPartChunk = z.object({
          chunkType: z.enum(["text", "table", "image"]),
          chunkValue: z.string(),
          chunkRole: z.enum(["context", "task", "answerField", "answerOption"]),
        });
        const Exam = z.object({
          parts: z.array(
            z.object({
              partName: z.string(),
              partLevel: z.number(),
              contentChunks: z.array(ExamPartChunk).nullable(),
              partRole: z.enum(["context", "task"]),
              taskDetails: z
                .object({
                  questionType: z.enum([
                    "write",
                    "multipleChoice",
                    "table",
                    "sketch",
                  ]),
                  pointsAvailable: z.number().nullable(),
                  isComputational: z.boolean(),
                  write_numAnswersExpected: z.number().nullable(),
                  multipleChoice_type: z
                    .enum(["single", "multiple"])
                    .nullable(),
                })
                .nullable(),
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
