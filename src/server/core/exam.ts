import OpenAI from "openai";
import { Exam } from "../../shared/types/exam";

const openai = new OpenAI();

export class ExamCore {
  public static async generateFromQuestions({
    className,
    classDescription,
    pastExams,
  }: {
    className: string;
    classDescription: string;
    pastExams: Exam[];
  }): Promise<Exam> {
    // Invoke LLM
    const response = await openai.responses.create({
      model: "chatgpt-4o-latest",
      input: [
        {
          role: "system",
          content: `You are teacher for the STEM class <className>${className}</className><classDescription>${classDescription}</classDescription>.\nYou are writing a new exam, based on past exams. The newly generated exam MUST be as close as possible in composition (order of questions, type of questions, weighting of different question types, use of subquestions, etc.) to all past exams. The generated exam may contain past questions exactly, under the condition that all numerical values are different. The generated exam may, and it is strongly encouraged to, contain completely novel questions, under the condition that each question tests the same material as questions in past exams.\nRecursively create the exam, building out a tree for each question using the given data structures.`,
        },
        {
          role: "user",
          content: JSON.stringify(pastExams),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "examSchema",
          description:
            "Schema for a STEM exam. Each exam question is represented by a tree",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: { $ref: "#/$defs/QuestionTree" },
              },
              metadata: {
                type: "object",
                properties: {
                  numQuestions: { type: "number" },
                  weighting: { $ref: "#/$defs/PointWeighting" },
                },
                required: ["numQuestions", "weighting"],
                additionalProperties: false,
              },
            },
            required: ["questions", "metadata"],
            additionalProperties: false,
            $defs: {
              PointWeighting: {
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
              QuestionTree: {
                anyOf: [
                  { $ref: "#/$defs/QuestionNode" },
                  { $ref: "#/$defs/QuestionWrapper" },
                ],
              },
              QuestionNode: {
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
                  children: {
                    type: "array",
                    items: { $ref: "#/$defs/QuestionTree" },
                  },
                },
                required: [
                  "type",
                  "content",
                  "numMultipleChoice",
                  "multipleChoiceOptions",
                  "points",
                  "children",
                ],
                additionalProperties: false,
              },
              QuestionWrapper: {
                type: "object",
                properties: {
                  content: { type: "string" },
                  children: {
                    type: "array",
                    items: { $ref: "#/$defs/QuestionTree" },
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

    const newExam = JSON.parse(response.output_text) as Exam;
    return newExam;
  }
}
