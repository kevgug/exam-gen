import { readFile } from "fs/promises";
import { PROMPT_DIR } from "../../config";
import path from "path";

export type PromptName = "ExamCore_getFromMarkdown";

export class PromptService {
  public static async get(promptName: PromptName): Promise<string> {
    return (
      await readFile(path.join(PROMPT_DIR, `${promptName}.md`))
    ).toString();
  }
}
