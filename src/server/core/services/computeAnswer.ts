import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { executeTool } from "freestyle-sandboxes/ai";

import { Question } from "../../../shared/types/question";
import { generateText } from "ai";
import { ExamPart, ExamPartChunk } from "../../../shared/types/exam";

const openai = createOpenAI({
  compatibility: "strict",
});
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const codeExecutor = executeTool({
  apiKey: process.env.FREESTYLE_API_KEY ?? "",
});

export class ComputeAnswerService {
  public static async answer({
    prevParts,
    currPart,
  }: {
    prevParts: ExamPart[];
    currPart: ExamPart;
  }): Promise<ExamPartChunk[] | null> {
    return null; // TODO

    /*
    let context = "Previous parts to this question:";
    context +=
      "\n" +
      prevParts.map(
        (q) =>
          `<question>${q.content}</question><type>${q.type}</type><answer>${q.answer}</answer>`,
      );

    if (currPart.type === "freeform-response") {
      // No computation necessary; generate answer traditionally
      const { text, steps } = await generateText({
        system:
          "You are an expert STEM teacher. Given an exam question, determine the correct answer/s.",
        model: openai("gpt-4o"),
        // model: google("gemini-1.5-flash"),
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<context>${context}</context>\nConcisely state the answer/s: <question>${currPart.content}</question><type>${currPart.type}</type>. State just the answer/s, nothing else.`,
      });
      console.log(steps);

      return text.trim();
    } else if (currPart.type === "numerical-response") {
      const { reasoning, steps: reasoningSteps } = await generateText({
        model: openai("gpt-4o"),
        // model: google("gemini-1.5-flash"),
        system:
          "You are an expert STEM teacher. Given an exam question, compute the correct answer with the correct units along with your reasoning.",
        tools: {
          codeExecutor,
        },
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<context>${context}</context>\nAnswer:<question>${currPart.content}</question><type>${currPart.type}</type>. Use code executor for any computation.`,
      });
      console.log("reasoningSteps: ", reasoningSteps);

      const { text: finalAnswer } = await generateText({
        model: openai("gpt-4o"),
        // model: google("gemini-1.5-flash"),
        system:
          "You are an expert STEM teacher. Given an exam question and your thought process, write down just the answer/s and nothing else. Unless specified, give numerical answers to 3 s.f. along with the correct units",
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<question>${currPart.content}</question><reasoning>${reasoning}</reasoning>`,
      });

      return finalAnswer.trim();
    } else if (currPart.type === "multiple-choice") {
      const { reasoning, steps: reasoningSteps } = await generateText({
        model: openai("gpt-4o"),
        // model: google("gemini-1.5-flash"),
        system:
          "You are an expert STEM teacher. Given a multiple choice exam question, compute the correct answer along with your reasoning.",
        tools: {
          codeExecutor,
        },
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<context>${context}</context>\nAnswer:<question>${currPart.content}</question><choices>${currPart.multipleChoiceOptions}</choices>. Use code executor for all computation, however simple.`,
      });
      console.log("reasoningSteps: ", reasoningSteps);

      const { text: finalAnswer } = await generateText({
        model: openai("gpt-4o"),
        // model: google("gemini-1.5-flash"),
        system:
          "You are an expert STEM teacher. Given a multiple choice exam question and your thought process, state just the answer choice letter and nothing else",
        maxSteps: 5,
        maxRetries: 0,
        prompt: `<question>${currPart.content}</question><reasoning>${reasoning}</reasoning>`,
      });

      return finalAnswer.trim();
    }

    return "";
    */
  }
}
