import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { executeTool } from "freestyle-sandboxes/ai";

import { Question } from "../../../shared/types/question";
import { generateText } from "ai";

const openai = createOpenAI({
  compatibility: "strict",
});
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const codeExecutor = executeTool({
  apiKey: "X1WoDa3f9GBTdEKNTTwY5y-BH12wGGZQhswcakKHSzB8TLfKrZy2Ytn1zW9Fq8SRSbv",
});

export class ComputeAnswerService {
  public static async answer({
    prevQuestions,
    currQuestion,
  }: {
    prevQuestions: Question[];
    currQuestion: Question;
  }): Promise<string> {
    let context = "Previous parts to this question:";
    context +=
      "\n" +
      prevQuestions.map(
        (q) =>
          `<question>${q.content}</question><type>${q.type}</type><answer>${q.answer}</answer>`,
      );

    if (currQuestion.type === "freeform-response") {
      // No computation necessary; generate answer traditionally
      const { text, steps } = await generateText({
        system:
          "You are an expert STEM teacher. Given a question, write down just the answer/s and nothing else. Unless specified, give numerical answers to 3 s.f. with the correct units",
        // model: openai("gpt-4o"),
        model: google("gemini-1.5-flash"),
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<context>${context}</context>\nConcisely state the answer/s: <question>${currQuestion.content}</question><type>${currQuestion.type}</type>. State just the answer/s, nothing else.`,
      });
      console.log(steps);

      return text;
    }

    // Call Freestyle with tool
    const { text, steps } = await generateText({
      // model: openai("gpt-4o"),
      model: google("gemini-1.5-flash"),
      tools: {
        codeExecutor,
      },
      maxSteps: 5,
      maxRetries: 0,
      prompt: `<context>${context}</context>\nUsing code executor tool, compute the answer to this STEM problem with the correct units: <question>${currQuestion.content}</question><type>${currQuestion.type}</type>.`,
    });
    console.log(steps);

    return text.trim();
  }
}
