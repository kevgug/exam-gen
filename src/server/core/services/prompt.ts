import { z } from "zod";
import { Schema, zodSchema } from "ai";
import { readFile } from "fs/promises";
import { PROMPT_DIR } from "../../config";
import path from "path";

export type SystemPromptName =
  | "ExamService_markdownToJson"
  | "ExamService_newExam"
  | "OcrService_generateImgAlts"
  | "OcrService_reviseOcrMarkdown";
export type UserPromptName = "ExamService_newExam";
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

  fillVars(fillValues: Record<string, string>): Prompt {
    let newText = this.text;
    for (const [varName, fillValue] of Object.entries(fillValues)) {
      newText = newText.replace(`{{${varName}\}}`, fillValue);
    }
    return new Prompt(newText);
  }
}

export class PromptService {
  public static async system(promptName: SystemPromptName): Promise<Prompt> {
    return new Prompt(
      (
        await readFile(path.join(PROMPT_DIR, "system", `${promptName}.md`))
      ).toString(),
    );
  }

  public static async user(promptName: UserPromptName): Promise<Prompt> {
    return new Prompt(
      (
        await readFile(path.join(PROMPT_DIR, "user", `${promptName}.md`))
      ).toString(),
    );
  }

  public static schemaInfo(promptName: SystemPromptName): SchemaInfo {
    switch (promptName) {
      case "ExamService_markdownToJson":
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
      case "OcrService_generateImgAlts":
        const ImgDescriptions = z.array(
          z.object({
            description: z.string(),
            isValid: z.boolean(),
          }),
        );

        return {
          schemaName: "imgAltDescriptions",
          schemaDescription: "Alt descriptions for an array of exam images.",
          schema: zodSchema(ImgDescriptions),
        };
      default:
        throw new Error(
          `prompt '${promptName}' does not have an output schema`,
        );
    }
  }
}
