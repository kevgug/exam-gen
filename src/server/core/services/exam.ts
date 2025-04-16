import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { Exam, ExamPart } from "../../../shared/types/exam";
import { ComputeAnswerService } from "./computeAnswer";
import { Prompt, PromptService } from "./prompt";
import Anthropic from "@anthropic-ai/sdk";

const anthropicClient = new Anthropic();

export class ExamService {
  public static async markdownToJson(mdStr: string): Promise<Exam> {
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
    classTitle,
    classDescription,
    scope,
    pastExams,
  }: {
    classTitle: string;
    classDescription?: string;
    scope?: string;
    pastExams: string[];
  }): Promise<string> {
    // Invoke LLM
    const stream = anthropicClient.messages.stream({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 30000,
      temperature: 1,
      system: (await PromptService.system("ExamService_newExam")).fillVars({
        CLASS_TITLE: classTitle,
        CLASS_DESCRIPTION: classDescription ?? "n/a",
        SCOPE: scope ?? "n/a",
        SAMPLE_EXAMS: pastExams
          .map((e) => `<sample_exam>\n${e}\n</sample_exam>`)
          .join("\n"),
      }).text,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: (await PromptService.user("ExamService_newExam")).text,
            },
          ],
        },
      ],
      thinking: {
        type: "enabled",
        budget_tokens: 10000,
      },
    });

    let reasoning = "";
    let text = "";
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        console.log(`\nStarting ${event.content_block.type} block...`);
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "thinking_delta") {
          reasoning += event.delta.thinking;
          console.log(`Thinking: ${event.delta.thinking}`);
        } else if (event.delta.type === "text_delta") {
          text += event.delta.text;
          console.log(`Response: ${event.delta.text}`);
        }
      } else if (event.type === "content_block_stop") {
        console.log("\nBlock complete.");
      }
    }

    return text;
  }
}
